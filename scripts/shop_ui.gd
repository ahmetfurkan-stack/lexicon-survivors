extends Control

signal shop_closed()

@onready var cards_container = $Panel/ScrollArea/CardsContainer
@onready var ink_label = $Panel/TopBar/InkLabel
@onready var wave_label = $Panel/TopBar/WaveLabel
@onready var synergy_label = $Panel/SynergyLabel
@onready var reroll_button = $Panel/BottomBar/RerollButton
@onready var chapter_strip = $Panel/ChapterStrip
@onready var chapter_kicker = $Panel/ChapterStrip/ChapterKicker
@onready var chapter_title = $Panel/ChapterStrip/ChapterTitle
@onready var chapter_narration = $Panel/ChapterStrip/ChapterNarration
@onready var chapter_mark = $Panel/ChapterStrip/ChapterMark

# Tabs
@onready var cards_tab_btn = $Panel/CategoryBar/CardsTabButton
@onready var weapons_tab_btn = $Panel/CategoryBar/WeaponsTabButton
@onready var gadgets_tab_btn = $Panel/CategoryBar/GadgetsTabButton
@onready var artifacts_tab_btn = $Panel/CategoryBar/ArtifactsTabButton

# Quiz Modal
@onready var quiz_modal = $QuizModal
@onready var quiz_word_title = $QuizModal/Box/WordTitle
@onready var quiz_question = $QuizModal/Box/QuestionLabel
@onready var quiz_example = $QuizModal/Box/ExampleLabel
@onready var quiz_result_label = $QuizModal/Box/ResultLabel
@onready var options_container = $QuizModal/Box/OptionsContainer
@onready var quiz_continue_btn = $QuizModal/Box/ContinueButton

var current_tab: String = "cards" # "cards", "weapons", "gadgets", "artifacts"
var current_cards: Array = []
var active_quiz_card: Dictionary = {}
var active_card_index: int = -1
var displayed_option_indices: Array[int] = []

const SHOP_SERIF_FONT = preload("res://assets/fonts/ibm-plex/IBMPlexSerif-SemiBold.ttf")
const SHOP_MONO_FONT = preload("res://assets/fonts/ibm-plex/IBMPlexMono-Medium.ttf")

func make_shop_card_panel(accent: Color) -> PanelContainer:
	var panel = PanelContainer.new()
	panel.custom_minimum_size = Vector2(265, 340)
	var panel_style = StyleBoxFlat.new()
	panel_style.bg_color = Color(0.96, 0.94, 0.89, 1)
	panel_style.border_color = Color(0.75, 0.69, 0.58, 1)
	panel_style.border_width_left = 3
	panel_style.border_width_top = 1
	panel_style.border_width_right = 1
	panel_style.border_width_bottom = 1
	panel_style.corner_radius_top_left = 5
	panel_style.corner_radius_top_right = 5
	panel_style.corner_radius_bottom_right = 5
	panel_style.corner_radius_bottom_left = 5
	panel_style.content_margin_left = 13.0
	panel_style.content_margin_top = 12.0
	panel_style.content_margin_right = 13.0
	panel_style.content_margin_bottom = 12.0
	panel_style.border_color = accent
	panel.add_theme_stylebox_override("panel", panel_style)
	return panel

func make_shop_price_label(text: String) -> Label:
	var price = Label.new()
	price.text = text
	price.add_theme_font_override("font", SHOP_MONO_FONT)
	price.add_theme_font_size_override("font_size", 12)
	price.add_theme_color_override("font_color", Color(0.40, 0.17, 0.20, 1))
	return price

func style_shop_title(label: Label, font_size: int) -> void:
	label.add_theme_font_override("font", SHOP_SERIF_FONT)
	label.add_theme_font_size_override("font_size", font_size)
	label.add_theme_color_override("font_color", Color(0.15, 0.17, 0.15, 1))

func style_shop_description(label: Label) -> void:
	label.add_theme_color_override("font_color", Color(0.30, 0.36, 0.32, 1))

func style_shop_action(button: Button) -> void:
	button.add_theme_color_override("font_color", Color(0.96, 0.93, 0.86, 1))
	button.add_theme_color_override("font_disabled_color", Color(0.47, 0.44, 0.38, 1))
	button.add_theme_font_size_override("font_size", 14)
	var normal = StyleBoxFlat.new()
	normal.bg_color = Color(0.39, 0.15, 0.19, 1)
	normal.border_color = Color(0.62, 0.40, 0.31, 1)
	normal.set_border_width_all(1)
	normal.set_corner_radius_all(4)
	normal.content_margin_left = 9.0
	normal.content_margin_right = 9.0
	normal.content_margin_top = 7.0
	normal.content_margin_bottom = 7.0
	var hover = normal.duplicate() as StyleBoxFlat
	hover.bg_color = Color(0.48, 0.20, 0.24, 1)
	hover.border_color = Color(0.75, 0.60, 0.39, 1)
	var disabled = normal.duplicate() as StyleBoxFlat
	disabled.bg_color = Color(0.85, 0.82, 0.75, 1)
	disabled.border_color = Color(0.75, 0.69, 0.58, 1)
	button.add_theme_stylebox_override("normal", normal)
	button.add_theme_stylebox_override("hover", hover)
	button.add_theme_stylebox_override("disabled", disabled)
	button.custom_minimum_size.y = 44

func style_shop_tab(button: Button, active: bool) -> void:
	var normal = StyleBoxFlat.new()
	normal.bg_color = Color(0.38, 0.16, 0.19, 1) if active else Color(0.89, 0.86, 0.79, 1)
	normal.border_color = Color(0.65, 0.46, 0.34, 1) if active else Color(0.75, 0.69, 0.58, 1)
	normal.set_border_width_all(1)
	normal.set_corner_radius_all(4)
	normal.content_margin_left = 10.0
	normal.content_margin_right = 10.0
	normal.content_margin_top = 7.0
	normal.content_margin_bottom = 7.0
	var hover = normal.duplicate() as StyleBoxFlat
	if not active:
		hover.bg_color = Color(0.95, 0.93, 0.88, 1)
	button.add_theme_stylebox_override("normal", normal)
	button.add_theme_stylebox_override("hover", hover)
	var label_color = Color(0.96, 0.93, 0.86, 1) if active else Color(0.25, 0.28, 0.26, 1)
	button.add_theme_color_override("font_color", label_color)
	button.add_theme_color_override("font_hover_color", label_color)

func _ready():
	hide()
	quiz_modal.hide()
	cards_tab_btn.icon = load("res://assets/ui/icons/cards.svg")
	weapons_tab_btn.icon = load("res://assets/ui/icons/weapons.svg")
	gadgets_tab_btn.icon = load("res://assets/ui/icons/gadget.svg")
	artifacts_tab_btn.icon = load("res://assets/ui/icons/artifact.svg")
	reroll_button.icon = load("res://assets/ui/icons/reroll.svg")
	StatsManager.ink_changed.connect(_on_ink_changed)
	StatsManager.synergy_activated.connect(_on_synergy_activated)

func open_shop():
	show()
	quiz_modal.hide()
	current_tab = "cards"
	highlight_tab_buttons()
	update_top_bar()
	update_chapter_header()
	update_synergy_display()
	refresh_cards()

func update_chapter_header():
	var chapters = [
		{"title": "KARANLIK KÜTÜPHANE", "narration": "Kayıp kelimeleri rafların arasından geri çağır.", "accent": Color("c5aa72")},
		{"title": "SÖZ DEHLİZİ", "narration": "Taş kapı açılır; duvarlardaki yanlış kelimeler uyanır.", "accent": Color("99a99d")},
		{"title": "ASTRAL GÖZLEMEVİ", "narration": "Dehlizin son kapısı açılır; yıldızlar yeni sözcükler dizer.", "accent": Color("9baad1")},
		{"title": "SON SAYFA", "narration": "Kitap kapanır; boşlukta son kelimeler uyanır.", "accent": Color("bd91b7")}
	]
	var wave = StatsManager.current_wave
	var index = 0 if wave < 26 else (1 if wave < 51 else (2 if wave < 76 else 3))
	var chapter = chapters[index]
	chapter_kicker.text = "DALGA ARASI  ·  %02d TAMAMLANDI" % wave
	chapter_title.text = chapter["title"]
	chapter_narration.text = chapter["narration"]
	chapter_mark.modulate = chapter["accent"]
	var strip_style = chapter_strip.get_theme_stylebox("panel") as StyleBoxFlat
	if strip_style:
		strip_style.border_color = chapter["accent"]

func update_top_bar():
	ink_label.text = "MÜREKKEP  " + str(StatsManager.ink_count)
	wave_label.text = "DALGA " + str(StatsManager.current_wave) + " · TAMAM"

func update_synergy_display():
	if StatsManager.active_synergies.is_empty():
		synergy_label.text = "Aktif Sinerji: Yok (Aynı kelime türünden 3 kart toplayarak sinerji açabilirsin!)"
		synergy_label.add_theme_color_override("font_color", Color(0.34, 0.35, 0.31, 1))
	else:
		var syn_text = "Aktif Sinerjiler: "
		for s in StatsManager.active_synergies.keys():
			syn_text += "[" + s + "] "
		synergy_label.text = syn_text
		synergy_label.add_theme_color_override("font_color", Color(0.39, 0.22, 0.15, 1))

func refresh_cards():
	current_cards = WordDatabase.get_random_cards(StatsManager.current_wave, StatsManager.difficulty, 4)
	render_current_view()

func _on_cards_tab_pressed():
	current_tab = "cards"
	reroll_button.visible = true
	highlight_tab_buttons()
	render_current_view()

func _on_weapons_tab_pressed():
	current_tab = "weapons"
	reroll_button.visible = false
	highlight_tab_buttons()
	render_current_view()

func _on_artifacts_tab_pressed():
	current_tab = "artifacts"
	reroll_button.visible = false
	highlight_tab_buttons()
	render_current_view()

func _on_gadgets_tab_pressed():
	current_tab = "gadgets"
	reroll_button.visible = false
	highlight_tab_buttons()
	render_current_view()

func highlight_tab_buttons():
	style_shop_tab(cards_tab_btn, current_tab == "cards")
	style_shop_tab(weapons_tab_btn, current_tab == "weapons")
	style_shop_tab(gadgets_tab_btn, current_tab == "gadgets")
	style_shop_tab(artifacts_tab_btn, current_tab == "artifacts")

func render_current_view():
	for child in cards_container.get_children():
		child.queue_free()
		
	match current_tab:
		"cards":
			render_cards()
		"weapons":
			render_weapons()
		"gadgets":
			render_gadgets()
		"artifacts":
			render_artifacts()

func render_gadgets():
	for gadget_id in StatsManager.gadgets_catalog:
		var gadget: Dictionary = StatsManager.gadgets_catalog[gadget_id]
		var card_panel = make_shop_card_panel(Color(0.24, 0.42, 0.35, 1))
		var vbox = VBoxContainer.new()
		vbox.add_theme_constant_override("separation", 10)
		card_panel.add_child(vbox)

		var tag = Label.new()
		tag.text = "AKTİF GEREÇ  ·  " + str(gadget.get("cooldown", 0.0)) + "s BEKLEME"
		tag.add_theme_font_override("font", SHOP_MONO_FONT)
		tag.add_theme_font_size_override("font_size", 10)
		tag.add_theme_color_override("font_color", Color(0.32, 0.42, 0.36, 1))
		vbox.add_child(tag)

		var title = Label.new()
		title.text = str(gadget.get("name", gadget_id))
		style_shop_title(title, 18)
		title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		vbox.add_child(title)

		var desc = Label.new()
		desc.text = str(gadget.get("desc", ""))
		desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		style_shop_description(desc)
		vbox.add_child(desc)

		var spacer = Control.new()
		spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
		vbox.add_child(spacer)

		var owned: bool = gadget_id in StatsManager.owned_gadgets
		var cost := int(gadget.get("cost", 0))
		vbox.add_child(make_shop_price_label("KUŞANILDI" if StatsManager.active_gadget == gadget_id else ("SAHİP" if owned else str(cost) + "  ·  MÜREKKEP")))

		var buy_btn = Button.new()
		buy_btn.custom_minimum_size = Vector2(0, 44)
		style_shop_action(buy_btn)
		if StatsManager.active_gadget == gadget_id:
			buy_btn.text = "AKTİF GEREÇ"
			buy_btn.disabled = true
		elif owned:
			buy_btn.text = "KUŞAN"
			buy_btn.pressed.connect(func():
				StatsManager.select_gadget(gadget_id)
				update_top_bar()
				render_current_view()
			)
		elif StatsManager.ink_count < cost:
			buy_btn.text = "MÜREKKEP YETERSİZ"
			buy_btn.disabled = true
		else:
			buy_btn.text = "SATIN AL · " + str(cost)
			buy_btn.pressed.connect(func():
				if StatsManager.buy_gadget(gadget_id):
					update_top_bar()
					render_current_view()
			)
		vbox.add_child(buy_btn)
		cards_container.add_child(card_panel)

func render_cards():
	for i in range(current_cards.size()):
		var card = current_cards[i]
		var card_panel = make_shop_card_panel(Color(0.52, 0.20, 0.25, 1))
		
		var vbox = VBoxContainer.new()
		vbox.add_theme_constant_override("separation", 8)
		card_panel.add_child(vbox)
		
		# Type & Level header
		var tag_label = Label.new()
		var q_type = card.get("question_type", "meaning").capitalize()
		tag_label.text = card["type"] + "  ·  " + card["level"] + "  ·  " + q_type
		tag_label.add_theme_font_override("font", SHOP_MONO_FONT)
		tag_label.add_theme_font_size_override("font_size", 10)
		tag_label.add_theme_color_override("font_color", Color(0.46, 0.41, 0.34, 1))
		vbox.add_child(tag_label)
		
		# Word Title
		var title_label = Label.new()
		title_label.text = card["word"]
		style_shop_title(title_label, 22)
		vbox.add_child(title_label)
		
		# Description
		var desc_label = Label.new()
		desc_label.text = card["description"]
		desc_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		style_shop_description(desc_label)
		vbox.add_child(desc_label)
		
		# Example sentence
		var ex_label = Label.new()
		ex_label.text = '"' + card.get("example", "") + '"'
		ex_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		ex_label.add_theme_color_override("font_color", Color(0.45, 0.43, 0.38, 1))
		ex_label.add_theme_font_size_override("font_size", 12)
		vbox.add_child(ex_label)
		
		var spacer = Control.new()
		spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
		vbox.add_child(spacer)
		vbox.add_child(make_shop_price_label(str(card["cost"]) + "  ·  MÜREKKEP"))
		
		# Buy / Quiz Button
		var buy_btn = Button.new()
		var cost = card["cost"]
		buy_btn.text = "Sınavı başlat"
		buy_btn.custom_minimum_size = Vector2(0, 42)
		style_shop_action(buy_btn)
		
		if StatsManager.ink_count < cost:
			buy_btn.disabled = true
			buy_btn.text = "Yetersiz Mürekkep (" + str(cost) + ")"
		else:
			var idx = i
			buy_btn.pressed.connect(func(): start_card_quiz(card, idx))
			
		vbox.add_child(buy_btn)
		cards_container.add_child(card_panel)

func render_weapons():
	var keys = StatsManager.weapons_catalog.keys()
	for k in keys:
		var w = StatsManager.weapons_catalog[k]
		var card_panel = make_shop_card_panel(Color(0.56, 0.37, 0.21, 1))
		
		var vbox = VBoxContainer.new()
		vbox.add_theme_constant_override("separation", 10)
		card_panel.add_child(vbox)
		
		var tag = Label.new()
		tag.text = "SİLAH  ·  TEÇHİZAT"
		tag.add_theme_font_override("font", SHOP_MONO_FONT)
		tag.add_theme_font_size_override("font_size", 10)
		tag.add_theme_color_override("font_color", Color(0.46, 0.41, 0.34, 1))
		vbox.add_child(tag)
		
		var title = Label.new()
		title.text = w["name"]
		style_shop_title(title, 19)
		title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		vbox.add_child(title)
		
		var desc = Label.new()
		desc.text = w["desc"]
		desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		style_shop_description(desc)
		vbox.add_child(desc)
		
		var stats_lbl = Label.new()
		stats_lbl.text = "Taban Hasar: " + str(w["damage"]) + "\nAtış Hızı: " + str(w["cooldown"]) + "s"
		stats_lbl.add_theme_font_override("font", SHOP_MONO_FONT)
		stats_lbl.add_theme_font_size_override("font_size", 11)
		stats_lbl.add_theme_color_override("font_color", Color(0.40, 0.34, 0.27, 1))
		vbox.add_child(stats_lbl)
		
		var spacer = Control.new()
		spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
		vbox.add_child(spacer)
		var owned_for_price = StatsManager.has_weapon(w["id"])
		vbox.add_child(make_shop_price_label("SAHİP" if owned_for_price else str(w["cost"]) + "  ·  MÜREKKEP"))
		
		var buy_btn = Button.new()
		buy_btn.custom_minimum_size = Vector2(0, 44)
		style_shop_action(buy_btn)
		var is_owned = StatsManager.has_weapon(w["id"])
		var w_id = w["id"]
		
		if is_owned:
			var is_active = (StatsManager.get_active_weapon_id() == w_id)
			if is_active:
				buy_btn.text = "Kuşanıldı (aktif)"
				buy_btn.disabled = true
				buy_btn.modulate = Color(1.3, 1.2, 0.4)
			else:
				buy_btn.text = "BİRİNCİL YAP"
				buy_btn.pressed.connect(func():
					var idx = StatsManager.equipped_weapons.find(w_id)
					if idx != -1:
						StatsManager.select_weapon_index(idx)
						render_current_view()
				)
		else:
			var cost = w["cost"]
			buy_btn.text = "Kuşan"
			if StatsManager.ink_count < cost:
				buy_btn.disabled = true
				buy_btn.text = "Mürekkep yetersiz"
			else:
				buy_btn.pressed.connect(func():
					if StatsManager.spend_ink(cost):
						StatsManager.equip_weapon(w_id)
						render_current_view()
						update_top_bar()
				)
		vbox.add_child(buy_btn)
		cards_container.add_child(card_panel)

func render_artifacts():
	var keys = StatsManager.artifacts_catalog.keys()
	for k in keys:
		var art = StatsManager.artifacts_catalog[k]
		var card_panel = make_shop_card_panel(Color(0.52, 0.20, 0.25, 1))
		
		var vbox = VBoxContainer.new()
		vbox.add_theme_constant_override("separation", 10)
		card_panel.add_child(vbox)
		
		var tag = Label.new()
		tag.text = "PASİF ESER  ·  GEREÇ"
		tag.add_theme_font_override("font", SHOP_MONO_FONT)
		tag.add_theme_font_size_override("font_size", 10)
		tag.add_theme_color_override("font_color", Color(0.46, 0.41, 0.34, 1))
		vbox.add_child(tag)
		
		var title = Label.new()
		title.text = art["name"]
		style_shop_title(title, 18)
		title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		vbox.add_child(title)
		
		var desc = Label.new()
		desc.text = art["desc"]
		desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		style_shop_description(desc)
		vbox.add_child(desc)
		
		var spacer = Control.new()
		spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
		vbox.add_child(spacer)
		var is_owned = StatsManager.has_artifact(art["id"])
		vbox.add_child(make_shop_price_label("SAHİP" if is_owned else str(art["cost"]) + "  ·  MÜREKKEP"))
		
		var buy_btn = Button.new()
		buy_btn.custom_minimum_size = Vector2(0, 44)
		style_shop_action(buy_btn)
		
		if is_owned:
			buy_btn.text = "SATIN ALINDI"
			buy_btn.disabled = true
		else:
			var cost = art["cost"]
			buy_btn.text = "Satın al"
			if StatsManager.ink_count < cost:
				buy_btn.disabled = true
				buy_btn.text = "Mürekkep yetersiz"
			else:
				var a_id = art["id"]
				buy_btn.pressed.connect(func():
					if StatsManager.buy_artifact(a_id):
						render_current_view()
						update_top_bar()
				)
		vbox.add_child(buy_btn)
		cards_container.add_child(card_panel)

func start_card_quiz(card: Dictionary, index: int):
	active_quiz_card = card
	active_card_index = index
	
	quiz_modal.show()
	quiz_result_label.text = ""
	quiz_continue_btn.hide()
	
	var q_type = card.get("question_type", "meaning").capitalize()
	quiz_word_title.text = card["word"] + " [" + card["type"] + " • " + q_type + "]"
	quiz_question.text = card["question"]
	quiz_example.text = 'Örnek Kullanım: "' + card.get("example", "") + '"'
	
	for child in options_container.get_children():
		child.queue_free()
		
	var opts = card["options"]
	displayed_option_indices.clear()
	for i in range(opts.size()):
		displayed_option_indices.append(i)
	displayed_option_indices.shuffle()
	var option_labels = ["A", "B", "C", "D"]
	for i in range(displayed_option_indices.size()):
		var original_index = displayed_option_indices[i]
		var btn = Button.new()
		var option_label = option_labels[i] if i < option_labels.size() else str(i + 1)
		btn.text = option_label + ") " + str(opts[original_index])
		btn.custom_minimum_size = Vector2(0, 44)
		var display_index = i
		btn.pressed.connect(func(): answer_quiz(display_index))
		options_container.add_child(btn)

func answer_quiz(selected_index: int):
	for child in options_container.get_children():
		if child is Button:
			child.disabled = true
			
	if selected_index < 0 or selected_index >= displayed_option_indices.size():
		return
	var is_correct = (displayed_option_indices[selected_index] == active_quiz_card["correct_index"])
	var base_cost = active_quiz_card["cost"]
	
	if is_correct:
		var discount_cost = int(ceil(base_cost * 0.5))
		quiz_result_label.text = "Doğru cevap\n%50 indirim ve +%50 güç kazandın.\nÖdenen: " + str(discount_cost) + " mürekkep"
		quiz_result_label.modulate = Color(0.2, 1.0, 0.4)
		
		StatsManager.spend_ink(discount_cost)
		StatsManager.apply_card_upgrade(active_quiz_card, true)
	else:
		quiz_result_label.text = "YANLIŞ CEVAP. Doğru seçenek: " + active_quiz_card["options"][active_quiz_card["correct_index"]] + "\nKart normal fiyattan alındı: " + str(base_cost) + " Mürekkep"
		quiz_result_label.modulate = Color(1.0, 0.3, 0.3)
		
		StatsManager.spend_ink(base_cost)
		StatsManager.apply_card_upgrade(active_quiz_card, false)
		
	if active_card_index >= 0 and active_card_index < current_cards.size():
		current_cards.remove_at(active_card_index)
		
	quiz_continue_btn.show()

func _on_continue_button_pressed():
	quiz_modal.hide()
	update_top_bar()
	update_synergy_display()
	render_current_view()

func _on_reroll_button_pressed():
	if StatsManager.spend_ink(5):
		refresh_cards()
		update_top_bar()

func _on_next_wave_button_pressed():
	hide()
	StatsManager.current_wave += 1
	emit_signal("shop_closed")

func _on_ink_changed(_new_ink: int):
	update_top_bar()

func _on_synergy_activated(_syn_name: String, _syn_desc: String):
	update_synergy_display()
