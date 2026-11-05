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

var banner_timer: float = 0.0
var chapter_timer: float = 0.0

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
	banner.hide()
	chapter_card.hide()
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
		gadget_status.modulate = Color(0.77, 0.68, 0.49)
	else:
		gadget_status.text = str(snapped(time_left, 0.1)) + "s"
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
	update_gadget(0.0, 0.0)

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

func _on_weapon_switched(_w_id: String, _w_idx: int):
	update_info_row()

func _on_character_changed(_char_id: String):
	update_info_row()

func _on_difficulty_changed(_diff_id: String):
	update_info_row()

func _on_synergy_activated(syn_name: String, syn_desc: String):
	banner.show()
	banner_title.text = "YENİ SİNERJİ · " + syn_name
	banner_desc.text = syn_desc
	banner_timer = 4.0
