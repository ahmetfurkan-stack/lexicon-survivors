extends SceneTree

func _init() -> void:
	call_deferred("_run")

func _run() -> void:
	var stats_manager = root.get_node("StatsManager")
	var main_scene: PackedScene = load("res://scenes/main.tscn")
	var main = main_scene.instantiate()
	root.add_child(main)
	current_scene = main
	await process_frame
	paused = false
	main.start_game()

	var wave_manager = main.get_node("WaveManager")
	wave_manager.max_active_enemies = 220
	for _i in range(90):
		wave_manager.spawn_enemy()
	await process_frame
	var active_enemies = get_nodes_in_group("enemies").size()
	assert(active_enemies == 48, "Wave 1 must use its lower wave-based enemy cap")
	assert(wave_manager._get_wave_enemy_cap() == 48, "Wave 1 cap should be derived from the current wave")
	for enemy in get_nodes_in_group("enemies"):
		enemy.queue_free()
	await process_frame
	stats_manager.current_wave = 12
	for _i in range(90):
		wave_manager.spawn_enemy()
	await process_frame
	active_enemies = get_nodes_in_group("enemies").size()
	assert(active_enemies == 70, "Wave 12 must allow a larger horde than wave 1")
	assert(wave_manager._get_wave_enemy_cap() == 70, "Wave 12 cap should continue scaling with the wave")

	var kills_before_cleanup = stats_manager.kill_count
	var ink_before_cleanup = stats_manager.ink_count
	wave_manager.end_wave()
	await process_frame
	assert(stats_manager.kill_count == kills_before_cleanup, "Wave cleanup must not grant kill credit")
	assert(stats_manager.ink_count == ink_before_cleanup, "Wave cleanup must not grant ink drops")
	assert(get_nodes_in_group("enemies").is_empty(), "Wave cleanup must remove all surviving enemies")

	# The gadget category must be visible and its purchase action must equip the selected item.
	var shop = main.shop_ui
	shop.open_shop()
	stats_manager.ink_count = 200
	shop._on_gadgets_tab_pressed()
	await process_frame
	assert(shop.cards_container.get_child_count() == stats_manager.gadgets_catalog.size(), "Gadget tab must render every available gadget")
	var ink_bomb_card: Control = null
	for card_panel in shop.cards_container.get_children():
		var card_title: Label = card_panel.get_child(0).get_child(1)
		if card_title.text == stats_manager.gadgets_catalog["ink_bomb"]["name"]:
			ink_bomb_card = card_panel
	assert(ink_bomb_card != null, "Ink bomb must appear as a purchasable gadget card")
	var buy_gadget_button: Button = ink_bomb_card.get_child(0).get_child(5)
	buy_gadget_button.pressed.emit()
	assert(stats_manager.active_gadget == "ink_bomb", "Buying a gadget from the shop must equip it")

	# A dash should damage each enemy once, even if overlap spans several physics frames.
	var player = main.player
	var selected_character_before_animation_test: String = stats_manager.selected_character
	for character_id in ["inky", "quillmaster", "word_knight", "rune_sorceress", "lexicon_alchemist", "shadow_lexicographer"]:
		stats_manager.selected_character = character_id
		player.apply_character_appearance()
		player.attack_anim_timer = 0.0
		player._update_hero_animation()
		assert(player.sprite.texture.resource_path.contains("animations/"), "%s must load its generated idle/run/attack animation set" % character_id)
	stats_manager.selected_character = selected_character_before_animation_test
	player.apply_character_appearance()
	player._update_hero_animation()

	var dash_target = load("res://scenes/enemy.tscn").instantiate()
	dash_target.enemy_type = "Typo Slime"
	main.add_child(dash_target)
	await process_frame
	dash_target.set_physics_process(false)
	dash_target.global_position = player.global_position
	var hp_before_dash: float = dash_target.health
	player.start_eraser_dash(Vector2.RIGHT)
	player.erase_nearby_enemies()
	player.erase_nearby_enemies()
	assert(is_equal_approx(dash_target.health, hp_before_dash - 45.0 * stats_manager.damage_mult), "Dash contact may damage an enemy only once per dash")
	dash_target.queue_free()

	paused = false
	var harpy = load("res://scenes/enemy.tscn").instantiate()
	harpy.enemy_type = "Homophone Harpy"
	main.add_child(harpy)
	await process_frame
	var harpy_dir = Vector2.RIGHT
	var harpy_velocity = harpy._harpy_movement(0.016, harpy_dir, 300.0)
	assert(harpy.telegraph_timer > 0.0, "Harpy must telegraph before firing")
	assert(harpy_velocity == Vector2.ZERO, "Harpy should pause to telegraph its ranged shot")

	var reaper = load("res://scenes/enemy.tscn").instantiate()
	reaper.enemy_type = "Run-on Reaper"
	main.add_child(reaper)
	await process_frame
	reaper._reaper_movement(0.016, Vector2.RIGHT)
	assert(reaper.telegraph_timer > 0.0, "Reaper must telegraph before charging")

	var phantom = load("res://scenes/enemy.tscn").instantiate()
	phantom.enemy_type = "Punctuation Phantom"
	main.add_child(phantom)
	await process_frame
	var phantom_velocity = phantom._phantom_movement(Vector2.RIGHT, 120.0)
	assert(phantom.telegraph_timer > 0.0, "Punctuation Phantom must wind up before its blink strike")
	assert(phantom_velocity == Vector2.ZERO, "Punctuation Phantom should pause during its strike telegraph")

	# Verify the player can physically enter the arena's lower-right corner.
	for enemy in [harpy, reaper, phantom]:
		enemy.queue_free()
	await process_frame
	paused = false
	shop.hide()
	wave_manager.is_wave_active = false
	for enemy in get_nodes_in_group("enemies"):
		enemy.queue_free()
	await process_frame
	player.set_physics_process(false)
	player.global_position = Vector2(1090.0, 790.0)
	for _i in range(14):
		await physics_frame
		player.velocity = Vector2(600.0, 600.0)
		player.move_and_slide()
	print("Corner movement test stopped at ", player.global_position)
	assert(player.global_position.x > 1135.0 and player.global_position.y > 835.0, "Overlapping wall corners must leave the arena corner reachable")

	print("Gameplay regression checks passed: wave-scaled cap, cleanup rewards, gadget shop, dash damage, corner access, enemy telegraphs")
	main.queue_free()
	await process_frame
	quit(0)
