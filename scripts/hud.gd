extends CanvasLayer

@onready var hp_bar = $MarginContainer/VBox/TopRow/HealthBar
@onready var hp_label = $MarginContainer/VBox/TopRow/HealthBar/HPLabel
@onready var timer_label = $MarginContainer/VBox/TopRow/TimerLabel
@onready var ink_label = $MarginContainer/VBox/TopRow/InkLabel
@onready var kill_label = $MarginContainer/VBox/TopRow/KillLabel
@onready var char_diff_label = $MarginContainer/VBox/InfoRow/CharDiffLabel
@onready var weapons_label = $MarginContainer/VBox/InfoRow/WeaponsLabel

# Controls Row
@onready var speed_btn = $MarginContainer/VBox/ControlsRow/SpeedButton
@onready var auto_tur_btn = $MarginContainer/VBox/ControlsRow/AutoTurButton
@onready var auto_run_btn = $MarginContainer/VBox/ControlsRow/AutoRunButton
@onready var mistakes_btn = $MarginContainer/VBox/ControlsRow/MistakesButton

# Panels & Banners
@onready var gadget_status = $GadgetPanel/HBox/GadgetStatus
@onready var banner = $SynergyBanner
@onready var banner_title = $SynergyBanner/Title
@onready var banner_desc = $SynergyBanner/Desc
@onready var tactical_banner = $TacticalBanner
@onready var tactical_title = $TacticalBanner/Title
@onready var tactical_desc = $TacticalBanner/Desc

# Touch Controls
@onready var touch_controls = $TouchControls
@onready var joystick = $TouchControls/VirtualJoystick
@onready var joystick_knob = $TouchControls/VirtualJoystick/JoystickKnob
@onready var touch_weapon_btn = $TouchControls/TouchActions/TouchWeaponBtn
@onready var touch_gadget_btn = $TouchControls/TouchActions/TouchGadgetBtn

# Mistakes Modal
@onready var mistakes_modal = $MistakesModal
@onready var mistakes_list = $MistakesModal/Panel/Scroll/List
@onready var mistakes_close_btn = $MistakesModal/Panel/CloseBtn

var banner_timer: float = 0.0
var tactical_timer: float = 0.0
var is_joystick_dragging: bool = false
var joystick_center: Vector2 = Vector2(70, 70)

func _ready():
	banner.hide()
	tactical_banner.hide()
	mistakes_modal.hide()
	
	StatsManager.hp_changed.connect(_on_hp_changed)
	StatsManager.ink_changed.connect(_on_ink_changed)
	StatsManager.kill_count_changed.connect(_on_kill_changed)
	StatsManager.synergy_activated.connect(_on_synergy_activated)
	StatsManager.weapon_equipped.connect(_on_weapon_equipped)
	StatsManager.weapon_switched.connect(_on_weapon_switched)
	StatsManager.character_selected.connect(_on_character_changed)
	StatsManager.difficulty_selected.connect(_on_difficulty_changed)
	StatsManager.game_speed_changed.connect(_on_game_speed_changed)
	StatsManager.auto_new_tur_changed.connect(_on_auto_new_tur_changed)
	StatsManager.auto_new_run_changed.connect(_on_auto_new_run_changed)
	StatsManager.tactical_alert_requested.connect(_on_tactical_alert_requested)
	StatsManager.mistakes_updated.connect(update_mistakes_button_text)
	
	speed_btn.pressed.connect(_on_speed_btn_pressed)
	auto_tur_btn.pressed.connect(_on_auto_tur_btn_pressed)
	auto_run_btn.pressed.connect(_on_auto_run_btn_pressed)
	mistakes_btn.pressed.connect(open_mistakes_modal)
	mistakes_close_btn.pressed.connect(func(): mistakes_modal.hide())
	
	touch_weapon_btn.pressed.connect(func(): StatsManager.switch_next_weapon())
	touch_gadget_btn.pressed.connect(_on_touch_gadget_pressed)
	
	if joystick:
		joystick.gui_input.connect(_on_joystick_gui_input)
	
	_on_hp_changed(StatsManager.hp, StatsManager.max_hp)
	_on_ink_changed(StatsManager.ink_count)
	_on_kill_changed(StatsManager.kill_count)
	_on_game_speed_changed(StatsManager.game_speed)
	_on_auto_new_tur_changed(StatsManager.auto_new_tur)
	_on_auto_new_run_changed(StatsManager.auto_new_run)
	update_mistakes_button_text()
	update_info_row()
	
	# Connect player gadget cooldown if player exists
	var players = get_tree().get_nodes_in_group("player")
	if players.size() > 0:
		var p = players[0]
		if p.has_signal("gadget_cooldown_updated"):
			p.gadget_cooldown_updated.connect(update_gadget)

func _process(delta: float):
	if banner_timer > 0:
		banner_timer -= delta
		if banner_timer <= 0:
			banner.hide()
			
	if tactical_timer > 0:
		tactical_timer -= delta
		if tactical_timer <= 0:
			tactical_banner.hide()

func _on_joystick_gui_input(event: InputEvent):
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.pressed:
				is_joystick_dragging = true
				_handle_joystick_move(event.position)
			else:
				_reset_joystick()
	elif event is InputEventMouseMotion and is_joystick_dragging:
		_handle_joystick_move(event.position)
	elif event is InputEventScreenTouch:
		if event.pressed:
			is_joystick_dragging = true
			_handle_joystick_move(event.position)
		else:
			_reset_joystick()
	elif event is InputEventScreenDrag and is_joystick_dragging:
		_handle_joystick_move(event.position)

func _handle_joystick_move(pos: Vector2):
	var diff = pos - joystick_center
	var max_dist = 55.0
	if diff.length() > max_dist:
		diff = diff.normalized() * max_dist
	if joystick_knob:
		joystick_knob.position = joystick_center + diff - Vector2(25, 25)
	StatsManager.touch_input_direction = diff / max_dist

func _reset_joystick():
	is_joystick_dragging = false
	if joystick_knob:
		joystick_knob.position = joystick_center - Vector2(25, 25)
	StatsManager.touch_input_direction = Vector2.ZERO

func _on_touch_gadget_pressed():
	var players = get_tree().get_nodes_in_group("player")
	if players.size() > 0:
		var p = players[0]
		if p.has_method("trigger_current_gadget"):
			p.trigger_current_gadget(StatsManager.touch_input_direction)

func _on_speed_btn_pressed():
	StatsManager.cycle_game_speed()

func _on_auto_tur_btn_pressed():
	StatsManager.toggle_auto_new_tur()

func _on_auto_run_btn_pressed():
	StatsManager.toggle_auto_new_run()

func _on_game_speed_changed(spd: float):
	if speed_btn:
		speed_btn.text = "⚡ Hız: " + str(spd) + "x"

func _on_auto_new_tur_changed(enabled: bool):
	if auto_tur_btn:
		auto_tur_btn.text = "🔄 Oto-Tur: " + ("Açık" if enabled else "Kapalı")
		auto_tur_btn.modulate = Color(0.4, 1.0, 0.5) if enabled else Color(0.8, 0.8, 0.8)

func _on_auto_new_run_changed(enabled: bool):
	if auto_run_btn:
		auto_run_btn.text = "🔁 Oto-Run: " + ("Açık" if enabled else "Kapalı")
		auto_run_btn.modulate = Color(0.4, 1.0, 0.5) if enabled else Color(0.8, 0.8, 0.8)

func update_mistakes_button_text():
	if mistakes_btn:
		var count = StatsManager.mistake_words.size()
		mistakes_btn.text = "📖 Hatalar (" + str(count) + ")"

func open_mistakes_modal():
	mistakes_modal.show()
	for child in mistakes_list.get_children():
		child.queue_free()
		
	if StatsManager.mistake_words.is_empty():
		var empty_lbl = Label.new()
		empty_lbl.text = "Tebrikler! Hata defteriniz temiz.\nHiçbir yanlış cevap bulunmuyor."
		empty_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		empty_lbl.modulate = Color(0.4, 1.0, 0.5)
		mistakes_list.add_child(empty_lbl)
		return
		
	for card in StatsManager.mistake_words:
		var card_box = PanelContainer.new()
		var vb = VBoxContainer.new()
		vb.theme_override_constants.separation = 4
		
		var w_lbl = Label.new()
		w_lbl.text = "⚠️ " + card.get("word", "") + " [" + card.get("level", "A1") + "]"
		w_lbl.modulate = Color(1.0, 0.5, 0.4)
		vb.add_child(w_lbl)
		
		var q_lbl = Label.new()
		q_lbl.text = card.get("question", "")
		vb.add_child(q_lbl)
		
		var opts = card.get("options", [])
		var c_idx = card.get("correct_index", 0)
		var c_opt = opts[c_idx] if c_idx >= 0 and c_idx < opts.size() else ""
		var a_lbl = Label.new()
		a_lbl.text = "Doğru Cevap: " + c_opt
		a_lbl.modulate = Color(0.3, 1.0, 0.4)
		vb.add_child(a_lbl)
		
		card_box.add_child(vb)
		mistakes_list.add_child(card_box)

func _on_tactical_alert_requested(title: String, desc: String):
	tactical_banner.show()
	tactical_title.text = title
	tactical_desc.text = desc
	tactical_timer = 4.0

func update_timer(time_left: float, wave_num: int):
	timer_label.text = "⏳ Dalga " + str(wave_num) + " • " + str(int(ceil(time_left))) + "s"

func update_info_row():
	var char_data = StatsManager.characters.get(StatsManager.selected_character, {"name": "Inky"})
	var diff_data = StatsManager.difficulties.get(StatsManager.difficulty, {"name": "Orta"})
	char_diff_label.text = "👤 " + char_data["name"] + " • 🎯 " + diff_data["name"]
	
	var weap_names = []
	for i in range(StatsManager.equipped_weapons.size()):
		var w_id = StatsManager.equipped_weapons[i]
		var w_name = w_id
		if StatsManager.weapons_catalog.has(w_id):
			w_name = StatsManager.weapons_catalog[w_id]["name"].split(" ")[0]
		if i == StatsManager.active_weapon_index:
			weap_names.append("★ [" + str(i + 1) + ": " + w_name + "]")
		else:
			weap_names.append(str(i + 1) + ": " + w_name)
	weapons_label.text = "⚔️ " + " | ".join(weap_names) + " (Q/E/1-5 Değiştir)"

func update_gadget(time_left: float, _total_time: float):
	if not gadget_status:
		return
	if time_left <= 0.05:
		gadget_status.text = "HAZIR"
		gadget_status.modulate = Color(0.3, 1.0, 0.4)
	else:
		gadget_status.text = str(snapped(time_left, 0.1)) + "s"
		gadget_status.modulate = Color(1.0, 0.75, 0.3)

func _on_hp_changed(curr: float, max_h: float):
	hp_bar.max_value = max_h
	hp_bar.value = curr
	hp_label.text = str(int(curr)) + " / " + str(int(max_h)) + " HP"

func _on_ink_changed(val: int):
	ink_label.text = "💧 " + str(val)

func _on_kill_changed(val: int):
	kill_label.text = "💀 " + str(val)

func _on_weapon_equipped(_w_id: String):
	update_info_row()

func _on_weapon_switched(_w_id: String, _w_idx: int):
	update_info_row()

func _on_character_changed(_char_id: String):
	update_info_row()

func _on_difficulty_changed(_diff_id: String):
	update_info_row()

func _on_synergy_activated(syn_name: String, syn_desc: String):
	banner.show()
	banner_title.text = "★ YENİ SİNERJİ AÇILDI: " + syn_name + " ★"
	banner_desc.text = syn_desc
	banner_timer = 4.0
