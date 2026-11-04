extends Control

signal game_started()

@onready var char_cards_container = $Panel/VBox/CharCardsContainer
@onready var easy_btn = $Panel/VBox/DiffContainer/EasyButton
@onready var normal_btn = $Panel/VBox/DiffContainer/NormalButton
@onready var hard_btn = $Panel/VBox/DiffContainer/HardButton
@onready var start_button = $Panel/VBox/StartButton
@onready var diff_desc_label = $Panel/VBox/DiffDescLabel

var selected_char: String = "inky"
var selected_diff: String = "normal"

func _ready():
	easy_btn.pressed.connect(func(): set_difficulty("easy"))
	normal_btn.pressed.connect(func(): set_difficulty("normal"))
	hard_btn.pressed.connect(func(): set_difficulty("hard"))
	start_button.pressed.connect(_on_start_pressed)
	
	build_character_cards()
	set_difficulty("normal")

func build_character_cards():
	for child in char_cards_container.get_children():
		child.queue_free()
		
	var chars = StatsManager.characters
	for c_id in ["inky", "quillmaster", "word_knight"]:
		var c_data = chars[c_id]
		var card_btn = Button.new()
		card_btn.custom_minimum_size = Vector2(340, 260)
		card_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		
		var vbox = VBoxContainer.new()
		vbox.anchors_preset = Control.PRESET_FULL_RECT
		vbox.offset_left = 12
		vbox.offset_top = 10
		vbox.offset_right = -12
		vbox.offset_bottom = -10
		vbox.add_theme_constant_override("separation", 6)
		card_btn.add_child(vbox)
		
		var name_lbl = Label.new()
		name_lbl.text = c_data["name"]
		name_lbl.add_theme_font_size_override("font_size", 20)
		name_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vbox.add_child(name_lbl)
		
		var title_lbl = Label.new()
		title_lbl.text = c_data["title"]
		title_lbl.add_theme_font_size_override("font_size", 12)
		title_lbl.modulate = Color(0.4, 0.85, 1.0)
		title_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vbox.add_child(title_lbl)
		
		var stats_lbl = Label.new()
		stats_lbl.text = "❤️ " + str(int(c_data["hp"])) + " HP  |  ⚡ " + str(int(c_data["move_speed"])) + " Hız\n⚔️ " + str(c_data["damage_mult"]) + "x Hasar  |  🏹 " + str(c_data["attack_speed_mult"]) + "x Atış"
		if c_data["armor"] > 0:
			stats_lbl.text += "  |  🛡️ +%" + str(int(c_data["armor"] * 100)) + " Zırh"
		stats_lbl.modulate = Color(0.3, 1.0, 0.5)
		stats_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vbox.add_child(stats_lbl)
		
		var desc_lbl = Label.new()
		desc_lbl.text = c_data["desc"]
		desc_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		desc_lbl.modulate = Color(0.85, 0.85, 0.85)
		desc_lbl.add_theme_font_size_override("font_size", 12)
		vbox.add_child(desc_lbl)
		
		var pass_lbl = Label.new()
		pass_lbl.text = "★ " + c_data["passive"]
		pass_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		pass_lbl.modulate = Color(1.0, 0.85, 0.3)
		pass_lbl.add_theme_font_size_override("font_size", 11)
		vbox.add_child(pass_lbl)
		
		var cur_id = c_id
		card_btn.pressed.connect(func(): select_character(cur_id))
		char_cards_container.add_child(card_btn)
		
	update_character_selection_ui()

func select_character(char_id: String):
	selected_char = char_id
	StatsManager.select_character(char_id)
	update_character_selection_ui()

func update_character_selection_ui():
	var children = char_cards_container.get_children()
	var char_keys = ["inky", "quillmaster", "word_knight"]
	for i in range(min(children.size(), char_keys.size())):
		var btn = children[i] as Button
		if char_keys[i] == selected_char:
			btn.modulate = Color(1.3, 1.3, 1.0)
		else:
			btn.modulate = Color(0.7, 0.7, 0.7)

func set_difficulty(diff_id: String):
	selected_diff = diff_id
	StatsManager.set_difficulty(diff_id)
	
	easy_btn.modulate = Color(1.3, 1.3, 1.0) if diff_id == "easy" else Color(0.7, 0.7, 0.7)
	normal_btn.modulate = Color(1.3, 1.3, 1.0) if diff_id == "normal" else Color(0.7, 0.7, 0.7)
	hard_btn.modulate = Color(1.3, 1.3, 1.0) if diff_id == "hard" else Color(0.7, 0.7, 0.7)
	
	var d_data = StatsManager.difficulties.get(diff_id, {})
	diff_desc_label.text = d_data.get("desc", "")

func _on_start_pressed():
	hide()
	emit_signal("game_started")
