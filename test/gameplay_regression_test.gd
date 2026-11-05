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

	# Native mobile HUD exposes a touch override for deterministic headless checks.
	var hud = main.get_node("HUD")
	assert(hud.has_method("set_touch_ui_enabled_override"), "HUD must expose deterministic touch UI visibility for device and test use")
	assert(hud.has_method("set_inventory_open"), "HUD must expose an inventory open/close action")
	assert(hud.has_method("refresh_inventory"), "HUD must rebuild inventory from currently owned equipment")
	assert(hud.has_method("select_inventory_item"), "HUD must route gear selection through validated inventory actions")
	assert(hud.has_method("activate_gadget_touch"), "HUD must expose a touch action for the active gadget")
	hud.set_touch_ui_enabled_override(true)
	assert(hud.get_node("TouchControls").visible, "Touch actions must be visible when touchscreen input is enabled")
	var touch_controls: Control = hud.get_node("TouchControls")
	var original_control_width: float = touch_controls.offset_right - touch_controls.offset_left
	var original_control_height: float = touch_controls.offset_bottom - touch_controls.offset_top
	hud._apply_touch_safe_area_insets(72.0, 38.0)
	assert(is_equal_approx(touch_controls.offset_right - touch_controls.offset_left, original_control_width), "Right safe-area inset must move the whole touch cluster without shrinking its width")
	assert(is_equal_approx(touch_controls.offset_bottom - touch_controls.offset_top, original_control_height), "Bottom safe-area inset must move the whole touch cluster without shrinking its height")
	assert(is_equal_approx(touch_controls.offset_left, -306.0 - 72.0) and is_equal_approx(touch_controls.offset_right, -24.0 - 72.0), "Right inset must translate both horizontal cluster edges equally")
	assert(is_equal_approx(touch_controls.offset_top, -88.0 - 38.0) and is_equal_approx(touch_controls.offset_bottom, -24.0 - 38.0), "Bottom inset must translate both vertical cluster edges equally")
	hud._apply_touch_safe_area_insets(0.0, 0.0)
	var wave_manager = main.get_node("WaveManager")
	wave_manager.spawn_enemy()
	await process_frame
	wave_manager.spawn_timer = 0.01
	var wave_time_before_inventory: float = wave_manager.time_left
	var enemy_count_before_inventory: int = get_nodes_in_group("enemies").size()
	var paused_enemy: Node2D = get_nodes_in_group("enemies")[0]
	var paused_enemy_position: Vector2 = paused_enemy.global_position
	hud.set_inventory_open(true)
	assert(hud.inventory_open and hud.get_node("InventoryOverlay").visible, "Inventory must open from the touch action")
	assert(paused, "Inventory must pause wave and enemy simulation while open")
	assert(main.player.inventory_input_blocked, "Opening inventory must block movement input")
	await create_timer(0.2, true, false, true).timeout
	assert(is_equal_approx(wave_manager.time_left, wave_time_before_inventory), "Wave timer must remain frozen while inventory is open")
	assert(get_nodes_in_group("enemies").size() == enemy_count_before_inventory, "Enemy spawns must remain frozen while inventory is open")
	assert(paused_enemy.global_position.is_equal_approx(paused_enemy_position), "Enemy physics must remain frozen while inventory is open")
	assert(hud.select_inventory_item("gadget", "not_owned") == false, "An unowned gadget cannot be selected")
	hud.inventory_gadgets_tab.pressed.emit()
	assert(hud.inventory_category == "gadgets", "Gadget inventory tab switches to owned gadgets")
	hud.inventory_items.get_child(0).pressed.emit()
	assert(stats_manager.active_gadget == "dash", "The gadget inventory row selects owned equipment")
	assert(not hud.inventory_open and not main.player.inventory_input_blocked, "Selecting owned gear must close inventory and restore play input")
	assert(not paused, "Closing inventory resumes the current wave")
	var first_weapon: String = stats_manager.get_active_weapon_id()
	var second_weapon: String = ""
	for weapon_id in stats_manager.weapons_catalog:
		if weapon_id != first_weapon:
			second_weapon = weapon_id
			break
	assert(second_weapon != "", "At least two catalog weapons are available for loadout selection coverage")
	stats_manager.equip_weapon(second_weapon)
	hud.inventory_weapons_tab.pressed.emit()
	hud.set_inventory_open(true)
	var second_weapon_button: Button = null
	var expected_weapon_name: String = stats_manager.weapons_catalog[second_weapon]["name"].to_upper()
	for inventory_button in hud.inventory_items.get_children():
		if inventory_button is Button and inventory_button.text.ends_with(expected_weapon_name):
			second_weapon_button = inventory_button
	assert(second_weapon_button != null, "Owned weapons must appear as inventory touch targets")
	second_weapon_button.pressed.emit()
	assert(stats_manager.get_active_weapon_id() == second_weapon, "Loadout selection must update the active weapon")
	stats_manager.equipped_weapons = [first_weapon]
	stats_manager.active_weapon_index = 0
	main.player.sync_weapons()
	var gadget_activation_count := [0]
	stats_manager.gadget_activated.connect(func(_gadget_id: String): gadget_activation_count[0] += 1)
	main.player.gadget_timer = 0.0
	assert(hud.activate_gadget_touch(), "Touch action activates a ready gadget")
	assert(not hud.activate_gadget_touch(), "Touch action cannot activate the gadget while cooling down")
	assert(main.player.gadget_timer > 0.0 and gadget_activation_count[0] == 1, "Touch activation starts exactly one gadget cooldown")
	assert(hud.gadget_touch_button.icon != null, "Touch gadget action displays the selected gadget icon")
	assert(hud.gadget_touch_button.text == hud.gadget_status.text and hud.gadget_touch_button.disabled, "Touch gadget action displays its cooldown countdown and disables re-use")
	hud.update_gadget(0.0, main.player.gadget_cooldown)
	assert(hud.gadget_touch_button.text == "HAZIR" and not hud.gadget_touch_button.disabled, "Touch gadget action displays readiness when cooldown ends")
	var inventory_key := InputEventKey.new()
	inventory_key.keycode = KEY_I
	inventory_key.pressed = true
	main.player._unhandled_input(inventory_key)
	assert(hud.inventory_open, "I key opens native inventory for keyboard users")
	main.player._unhandled_input(inventory_key)
	assert(not hud.inventory_open and not paused, "I key closes inventory and resumes the run")
	main.player.gadget_timer = 0.0
	main.player.start_eraser_dash(Vector2.RIGHT)
	assert(main.player.is_dashing and main.player.is_invulnerable, "Dash grants temporary invulnerability")
	hud.set_inventory_open(true)
	assert(not main.player.is_dashing and not main.player.is_invulnerable, "Opening inventory cancels dash and its invulnerability")
	hud.set_inventory_open(false)
	main.player.invuln_timer.start(0.55)
	main.player.is_invulnerable = true
	main.player.start_eraser_dash(Vector2.RIGHT)
	hud.set_inventory_open(true)
	assert(not main.player.is_dashing and main.player.is_invulnerable, "Cancelling dash preserves damage i-frames already in progress")
	hud.set_inventory_open(false)
	main.player.invuln_timer.stop()
	main.player.is_invulnerable = false

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
