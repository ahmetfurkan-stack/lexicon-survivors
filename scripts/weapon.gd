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
var muzzle_flash: Polygon2D
var slash_arc: Line2D
var shot_tween: Tween
var melee_tween: Tween
var sprite_rest_position: Vector2 = Vector2(10.0, 0.0)
var focus_scale: float = 0.72

@onready var sprite = $Sprite2D

func _ready():
	setup_weapon(weapon_id)
	_create_combat_cues()

func _create_combat_cues():
	muzzle_flash = Polygon2D.new()
	muzzle_flash.name = "MuzzleFlash"
	muzzle_flash.position = Vector2(31.0, 0.0)
	muzzle_flash.polygon = PackedVector2Array([Vector2(-4, -3), Vector2(8, 0), Vector2(-4, 3), Vector2(-1, 0)])
	muzzle_flash.color = Color(1.0, 0.84, 0.49, 0.0)
	muzzle_flash.visible = false
	add_child(muzzle_flash)

	slash_arc = Line2D.new()
	slash_arc.name = "MeleeSlashCue"
	slash_arc.width = 4.0
	slash_arc.default_color = Color(0.91, 0.86, 0.68, 0.92)
	slash_arc.begin_cap_mode = Line2D.LINE_CAP_ROUND
	slash_arc.end_cap_mode = Line2D.LINE_CAP_ROUND
	slash_arc.joint_mode = Line2D.LINE_JOINT_ROUND
	slash_arc.visible = false
	var arc_points := PackedVector2Array()
	for point_index in range(13):
		var arc_angle := deg_to_rad(-52.0 + point_index * (104.0 / 12.0))
		arc_points.append(Vector2.RIGHT.rotated(arc_angle) * 39.0)
	slash_arc.points = arc_points
	add_child(slash_arc)

func set_active_focus(active: bool):
	is_active_focus = active
	if sprite:
		focus_scale = 1.05 if active else 0.68
		sprite.scale = Vector2.ONE * focus_scale
		sprite.modulate = Color(1.12, 1.07, 0.91) if active else Color(0.74, 0.78, 0.73)

func set_mount_pose(slot_index: int, active: bool, facing_left: bool) -> void:
	# The local origin is the grip point. Slots stay on the hero's hand/holster
	# side as they move; no weapon is parented to a rotating orbit.
	var side := -1.0 if facing_left else 1.0
	if active:
		position = Vector2(8.0 * side, 2.0)
	else:
		var holster_row := slot_index if slot_index < StatsManager.active_weapon_index else slot_index - 1
		position = Vector2(5.0 * side, 9.0 + float(maxi(holster_row, 0)) * 5.0)

func setup_weapon(type_id: String):
	weapon_id = type_id
	var weapon_data = StatsManager.weapons_catalog.get(weapon_id, {})
	base_cooldown = float(weapon_data.get("cooldown", base_cooldown))
	if not sprite:
		sprite = get_node_or_null("Sprite2D")
		
	match weapon_id:
		"quill_blaster":
			detection_range = 550.0
			if sprite:
				sprite.texture = load("res://assets/sprites/quill_blaster.png")
				sprite.offset = Vector2(0, 0)
		"syllable_shotgun":
			detection_range = 440.0
			if sprite:
				sprite.texture = load("res://assets/sprites/syllable_shotgun.png")
				sprite.offset = Vector2(4, 0)
		"lexicon_beam":
			detection_range = 620.0
			if sprite:
				sprite.texture = load("res://assets/sprites/lexicon_beam.png")
				sprite.offset = Vector2(4, 0)
		"punctuation_bomb":
			detection_range = 450.0
			if sprite:
				sprite.texture = load("res://assets/sprites/punctuation_bomb.png")
				sprite.offset = Vector2(0, 0)
		"dictionary_blade":
			detection_range = 140.0
			if sprite:
				sprite.texture = load("res://assets/sprites/dictionary_blade.png")
				sprite.offset = Vector2(16, 0)
		"crossword_crossbow":
			detection_range = 600.0
			if sprite:
				sprite.texture = load("res://assets/sprites/crossword_crossbow.png")
				sprite.offset = Vector2(0, 0)
		"hyphen_boomerang":
			detection_range = 520.0
			if sprite:
				sprite.texture = load("res://assets/sprites/hyphen_boomerang.png")
				sprite.offset = Vector2(0, 0)
		"ink_flamethrower":
			detection_range = 380.0
			if sprite:
				sprite.texture = load("res://assets/sprites/ink_flamethrower.png")
				sprite.offset = Vector2(4, 0)
		"thesaurus_rocket":
			detection_range = 640.0
			if sprite:
				sprite.texture = load("res://assets/sprites/thesaurus_rocket.png")
				sprite.offset = Vector2(0, 0)
		"quote_pistols":
			detection_range = 560.0
			if sprite:
				sprite.texture = load("res://assets/sprites/quote_pistols.png")
				sprite.offset = Vector2(0, 0)
		"calligraphy_katana":
			detection_range = 210.0
			if sprite:
				sprite.texture = load("res://assets/sprites/calligraphy_katana.png")
				sprite.offset = Vector2(16, 0)
		"scroll_turret":
			detection_range = 580.0
			if sprite:
				sprite.texture = load("res://assets/sprites/scroll_turret.png")
				sprite.offset = Vector2(0, 0)
		"rune_orb":
			detection_range = 560.0
			if sprite:
				sprite.texture = load("res://assets/sprites/rune_orb.png")
				sprite.offset = Vector2(0, 0)
		"grammar_sniper":
			detection_range = 750.0
			if sprite:
				sprite.texture = load("res://assets/sprites/grammar_sniper.png")
				sprite.offset = Vector2(4, 0)
	if sprite:
		var weapon_is_in_hero_pose := (StatsManager.selected_character == "inky" and weapon_id == "quill_blaster") \
			or (StatsManager.selected_character == "quillmaster" and weapon_id == "syllable_shotgun") \
			or (StatsManager.selected_character == "word_knight" and weapon_id == "dictionary_blade") \
			or (StatsManager.selected_character == "rune_sorceress" and weapon_id == "rune_orb") \
			or (StatsManager.selected_character == "shadow_lexicographer" and weapon_id == "calligraphy_katana")
		sprite.visible = not weapon_is_in_hero_pose

func _process(delta: float):
	shoot_timer -= delta
	find_nearest_enemy()
	if target_enemy and is_instance_valid(target_enemy) and not is_melee_slashing:
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
		start_melee_swing()
		return
	elif weapon_id == "punctuation_bomb":
		_play_shot_cue()
		drop_punctuation_mine()
		return
		
	if not target_enemy or not is_instance_valid(target_enemy):
		return
	if not projectile_scene:
		return
	_play_shot_cue()
		
	var is_crit = randf() < StatsManager.crit_chance
	var crit_mult = 2.0 if is_crit else 1.0
	var weapon_data = StatsManager.weapons_catalog.get(weapon_id, {})
	var base_dmg = float(weapon_data.get("damage", 20.0)) * StatsManager.damage_mult * crit_mult
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
	var weapon_data = StatsManager.weapons_catalog.get(weapon_id, {})
	var mine_dmg = float(weapon_data.get("damage", 38.0)) * StatsManager.damage_mult * crit_mult
	
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
	var is_crit = randf() < StatsManager.crit_chance
	var crit_mult = 2.0 if is_crit else 1.0
	var weapon_data = StatsManager.weapons_catalog.get(weapon_id, {})
	var melee_dmg = float(weapon_data.get("damage", 32.0)) * StatsManager.damage_mult * crit_mult
	
	# The blade only lands in its forward arc during the active frames of the swing.
	var enemies = get_tree().get_nodes_in_group("enemies")
	var forward = Vector2.RIGHT.rotated(rotation)
	for e in enemies:
		if is_instance_valid(e) and global_position.distance_to(e.global_position) <= 132.0:
			var knock_dir = (e.global_position - global_position).normalized()
			if knock_dir == Vector2.ZERO:
				knock_dir = Vector2.RIGHT
			if knock_dir.dot(forward) < 0.34:
				continue
			if e.has_method("take_damage"):
				e.take_damage(melee_dmg, knock_dir)
				if is_crit and StatsManager.selected_character == "shadow_lexicographer" and e.has_method("apply_slow"):
					e.apply_slow(1.25, 0.6)

func start_melee_swing():
	if not is_inside_tree() or is_melee_slashing:
		return
	is_melee_slashing = true
	_notify_player_attack()
	if melee_tween and melee_tween.is_running():
		melee_tween.kill()
	slash_arc.visible = true
	slash_arc.modulate = Color.WHITE
	slash_arc.rotation = -0.82
	sprite.position = sprite_rest_position
	sprite.rotation = -0.95
	melee_tween = create_tween()
	melee_tween.tween_property(sprite, "position", sprite_rest_position - Vector2(5.0, 2.0), 0.07).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
	melee_tween.parallel().tween_property(sprite, "rotation", 0.95, 0.14).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	melee_tween.tween_property(slash_arc, "rotation", 0.82, 0.12).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	melee_tween.parallel().tween_property(sprite, "position", sprite_rest_position + Vector2(5.0, 2.0), 0.09).set_delay(0.07)
	melee_tween.parallel().tween_property(slash_arc, "modulate:a", 0.0, 0.12).set_delay(0.07)
	melee_tween.parallel().tween_property(sprite, "rotation", 0.0, 0.10).set_delay(0.14).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	melee_tween.tween_callback(_finish_melee_swing)
	melee_tween.tween_property(sprite, "position", sprite_rest_position, 0.07).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	melee_tween.parallel().tween_property(sprite, "rotation", 0.0, 0.03)
	melee_tween.tween_callback(func(): is_melee_slashing = false)
	# The blade visibly draws back, sweeps through its target arc, and returns to the grip.
	get_tree().create_timer(0.12).timeout.connect(sweep_blade_attack, CONNECT_ONE_SHOT)

func _finish_melee_swing() -> void:
	if is_instance_valid(slash_arc):
		slash_arc.visible = false

func _play_shot_cue() -> void:
	if not is_instance_valid(sprite):
		return
	_notify_player_attack()
	if shot_tween and shot_tween.is_running():
		shot_tween.kill()
	sprite.position = sprite_rest_position
	sprite.rotation = 0.0
	shot_tween = create_tween()
	shot_tween.tween_property(sprite, "position", sprite_rest_position - Vector2(3.5, 0.0), 0.045).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	shot_tween.parallel().tween_property(sprite, "rotation", -0.09, 0.045)
	shot_tween.tween_property(sprite, "position", sprite_rest_position, 0.10).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	shot_tween.parallel().tween_property(sprite, "rotation", 0.0, 0.10)
	if is_instance_valid(muzzle_flash):
		muzzle_flash.visible = true
		muzzle_flash.modulate = Color(1.0, 0.84, 0.49, 0.95)
		var flash_tween := create_tween()
		flash_tween.tween_property(muzzle_flash, "modulate:a", 0.0, 0.07)
		flash_tween.tween_callback(func(): muzzle_flash.visible = false)

func _notify_player_attack() -> void:
	var player = get_tree().get_first_node_in_group("player")
	if is_instance_valid(player) and player.has_method("play_attack_animation"):
		player.play_attack_animation()

func spawn_one_projectile(dir: Vector2, dmg: float, prc: int, spd: float, tint: Color, crit: bool):
	var p = projectile_scene.instantiate()
	p.global_position = global_position + dir * 18.0
	p.setup(dir, dmg, prc, spd, tint, crit)
	get_tree().current_scene.add_child(p)
