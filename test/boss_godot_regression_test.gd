extends Node

const WaveManagerScript = preload("res://scripts/wave_manager.gd")
const EnemyScene: PackedScene = preload("res://scenes/enemy.tscn")

func _ready() -> void:
	call_deferred("_run")

func _run() -> void:
	var stats = get_node("/root/StatsManager")
	var original_wave: int = stats.current_wave
	var arena := Node2D.new()
	arena.name = "BossRegressionArena"
	get_tree().root.add_child(arena)
	get_tree().current_scene = arena
	var player := CharacterBody2D.new()
	player.name = "RegressionPlayer"
	player.add_to_group("player")
	arena.add_child(player)
	var manager = WaveManagerScript.new()
	manager.enemy_scene = EnemyScene
	manager.player_ref = player
	arena.add_child(manager)

	# Normal waves stay on the established horde path and cannot be upgraded to
	# a boss encounter by a stray spawn call.
	stats.current_wave = 4
	manager.start_wave()
	assert(not manager.boss_wave_active, "Wave 4 must retain normal pacing")
	manager.spawn_milestone_boss()
	assert(not manager.boss_spawned, "A milestone boss must not spawn off-cycle")
	manager.spawn_enemy()
	assert(manager._active_enemy_count() == 1, "A normal wave should still spawn its regular enemy")
	var regular_enemy: Node = Enemy.get_active_enemies().back()
	assert(regular_enemy.enemy_type not in ["Red Pen Boss", "Lexicon Dragon Boss"], "Regular spawns must not include boss-class enemies")
	manager.end_wave()
	await get_tree().process_frame

	stats.current_wave = 51
	manager.max_active_enemies = 100
	manager.start_wave()
	for _spawn_index in range(100):
		manager.spawn_enemy()
	for enemy in Enemy.get_active_enemies():
		assert(enemy.enemy_type != "Lexicon Dragon Boss", "Random dragon appearances must be reserved for milestone waves")
	manager.end_wave()
	await get_tree().process_frame

	# A fifth wave is solo: reject regular spawn requests during the boss reveal,
	# spawn the authored boss, then wait for its actual death before handoff.
	stats.current_wave = 5
	manager.start_wave()
	assert(manager.boss_wave_active, "Every fifth wave must enter the solo boss flow")
	manager.end_wave()
	assert(manager.is_wave_active, "A milestone cannot finish before its boss has spawned")
	manager.spawn_enemy()
	assert(manager._active_enemy_count() == 0, "Boss waves must not spawn horde enemies")
	manager._process(1.1)
	await get_tree().process_frame
	assert(manager.boss_spawned, "Boss wave should spawn one authored boss")
	assert(manager._active_enemy_count() == 1, "Boss wave should contain exactly one combatant")
	var boss: Node = manager.milestone_boss
	assert(is_instance_valid(boss) and boss.is_milestone_boss, "Spawned combatant must be a tracked milestone boss")
	assert(boss.boss_custom_name == "KIRMIZI MÜFETTİŞ", "Wave 5 must select its authored boss identity")
	assert(boss.boss_skill_id == "judgment", "Wave 5 must use its distinct telegraphed skill")
	assert(boss.ink_reward == 60, "Wave 5 boss payout must match shared economy data")
	assert(stats.get_boss_wave_reward(100) == 155, "Final boss payout must grow from shared economy data")
	var opening_interval: float = boss.boss_skill_interval
	boss.health = boss.max_health * 0.65
	boss._milestone_boss_movement(0.0, Vector2.RIGHT, 300.0)
	assert(boss.boss_phase == 2 and boss.boss_skill_interval < opening_interval, "Phase two should increase boss pressure")
	var phase_two_interval: float = boss.boss_skill_interval
	boss.health = boss.max_health * 0.30
	boss._milestone_boss_movement(0.0, Vector2.RIGHT, 300.0)
	assert(boss.boss_phase == 3 and boss.boss_skill_interval < phase_two_interval, "Final phase should increase attack pace again")
	assert(boss._boss_telegraph_duration() >= 0.70, "Final phase must retain a readable dodge window")
	manager.end_wave()
	assert(manager.is_wave_active, "A direct wave-end request must not bypass a living milestone boss")
	boss.health = 1.0
	boss.take_damage(10.0, Vector2.ZERO)
	await get_tree().process_frame
	manager._process(0.016)
	assert(not manager.is_wave_active, "Defeating the solo boss must finish the wave")

	# The dragon is reserved for its authored milestone rather than appearing as
	# a random regular-wave enemy.
	stats.current_wave = 25
	manager.start_wave()
	manager._process(1.1)
	await get_tree().process_frame
	assert(manager.milestone_boss.enemy_type == "Lexicon Dragon Boss", "Wave 25 must spawn its authored dragon milestone")
	manager.milestone_boss.despawn_without_rewards()
	await get_tree().process_frame
	manager._process(0.016)
	stats.current_wave = original_wave
	print("Godot boss regression passed (off-cycle guard, solo milestone, boss-death handoff, authored dragon milestone).")
	get_tree().quit(0)
