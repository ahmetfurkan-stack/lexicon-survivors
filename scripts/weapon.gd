extends Node2D

@export var projectile_scene: PackedScene = preload("res://scenes/projectile.tscn")
@export var punctuation_mine_scene: PackedScene = preload("res://scenes/punctuation_mine.tscn")
@export var weapon_id: String = "quill_blaster"
@export var base_cooldown: float = 0.85
@export var detection_range: float = 550.0

var shoot_timer: float = 0.0
var target_enemy: Node2D = null
var is_melee_slashing: bool = false
var slash_angle: float = 0.0
var is_active_focus: bool = false

@onready var sprite = $Sprite2D

func _ready():
	setup_weapon(weapon_id)

func set_active_focus(active: bool):
	is_active_focus = active
	if sprite:
		if active:
			sprite.scale = Vector2(1.22, 1.22)
			sprite.modulate = Color(1.3, 1.25, 0.9)
		else:
			sprite.scale = Vector2(1.0, 1.0)
			sprite.modulate = Color.WHITE

func setup_weapon(type_id: String):
	weapon_id = type_id
	if not sprite:
		sprite = get_node_or_null("Sprite2D")
		
	match weapon_id:
		"quill_blaster":
			base_cooldown = 0.80
			detection_range = 550.0
			if sprite:
				sprite.texture = load("res://assets/sprites/quill_blaster.png")
				sprite.offset = Vector2(0, 0)
		"syllable_shotgun":
			base_cooldown = 1.20
			detection_range = 440.0
			if sprite:
				sprite.texture = load("res://assets/sprites/syllable_shotgun.png")
				sprite.offset = Vector2(4, 0)
		"lexicon_beam":
			base_cooldown = 0.45
			detection_range = 620.0
			if sprite:
				sprite.texture = load("res://assets/sprites/lexicon_beam.png")
				sprite.offset = Vector2(4, 0)
		"punctuation_bomb":
			base_cooldown = 1.35
			detection_range = 450.0
			if sprite:
				sprite.texture = load("res://assets/sprites/punctuation_bomb.png")
				sprite.offset = Vector2(0, 0)
		"dictionary_blade":
			base_cooldown = 0.75
			detection_range = 140.0
			if sprite:
				sprite.texture = load("res://assets/sprites/dictionary_blade.png")
				sprite.offset = Vector2(16, 0)
		"crossword_crossbow":
			base_cooldown = 0.95
			detection_range = 600.0
			if sprite:
				sprite.texture = load("res://assets/sprites/crossword_crossbow.png")
				sprite.offset = Vector2(0, 0)
		"hyphen_boomerang":
			base_cooldown = 1.10
			detection_range = 520.0
			if sprite:
				sprite.texture = load("res://assets/sprites/hyphen_boomerang.png")
				sprite.offset = Vector2(0, 0)
		"ink_flamethrower":
			base_cooldown = 0.12
			detection_range = 380.0
			if sprite:
				sprite.texture = load("res://assets/sprites/ink_flamethrower.png")
				sprite.offset = Vector2(4, 0)
		"thesaurus_rocket":
			base_cooldown = 1.60
			detection_range = 640.0
			if sprite:
				sprite.texture = load("res://assets/sprites/thesaurus_rocket.png")
				sprite.offset = Vector2(0, 0)
		"quote_pistols":
			base_cooldown = 0.28
			detection_range = 560.0
			if sprite:
				sprite.texture = load("res://assets/sprites/quote_pistols.png")
				sprite.offset = Vector2(0, 0)
		"calligraphy_katana":
			base_cooldown = 0.65
			detection_range = 210.0
			if sprite:
				sprite.texture = load("res://assets/sprites/calligraphy_katana.png")
				sprite.offset = Vector2(16, 0)
		"scroll_turret":
			base_cooldown = 2.0
			detection_range = 580.0
			if sprite:
				sprite.texture = load("res://assets/sprites/scroll_turret.png")
				sprite.offset = Vector2(0, 0)
		"rune_orb":
			base_cooldown = 1.10
			detection_range = 560.0
			if sprite:
				sprite.texture = load("res://assets/sprites/rune_orb.png")
				sprite.offset = Vector2(0, 0)
		"grammar_sniper":
			base_cooldown = 1.85
			detection_range = 750.0
			if sprite:
				sprite.texture = load("res://assets/sprites/grammar_sniper.png")
				sprite.offset = Vector2(4, 0)

func _process(delta: float):
	shoot_timer -= delta
	
	if weapon_id == "dictionary_blade":
		# Melee spinning / hovering
		if is_melee_slashing:
			slash_angle += delta * 18.0
			rotation = slash_angle
			if slash_angle >= TAU:
				is_melee_slashing = false
				slash_angle = 0.0
		else:
			rotation += delta * 2.5
	else:
		find_nearest_enemy()
		if target_enemy and is_instance_valid(target_enemy):
			var target_angle = (target_enemy.global_position - global_position).angle()
			rotation = lerp_angle(rotation, target_angle, delta * 14.0)
	
	var effective_attack_speed = max(0.1, StatsManager.attack_speed_mult)
	if is_active_focus:
		effective_attack_speed *= 1.25 # Quick-Draw bonus for switched active weapon
		
	var effective_cooldown = max(0.08, base_cooldown / effective_attack_speed)
	if shoot_timer <= 0:
		shoot_timer = effective_cooldown
		shoot()

func find_nearest_enemy():
	if not is_inside_tree():
		return
	var enemies = get_tree().get_nodes_in_group("enemies")
	var closest: Node2D = null
	var min_dist: float = detection_range
	
	for e in enemies:
		if is_instance_valid(e):
			var d = global_position.distance_to(e.global_position)
			if d < min_dist:
				min_dist = d
				closest = e
				
	target_enemy = closest

func shoot():
	if weapon_id == "dictionary_blade":
		sweep_blade_attack()
		return
	elif weapon_id == "punctuation_bomb":
		drop_punctuation_mine()
		return
		
	if not target_enemy or not is_instance_valid(target_enemy):
		return
	if not projectile_scene:
		return
		
	var is_crit = randf() < StatsManager.crit_chance
	var crit_mult = 2.0 if is_crit else 1.0
	var base_dmg = 20.0 * StatsManager.damage_mult * crit_mult
	var prc = StatsManager.pierce_count
	var base_dir = Vector2.RIGHT.rotated(rotation)
	
	match weapon_id:
		"quill_blaster":
			var count = StatsManager.projectile_count
			if count == 1:
				spawn_one_projectile(base_dir, base_dmg * 1.1, prc, 540.0, Color.WHITE, is_crit)
			else:
				var spread_angle = deg_to_rad(14.0)
				var start_angle = -((count - 1) * spread_angle) / 2.0
				for i in range(count):
					var current_dir = base_dir.rotated(start_angle + i * spread_angle)
					spawn_one_projectile(current_dir, base_dmg, prc, 540.0, Color.WHITE, is_crit)
					
		"syllable_shotgun":
			# High pellet count spread
			var pellets = 4 + (StatsManager.projectile_count - 1) * 2
			var pellet_dmg = base_dmg * 0.75
			var spread_angle = deg_to_rad(28.0)
			for i in range(pellets):
				var offset_ang = (randf() - 0.5) * spread_angle
				var pellet_dir = base_dir.rotated(offset_ang)
				var spd = randf_range(460.0, 600.0)
				spawn_one_projectile(pellet_dir, pellet_dmg, 1, spd, Color(1.0, 0.75, 0.3), is_crit)
				
		"lexicon_beam":
			# Piercing continuous cyan beam
			var beam_dmg = base_dmg * 0.95
			spawn_one_projectile(base_dir, beam_dmg, prc + 8, 920.0, Color(0.2, 0.95, 1.0), is_crit)
		"crossword_crossbow":
			# Crossword bolt
			spawn_one_projectile(base_dir, base_dmg, 1, 620.0, Color(0.85, 0.75, 0.2), is_crit)
		"hyphen_boomerang":
			# Hyphen boomerang with infinite pierce
			spawn_one_projectile(base_dir, base_dmg, 999, 520.0, Color(1.0, 0.45, 0.2), is_crit)
		"ink_flamethrower":
			# Rapid flame stream
			var spread = (randf() - 0.5) * deg_to_rad(20.0)
			spawn_one_projectile(base_dir.rotated(spread), base_dmg, 3, 380.0, Color(1.0, 0.35, 0.1), is_crit)
		"thesaurus_rocket":
			# Heavy explosive rocket
			spawn_one_projectile(base_dir, base_dmg, 1, 420.0, Color(0.7, 0.3, 0.8), is_crit)
		"quote_pistols":
			# Alternating dual pistols
			var side_offset = 8.0 if randf() > 0.5 else -8.0
			var perp = Vector2(-base_dir.y, base_dir.x) * side_offset
			var p = projectile_scene.instantiate()
			p.global_position = global_position + base_dir * 18.0 + perp
			p.setup(base_dir, base_dmg, prc, 640.0, Color(1.0, 0.9, 0.3), is_crit)
			get_tree().current_scene.add_child(p)
		"calligraphy_katana":
			# Ink crescent slash
			var slash_count = 3
			for i in range(slash_count):
				var off_angle = (i - 1) * deg_to_rad(16.0)
				spawn_one_projectile(base_dir.rotated(off_angle), base_dmg * 1.3, prc + 3, 560.0, Color(0.15, 0.15, 0.25), is_crit)
		"scroll_turret":
			# 6-way radial salvo
			for i in range(6):
				var radial_dir = Vector2.RIGHT.rotated(i * (TAU / 6.0))
				spawn_one_projectile(radial_dir, base_dmg * 0.85, 1, 480.0, Color(0.95, 0.85, 0.45), is_crit)
		"rune_orb":
			# Bouncing piercing orb
			spawn_one_projectile(base_dir, base_dmg * 1.2, prc + 4, 460.0, Color(0.3, 0.85, 1.0), is_crit)
		"grammar_sniper":
			# High-speed piercing sniper shot
			spawn_one_projectile(base_dir, base_dmg * 2.8, prc + 6, 1100.0, Color(1.0, 0.2, 0.4), is_crit)

func drop_punctuation_mine():
	if not is_inside_tree() or not punctuation_mine_scene:
		return
	var is_crit = randf() < StatsManager.crit_chance
	var crit_mult = 2.0 if is_crit else 1.0
	var mine_dmg = 38.0 * StatsManager.damage_mult * crit_mult
	
	var drop_offset = Vector2.RIGHT.rotated(randf() * TAU) * randf_range(20.0, 50.0)
	if target_enemy and is_instance_valid(target_enemy):
		var to_enemy = (target_enemy.global_position - global_position).normalized()
		drop_offset = to_enemy * randf_range(30.0, 65.0)
		
	var mine = punctuation_mine_scene.instantiate()
	mine.setup(global_position + drop_offset, mine_dmg, 125.0)
	get_tree().current_scene.add_child(mine)

func sweep_blade_attack():
	if not is_inside_tree():
		return
	is_melee_slashing = true
	slash_angle = 0.0
	var is_crit = randf() < StatsManager.crit_chance
	var crit_mult = 2.0 if is_crit else 1.0
	var melee_dmg = 32.0 * StatsManager.damage_mult * crit_mult
	
	# Damage all enemies in 140 radius
	var enemies = get_tree().get_nodes_in_group("enemies")
	for e in enemies:
		if is_instance_valid(e) and global_position.distance_to(e.global_position) <= 145.0:
			var knock_dir = (e.global_position - global_position).normalized()
			if knock_dir == Vector2.ZERO:
				knock_dir = Vector2.RIGHT
			if e.has_method("take_damage"):
				e.take_damage(melee_dmg, knock_dir)

func spawn_one_projectile(dir: Vector2, dmg: float, prc: int, spd: float, tint: Color, crit: bool):
	var p = projectile_scene.instantiate()
	p.global_position = global_position + dir * 18.0
	p.setup(dir, dmg, prc, spd, tint, crit)
	get_tree().current_scene.add_child(p)
