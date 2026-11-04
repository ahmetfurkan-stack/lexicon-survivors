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

# Tactical Affixes & Boss Phases
var affix: String = "" # "", "shielded", "blinker", "commander", "volatile"
var blink_timer: float = 4.0
var commander_aura_timer: float = 1.0
var is_exploding: bool = false
var explode_timer: float = 0.0

var is_boss: bool = false
var is_enraged: bool = false
var laser_cooldown: float = 5.0
var laser_warning_timer: float = 0.0
var laser_active_timer: float = 0.0
var laser_target_pos: Vector2 = Vector2.ZERO

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
			
	is_boss = (enemy_type == "Red Pen Boss" or enemy_type == "Lexicon Dragon Boss")
	health = max_health
	
	if affix != "" and label:
		match affix:
			"shielded":
				label.text = "🛡️ " + label.text
			"blinker":
				label.text = "⚡ " + label.text
			"commander":
				label.text = "🔮 " + label.text
			"volatile":
				label.text = "💣 " + label.text

func _draw():
	if affix == "shielded":
		draw_arc(Vector2.ZERO, 22.0, -PI/2.5, PI/2.5, 16, Color(0.2, 0.8, 1.0, 0.85), 3.0)
	elif affix == "commander":
		draw_circle(Vector2.ZERO, 40.0, Color(0.8, 0.3, 1.0, 0.12))
		draw_arc(Vector2.ZERO, 40.0, 0, TAU, 24, Color(0.9, 0.4, 1.0, 0.7), 2.0)
	elif is_exploding:
		var pulse = 0.5 + sin(explode_timer * 22.0) * 0.45
		draw_circle(Vector2.ZERO, 55.0, Color(1.0, 0.2, 0.2, pulse))
		
	if is_enraged and laser_warning_timer > 0:
		var target_local = to_local(laser_target_pos)
		draw_line(Vector2.ZERO, target_local, Color(1.0, 0.2, 0.2, 0.65), 2.0)
	elif is_enraged and laser_active_timer > 0:
		var target_local = to_local(laser_target_pos)
		draw_line(Vector2.ZERO, target_local, Color(1.0, 0.85, 0.3, 0.95), 12.0)

func _physics_process(delta: float):
	queue_redraw()
	
	# Volatile death bomb countdown
	if is_exploding:
		explode_timer -= delta
		velocity = Vector2.ZERO
		modulate = Color(2.5, 0.4, 0.4) if int(explode_timer * 12.0) % 2 == 0 else Color.WHITE
		if explode_timer <= 0:
			detonate_volatile_bomb()
		return
		
	if flash_timer > 0:
		flash_timer -= delta
		if flash_timer <= 0:
			modulate = Color(2.5, 0.4, 0.4) if is_enraged else Color.WHITE
			
	if attack_cooldown > 0:
		attack_cooldown -= delta
		
	# Affix: Blinker teleport
	if affix == "blinker" and target_player and is_instance_valid(target_player):
		blink_timer -= delta
		if blink_timer <= 0:
			blink_timer = 4.2
			var blink_ang = randf() * TAU
			global_position = target_player.global_position + Vector2(cos(blink_ang), sin(blink_ang)) * randf_range(110.0, 150.0)
			StatsManager.add_floating_text(global_position + Vector2(0, -20), "⚡ SIÇRAMA!", Color(1.0, 0.9, 0.2), 16)
			
	# Affix: Commander buffing aura
	if affix == "commander":
		commander_aura_timer -= delta
		if commander_aura_timer <= 0:
			commander_aura_timer = 1.0
			var enemies = get_tree().get_nodes_in_group("enemies")
			for e in enemies:
				if is_instance_valid(e) and e != self and global_position.distance_to(e.global_position) <= 180.0:
					if "speed" in e and not e.is_boss:
						e.speed = min(e.speed * 1.35, 260.0)
						
	# Boss Enraged Laser Attack Cycle
	if is_enraged and target_player and is_instance_valid(target_player):
		if laser_warning_timer > 0:
			laser_warning_timer -= delta
			laser_target_pos = target_player.global_position
			if laser_warning_timer <= 0:
				laser_active_timer = 0.4
				StatsManager.trigger_screen_shake(0.35, 10.0)
				# Check if laser hit player
				var to_player = target_player.global_position - global_position
				var to_target = laser_target_pos - global_position
				if to_player.angle_to(to_target) < 0.25 and to_player.length() <= 800.0:
					if target_player.has_method("take_damage"):
						target_player.take_damage(damage_to_player * 1.5)
		elif laser_active_timer > 0:
			laser_active_timer -= delta
		else:
			laser_cooldown -= delta
			if laser_cooldown <= 0:
				laser_cooldown = 5.5
				laser_warning_timer = 1.0
				laser_target_pos = target_player.global_position
				StatsManager.add_floating_text(global_position + Vector2(0, -40), "⚠️ LAZER KİLİTLENDİ!", Color(1.0, 0.2, 0.2), 22)
		
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

func trigger_boss_enrage():
	is_enraged = true
	speed *= 1.25
	damage_to_player *= 1.25
	modulate = Color(2.8, 0.4, 0.4)
	StatsManager.trigger_screen_shake(0.45, 12.0)
	StatsManager.trigger_tactical_alert("⚠️ BOSS PHASE 2 KIZGINLIK!", "Hız ve hasar arttı, telegraphed ölümcül lazer ışını devrede!")
	StatsManager.add_floating_text(global_position + Vector2(0, -45), "🔥 ENRAGED PHASE 2!", Color(1.0, 0.2, 0.2), 26)

func start_volatile_explosion():
	is_exploding = true
	explode_timer = 1.1
	StatsManager.add_floating_text(global_position + Vector2(0, -25), "💣 PATLAMA GERİ SAYIMI!", Color(1.0, 0.3, 0.2), 18)

func detonate_volatile_bomb():
	StatsManager.trigger_screen_shake(0.3, 9.0)
	var players = get_tree().get_nodes_in_group("player")
	if players.size() > 0:
		var p = players[0]
		if is_instance_valid(p) and global_position.distance_to(p.global_position) <= 140.0:
			if p.has_method("take_damage"):
				p.take_damage(damage_to_player * 1.2)
	die()

func take_damage(amount: float, knock_dir: Vector2):
	if is_exploding:
		return
		
	var final_dmg = amount
	var is_crit = randf() < StatsManager.crit_chance
	if is_crit:
		final_dmg *= 1.75
		
	if affix == "shielded":
		var to_hit = -knock_dir.normalized()
		var facing = velocity.normalized()
		if to_hit.dot(facing) > 0.0:
			final_dmg *= 0.25
			StatsManager.add_floating_text(global_position + Vector2(0, -30), "🛡️ KALKAN! -" + str(int(final_dmg)), Color(0.4, 0.8, 1.0), 16)
		else:
			var txt = str(int(final_dmg)) + "!" if is_crit else str(int(final_dmg))
			var col = Color(1.0, 0.85, 0.2) if is_crit else Color(1.0, 0.3, 0.3)
			StatsManager.add_floating_text(global_position + Vector2(0, -25), txt, col, 20 if is_crit else 17)
	else:
		var txt = str(int(final_dmg)) + "!" if is_crit else str(int(final_dmg))
		var col = Color(1.0, 0.85, 0.2) if is_crit else Color(1.0, 0.3, 0.3)
		StatsManager.add_floating_text(global_position + Vector2(0, -25), txt, col, 20 if is_crit else 17)
		
	health -= final_dmg
	flash_timer = 0.09
	modulate = Color(2.5, 2.5, 2.5) # Bright white flash
	knockback = knock_dir.normalized() * 150.0
	
	if is_boss and not is_enraged and health < max_health * 0.5:
		trigger_boss_enrage()
		
	if health <= 0:
		if affix == "volatile" and not is_exploding:
			start_volatile_explosion()
		else:
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
