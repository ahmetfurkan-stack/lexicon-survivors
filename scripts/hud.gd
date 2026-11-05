extends CanvasLayer

@onready var hp_bar = $MarginContainer/VBox/TopRow/HealthBar
@onready var hp_label = $MarginContainer/VBox/TopRow/HealthBar/HPLabel
@onready var timer_label = $MarginContainer/VBox/TopRow/TimerLabel
@onready var ink_label = $MarginContainer/VBox/TopRow/InkStat/InkLabel
@onready var kill_label = $MarginContainer/VBox/TopRow/KillStat/KillLabel
@onready var char_diff_label = $MarginContainer/VBox/InfoRow/CharDiffLabel
@onready var weapons_label = $MarginContainer/VBox/InfoRow/WeaponsLabel
@onready var gadget_status = $GadgetPanel/HBox/GadgetStatus
@onready var gadget_name = $GadgetPanel/HBox/GadgetName
@onready var gadget_glyph = $GadgetPanel/HBox/GadgetGlyph
@onready var banner = $SynergyBanner
@onready var banner_title = $SynergyBanner/Title
@onready var banner_desc = $SynergyBanner/Desc
@onready var chapter_card = $ChapterCard
@onready var chapter_kicker = $ChapterCard/Kicker
@onready var chapter_number = $ChapterCard/ChapterNumber
@onready var chapter_title = $ChapterCard/ChapterTitle
@onready var chapter_desc = $ChapterCard/ChapterDesc
@onready var chapter_accent = $ChapterCard/Accent
@onready var touch_controls: Control = $TouchControls
@onready var gadget_touch_button: Button = $TouchControls/ActionRow/GadgetTouchButton
@onready var inventory_overlay: Control = $InventoryOverlay
@onready var inventory_title: Label = $InventoryOverlay/InventoryPanel/InventoryLayout/InventoryHeader/InventoryTitle
@onready var inventory_items: VBoxContainer = $InventoryOverlay/InventoryPanel/InventoryLayout/InventoryScroll/InventoryItems
@onready var inventory_weapons_tab: Button = $InventoryOverlay/InventoryPanel/InventoryLayout/InventoryTabs/WeaponsTab
@onready var inventory_gadgets_tab: Button = $InventoryOverlay/InventoryPanel/InventoryLayout/InventoryTabs/GadgetsTab
@onready var inventory_close_button: Button = $InventoryOverlay/InventoryPanel/InventoryLayout/InventoryHeader/InventoryCloseButton

var banner_timer: float = 0.0
var chapter_timer: float = 0.0
var inventory_open: bool = false
var inventory_category: String = "weapons"
var _touch_ui_override: bool = false
var _has_touch_ui_override: bool = false

const CHAPTERS = [
	{
		"title": "KARANLIK KÜTÜPHANE",
		"kicker": "BÖLÜM I  ·  DALGALAR 01–25",
		"narration": "Kayıp kelimeleri rafların arasından geri çağır.",
		"accent": "c5aa72"
	},
	{
		"title": "SÖZ DEHLİZİ",
		"kicker": "BÖLÜM II  ·  DALGALAR 26–50",
		"narration": "Taş kapı açılır; duvarlardaki yanlış kelimeler uyanır.",
		"accent": "99a99d"
	},
	{
		"title": "ASTRAL GÖZLEMEVİ",
		"kicker": "BÖLÜM III  ·  DALGALAR 51–75",
		"narration": "Dehlizin son kapısı açılır; yıldızlar yeni sözcükler dizer.",
		"accent": "9baad1"
	},
	{
		"title": "SON SAYFA",
		"kicker": "BÖLÜM IV  ·  DALGALAR 76–100",
		"narration": "Kitap kapanır; boşlukta son kelimeler uyanır.",
		"accent": "bd91b7"
	}
]

func _ready():
	add_to_group("hud")
	banner.hide()
	chapter_card.hide()
	inventory_overlay.hide()
	touch_controls.visible = DisplayServer.is_touchscreen_available()
	gadget_touch_button.pressed.connect(activate_gadget_touch)
	$TouchControls/ActionRow/WeaponTouchButton.pressed.connect(StatsManager.switch_next_weapon)
	$TouchControls/ActionRow/InventoryTouchButton.pressed.connect(toggle_inventory)
	inventory_close_button.pressed.connect(func(): set_inventory_open(false))
	inventory_weapons_tab.pressed.connect(func(): _set_inventory_category("weapons"))
	inventory_gadgets_tab.pressed.connect(func(): _set_inventory_category("gadgets"))
	_apply_touch_safe_area()
	refresh_inventory()
	StatsManager.hp_changed.connect(_on_hp_changed)
	StatsManager.ink_changed.connect(_on_ink_changed)
	StatsManager.kill_count_changed.connect(_on_kill_changed)
	StatsManager.synergy_activated.connect(_on_synergy_activated)
	StatsManager.weapon_equipped.connect(_on_weapon_equipped)
	StatsManager.weapon_switched.connect(_on_weapon_switched)
	StatsManager.character_selected.connect(_on_character_changed)
	StatsManager.difficulty_selected.connect(_on_difficulty_changed)
	StatsManager.gadget_switched.connect(_on_gadget_switched)
	
	_on_hp_changed(StatsManager.hp, StatsManager.max_hp)
	_on_ink_changed(StatsManager.ink_count)
	_on_kill_changed(StatsManager.kill_count)
	_on_gadget_switched(StatsManager.active_gadget)
	update_info_row()
	
	# Connect player gadget cooldown if player exists
	var players = get_tree().get_nodes_in_group("player")
	if players.size() > 0:
		var p = players[0]
		if p.has_signal("gadget_cooldown_updated"):
			p.gadget_cooldown_updated.connect(update_gadget)
		if p.gadget_timer > 0.0:
			update_gadget(p.gadget_timer, p.gadget_cooldown)

func set_touch_ui_enabled_override(enabled: bool) -> void:
	_has_touch_ui_override = true
	_touch_ui_override = enabled
	_sync_touch_controls()

func _sync_touch_controls() -> void:
	if is_node_ready():
		touch_controls.visible = _touch_ui_override if _has_touch_ui_override else DisplayServer.is_touchscreen_available()

func _apply_touch_safe_area() -> void:
	var screen := DisplayServer.window_get_current_screen()
	var screen_size := DisplayServer.screen_get_size(screen)
	if screen_size.x <= 0 or screen_size.y <= 0:
		return
	var safe_rect := DisplayServer.get_display_safe_area()
	var viewport_size := get_viewport().get_visible_rect().size
	var right_inset := maxf(0.0, float(screen_size.x - safe_rect.end.x)) * viewport_size.x / float(screen_size.x)
	var bottom_inset := maxf(0.0, float(screen_size.y - safe_rect.end.y)) * viewport_size.y / float(screen_size.y)
	_apply_touch_safe_area_insets(right_inset, bottom_inset)

func _apply_touch_safe_area_insets(right_inset: float, bottom_inset: float) -> void:
	touch_controls.offset_left = -306.0 - right_inset
	touch_controls.offset_right = -24.0 - right_inset
	touch_controls.offset_top = -88.0 - bottom_inset
	touch_controls.offset_bottom = -24.0 - bottom_inset

func toggle_inventory() -> void:
	set_inventory_open(not inventory_open)

func _input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo and inventory_open:
		if event.keycode in [KEY_ESCAPE, KEY_I, KEY_TAB]:
			set_inventory_open(false)
			get_viewport().set_input_as_handled()

func set_inventory_open(open: bool) -> void:
	if open and get_tree().paused and not inventory_open:
		return
	inventory_open = open
	inventory_overlay.visible = open
	if open:
		refresh_inventory()
	var player := get_tree().get_first_node_in_group("player")
	if player and player.has_method("set_inventory_input_blocked"):
		player.set_inventory_input_blocked(open)
	get_tree().paused = open
	if is_inside_tree():
		get_viewport().set_input_as_handled()

func _set_inventory_category(category: String) -> void:
	inventory_category = category
	refresh_inventory()

func refresh_inventory() -> void:
	if not is_node_ready():
		return
	for child in inventory_items.get_children():
		inventory_items.remove_child(child)
		child.queue_free()
	var ids: Array = StatsManager.equipped_weapons if inventory_category == "weapons" else StatsManager.owned_gadgets
	var catalog: Dictionary = StatsManager.weapons_catalog if inventory_category == "weapons" else StatsManager.gadgets_catalog
	inventory_title.text = "SİLAH YÜKÜ" if inventory_category == "weapons" else "GEREÇ ÇANTASI"
	for raw_id in ids:
		var item_id := str(raw_id)
		var item_kind := "weapon" if inventory_category == "weapons" else "gadget"
		var item_data: Dictionary = catalog.get(item_id, {})
		var selected := StatsManager.get_active_weapon_id() == item_id if inventory_category == "weapons" else StatsManager.active_gadget == item_id
		var item_name := str(item_data.get("name", item_id.replace("_", " ")))
		var button := Button.new()
		button.custom_minimum_size = Vector2(0, 54)
		button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		button.text = ("SEÇİLİ  ·  " if selected else "") + item_name.to_upper()
		button.add_theme_font_size_override("font_size", 16)
		button.pressed.connect(func(): select_inventory_item(item_kind, item_id))
		inventory_items.add_child(button)
	if inventory_items.get_child_count() == 0:
		var empty_label := Label.new()
		empty_label.text = "Bu bölümde sahip olunan eşya yok."
		empty_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		inventory_items.add_child(empty_label)
	inventory_weapons_tab.disabled = inventory_category == "weapons"
	inventory_gadgets_tab.disabled = inventory_category == "gadgets"

func select_inventory_item(kind: String, item_id: String) -> bool:
	var selected := false
	if kind == "weapon":
		var index := StatsManager.equipped_weapons.find(item_id)
		if index >= 0:
			StatsManager.select_weapon_index(index)
			selected = true
	elif kind == "gadget":
		selected = StatsManager.select_gadget(item_id)
	if selected:
		refresh_inventory()
		set_inventory_open(false)
	return selected

func activate_gadget_touch() -> bool:
	var player := get_tree().get_first_node_in_group("player")
	if not player or not player.has_method("activate_active_gadget") or player.gadget_timer > 0.0:
		return false
	player.activate_active_gadget(player.get_gadget_direction())
	return true

func _process(delta: float):
	if chapter_timer > 0:
		chapter_timer -= delta
		if chapter_timer <= 0:
			chapter_card.hide()
	if banner_timer > 0:
		banner_timer -= delta
		if banner_timer <= 0:
			banner.hide()

func update_timer(time_left: float, wave_num: int):
	var biome_name = "KÜTÜPHANE" if wave_num < 26 else ("DEHLİZ" if wave_num < 51 else ("GÖZLEMEVİ" if wave_num < 76 else "SON SAYFA"))
	timer_label.text = biome_name + " · " + str(wave_num) + " / 100 · " + str(int(ceil(time_left))) + "s"

func show_arena_transition(stage_index: int):
	var chapter = CHAPTERS[clampi(stage_index, 0, CHAPTERS.size() - 1)]
	chapter_kicker.text = chapter["kicker"]
	chapter_number.text = ["I", "II", "III", "IV"][clampi(stage_index, 0, 3)]
	chapter_title.text = chapter["title"]
	chapter_desc.text = chapter["narration"]
	chapter_accent.color = Color(chapter["accent"])
	chapter_card.show()
	chapter_timer = 5.5

func update_info_row():
	var char_data = StatsManager.characters.get(StatsManager.selected_character, {"name": "Inky"})
	var difficulty_labels = {"easy": "A1–A2", "normal": "B1", "hard": "B2–C1"}
	char_diff_label.text = char_data["name"] + " · " + difficulty_labels.get(StatsManager.difficulty, "B1")
	
	var weap_names = []
	for i in range(StatsManager.equipped_weapons.size()):
		var w_id = StatsManager.equipped_weapons[i]
		var w_name = w_id
		if StatsManager.weapons_catalog.has(w_id):
			w_name = StatsManager.weapons_catalog[w_id]["name"].split(" ")[0]
		if i == StatsManager.active_weapon_index:
			weap_names.append(str(i + 1) + " · " + w_name)
		else:
			weap_names.append(str(i + 1) + ": " + w_name)
	weapons_label.text = "SİLAHLAR  " + "  /  ".join(weap_names) + "   Q/E"

func update_gadget(time_left: float, _total_time: float):
	if not gadget_status:
		return
	if time_left <= 0.05:
		gadget_status.text = "HAZIR"
		gadget_touch_button.text = "HAZIR"
		gadget_touch_button.disabled = false
		gadget_status.modulate = Color(0.77, 0.68, 0.49)
	else:
		var countdown := str(snapped(time_left, 0.1)) + "s"
		gadget_status.text = countdown
		gadget_touch_button.text = countdown
		gadget_touch_button.disabled = true
		gadget_status.modulate = Color(0.72, 0.72, 0.66)

func _on_gadget_switched(gadget_id: String) -> void:
	var labels := {
		"dash": "SİLGİ · SPACE",
		"ink_bomb": "MÜREKKEP · SPACE",
		"time_stop": "ZAMAN · SPACE",
		"shield": "KALKAN · SPACE",
		"magnet": "MANYETİK · SPACE"
	}
	var icons := {
		"dash": "eraser_icon.png",
		"ink_bomb": "gadget_ink_bomb.png",
		"time_stop": "gadget_time_stop.png",
		"shield": "gadget_shield.png",
		"magnet": "gadget_magnet.png"
	}
	gadget_name.text = labels.get(gadget_id, "GEREÇ · SPACE")
	var texture_path: String = "res://assets/sprites/" + str(icons.get(gadget_id, "eraser_icon.png"))
	gadget_glyph.texture = load(texture_path) as Texture2D
	gadget_touch_button.icon = gadget_glyph.texture
	gadget_touch_button.tooltip_text = labels.get(gadget_id, "GEREÇ · SPACE") + " · dokun ve kullan"
	update_gadget(0.0, 0.0)
	refresh_inventory()

func _on_hp_changed(curr: float, max_h: float):
	hp_bar.max_value = max_h
	hp_bar.value = curr
	hp_label.text = str(int(curr)) + " / " + str(int(max_h)) + " HP"

func _on_ink_changed(val: int):
	ink_label.text = str(val)

func _on_kill_changed(val: int):
	kill_label.text = str(val)

func _on_weapon_equipped(_w_id: String):
	update_info_row()
	refresh_inventory()

func _on_weapon_switched(_w_id: String, _w_idx: int):
	update_info_row()
	refresh_inventory()

func _on_character_changed(_char_id: String):
	update_info_row()

func _on_difficulty_changed(_diff_id: String):
	update_info_row()

func _on_synergy_activated(syn_name: String, syn_desc: String):
	banner.show()
	banner_title.text = "YENİ SİNERJİ · " + syn_name
	banner_desc.text = syn_desc
	banner_timer = 4.0
