extends CharacterBody2D

@export var enemy_type: String = "Typo Slime"
@export var max_health: float = 25.0
@export var speed: float = 85.0
@export var damage_to_player: float = 8.0
@export var ink_reward: int = 1

var health: float
var target_player: Node2D = null
var flash_timer: float = 0.0
var attack_cooldown: float = 0.0
var knockback: Vector2 = Vector2.ZERO
var behavior_cooldown: float = 0.0
var telegraph_timer: float = 0.0
var charge_timer: float = 0.0
var attack_direction: Vector2 = Vector2.RIGHT
var suppress_rewards: bool = false
var stun_timer: float = 0.0
var slow_timer: float = 0.0
var slow_factor: float = 1.0
var base_sprite_scale: Vector2 = Vector2.ONE

@onready var sprite = $Sprite2D
@onready var label = $Label
var ink_drop_scene = preload("res://scenes/ink_drop.tscn")

var typo_words = ["Teh", "Woudl", "Recieve", "Becaue", "Definately", "Seperate", "Tomorow", "Untill", "Beautifull", "Acommodate"]
var grammar_pairs = ["is/are", "have/has", "their/there", "your/you're", "its/it's", "to/too", "affect/effect", "less/fewer", "who/whom"]
var threat_seal: Texture2D = null

class HarpyBolt extends Area2D:
	var direction: Vector2 = Vector2.RIGHT
	var speed: float = 300.0
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
				elif enemy_type in ["Run-on Reaper", "Punctuation Phantom"]:
					charge_timer = 0.42 if enemy_type == "Run-on Reaper" else 0.24
					behavior_cooldown = 2.4 if enemy_type == "Run-on Reaper" else 2.8
			queue_redraw()
		if charge_timer > 0.0:
			charge_timer = maxf(0.0, charge_timer - delta)
			if charge_timer == 0.0:
				behavior_cooldown = 2.4

func _harpy_movement(delta: float, dir: Vector2, distance_to_player: float) -> Vector2:
	if telegraph_timer > 0.0:
		return Vector2.ZERO
	if behavior_cooldown <= 0.0 and distance_to_player <= 440.0:
		attack_direction = dir
		telegraph_timer = 0.72
		behavior_cooldown = 2.25
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
		return attack_direction * 540.0
	if telegraph_timer > 0.0:
		return Vector2.ZERO
	if behavior_cooldown <= 0.0:
		attack_direction = dir
		telegraph_timer = 0.68
		queue_redraw()
		return Vector2.ZERO
	return dir * speed

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
		"Punctuation Phantom":
			motion = Vector2.ONE * (1.0 + sin(phase) * 0.035)
			if telegraph_timer > 0.0:
				motion = Vector2(0.72, 1.18)
			elif charge_timer > 0.0:
				motion = Vector2(1.3, 0.82)
	sprite.scale = base_sprite_scale * motion

func fire_harpy_bolt():
	if not is_inside_tree():
		return
	var bolt = HarpyBolt.new(attack_direction, damage_to_player * 0.55)
	get_tree().current_scene.add_child(bolt)
	bolt.global_position = global_position + attack_direction * 24.0

func _draw():
	if telegraph_timer <= 0.0:
		return
	var is_harpy = enemy_type == "Homophone Harpy"
	var is_phantom = enemy_type == "Punctuation Phantom"
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

func take_damage(amount: float, knock_dir: Vector2):
	health -= amount
	flash_timer = 0.09
	modulate = Color(2.5, 2.5, 2.5) # Bright white flash
	knockback = knock_dir.normalized() * 150.0
	
	if health <= 0:
		die()

func apply_stun(duration: float) -> void:
	stun_timer = maxf(stun_timer, duration)
	telegraph_timer = 0.0
	charge_timer = 0.0
	queue_redraw()

func apply_slow(duration: float, factor: float = 0.35) -> void:
	slow_timer = maxf(slow_timer, duration)
	slow_factor = minf(slow_factor, clampf(factor, 0.05, 1.0))

func die():
	if is_queued_for_deletion():
		return
	if not suppress_rewards:
		StatsManager.register_kill()
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
