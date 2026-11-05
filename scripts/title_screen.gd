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

const DIFFICULTY_DESCRIPTIONS = {
	"easy": "Düşmanlar daha yavaş ve daha az dayanıklıdır. Başlangıç canı +40 HP.",
	"normal": "Dengeli dalga temposu ve toplanabilir can parşömenleri.",
	"hard": "Çevik, dayanıklı düşmanlar ve daha hızlı bir arena temposu."
}

func _ready():
	easy_btn.pressed.connect(func(): set_difficulty("easy"))
	normal_btn.pressed.connect(func(): set_difficulty("normal"))
	hard_btn.pressed.connect(func(): set_difficulty("hard"))
	start_button.pressed.connect(_on_start_pressed)
	_style_start_button()
	
	build_character_cards()
	set_difficulty("normal")

func build_character_cards():
	for child in char_cards_container.get_children():
		child.queue_free()
		
	var chars = StatsManager.characters
	var character_ids = ["inky", "quillmaster", "word_knight", "rune_sorceress", "lexicon_alchemist", "shadow_lexicographer"]
	for c_id in character_ids:
		var c_data = chars[c_id]
		var card_btn = Button.new()
		card_btn.custom_minimum_size = Vector2(350, 166)
		card_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		card_btn.focus_mode = Control.FOCUS_ALL
		card_btn.add_theme_stylebox_override("normal", _card_style(Color("#202825"), Color("#435048")))
		card_btn.add_theme_stylebox_override("hover", _card_style(Color("#28332e"), Color("#8f8058")))
		card_btn.add_theme_stylebox_override("pressed", _card_style(Color("#303b34"), Color("#b7a36b")))
		card_btn.add_theme_stylebox_override("focus", _card_style(Color("#202825"), Color("#b7a36b")))
		
		var vbox = VBoxContainer.new()
		vbox.anchors_preset = Control.PRESET_FULL_RECT
		vbox.offset_left = 11
		vbox.offset_top = 8
		vbox.offset_right = -11
		vbox.offset_bottom = -8
		vbox.add_theme_constant_override("separation", 4)
		vbox.mouse_filter = Control.MOUSE_FILTER_IGNORE
		card_btn.add_child(vbox)
		var head = HBoxContainer.new()
		head.add_theme_constant_override("separation", 10)
		head.mouse_filter = Control.MOUSE_FILTER_IGNORE
		vbox.add_child(head)
		var portrait = TextureRect.new()
		portrait.custom_minimum_size = Vector2(42, 42)
		portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		portrait.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		portrait.mouse_filter = Control.MOUSE_FILTER_IGNORE
		portrait.texture = load(_character_sprite_path(c_id))
		head.add_child(portrait)
		var identity = VBoxContainer.new()
		identity.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		identity.add_theme_constant_override("separation", 0)
		identity.mouse_filter = Control.MOUSE_FILTER_IGNORE
		head.add_child(identity)
		var name_lbl = Label.new()
		name_lbl.text = c_data["name"]
		name_lbl.add_theme_font_size_override("font_size", 16)
		name_lbl.add_theme_color_override("font_color", Color("#eee9dc"))
		name_lbl.mouse_filter = Control.MOUSE_FILTER_IGNORE
		identity.add_child(name_lbl)
		var title_lbl = Label.new()
		title_lbl.text = c_data["title"].split(" (")[0]
		title_lbl.add_theme_font_size_override("font_size", 10)
		title_lbl.add_theme_color_override("font_color", Color("#aaa995"))
		title_lbl.mouse_filter = Control.MOUSE_FILTER_IGNORE
		identity.add_child(title_lbl)
		
		var stats_lbl = Label.new()
		stats_lbl.text = "%d HP     %d HIZ     %.2f× HASAR" % [int(c_data["hp"]), int(c_data["move_speed"]), float(c_data["damage_mult"])]
		stats_lbl.add_theme_font_size_override("font_size", 10)
		stats_lbl.add_theme_color_override("font_color", Color("#c2ad76"))
		stats_lbl.mouse_filter = Control.MOUSE_FILTER_IGNORE
		vbox.add_child(stats_lbl)
		
		var desc_lbl = Label.new()
		desc_lbl.text = c_data["desc"]
		desc_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		desc_lbl.modulate = Color("#d0cec3")
		desc_lbl.add_theme_font_size_override("font_size", 11)
		desc_lbl.size_flags_vertical = Control.SIZE_EXPAND_FILL
		desc_lbl.mouse_filter = Control.MOUSE_FILTER_IGNORE
		vbox.add_child(desc_lbl)
		
		var pass_lbl = Label.new()
		pass_lbl.text = c_data["passive"]
		pass_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		pass_lbl.modulate = Color("#9ca99a")
		pass_lbl.add_theme_font_size_override("font_size", 10)
		pass_lbl.mouse_filter = Control.MOUSE_FILTER_IGNORE
		vbox.add_child(pass_lbl)
		
		var cur_id = c_id
		card_btn.pressed.connect(func(): select_character(cur_id))
		char_cards_container.add_child(card_btn)
		
	update_character_selection_ui()

func _card_style(fill_color: Color, border_color: Color) -> StyleBoxFlat:
	var style = StyleBoxFlat.new()
	style.bg_color = fill_color
	style.border_color = border_color
	style.set_border_width_all(1)
	style.set_corner_radius_all(5)
	style.content_margin_left = 8
	style.content_margin_right = 8
	style.content_margin_top = 6
	style.content_margin_bottom = 6
	return style

func _difficulty_style(fill_color: Color, border_color: Color) -> StyleBoxFlat:
	var style = StyleBoxFlat.new()
	style.bg_color = fill_color
	style.border_color = border_color
	style.set_border_width_all(1)
	style.set_corner_radius_all(4)
	style.content_margin_left = 12
	style.content_margin_right = 12
	style.content_margin_top = 7
	style.content_margin_bottom = 7
	return style

func _style_start_button():
	start_button.add_theme_color_override("font_color", Color("#f2ead9"))
	start_button.add_theme_font_size_override("font_size", 18)
	start_button.add_theme_stylebox_override("normal", _difficulty_style(Color("#642b32"), Color("#9a6c52")))
	start_button.add_theme_stylebox_override("hover", _difficulty_style(Color("#783840"), Color("#b18d63")))
	start_button.add_theme_stylebox_override("pressed", _difficulty_style(Color("#51232a"), Color("#b18d63")))

func _style_difficulty_button(button: Button, active: bool) -> void:
	var fill = Color("#642b32") if active else Color("#e5dece")
	var border = Color("#9a6c52") if active else Color("#c4b89f")
	var text_color = Color("#f2ead9") if active else Color("#303630")
	button.add_theme_color_override("font_color", text_color)
	button.add_theme_color_override("font_hover_color", text_color)
	button.add_theme_stylebox_override("normal", _difficulty_style(fill, border))
	button.add_theme_stylebox_override("hover", _difficulty_style(Color("#74363e") if active else Color("#f0eadc"), border))
	button.add_theme_stylebox_override("pressed", _difficulty_style(Color("#52252c") if active else Color("#ddd4c2"), border))

func _character_sprite_path(char_id: String) -> String:
	var sprite_names = {
		"inky": "hero_inky.png",
		"quillmaster": "hero_quillmaster.png",
		"word_knight": "hero_word_knight.png",
		"rune_sorceress": "hero_rune_sorceress.png",
		"lexicon_alchemist": "hero_alchemist.png",
		"shadow_lexicographer": "hero_shadow_scribe.png"
	}
	return "res://assets/sprites/upgrade_v1/" + sprite_names.get(char_id, "hero_inky.png")

func select_character(char_id: String):
	selected_char = char_id
	StatsManager.select_character(char_id)
	update_character_selection_ui()

func update_character_selection_ui():
	var children = char_cards_container.get_children()
	var char_keys = ["inky", "quillmaster", "word_knight", "rune_sorceress", "lexicon_alchemist", "shadow_lexicographer"]
	for i in range(min(children.size(), char_keys.size())):
		var btn = children[i] as Button
		if char_keys[i] == selected_char:
			btn.add_theme_stylebox_override("normal", _card_style(Color("#303a33"), Color("#c2ad76")))
		else:
			btn.add_theme_stylebox_override("normal", _card_style(Color("#202825"), Color("#435048")))

func set_difficulty(diff_id: String):
	selected_diff = diff_id
	StatsManager.set_difficulty(diff_id)
	
	_style_difficulty_button(easy_btn, diff_id == "easy")
	_style_difficulty_button(normal_btn, diff_id == "normal")
	_style_difficulty_button(hard_btn, diff_id == "hard")
	
	diff_desc_label.text = DIFFICULTY_DESCRIPTIONS.get(diff_id, DIFFICULTY_DESCRIPTIONS["normal"])

func _on_start_pressed():
	hide()
	emit_signal("game_started")
