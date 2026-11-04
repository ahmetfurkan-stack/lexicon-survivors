extends Control

signal shop_closed()

@onready var cards_container = $Panel/ScrollArea/CardsContainer
@onready var ink_label = $Panel/TopBar/InkLabel
@onready var wave_label = $Panel/TopBar/WaveLabel
@onready var synergy_label = $Panel/SynergyLabel
@onready var reroll_button = $Panel/BottomBar/RerollButton
@onready var next_wave_button = $Panel/BottomBar/NextWaveButton

# Tabs
@onready var cards_tab_btn = $Panel/CategoryBar/CardsTabButton
@onready var weapons_tab_btn = $Panel/CategoryBar/WeaponsTabButton
@onready var artifacts_tab_btn = $Panel/CategoryBar/ArtifactsTabButton
@onready var mistakes_tab_btn = $Panel/CategoryBar/MistakesTabButton

# Quiz Modal
@onready var quiz_modal = $QuizModal
@onready var quiz_word_title = $QuizModal/Box/WordTitle
@onready var quiz_question = $QuizModal/Box/QuestionLabel
@onready var quiz_example = $QuizModal/Box/ExampleLabel
@onready var quiz_result_label = $QuizModal/Box/ResultLabel
@onready var options_container = $QuizModal/Box/OptionsContainer
@onready var quiz_continue_btn = $QuizModal/Box/ContinueButton

var current_tab: String = "cards" # "cards", "weapons", "artifacts", "mistakes"
var current_cards: Array = []
var active_quiz_card: Dictionary = {}
var active_card_index: int = -1

var auto_tur_timer: float = 3.0
var auto_tur_paused: bool = false

func _ready():
	hide()
	quiz_modal.hide()
	StatsManager.ink_changed.connect(_on_ink_changed)
	StatsManager.synergy_activated.connect(_on_synergy_activated)
	StatsManager.mistakes_updated.connect(update_mistakes_tab_title)

func _process(delta: float):
	if not visible:
		return
	update_mistakes_tab_title()
	if StatsManager.auto_new_tur and not auto_tur_paused and not quiz_modal.visible and current_tab == "cards":
		auto_tur_timer -= delta
		if next_wave_button:
			next_wave_button.text = "⚔ Sonraki Dalga (" + str(int(ceil(max(0.0, auto_tur_timer)))) + "s) ▶"
		if auto_tur_timer <= 0:
			_on_next_wave_button_pressed()
	else:
		if next_wave_button:
			next_wave_button.text = "⚔ Sonraki Dalgaya Başla ▶"

func update_mistakes_tab_title():
	if mistakes_tab_btn:
		var count = StatsManager.mistake_words.size()
		mistakes_tab_btn.text = "📖 Hata Defteri (" + str(count) + ")"

func open_shop():
	show()
	quiz_modal.hide()
	current_tab = "cards"
	auto_tur_timer = 3.0
	auto_tur_paused = not StatsManager.auto_new_tur
	update_top_bar()
	update_synergy_display()
	update_mistakes_tab_title()
	refresh_cards()

func update_top_bar():
	ink_label.text = "💧 Mürekkep: " + str(StatsManager.ink_count)
	wave_label.text = "Dalga " + str(StatsManager.current_wave) + " Tamamlandı!"

func update_synergy_display():
	if StatsManager.active_synergies.is_empty():
		synergy_label.text = "Aktif Sinerji: Yok (Aynı kelime türünden 3 kart toplayarak sinerji açabilirsin!)"
	else:
		var syn_text = "Aktif Sinerjiler: "
		for s in StatsManager.active_synergies.keys():
			syn_text += "★ [" + s + "] "
		synergy_label.text = syn_text

func refresh_cards():
	current_cards = WordDatabase.get_random_cards(StatsManager.current_wave, StatsManager.difficulty, 4)
	render_current_view()

func _on_cards_tab_pressed():
	current_tab = "cards"
	reroll_button.visible = true
	auto_tur_paused = false
	highlight_tab_buttons()
	render_current_view()

func _on_weapons_tab_pressed():
	current_tab = "weapons"
	reroll_button.visible = false
	auto_tur_paused = true
	highlight_tab_buttons()
	render_current_view()

func _on_artifacts_tab_pressed():
	current_tab = "artifacts"
	reroll_button.visible = false
	auto_tur_paused = true
	highlight_tab_buttons()
	render_current_view()

func _on_mistakes_tab_pressed():
	current_tab = "mistakes"
	reroll_button.visible = false
	auto_tur_paused = true
	highlight_tab_buttons()
	render_current_view()

func highlight_tab_buttons():
	cards_tab_btn.modulate = Color(1.3, 1.3, 1.0) if current_tab == "cards" else Color(0.8, 0.8, 0.8)
	weapons_tab_btn.modulate = Color(1.3, 1.3, 1.0) if current_tab == "weapons" else Color(0.8, 0.8, 0.8)
	artifacts_tab_btn.modulate = Color(1.3, 1.3, 1.0) if current_tab == "artifacts" else Color(0.8, 0.8, 0.8)
	if mistakes_tab_btn:
		mistakes_tab_btn.modulate = Color(1.3, 1.3, 1.0) if current_tab == "mistakes" else Color(0.8, 0.8, 0.8)

func render_current_view():
	for child in cards_container.get_children():
		child.queue_free()
		
	match current_tab:
		"cards":
			render_cards()
		"weapons":
			render_weapons()
		"artifacts":
			render_artifacts()
		"mistakes":
			render_mistakes()

func render_cards():
	for i in range(current_cards.size()):
		var card = current_cards[i]
		var card_panel = PanelContainer.new()
		card_panel.custom_minimum_size = Vector2(265, 340)
		
		var vbox = VBoxContainer.new()
		vbox.add_theme_constant_override("separation", 8)
		card_panel.add_child(vbox)
		
		# Type & Level header
		var tag_label = Label.new()
		var q_type = card.get("question_type", "meaning").capitalize()
		tag_label.text = "[" + card["type"] + " • " + card["level"] + " • " + q_type + "]"
		tag_label.modulate = Color(0.4, 0.8, 1.0)
		tag_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vbox.add_child(tag_label)
		
		# Word Title
		var title_label = Label.new()
		title_label.text = card["word"]
		title_label.add_theme_font_size_override("font_size", 22)
		title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vbox.add_child(title_label)
		
		# Description
		var desc_label = Label.new()
		desc_label.text = card["description"]
		desc_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		desc_label.modulate = Color(0.3, 1.0, 0.4)
		desc_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vbox.add_child(desc_label)
		
		# Example sentence
		var ex_label = Label.new()
		ex_label.text = '"' + card.get("example", "") + '"'
		ex_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		ex_label.modulate = Color(0.8, 0.8, 0.8)
		ex_label.add_theme_font_size_override("font_size", 12)
		ex_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vbox.add_child(ex_label)
		
		var spacer = Control.new()
		spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
		vbox.add_child(spacer)
		
		# Buy / Quiz Button
		var buy_btn = Button.new()
		var cost = card["cost"]
		buy_btn.text = "💧 " + str(cost) + " Quiz & Satın Al"
		buy_btn.custom_minimum_size = Vector2(0, 42)
		
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
		var card_panel = PanelContainer.new()
		card_panel.custom_minimum_size = Vector2(265, 340)
		
		var vbox = VBoxContainer.new()
		vbox.add_theme_constant_override("separation", 10)
		card_panel.add_child(vbox)
		
		var tag = Label.new()
		tag.text = "[SİLAH TEÇHİZATI]"
		tag.modulate = Color(1.0, 0.65, 0.2)
		tag.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vbox.add_child(tag)
		
		var title = Label.new()
		title.text = w["name"]
		title.add_theme_font_size_override("font_size", 18)
		title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		vbox.add_child(title)
		
		var desc = Label.new()
		desc.text = w["desc"]
		desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		desc.modulate = Color(0.9, 0.9, 0.9)
		desc.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vbox.add_child(desc)
		
		var stats_lbl = Label.new()
		stats_lbl.text = "Taban Hasar: " + str(w["damage"]) + "\nAtış Hızı: " + str(w["cooldown"]) + "s"
		stats_lbl.modulate = Color(0.3, 0.9, 0.5)
		stats_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vbox.add_child(stats_lbl)
		
		var spacer = Control.new()
		spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
		vbox.add_child(spacer)
		
		var buy_btn = Button.new()
		buy_btn.custom_minimum_size = Vector2(0, 44)
		var is_owned = StatsManager.has_weapon(w["id"])
		var w_id = w["id"]
		
		if is_owned:
			var is_active = (StatsManager.get_active_weapon_id() == w_id)
			if is_active:
				buy_btn.text = "★ Kuşanıldı (Aktif)"
				buy_btn.disabled = true
				buy_btn.modulate = Color(1.3, 1.2, 0.4)
			else:
				buy_btn.text = "⇄ Birincil Yap"
				buy_btn.pressed.connect(func():
					var idx = StatsManager.equipped_weapons.find(w_id)
					if idx != -1:
						StatsManager.select_weapon_index(idx)
						render_current_view()
				)
		else:
			var cost = w["cost"]
			buy_btn.text = "💧 " + str(cost) + " Kuşan / Satın Al"
			if StatsManager.ink_count < cost:
				buy_btn.disabled = true
				buy_btn.text = "Yetersiz Mürekkep (" + str(cost) + ")"
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
		var card_panel = PanelContainer.new()
		card_panel.custom_minimum_size = Vector2(265, 340)
		
		var vbox = VBoxContainer.new()
		vbox.add_theme_constant_override("separation", 10)
		card_panel.add_child(vbox)
		
		var tag = Label.new()
		tag.text = "[PASİF ESER / GADGET]"
		tag.modulate = Color(0.8, 0.4, 1.0)
		tag.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vbox.add_child(tag)
		
		var title = Label.new()
		title.text = art["name"]
		title.add_theme_font_size_override("font_size", 17)
		title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		vbox.add_child(title)
		
		var desc = Label.new()
		desc.text = art["desc"]
		desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		desc.modulate = Color(0.2, 1.0, 0.8)
		desc.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		vbox.add_child(desc)
		
		var spacer = Control.new()
		spacer.size_flags_vertical = Control.SIZE_EXPAND_FILL
		vbox.add_child(spacer)
		
		var buy_btn = Button.new()
		buy_btn.custom_minimum_size = Vector2(0, 44)
		var is_owned = StatsManager.has_artifact(art["id"])
		
		if is_owned:
			buy_btn.text = "✓ Satın Alındı"
			buy_btn.disabled = true
		else:
			var cost = art["cost"]
			buy_btn.text = "💧 " + str(cost) + " Satın Al"
			if StatsManager.ink_count < cost:
				buy_btn.disabled = true
				buy_btn.text = "Yetersiz Mürekkep (" + str(cost) + ")"
			else:
				var a_id = art["id"]
				buy_btn.pressed.connect(func():
					if StatsManager.buy_artifact(a_id):
						render_current_view()
						update_top_bar()
				)
		vbox.add_child(buy_btn)
		cards_container.add_child(card_panel)

func render_mistakes():
	if StatsManager.mistake_words.is_empty():
		var empty_lbl = Label.new()
		empty_lbl.text = "🎉 Tebrikler! Hata defteriniz boş.\nHiçbir soruda yanlış yapmadınız veya tüm hatalarınızı telafi ettiniz!"
		empty_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		empty_lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
		empty_lbl.custom_minimum_size = Vector2(600, 200)
		empty_lbl.modulate = Color(0.4, 1.0, 0.6)
		cards_container.add_child(empty_lbl)
		return
		
	for i in range(StatsManager.mistake_words.size()):
		var card = StatsManager.mistake_words[i]
		var card_panel = PanelContainer.new()
		card_panel.custom_minimum_size = Vector2(265, 340)
		
		var vbox = VBoxContainer.new()
		vbox.theme_override_constants.separation = 8
		
		var title_lbl = Label.new()
		title_lbl.text = "⚠️ " + card.get("word", "") + "\n[" + card.get("level", "A1") + " • " + card.get("type", "Kelime") + "]"
		title_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		title_lbl.modulate = Color(1.0, 0.5, 0.5)
		vbox.add_child(title_lbl)
		
		var q_lbl = Label.new()
		q_lbl.text = card.get("question", "")
		q_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		q_lbl.modulate = Color(0.9, 0.9, 0.9)
		vbox.add_child(q_lbl)
		
		var correct_opt = ""
		var opts = card.get("options", [])
		var c_idx = card.get("correct_index", 0)
		if c_idx >= 0 and c_idx < opts.size():
			correct_opt = opts[c_idx]
			
		var ans_lbl = Label.new()
		ans_lbl.text = "Doğru Yanıt: " + correct_opt
		ans_lbl.modulate = Color(0.3, 1.0, 0.4)
		vbox.add_child(ans_lbl)
		
		var ex_lbl = Label.new()
		ex_lbl.text = 'Örnek: "' + card.get("example", "") + '"'
		ex_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		ex_lbl.modulate = Color(0.7, 0.7, 0.7)
		vbox.add_child(ex_lbl)
		
		var tag = Label.new()
		tag.text = "★ Sonraki turlarda %50 indirimli ve +%75 güçlü Telafi Kartı olarak gelecektir."
		tag.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		tag.modulate = Color(1.0, 0.85, 0.3)
		vbox.add_child(tag)
		
		card_panel.add_child(vbox)
		cards_container.add_child(card_panel)

func start_card_quiz(card: Dictionary, index: int):
	active_quiz_card = card
	active_card_index = index
	auto_tur_paused = true
	
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
	for i in range(opts.size()):
		var opt_text = opts[i]
		var btn = Button.new()
		btn.text = str(i + 1) + ". " + opt_text
		btn.custom_minimum_size = Vector2(0, 44)
		var opt_idx = i
		btn.pressed.connect(func(): answer_quiz(opt_idx))
		options_container.add_child(btn)

func answer_quiz(selected_index: int):
	for child in options_container.get_children():
		if child is Button:
			child.disabled = true
			
	var is_correct = (selected_index == active_quiz_card["correct_index"])
	var base_cost = active_quiz_card["cost"]
	var is_redemption = active_quiz_card.get("is_redemption", false)
	
	if is_correct:
		var discount_cost = int(ceil(base_cost * 0.5))
		if is_redemption:
			StatsManager.remove_mistake(active_quiz_card.get("word", ""))
			quiz_result_label.text = "★ HARİKA! TELAFİ BAŞARILI! ★\nHata Defterinden temizlendi!\n+%75 Ekstra Güç ve %50 İndirim Kazandın!\nÖdenen: " + str(discount_cost) + " Mürekkep"
		else:
			quiz_result_label.text = "★ TEBRİKLER! DOĞRU CEVAP! ★\n%50 İndirim ve +%50 Ekstra Güç Kazandın!\nÖdenen: " + str(discount_cost) + " Mürekkep"
		quiz_result_label.modulate = Color(0.2, 1.0, 0.4)
		
		StatsManager.spend_ink(discount_cost)
		StatsManager.apply_card_upgrade(active_quiz_card, true)
	else:
		StatsManager.record_mistake(active_quiz_card)
		quiz_result_label.text = "✗ YANLIŞ! Doğru seçenek: " + active_quiz_card["options"][active_quiz_card["correct_index"]] + "\n(Hata Defterine eklendi! İleride telafi kartı olarak karşına çıkacak)\nKart normal fiyattan alındı: " + str(base_cost) + " Mürekkep"
		quiz_result_label.modulate = Color(1.0, 0.3, 0.3)
		
		StatsManager.spend_ink(base_cost)
		StatsManager.apply_card_upgrade(active_quiz_card, false)
		
	if active_card_index >= 0 and active_card_index < current_cards.size():
		current_cards.remove_at(active_card_index)
		
	quiz_continue_btn.show()

func _on_continue_button_pressed():
	quiz_modal.hide()
	auto_tur_timer = 3.0
	auto_tur_paused = not StatsManager.auto_new_tur
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
