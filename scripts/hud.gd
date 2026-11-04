extends CanvasLayer

@onready var hp_bar = $MarginContainer/VBox/TopRow/HealthBar
@onready var hp_label = $MarginContainer/VBox/TopRow/HealthBar/HPLabel
@onready var timer_label = $MarginContainer/VBox/TopRow/TimerLabel
@onready var ink_label = $MarginContainer/VBox/TopRow/InkLabel
@onready var kill_label = $MarginContainer/VBox/TopRow/KillLabel
@onready var char_diff_label = $MarginContainer/VBox/InfoRow/CharDiffLabel
@onready var weapons_label = $MarginContainer/VBox/InfoRow/WeaponsLabel
@onready var gadget_status = $GadgetPanel/HBox/GadgetStatus
@onready var banner = $SynergyBanner
@onready var banner_title = $SynergyBanner/Title
@onready var banner_desc = $SynergyBanner/Desc

var banner_timer: float = 0.0

func _ready():
	banner.hide()
	StatsManager.hp_changed.connect(_on_hp_changed)
	StatsManager.ink_changed.connect(_on_ink_changed)
	StatsManager.kill_count_changed.connect(_on_kill_changed)
	StatsManager.synergy_activated.connect(_on_synergy_activated)
	StatsManager.weapon_equipped.connect(_on_weapon_equipped)
	StatsManager.weapon_switched.connect(_on_weapon_switched)
	StatsManager.character_selected.connect(_on_character_changed)
	StatsManager.difficulty_selected.connect(_on_difficulty_changed)
	
	_on_hp_changed(StatsManager.hp, StatsManager.max_hp)
	_on_ink_changed(StatsManager.ink_count)
	_on_kill_changed(StatsManager.kill_count)
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
