extends CharacterBody2D

const HEALTH_SCROLL_SCENE: PackedScene = preload("res://scenes/health_scroll.tscn")

@export var enemy_type: String = "Typo Slime"
@export var max_health: float = 25.0
@export var speed: float = 85.0
@export var damage_to_player: float = 8.0
@export var ink_reward: int = 1

var health: float
var target_player: Node2D = null
var flash_timer: float = 0.0
var hit_squash_timer: float = 0.0
var attack_cooldown: float = 0.0
var knockback: Vector2 = Vector2.ZERO
var behavior_cooldown: float = 0.0
var telegraph_timer: float = 0.0
var charge_timer: float = 0.0
var recovery_timer: float = 0.0
var attack_direction: Vector2 = Vector2.RIGHT
var telegraph_target_position: Vector2 = Vector2.ZERO
var suppress_rewards: bool = false
var stun_timer: float = 0.0
var slow_timer: float = 0.0
var slow_factor: float = 1.0
var base_sprite_scale: Vector2 = Vector2.ONE
var weapon_mark_timer: float = 0.0
var burn_timer: float = 0.0
var burn_tick_timer: float = 0.0
var burn_damage: float = 0.0
var burn_stacks: int = 0

@onready var sprite = $Sprite2D
@onready var label = $Label
var ink_drop_scene = preload("res://scenes/ink_drop.tscn")

var typo_words = ["Teh", "Woudl", "Recieve", "Becaue", "Definately", "Seperate", "Tomorow", "Untill", "Beautifull", "Acommodate"]
var grammar_pairs = ["is/are", "have/has", "their/there", "your/you're", "its/it's", "to/too", "affect/effect", "less/fewer", "who/whom"]
var threat_seal: Texture2D = null

class HarpyBolt extends Area2D:
	var direction: Vector2 = Vector2.RIGHT
	var speed: float = 190.0
	var damage: float = 14.0
	var lifetime: float = 3.0

	func _init(flight_direction: Vector2, hit_damage: float):
		direction = flight_direction.normalized()
		damage = hit_damage
		collision_layer = 8
		collision_mask = 1
		var shape_node = CollisionShape2D.new()
		var shape = CircleShape2D.new()
		shape.radius = 8.0
		shape_node.shape = shape
		add_child(shape_node)
		var bolt_sprite = Sprite2D.new()
		bolt_sprite.texture = load("res://assets/sprites/bullet_enemy_red.png")
		bolt_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		bolt_sprite.scale = Vector2(0.8, 0.8)
		add_child(bolt_sprite)

	func _ready():
		add_to_group("enemy_projectiles")
		body_entered.connect(_on_body_entered)

	func _physics_process(delta: float):
		global_position += direction * speed * delta
		lifetime -= delta
		if lifetime <= 0.0:
			queue_free()

	func _on_body_entered(body: Node2D):
		if body.is_in_group("player") and body.has_method("take_damage"):
			body.take_damage(damage)
			queue_free()

class EnemyInkPuddle extends Area2D:
	var lifetime: float = 4.5
	var damage: float = 8.0
	var has_hit_player: bool = false

	func _init(hit_damage: float):
		damage = hit_damage
		collision_layer = 0
		collision_mask = 1
		var shape_node = CollisionShape2D.new()
		var shape = CircleShape2D.new()
		shape.radius = 30.0
		shape_node.shape = shape
		add_child(shape_node)

	func _ready():
		add_to_group("enemy_ink_puddles")
		body_entered.connect(_on_body_entered)

	func _physics_process(delta: float):
		lifetime -= delta
		queue_redraw()
		if lifetime <= 0.0:
			queue_free()

	func _draw():
		var alpha := clampf(lifetime / 4.5, 0.18, 0.58)
		draw_circle(Vector2.ZERO, 30.0, Color(0.24, 0.08, 0.38, alpha))
		draw_arc(Vector2.ZERO, 30.0, 0.0, TAU, 36, Color(0.56, 0.29, 0.82, minf(0.82, alpha + 0.2)), 2.0, true)

	func _on_body_entered(body: Node2D):
		if has_hit_player or not body.is_in_group("player") or body.is_dashing:
			return
		if body.has_method("take_damage"):
			body.take_damage(damage)
			has_hit_player = true

func _ready():
	add_to_group("enemies")
	if ResourceLoader.exists("res://assets/sprites/upgrade_v1/threat_seal.png"):
		threat_seal = load("res://assets/sprites/upgrade_v1/threat_seal.png")
	setup_type()
	if sprite:
		base_sprite_scale = sprite.scale

func setup_type():
	var diff_data = StatsManager.difficulties.get(StatsManager.difficulty, StatsManager.difficulties["normal"])
	var spd_mult = diff_data.get("enemy_speed_mult", 1.0)
	var hp_mult = diff_data.get("enemy_hp_mult", 1.0)
	var dmg_mult = diff_data.get("enemy_damage_mult", 1.0)
	
	if enemy_type == "Typo Slime":
		max_health = (140.0 + (StatsManager.current_wave - 1) * 36.0) * hp_mult
		speed = (98.0 + (StatsManager.current_wave - 1) * 3.5) * spd_mult
		damage_to_player = 34.0 * dmg_mult
		ink_reward = 3
		if sprite:
			sprite.texture = load("res://assets/sprites/upgrade_v1/monster_typo_slime.png")
		if label:
			label.text = typo_words[randi() % typo_words.size()]
	elif enemy_type == "Grammar Goblin":
		max_health = (90.0 + (StatsManager.current_wave - 1) * 28.0) * hp_mult
		speed = (155.0 + (StatsManager.current_wave - 1) * 5.0) * spd_mult
		damage_to_player = 32.0 * dmg_mult
		ink_reward = 3
		if sprite:
			sprite.texture = load("res://assets/sprites/upgrade_v1/monster_grammar_goblin.png")
		if label:
			label.text = grammar_pairs[randi() % grammar_pairs.size()]
	elif enemy_type == "Typo Splinter":
		max_health = (50.0 + StatsManager.current_wave * 12.0) * hp_mult
		speed = (175.0 + StatsManager.current_wave * 5.0) * spd_mult
		damage_to_player = 22.0 * dmg_mult
		ink_reward = 1
		if sprite:
			sprite.texture = load("res://assets/sprites/upgrade_v1/monster_typo_splinter.png")
		if label:
			label.text = "Splinter"
	elif enemy_type == "Punctuation Phantom":
		max_health = (110.0 + (StatsManager.current_wave - 1) * 32.0) * hp_mult
		speed = (135.0 + (StatsManager.current_wave - 1) * 4.0) * spd_mult
		damage_to_player = 34.0 * dmg_mult
		ink_reward = 4
		if sprite:
			sprite.texture = load("res://assets/sprites/upgrade_v1/monster_punctuation_phantom.png")
		if label:
			label.text = "?"
	elif enemy_type == "Syntax Titan":
		max_health = (560.0 + (StatsManager.current_wave - 1) * 150.0) * hp_mult
		speed = (82.0 + (StatsManager.current_wave - 1) * 3.0) * spd_mult
		damage_to_player = 64.0 * dmg_mult
		ink_reward = 8
		if sprite:
			sprite.texture = load("res://assets/sprites/syntax_titan.png")
		if label:
			label.text = "SYNTAX TITAN"
	elif enemy_type == "Spelling Spectre":
		max_health = (140.0 + (StatsManager.current_wave - 1) * 36.0) * hp_mult
		speed = (145.0 + (StatsManager.current_wave - 1) * 4.0) * spd_mult
		damage_to_player = 42.0 * dmg_mult
		ink_reward = 5
		if sprite:
			sprite.texture = load("res://assets/sprites/upgrade_v1/monster_spelling_spectre.png")
		if label:
			label.text = "Spectre"
	elif enemy_type == "Red Pen Boss":
		max_health = (2400.0 + StatsManager.current_wave * 130.0) * hp_mult
		speed = 52.0 * spd_mult
		damage_to_player = (95.0 + StatsManager.current_wave * 1.8) * dmg_mult
		ink_reward = 60
		if sprite:
			sprite.texture = load("res://assets/sprites/upgrade_v1/monster_red_pen_boss.png")
		if label:
			label.text = "RED PEN BOSS"
	elif enemy_type == "Oxymoron Ogre":
		max_health = (680.0 + (StatsManager.current_wave - 1) * 160.0) * hp_mult
		speed = 92.0 * spd_mult
		damage_to_player = 68.0 * dmg_mult
		ink_reward = 10
		if sprite:
			sprite.texture = load("res://assets/sprites/oxymoron_ogre.png")
		if label:
			label.text = "OXYMORON OGRE"
	elif enemy_type == "Vocabulary Void":
		max_health = (400.0 + (StatsManager.current_wave - 1) * 100.0) * hp_mult
		speed = 82.0 * spd_mult
		damage_to_player = 52.0 * dmg_mult
		ink_reward = 8
		if sprite:
			sprite.texture = load("res://assets/sprites/vocabulary_void.png")
		if label:
			label.text = "VOCAB VOID"
	elif enemy_type == "Malapropism Mimic":
		max_health = (220.0 + (StatsManager.current_wave - 1) * 50.0) * hp_mult
		speed = 160.0 * spd_mult
		damage_to_player = 48.0 * dmg_mult
		ink_reward = 6
		if sprite:
			sprite.texture = load("res://assets/sprites/malapropism_mimic.png")
		if label:
			label.text = "MIMIC"
	elif enemy_type == "Homophone Harpy":
		max_health = (170.0 + (StatsManager.current_wave - 1) * 40.0) * hp_mult
		speed = 180.0 * spd_mult
		damage_to_player = 40.0 * dmg_mult
		ink_reward = 6
		if sprite:
			sprite.texture = load("res://assets/sprites/upgrade_v1/monster_homophone_harpy.png")
		if label:
			label.text = "HARPY"
	elif enemy_type == "Idiom Imp":
		max_health = (120.0 + (StatsManager.current_wave - 1) * 30.0) * hp_mult
		speed = 185.0 * spd_mult
		damage_to_player = 34.0 * dmg_mult
		ink_reward = 4
		if sprite:
			sprite.texture = load("res://assets/sprites/upgrade_v1/monster_idiom_imp.png")
		if label:
			label.text = "IDIOM IMP"
	elif enemy_type == "Tautology Twin":
		max_health = (160.0 + (StatsManager.current_wave - 1) * 35.0) * hp_mult
		speed = 140.0 * spd_mult
		damage_to_player = 32.0 * dmg_mult
		ink_reward = 5
		if sprite:
			sprite.texture = load("res://assets/sprites/upgrade_v1/monster_tautology_twin.png")
		if label:
			label.text = "TAUTOLOGY"
	elif enemy_type == "Run-on Reaper":
		max_health = (180.0 + (StatsManager.current_wave - 1) * 38.0) * hp_mult
		speed = 195.0 * spd_mult
		damage_to_player = 36.0 * dmg_mult
		ink_reward = 6
		if sprite:
			sprite.texture = load("res://assets/sprites/upgrade_v1/monster_run_on_reaper.png")
		if label:
			label.text = "RUN-ON"
	elif enemy_type == "Dangling Modifier":
		max_health = (130.0 + (StatsManager.current_wave - 1) * 30.0) * hp_mult
		speed = 165.0 * spd_mult
		damage_to_player = 28.0 * dmg_mult
		ink_reward = 5
		if sprite:
			sprite.texture = load("res://assets/sprites/upgrade_v1/monster_dangling_modifier.png")
		if label:
			label.text = "DANGLING"
	elif enemy_type == "Double Negative Drake":
		max_health = (340.0 + (StatsManager.current_wave - 1) * 80.0) * hp_mult
		speed = 110.0 * spd_mult
		damage_to_player = 42.0 * dmg_mult
		ink_reward = 8
		if sprite:
			sprite.texture = load("res://assets/sprites/upgrade_v1/monster_double_negative_drake.png")
		if label:
			label.text = "DOUBLE NEGATIVE"
	elif enemy_type == "Palindrome Phantom":
		max_health = (145.0 + (StatsManager.current_wave - 1) * 32.0) * hp_mult
		speed = 170.0 * spd_mult
		damage_to_player = 30.0 * dmg_mult
		ink_reward = 6
		if sprite:
			sprite.texture = load("res://assets/sprites/palindrome_phantom.png")
		if label:
			label.text = "RACECAR"
	elif enemy_type == "Lexicon Dragon Boss":
		var dragon_hp = 16500.0 if StatsManager.current_wave <= 50 else 38000.0
		max_health = dragon_hp * hp_mult
		speed = 58.0 * spd_mult
		damage_to_player = (145.0 if StatsManager.current_wave <= 50 else 220.0) * dmg_mult
		ink_reward = 120
		if sprite:
			sprite.texture = load("res://assets/sprites/upgrade_v1/monster_lexicon_dragon_boss.png")
		if label:
			label.text = "LEXICON DRAGON OVERLORD"
			
	health = max_health

func _physics_process(delta: float):
	_update_readable_motion()
	hit_squash_timer = maxf(0.0, hit_squash_timer - delta)
	weapon_mark_timer = maxf(0.0, weapon_mark_timer - delta)
	if burn_timer > 0.0:
		burn_timer = maxf(0.0, burn_timer - delta)
		burn_tick_timer -= delta
		if burn_tick_timer <= 0.0 and burn_timer > 0.0:
			burn_tick_timer = 0.42
			take_damage(burn_damage * float(maxi(1, burn_stacks)), Vector2.ZERO, "heavy", false)
		if burn_timer <= 0.0:
			burn_stacks = 0
			burn_damage = 0.0
	if stun_timer > 0.0:
		stun_timer = maxf(0.0, stun_timer - delta)
		velocity = Vector2.ZERO
		move_and_slide()
		return
	if slow_timer > 0.0:
		slow_timer = maxf(0.0, slow_timer - delta)
		if slow_timer == 0.0:
			slow_factor = 1.0
	if flash_timer > 0:
		flash_timer -= delta
		if flash_timer <= 0:
			modulate = Color.WHITE
			
	if attack_cooldown > 0:
		attack_cooldown -= delta
	if behavior_cooldown > 0:
		behavior_cooldown -= delta
	if recovery_timer > 0.0:
		recovery_timer = maxf(0.0, recovery_timer - delta)
		
	# Find player
	if not target_player or not is_instance_valid(target_player):
		if is_inside_tree():
			var players = get_tree().get_nodes_in_group("player")
			if players.size() > 0:
				target_player = players[0]
			
	if target_player and is_instance_valid(target_player):
		var dir = (target_player.global_position - global_position).normalized()
		var distance_to_player = global_position.distance_to(target_player.global_position)
		var desired_velocity = dir * speed
		
		# Flip sprite based on direction
		if sprite and dir.x != 0:
			sprite.flip_h = dir.x < 0

		if enemy_type == "Homophone Harpy":
			desired_velocity = _harpy_movement(delta, dir, distance_to_player)
		elif enemy_type == "Run-on Reaper":
			desired_velocity = _reaper_movement(delta, dir)
		elif enemy_type == "Idiom Imp":
			desired_velocity = _imp_movement(dir)
		elif enemy_type == "Oxymoron Ogre":
			desired_velocity = _ogre_movement(dir, distance_to_player)
		elif enemy_type == "Punctuation Phantom":
			desired_velocity = _phantom_movement(dir, distance_to_player)
		desired_velocity *= slow_factor

		velocity = desired_velocity + knockback
		knockback = knockback.move_toward(Vector2.ZERO, 600.0 * delta)
		move_and_slide()
		
		# Check contact with player
		for i in get_slide_collision_count():
			var collision = get_slide_collision(i)
			var collider = collision.get_collider()
			if collider and collider.is_in_group("player") and attack_cooldown <= 0:
				if collider.has_method("take_damage"):
					collider.take_damage(damage_to_player)
					attack_cooldown = 0.55
		if telegraph_timer > 0.0:
			telegraph_timer = maxf(0.0, telegraph_timer - delta)
			if telegraph_timer == 0.0:
				if enemy_type == "Homophone Harpy":
					fire_harpy_bolt()
					behavior_cooldown = 2.75
				elif enemy_type == "Run-on Reaper":
					charge_timer = 0.42
					behavior_cooldown = 3.0
				elif enemy_type == "Idiom Imp":
					_spawn_ink_puddle(telegraph_target_position)
					behavior_cooldown = 3.5
				elif enemy_type == "Oxymoron Ogre":
					_pulse_ogre_shock()
					behavior_cooldown = 3.0
					recovery_timer = 0.78
				elif enemy_type == "Punctuation Phantom":
					charge_timer = 0.24
					behavior_cooldown = 2.8
			queue_redraw()
		if charge_timer > 0.0:
			charge_timer = maxf(0.0, charge_timer - delta)
			if charge_timer == 0.0:
				behavior_cooldown = 3.0 if enemy_type == "Run-on Reaper" else 2.8
				recovery_timer = 0.72 if enemy_type == "Run-on Reaper" else 0.0
		if enemy_type in ["Idiom Imp", "Oxymoron Ogre"] and telegraph_timer > 0.0:
			queue_redraw()

func _harpy_movement(delta: float, dir: Vector2, distance_to_player: float) -> Vector2:
	if telegraph_timer > 0.0:
		return Vector2.ZERO
	if behavior_cooldown <= 0.0 and distance_to_player <= 440.0:
		attack_direction = dir
		telegraph_timer = 0.88
		behavior_cooldown = 2.75
		queue_redraw()
		return Vector2.ZERO
	# Harpies orbit at a readable firing distance instead of joining the melee pile.
	if distance_to_player < 205.0:
		return -dir * speed * 0.7
	if distance_to_player > 350.0:
		return dir * speed * 0.65
	return Vector2(-dir.y, dir.x) * speed * 0.42

func _reaper_movement(_delta: float, dir: Vector2) -> Vector2:
	if charge_timer > 0.0:
		return attack_direction * 500.0
	if telegraph_timer > 0.0 or recovery_timer > 0.0:
		return Vector2.ZERO
	if behavior_cooldown <= 0.0:
		attack_direction = dir
		telegraph_timer = 0.78
		queue_redraw()
		return Vector2.ZERO
	return dir * speed

func _imp_movement(dir: Vector2) -> Vector2:
	if telegraph_timer > 0.0:
		return Vector2.ZERO
	if behavior_cooldown <= 0.0 and target_player and global_position.distance_to(target_player.global_position) <= 360.0:
		telegraph_target_position = target_player.global_position
		telegraph_timer = 0.9
		behavior_cooldown = 4.4
		queue_redraw()
	return dir * speed

func _ogre_movement(dir: Vector2, distance_to_player: float) -> Vector2:
	if telegraph_timer > 0.0 or recovery_timer > 0.0:
		return Vector2.ZERO
	if behavior_cooldown <= 0.0 and distance_to_player <= 170.0:
		telegraph_timer = 0.84
		behavior_cooldown = 3.8
		queue_redraw()
		return Vector2.ZERO
	return dir * speed

func _spawn_ink_puddle(puddle_position: Vector2) -> void:
	if not is_inside_tree():
		return
	var puddles := get_tree().get_nodes_in_group("enemy_ink_puddles")
	while puddles.size() >= 4:
		var oldest = puddles.pop_front()
		if is_instance_valid(oldest):
			oldest.queue_free()
	var puddle := EnemyInkPuddle.new(damage_to_player * 0.25)
	get_tree().current_scene.add_child(puddle)
	puddle.global_position = puddle_position

func _pulse_ogre_shock() -> void:
	if not target_player or not is_instance_valid(target_player):
		return
	var distance := global_position.distance_to(target_player.global_position)
	if distance <= 118.0 and target_player.has_method("take_damage"):
		target_player.take_damage(damage_to_player * 0.75)

func _phantom_movement(dir: Vector2, distance_to_player: float) -> Vector2:
	if charge_timer > 0.0:
		return attack_direction * speed * 3.2
	if telegraph_timer > 0.0:
		return Vector2.ZERO
	if behavior_cooldown <= 0.0 and distance_to_player <= 300.0:
		attack_direction = dir
		telegraph_timer = 0.52
		queue_redraw()
		return Vector2.ZERO
	return dir * speed * 0.82

func _update_readable_motion() -> void:
	if not sprite:
		return
	var phase := float(Time.get_ticks_msec()) * 0.012
	var motion := Vector2.ONE
	match enemy_type:
		"Homophone Harpy":
			motion = Vector2(1.0 + sin(phase * 1.7) * 0.09, 1.0 - sin(phase * 1.7) * 0.09)
			if telegraph_timer > 0.0:
				motion = Vector2(1.24, 0.76)
		"Run-on Reaper":
			if telegraph_timer > 0.0:
				motion = Vector2(1.18, 0.68)
			elif charge_timer > 0.0:
				motion = Vector2(1.38, 0.76)
			elif recovery_timer > 0.0:
				motion = Vector2(0.78, 1.2)
		"Idiom Imp":
			if telegraph_timer > 0.0:
				motion = Vector2(0.84, 1.16)
		"Oxymoron Ogre":
			if telegraph_timer > 0.0:
				motion = Vector2(1.2, 0.82)
			elif recovery_timer > 0.0:
				motion = Vector2(0.82, 1.18)
		"Punctuation Phantom":
			motion = Vector2.ONE * (1.0 + sin(phase) * 0.035)
			if telegraph_timer > 0.0:
				motion = Vector2(0.72, 1.18)
			elif charge_timer > 0.0:
				motion = Vector2(1.3, 0.82)
	if hit_squash_timer > 0.0:
		var squash := clampf(hit_squash_timer / 0.11, 0.0, 1.0)
		motion *= Vector2(1.0 + 0.13 * squash, 1.0 - 0.10 * squash)
	sprite.scale = base_sprite_scale * motion

func fire_harpy_bolt():
	if not is_inside_tree():
		return
	var bolt = HarpyBolt.new(attack_direction, damage_to_player * 0.55)
	get_tree().current_scene.add_child(bolt)
	bolt.global_position = global_position + attack_direction * 24.0

func _draw():
	if telegraph_timer <= 0.0 and recovery_timer <= 0.0:
		return
	var is_harpy = enemy_type == "Homophone Harpy"
	var is_phantom = enemy_type == "Punctuation Phantom"
	if enemy_type == "Idiom Imp" and telegraph_timer > 0.0:
		var puddle_center := telegraph_target_position - global_position
		var pulse := 1.0 + 0.08 * sin(Time.get_ticks_msec() * 0.022)
		draw_circle(puddle_center, 31.0 * pulse, Color(0.48, 0.12, 0.7, 0.1))
		draw_arc(puddle_center, 31.0 * pulse, 0.0, TAU, 36, Color(0.72, 0.35, 0.94, 0.84), 3.0, true)
		return
	if enemy_type == "Oxymoron Ogre" and telegraph_timer > 0.0:
		var progress := 1.0 - telegraph_timer / 0.84
		var shock_radius := lerpf(24.0, 118.0, progress)
		draw_arc(Vector2.ZERO, shock_radius, 0.0, TAU, 48, Color(1.0, 0.38, 0.08, 0.82), 4.0, true)
		draw_arc(Vector2.ZERO, 118.0, 0.0, TAU, 48, Color(1.0, 0.72, 0.22, 0.44), 1.5, true)
		return
	if enemy_type == "Run-on Reaper" and recovery_timer > 0.0:
		draw_arc(Vector2.ZERO, 29.0, 0.0, TAU, 32, Color(0.36, 0.95, 0.54, 0.8), 2.5, true)
		return
	if telegraph_timer <= 0.0:
		return
	var line_length = 300.0 if is_harpy else (185.0 if is_phantom else 230.0)
	var tint = Color(0.96, 0.28, 0.24, 0.5 + 0.35 * absf(sin(Time.get_ticks_msec() * 0.018)))
	if is_harpy:
		tint = Color(0.95, 0.58, 0.20, tint.a)
	var endpoint = attack_direction * line_length
	if is_phantom:
		draw_arc(endpoint, 36.0, 0.0, TAU, 32, tint, 3.0, true)
		draw_arc(endpoint, 22.0, 0.0, TAU, 32, tint.lightened(0.25), 1.5, true)
	else:
		draw_line(Vector2.ZERO, endpoint, tint, 3.0, true)
		draw_arc(endpoint, 13.0, 0.0, TAU, 24, tint, 2.0, true)
	if threat_seal:
		draw_texture_rect(threat_seal, Rect2(endpoint - Vector2(18.0, 18.0), Vector2(36.0, 36.0)), false, tint)

func take_damage(amount: float, knock_dir: Vector2, impact_profile: String = "ink", is_critical: bool = false):
	amount *= StatsManager.get_relic_damage_multiplier(self)
	StatsManager.relic_on_enemy_hit(self)
	health -= amount
	if is_inside_tree() and get_tree().current_scene:
		var audio = get_tree().current_scene.get_node_or_null("AudioManager")
		if audio and audio.has_method("play_effect"):
			audio.play_effect("hit")
	flash_timer = 0.11 if is_critical else 0.09
	hit_squash_timer = 0.11 if is_critical else 0.075
	modulate = Color(2.5, 2.5, 2.5) if is_critical else Color(1.9, 1.9, 1.9)
	var push_strength := 205.0 if is_critical else 150.0
	knockback = knock_dir.normalized() * push_strength
	spawn_hit_effect("critical" if is_critical else impact_profile, knock_dir, is_critical)
	
	if health <= 0:
		die()

func spawn_hit_effect(impact_profile: String, knock_dir: Vector2, is_critical: bool = false) -> void:
	if not is_inside_tree():
		return
	var impact_index := int({"ink": 0, "gold": 0, "slash": 1, "shield": 2, "critical": 3, "heavy": 4, "rune": 5, "piercing": 6, "blunt": 7}.get(impact_profile, 0))
	var effect_sprite := Sprite2D.new()
	effect_sprite.name = "CombatHitEffect"
	effect_sprite.add_to_group("combat_hit_fx")
	effect_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	effect_sprite.texture = load("res://assets/sprites/effects/combat_hit_%d.png" % impact_index)
	effect_sprite.z_index = 18
	effect_sprite.global_position = global_position
	effect_sprite.rotation = knock_dir.angle()
	var size := 46.0 if is_critical else (40.0 if impact_profile == "heavy" else 30.0)
	effect_sprite.scale = Vector2.ONE * (size / 64.0 * 0.68)
	get_tree().current_scene.add_child(effect_sprite)
	effect_sprite.global_position = global_position
	var existing_effects := get_tree().get_nodes_in_group("combat_hit_fx")
	while existing_effects.size() > 40:
		var oldest = existing_effects.pop_front()
		if is_instance_valid(oldest) and oldest != effect_sprite:
			oldest.queue_free()
	var tween := effect_sprite.create_tween()
	tween.set_parallel(true)
	tween.tween_property(effect_sprite, "scale", Vector2.ONE * (size / 64.0), 0.12).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tween.tween_property(effect_sprite, "modulate:a", 0.0, 0.12)
	tween.chain().tween_callback(effect_sprite.queue_free)

func apply_stun(duration: float) -> void:
	stun_timer = maxf(stun_timer, duration)
	telegraph_timer = 0.0
	charge_timer = 0.0
	queue_redraw()

func apply_slow(duration: float, factor: float = 0.35) -> void:
	slow_timer = maxf(slow_timer, duration)
	slow_factor = minf(slow_factor, clampf(factor, 0.05, 1.0))

func apply_weapon_mark(duration: float) -> void:
	weapon_mark_timer = maxf(weapon_mark_timer, maxf(0.2, duration))
	queue_redraw()

func apply_burn(damage_per_tick: float, duration: float, stack_cap: int = 1) -> void:
	var next_stack := mini(maxi(stack_cap, 1), burn_stacks + 1)
	var previous_damage := burn_damage * float(burn_stacks)
	burn_stacks = next_stack
	burn_damage = minf(maxf(damage_per_tick, burn_damage), damage_per_tick * float(maxi(stack_cap, 1)))
	burn_timer = maxf(burn_timer, duration)
	if burn_timer > 0.0 and burn_tick_timer <= 0.0:
		burn_tick_timer = 0.2
	# Keep total tick output bounded when several flame hits land in one burst.
	if previous_damage > 0.0:
		burn_damage = minf(burn_damage, previous_damage / float(burn_stacks) + damage_per_tick * 0.5)

func die():
	if is_queued_for_deletion():
		return
	if is_inside_tree() and get_tree().current_scene:
		var audio = get_tree().current_scene.get_node_or_null("AudioManager")
		if audio and audio.has_method("play_effect"):
			audio.play_effect("death")
	if not suppress_rewards:
		StatsManager.register_kill()
		if randf() < 0.035:
			var scrolls := get_tree().get_nodes_in_group("health_scrolls")
			while scrolls.size() >= 2:
				var oldest = scrolls.pop_front()
				if is_instance_valid(oldest):
					oldest.queue_free()
			var health_scroll: Area2D = HEALTH_SCROLL_SCENE.instantiate()
			health_scroll.global_position = global_position
			get_tree().current_scene.call_deferred("add_child", health_scroll)
		if StatsManager.selected_character == "rune_sorceress":
			for nearby in get_tree().get_nodes_in_group("enemies"):
				if nearby != self and is_instance_valid(nearby) and global_position.distance_to(nearby.global_position) <= 118.0:
					var burst_direction = (nearby.global_position - global_position).normalized()
					nearby.take_damage(34.0 * StatsManager.damage_mult, burst_direction * 220.0)
		# Spawn ink drop
		if ink_drop_scene:
			var drop = ink_drop_scene.instantiate()
			drop.global_position = global_position
			drop.ink_value = ink_reward
			get_tree().current_scene.call_deferred("add_child", drop)
		
	queue_free()

func despawn_without_rewards():
	suppress_rewards = true
	queue_free()
