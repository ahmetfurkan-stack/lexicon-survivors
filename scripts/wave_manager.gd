extends Node2D

signal wave_timer_updated(time_remaining: float)
signal wave_finished()
signal wave_started(wave_number: int)

@export var enemy_scene: PackedScene = preload("res://scenes/enemy.tscn")
@export var wave_duration: float = 25.0
@export var max_active_enemies: int = 220

var time_left: float = 25.0
var spawn_timer: float = 0.0
var is_wave_active: bool = false
var player_ref: Node2D = null

func start_wave():
	time_left = wave_duration
	is_wave_active = true
	spawn_timer = 0.5
	emit_signal("wave_started", StatsManager.current_wave)
	emit_signal("wave_timer_updated", time_left)

func _process(delta: float):
	if not is_wave_active:
		return
		
	time_left -= delta
	emit_signal("wave_timer_updated", max(0.0, time_left))
	
	if time_left <= 0:
		end_wave()
		return
		
	var wave_enemy_cap := _get_wave_enemy_cap()
	var active_count = _active_enemy_count()
	if active_count >= wave_enemy_cap:
		# Hold the spawn clock at the cap so clearing space resumes the cadence cleanly.
		spawn_timer = max(spawn_timer, 0.0)
		return

	spawn_timer -= delta
	var diff_factor = 1.15 if StatsManager.difficulty == "easy" else (0.80 if StatsManager.difficulty == "hard" else 1.0)
	var spawn_interval = max(0.12, (0.60 - (StatsManager.current_wave * 0.04)) * diff_factor)
	if spawn_timer <= 0:
		spawn_timer = spawn_interval
		var batch_count = 3 if StatsManager.current_wave >= 25 else (2 if StatsManager.current_wave >= 8 else 1)
		var available_slots = wave_enemy_cap - _active_enemy_count()
		for i in range(min(batch_count, available_slots)):
			spawn_enemy()

func _active_enemy_count() -> int:
	var count = 0
	for enemy in get_tree().get_nodes_in_group("enemies"):
		if is_instance_valid(enemy) and not enemy.is_queued_for_deletion():
			count += 1
	return count

func _get_wave_enemy_cap() -> int:
	# Early waves keep readable space around the player; later waves build into
	# the larger horde the pacing promises, with a performance ceiling at 220.
	return mini(max_active_enemies, 48 + maxi(0, StatsManager.current_wave - 1) * 2)

func find_player():
	if not is_inside_tree():
		return
	if not player_ref or not is_instance_valid(player_ref):
		var players = get_tree().get_nodes_in_group("player")
		if players.size() > 0:
			player_ref = players[0]

func spawn_enemy():
	if not is_inside_tree():
		return
	if _active_enemy_count() >= _get_wave_enemy_cap():
		return
	find_player()
	if not player_ref:
		return
		
	# Random angle around player at distance ~680
	var angle = randf() * TAU
	var spawn_pos = player_ref.global_position + Vector2(cos(angle), sin(angle)) * 680.0
	
	var enemy = enemy_scene.instantiate()
	enemy.global_position = spawn_pos
	
	# Choose type based on wave
	var roll = randf()
	var wave = StatsManager.current_wave
	if wave >= 50 and roll < 0.05:
		enemy.enemy_type = "Lexicon Dragon Boss"
	elif wave >= 30 and roll < 0.12:
		enemy.enemy_type = "Oxymoron Ogre"
	elif wave >= 25 and roll < 0.22:
		enemy.enemy_type = "Double Negative Drake"
	elif wave >= 25 and roll < 0.30:
		enemy.enemy_type = "Vocabulary Void"
	elif wave >= 20 and roll < 0.38:
		enemy.enemy_type = "Palindrome Phantom"
	elif wave >= 20 and roll < 0.46:
		enemy.enemy_type = "Homophone Harpy"
	elif wave >= 15 and roll < 0.54:
		enemy.enemy_type = "Dangling Modifier"
	elif wave >= 15 and roll < 0.62:
		enemy.enemy_type = "Malapropism Mimic"
	elif wave >= 10 and roll < 0.70:
		enemy.enemy_type = "Run-on Reaper"
	elif wave >= 10 and roll < 0.78:
		enemy.enemy_type = "Idiom Imp"
	elif wave >= 5 and roll < 0.85:
		enemy.enemy_type = "Tautology Twin"
	elif wave >= 5 and roll < 0.90:
		enemy.enemy_type = "Punctuation Phantom"
	elif roll < 0.95:
		enemy.enemy_type = "Grammar Goblin"
	else:
		enemy.enemy_type = "Typo Slime"
		
	get_tree().current_scene.add_child(enemy)

func end_wave():
	is_wave_active = false
	# Remove survivors without treating a timed wave transition as player kills.
	var enemies = get_tree().get_nodes_in_group("enemies")
	for e in enemies:
		if is_instance_valid(e):
			if e.has_method("despawn_without_rewards"):
				e.despawn_without_rewards()
			else:
				e.queue_free()
	for projectile in get_tree().get_nodes_in_group("enemy_projectiles"):
		if is_instance_valid(projectile):
			projectile.queue_free()
	emit_signal("wave_finished")
