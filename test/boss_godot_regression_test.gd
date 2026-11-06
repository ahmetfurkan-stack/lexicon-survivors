extends SceneTree

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	var stats = root.get_node("StatsManager")
	var packed: PackedScene = load("res://scenes/main.tscn")
	assert(packed != null, "Main scene should load for the boss regression")
	var main := packed.instantiate()
	root.add_child(main)
	current_scene = main
	await process_frame
	paused = false
	var manager: Node = main.get_node("WaveManager")
	stats.current_wave = 5
	manager.start_wave()
	assert(manager.boss_wave_active, "Every fifth wave must enter the solo boss flow")
	assert(manager._active_enemy_count() == 0, "Boss wave must not spawn horde enemies while the boss reveal is running")
	manager._process(1.1)
	await process_frame
	assert(manager.boss_spawned, "Boss wave should spawn one authored boss")
	assert(manager._active_enemy_count() == 1, "Boss wave should contain exactly one enemy combatant")
	var boss: Node = manager.milestone_boss
	assert(boss != null and boss.is_milestone_boss, "Spawned combatant must be flagged as a milestone boss")
	assert(boss.boss_custom_name == "KIRMIZI MÜFETTİŞ", "Wave 5 must select its authored boss identity")
	assert(boss.boss_skill_id == "judgment", "Wave 5 must have its own tell-driven skill")
	assert(boss.ink_reward == 60, "Wave 5 boss payout must match the shared economy table")
	assert(stats.get_boss_wave_reward(100) == 155, "Final boss payout must grow from shared economy data")
	boss.health = 1.0
	boss.take_damage(10.0, Vector2.ZERO)
	await process_frame
	manager._process(0.016)
	assert(not manager.is_wave_active, "Defeating the solo boss must immediately finish the wave")
	print("Godot boss regression passed (5-wave solo spawn, authored skill and immediate wave handoff).")
	quit(0)
