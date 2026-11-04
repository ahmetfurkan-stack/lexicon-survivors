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

@onready var sprite = $Sprite2D
@onready var label = $Label
var ink_drop_scene = preload("res://scenes/ink_drop.tscn")

var typo_words = ["Teh", "Woudl", "Recieve", "Becaue", "Definately", "Seperate", "Tomorow", "Untill", "Beautifull", "Acommodate"]
var grammar_pairs = ["is/are", "have/has", "their/there", "your/you're", "its/it's", "to/too", "affect/effect", "less/fewer", "who/whom"]

func _ready():
	add_to_group("enemies")
	setup_type()

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
			sprite.texture = load("res://assets/sprites/typo_slime.png")
		if label:
			label.text = typo_words[randi() % typo_words.size()]
	elif enemy_type == "Grammar Goblin":
		max_health = (90.0 + (StatsManager.current_wave - 1) * 28.0) * hp_mult
		speed = (155.0 + (StatsManager.current_wave - 1) * 5.0) * spd_mult
		damage_to_player = 32.0 * dmg_mult
		ink_reward = 3
		if sprite:
			sprite.texture = load("res://assets/sprites/grammar_goblin.png")
		if label:
			label.text = grammar_pairs[randi() % grammar_pairs.size()]
	elif enemy_type == "Typo Splinter":
		max_health = (50.0 + StatsManager.current_wave * 12.0) * hp_mult
		speed = (175.0 + StatsManager.current_wave * 5.0) * spd_mult
		damage_to_player = 22.0 * dmg_mult
		ink_reward = 1
		if sprite:
			sprite.texture = load("res://assets/sprites/typo_splinter.png")
		if label:
			label.text = "Splinter"
	elif enemy_type == "Punctuation Phantom":
		max_health = (110.0 + (StatsManager.current_wave - 1) * 32.0) * hp_mult
		speed = (135.0 + (StatsManager.current_wave - 1) * 4.0) * spd_mult
		damage_to_player = 34.0 * dmg_mult
		ink_reward = 4
		if sprite:
			sprite.texture = load("res://assets/sprites/punctuation_phantom.png")
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
			sprite.texture = load("res://assets/sprites/spelling_spectre.png")
		if label:
			label.text = "Spectre"
	elif enemy_type == "Red Pen Boss":
		max_health = (2400.0 + StatsManager.current_wave * 130.0) * hp_mult
		speed = 52.0 * spd_mult
		damage_to_player = (95.0 + StatsManager.current_wave * 1.8) * dmg_mult
		ink_reward = 60
		if sprite:
			sprite.texture = load("res://assets/sprites/red_pen_boss.png")
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
			sprite.texture = load("res://assets/sprites/homophone_harpy.png")
		if label:
			label.text = "HARPY"
	elif enemy_type == "Idiom Imp":
		max_health = (120.0 + (StatsManager.current_wave - 1) * 30.0) * hp_mult
		speed = 185.0 * spd_mult
		damage_to_player = 34.0 * dmg_mult
		ink_reward = 4
		if sprite:
			sprite.texture = load("res://assets/sprites/idiom_imp.png")
		if label:
			label.text = "IDIOM IMP"
	elif enemy_type == "Tautology Twin":
		max_health = (160.0 + (StatsManager.current_wave - 1) * 35.0) * hp_mult
		speed = 140.0 * spd_mult
		damage_to_player = 32.0 * dmg_mult
		ink_reward = 5
		if sprite:
			sprite.texture = load("res://assets/sprites/tautology_twin.png")
		if label:
			label.text = "TAUTOLOGY"
	elif enemy_type == "Run-on Reaper":
		max_health = (180.0 + (StatsManager.current_wave - 1) * 38.0) * hp_mult
		speed = 195.0 * spd_mult
		damage_to_player = 36.0 * dmg_mult
		ink_reward = 6
		if sprite:
			sprite.texture = load("res://assets/sprites/run_on_reaper.png")
		if label:
			label.text = "RUN-ON"
	elif enemy_type == "Dangling Modifier":
		max_health = (130.0 + (StatsManager.current_wave - 1) * 30.0) * hp_mult
		speed = 165.0 * spd_mult
		damage_to_player = 28.0 * dmg_mult
		ink_reward = 5
		if sprite:
			sprite.texture = load("res://assets/sprites/dangling_modifier.png")
		if label:
			label.text = "DANGLING"
	elif enemy_type == "Double Negative Drake":
		max_health = (340.0 + (StatsManager.current_wave - 1) * 80.0) * hp_mult
		speed = 110.0 * spd_mult
		damage_to_player = 42.0 * dmg_mult
		ink_reward = 8
		if sprite:
			sprite.texture = load("res://assets/sprites/double_negative_drake.png")
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
			sprite.texture = load("res://assets/sprites/lexicon_dragon_boss.png")
		if label:
			label.text = "LEXICON DRAGON OVERLORD"
			
	health = max_health

func _physics_process(delta: float):
	if flash_timer > 0:
		flash_timer -= delta
		if flash_timer <= 0:
			modulate = Color.WHITE
			
	if attack_cooldown > 0:
		attack_cooldown -= delta
		
	# Find player
	if not target_player or not is_instance_valid(target_player):
		if is_inside_tree():
			var players = get_tree().get_nodes_in_group("player")
			if players.size() > 0:
				target_player = players[0]
			
	if target_player and is_instance_valid(target_player):
		var dir = (target_player.global_position - global_position).normalized()
		
		# Flip sprite based on direction
		if sprite and dir.x != 0:
			sprite.flip_h = dir.x < 0
			
		velocity = dir * speed + knockback
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

func take_damage(amount: float, knock_dir: Vector2):
	health -= amount
	flash_timer = 0.09
	modulate = Color(2.5, 2.5, 2.5) # Bright white flash
	knockback = knock_dir.normalized() * 150.0
	
	if health <= 0:
		die()

func die():
	StatsManager.register_kill()
	# Spawn ink drop
	if ink_drop_scene:
		var drop = ink_drop_scene.instantiate()
		drop.global_position = global_position
		drop.ink_value = ink_reward
		get_tree().current_scene.call_deferred("add_child", drop)
		
	queue_free()
