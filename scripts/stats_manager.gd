extends Node


signal hp_changed(current_hp: float, max_hp: float)
signal ink_changed(current_ink: int)
signal wave_changed(current_wave: int)
signal kill_count_changed(total_kills: int)
signal player_died()
signal synergy_activated(synergy_name: String, description: String)
signal weapon_equipped(weapon_id: String)
signal weapon_switched(weapon_id: String, weapon_index: int)
signal artifact_purchased(artifact_id: String)
signal character_selected(char_id: String)
signal difficulty_selected(diff_id: String)

# Configuration & Choices
var selected_character: String = "inky"
var difficulty: String = "normal"

# Core player stats
var max_hp: float = 100.0
var hp: float = 100.0
var move_speed: float = 230.0
var damage_mult: float = 1.0
var attack_speed_mult: float = 1.0
var pickup_radius: float = 140.0
var projectile_count: int = 1
var pierce_count: int = 1
var armor: float = 0.0 # Damage reduction percentage (0.0 - 0.85)
var crit_chance: float = 0.05
var ink_mult: float = 1.0
var gadget_cooldown_base: float = 4.0
var gadget_cooldown_mult: float = 1.0

# Game progress
var current_wave: int = 1
var max_waves: int = 100
var ink_count: int = 0
var kill_count: int = 0
var words_learned: Array = []
var active_synergies: Dictionary = {}

# Equipment & Inventory
var equipped_weapons: Array = ["quill_blaster"]
var active_weapon_index: int = 0
var artifacts_owned: Array = []

# Character definitions
var characters: Dictionary = {
	"inky": {
		"id": "inky",
		"name": "Inky",
		"title": "Dengeli Bilgin (The Balanced Scholar)",
		"desc": "Standart dengeli nitelikler. Güvenilir ve çok yönlü kelime koruyucusu.",
		"hp": 125.0,
		"move_speed": 235.0,
		"damage_mult": 1.05,
		"attack_speed_mult": 1.05,
		"armor": 0.10,
		"crit_chance": 0.10,
		"starting_weapon": "quill_blaster",
		"passive": "Mürekkep Ustası: Mürekkep toplama menzili ve öğrenme dengesi tam.",
		"color": Color(0.9, 0.95, 1.0)
	},
	"quillmaster": {
		"id": "quillmaster",
		"name": "Quillmaster",
		"title": "Hızlı Kalemşör (Glass Cannon)",
		"desc": "+%35 Saldırı Hızı, +%20 Hasar ve +30 Hız! Seri kritik vuruşlar.",
		"hp": 95.0,
		"move_speed": 265.0,
		"damage_mult": 1.25,
		"attack_speed_mult": 1.35,
		"armor": 0.0,
		"crit_chance": 0.20,
		"starting_weapon": "syllable_shotgun",
		"passive": "Seri Kalem: Başlangıçtan itibaren Hece Pompalısı ve yüksek atış hızı.",
		"color": Color(1.0, 0.88, 0.4)
	},
	"word_knight": {
		"id": "word_knight",
		"name": "Word Knight",
		"title": "Sözcük Şövalyesi (The Tank)",
		"desc": "+55 Maksimum Can (180 HP), +%30 Hasar Direnci (Zırh), sağlam savunma kalkanı.",
		"hp": 180.0,
		"move_speed": 210.0,
		"damage_mult": 1.15,
		"attack_speed_mult": 0.95,
		"armor": 0.30,
		"crit_chance": 0.08,
		"starting_weapon": "dictionary_blade",
		"passive": "Sözlük Zırhı: Düşman darbelerine karşı dayanıklı ve yakın dövüş kalkanı.",
		"color": Color(0.45, 0.9, 0.65)
	}
}

# Difficulty definitions
var difficulties: Dictionary = {
	"easy": {
		"id": "easy",
		"name": "Kolay (LGS / A1-A2)",
		"desc": "Düşmanlar yavaş (%-25), canları az (%-35). Başlangıç canı +40 HP. Rahat öğrenme ortamı.",
		"enemy_speed_mult": 0.75,
		"enemy_hp_mult": 0.65,
		"enemy_damage_mult": 0.60,
		"player_hp_bonus": 40.0,
		"ink_bonus_mult": 1.40
	},
	"normal": {
		"id": "normal",
		"name": "Orta (YKS-YDT / B1)",
		"desc": "Dengeli arcade roguelite. Akıcı dalga temposu, toplanabilir can parşömenleri.",
		"enemy_speed_mult": 0.90,
		"enemy_hp_mult": 0.85,
		"enemy_damage_mult": 0.80,
		"player_hp_bonus": 15.0,
		"ink_bonus_mult": 1.20
	},
	"hard": {
		"id": "hard",
		"name": "Zor (IELTS-TOEFL / B2-C1)",
		"desc": "Akademik arena! Çevik düşmanlar, yüksek canlar (%+15), sınav tuzakları.",
		"enemy_speed_mult": 1.08,
		"enemy_hp_mult": 1.15,
		"enemy_damage_mult": 1.15,
		"player_hp_bonus": 0.0,
		"ink_bonus_mult": 1.35
	}
}

# Weapons Catalog
var weapons_catalog: Dictionary = {
	"quill_blaster": {
		"id": "quill_blaster",
		"name": "Tüy Kalem (Quill Blaster)",
		"desc": "Hedefe hızlı mürekkep atışları yapar.",
		"cost": 12,
		"cooldown": 0.8,
		"damage": 22.0
	},
	"syllable_shotgun": {
		"id": "syllable_shotgun",
		"name": "Hece Pompalısı (Syllable Shotgun)",
		"desc": "Geniş bir yayda 4-5 adet hece parçacığı püskürtür.",
		"cost": 16,
		"cooldown": 1.2,
		"damage": 16.0
	},
	"lexicon_beam": {
		"id": "lexicon_beam",
		"name": "Leksikon Lazeri (Lexicon Beam)",
		"desc": "Düşman sıralarını delip geçen odaklanmış mürekkep ışını.",
		"cost": 20,
		"cooldown": 0.55,
		"damage": 18.0
	},
	"punctuation_bomb": {
		"id": "punctuation_bomb",
		"name": "Noktalama Bombası (Punctuation Bomb)",
		"desc": "Zemine temasla patlayan virgül ve ünlem mayınları bırakır.",
		"cost": 17,
		"cooldown": 1.35,
		"damage": 38.0
	},
	"dictionary_blade": {
		"id": "dictionary_blade",
		"name": "Sözlük Kılıcı (Dictionary Blade)",
		"desc": "Kullanıcı etrafında dönerek yaklaşan hataları biçer.",
		"cost": 18,
		"cooldown": 0.75,
		"damage": 38.0
	},
	"crossword_crossbow": {
		"id": "crossword_crossbow",
		"name": "Bulmaca Tatar Yayı (Crossword Crossbow)",
		"desc": "Çarptığı düşmandan 4 yöne dağılan bulmaca okları fırlatır.",
		"cost": 22,
		"cooldown": 0.95,
		"damage": 34.0
	},
	"hyphen_boomerang": {
		"id": "hyphen_boomerang",
		"name": "Tire Bumerangı (Hyphen Boomerang)",
		"desc": "İleri uçup geri dönerken yolundaki tüm düşmanları biçer.",
		"cost": 20,
		"cooldown": 1.10,
		"damage": 28.0
	},
	"ink_flamethrower": {
		"id": "ink_flamethrower",
		"name": "Mürekkep Alevi (Ink Flamethrower)",
		"desc": "Sürekli bir kor mürekkep alevi püskürtür.",
		"cost": 24,
		"cooldown": 0.12,
		"damage": 9.5
	},
	"thesaurus_rocket": {
		"id": "thesaurus_rocket",
		"name": "Eşanlamlı Roketi (Thesaurus Rocket)",
		"desc": "Çarptığında devasa bir sözlük patlaması yaratan roket.",
		"cost": 26,
		"cooldown": 1.60,
		"damage": 70.0
	},
	"quote_pistols": {
		"id": "quote_pistols",
		"name": "Tırnak Çift Tabanca (Quote Pistols)",
		"desc": "Çift el tırnak işaretleriyle seri ve yüksek kritik vuruşlar.",
		"cost": 22,
		"cooldown": 0.28,
		"damage": 17.0
	},
	"calligraphy_katana": {
		"id": "calligraphy_katana",
		"name": "Hattat Katanası (Calligraphy Katana)",
		"desc": "İleriye doğru hilal şeklinde geniş mürekkep dalgası savurur.",
		"cost": 25,
		"cooldown": 0.65,
		"damage": 42.0
	},
	"scroll_turret": {
		"id": "scroll_turret",
		"name": "Tomar Tareti (Scroll Turret)",
		"desc": "Zemine dönen büyü tomarı yerleştirir, otomatik yaylım ateşi açar.",
		"cost": 28,
		"cooldown": 2.2,
		"damage": 26.0
	},
	"rune_orb": {
		"id": "rune_orb",
		"name": "Rün Küresi (Rune Orb)",
		"desc": "Düşmanlar arasında zincirleme seken parlak rün küresi.",
		"cost": 24,
		"cooldown": 1.1,
		"damage": 36.0
	},
	"grammar_sniper": {
		"id": "grammar_sniper",
		"name": "Gramer Keskin Nişancısı (Grammar Sniper)",
		"desc": "En uzaktaki veya en güçlü hedefe delici, aşırı yüksek hasarlı atış.",
		"cost": 30,
		"cooldown": 1.9,
		"damage": 95.0
	}
}

# Artifacts Catalog
var artifacts_catalog: Dictionary = {
	"magnifying_glass": {
		"id": "magnifying_glass",
		"name": "Büyüteç (Magnifying Glass)",
		"desc": "+%15 Kritik Şans & +%20 Mermi Hasarı",
		"cost": 14,
		"stats": {"crit_chance": 0.15, "damage": 0.20}
	},
	"golden_inkpot": {
		"id": "golden_inkpot",
		"name": "Altın Mürekkep Hokkası (Golden Inkpot)",
		"desc": "Düşmanlardan +%50 daha fazla mürekkep düşer.",
		"cost": 15,
		"stats": {"ink_mult": 0.50}
	},
	"scholar_boots": {
		"id": "scholar_boots",
		"name": "Bilgin Çizmeleri (Scholar Boots)",
		"desc": "+40 Hareket Hızı",
		"cost": 12,
		"stats": {"move_speed": 40.0}
	},
	"grammar_guide": {
		"id": "grammar_guide",
		"name": "Dilbilgisi Kılavuzu (Grammar Guide)",
		"desc": "+20 Maksimum Can & +%15 Hasar Direnci (Zırh)",
		"cost": 14,
		"stats": {"max_hp": 20.0, "armor": 0.15}
	},
	"quantum_eraser": {
		"id": "quantum_eraser",
		"name": "Kuantum Silgi (Quantum Eraser)",
		"desc": "Silgi Atılımı (Gadget) bekleme süresini %35 azaltır.",
		"cost": 12,
		"stats": {"gadget_cooldown_mult": -0.35}
	},
	"diligence_coffee": {
		"id": "diligence_coffee",
		"name": "Çalışkanlık Kahvesi (Coffee of Diligence)",
		"desc": "+%25 Saldırı Hızı",
		"cost": 13,
		"stats": {"attack_speed": 0.25}
	}
}

# Gadgets Catalog
var gadgets_catalog: Dictionary = {
	"dash": {
		"id": "dash",
		"name": "Silgi Atılımı (Eraser Dash)",
		"desc": "Anlık ileri atılma, 0.4s hasar görmezlik ve temas edilen düşmanlara 50 silgi hasarı.",
		"cooldown": 4.0,
		"cost": 0
	},
	"ink_bomb": {
		"id": "ink_bomb",
		"name": "Mürekkep Kıyameti (Ink Cataclysm)",
		"desc": "Tüm ekrandaki düşmanlara 120 patlama hasarı verir ve 3 saniye körleştirir.",
		"cooldown": 12.0,
		"cost": 25
	},
	"time_stop": {
		"id": "time_stop",
		"name": "Kronos Virgülü (Chrono Comma)",
		"desc": "Zamanı 3.5 saniye boyunca %80 yavaşlatır.",
		"cooldown": 14.0,
		"cost": 28
	},
	"shield": {
		"id": "shield",
		"name": "Leksikon Kalkanı (Lexicon Aegis)",
		"desc": "5 saniye boyunca 100 hasar emen ve çarpan mermileri yansıtan koruma alanı.",
		"cooldown": 10.0,
		"cost": 22
	},
	"magnet": {
		"id": "magnet",
		"name": "Gramer Mıknatısı (Grammar Magnet)",
		"desc": "Tüm harita üzerindeki tüm mürekkep damlalarını ve rünleri anında kendine çeker.",
		"cooldown": 8.0,
		"cost": 18
	}
}
var active_gadget: String = "dash"
var owned_gadgets: Array = ["dash"]

signal gadget_activated(gadget_id: String)
signal gadget_switched(gadget_id: String)

func select_gadget(gadget_id: String) -> bool:
	if gadget_id in owned_gadgets and gadgets_catalog.has(gadget_id):
		active_gadget = gadget_id
		emit_signal("gadget_switched", gadget_id)
		return true
	return false

func buy_gadget(gadget_id: String) -> bool:
	if not gadgets_catalog.has(gadget_id) or gadget_id in owned_gadgets:
		return false
	var cost = gadgets_catalog[gadget_id]["cost"]
	if spend_ink(cost):
		owned_gadgets.append(gadget_id)
		active_gadget = gadget_id
		emit_signal("gadget_switched", gadget_id)
		return true
	return false

func select_character(char_id: String):
	if characters.has(char_id):
		selected_character = char_id
		emit_signal("character_selected", char_id)

func set_difficulty(diff_id: String):
	if difficulties.has(diff_id):
		difficulty = diff_id
		emit_signal("difficulty_selected", diff_id)

func reset():
	var char_data = characters.get(selected_character, characters["inky"])
	var diff_data = difficulties.get(difficulty, difficulties["normal"])
	
	max_hp = char_data["hp"] + diff_data.get("player_hp_bonus", 0.0)
	hp = max_hp
	move_speed = char_data["move_speed"]
	damage_mult = char_data["damage_mult"]
	attack_speed_mult = char_data["attack_speed_mult"]
	armor = char_data["armor"]
	crit_chance = char_data["crit_chance"]
	pickup_radius = 140.0
	projectile_count = 1
	pierce_count = 1
	
	ink_mult = diff_data.get("ink_bonus_mult", 1.0)
	gadget_cooldown_base = 4.0
	gadget_cooldown_mult = 1.0
	
	current_wave = 1
	ink_count = 0
	kill_count = 0
	words_learned.clear()
	active_synergies.clear()
	
	equipped_weapons.clear()
	equipped_weapons.append(char_data["starting_weapon"])
	active_weapon_index = 0
	artifacts_owned.clear()
	owned_gadgets = ["dash"]
	active_gadget = "dash"
	
	emit_signal("hp_changed", hp, max_hp)
	emit_signal("ink_changed", ink_count)
	emit_signal("wave_changed", current_wave)
	emit_signal("kill_count_changed", kill_count)

func add_ink(amount: int):
	var effective_amount = int(ceil(amount * ink_mult))
	ink_count += effective_amount
	emit_signal("ink_changed", ink_count)

func spend_ink(amount: int) -> bool:
	if ink_count >= amount:
		ink_count -= amount
		emit_signal("ink_changed", ink_count)
		return true
	return false

func register_kill():
	kill_count += 1
	emit_signal("kill_count_changed", kill_count)

func heal(amount: float):
	hp = min(max_hp, hp + amount)
	emit_signal("hp_changed", hp, max_hp)

func take_damage(amount: float):
	var reduction = clamp(armor, 0.0, 0.85)
	var final_dmg = max(1.0, amount * (1.0 - reduction))
	hp = max(0.0, hp - final_dmg)
	emit_signal("hp_changed", hp, max_hp)
	if hp <= 0.0:
		emit_signal("player_died")

func equip_weapon(weapon_id: String) -> bool:
	if not weapons_catalog.has(weapon_id):
		return false
	if not equipped_weapons.has(weapon_id):
		equipped_weapons.append(weapon_id)
		emit_signal("weapon_equipped", weapon_id)
		return true
	return false

func has_weapon(weapon_id: String) -> bool:
	return equipped_weapons.has(weapon_id)

func get_active_weapon_id() -> String:
	if active_weapon_index >= 0 and active_weapon_index < equipped_weapons.size():
		return equipped_weapons[active_weapon_index]
	return equipped_weapons[0] if equipped_weapons.size() > 0 else "quill_blaster"

func switch_next_weapon():
	if equipped_weapons.size() <= 1:
		return
	active_weapon_index = (active_weapon_index + 1) % equipped_weapons.size()
	emit_signal("weapon_switched", get_active_weapon_id(), active_weapon_index)

func switch_prev_weapon():
	if equipped_weapons.size() <= 1:
		return
	active_weapon_index = (active_weapon_index - 1 + equipped_weapons.size()) % equipped_weapons.size()
	emit_signal("weapon_switched", get_active_weapon_id(), active_weapon_index)

func select_weapon_index(idx: int):
	if idx >= 0 and idx < equipped_weapons.size():
		active_weapon_index = idx
		emit_signal("weapon_switched", get_active_weapon_id(), active_weapon_index)

func buy_artifact(art_id: String) -> bool:
	if not artifacts_catalog.has(art_id):
		return false
	if artifacts_owned.has(art_id):
		return false
		
	var art = artifacts_catalog[art_id]
	if spend_ink(art["cost"]):
		artifacts_owned.append(art_id)
		var stats = art.get("stats", {})
		for s in stats.keys():
			var val = stats[s]
			match s:
				"max_hp":
					max_hp += val
					hp += val
					emit_signal("hp_changed", hp, max_hp)
				"move_speed":
					move_speed += val
				"damage":
					damage_mult += val
				"attack_speed":
					attack_speed_mult += val
				"armor":
					armor = clamp(armor + val, 0.0, 0.85)
				"crit_chance":
					crit_chance = clamp(crit_chance + val, 0.0, 1.0)
				"ink_mult":
					ink_mult += val
				"gadget_cooldown_mult":
					gadget_cooldown_mult = max(0.25, gadget_cooldown_mult + val)
		emit_signal("artifact_purchased", art_id)
		return true
	return false

func has_artifact(art_id: String) -> bool:
	return artifacts_owned.has(art_id)

func apply_card_upgrade(card_data: Dictionary, quiz_bonus: bool = false):
	if card_data.has("word"):
		words_learned.append(card_data["word"])
	var multiplier = 1.5 if quiz_bonus else 1.0
	
	var stat_name = card_data.get("stat", "")
	var val = card_data.get("value", 0.0) * multiplier
	
	match stat_name:
		"max_hp":
			max_hp += val
			hp += val
			emit_signal("hp_changed", hp, max_hp)
		"heal":
			heal(val)
		"move_speed":
			move_speed += val
		"damage":
			damage_mult += val
		"attack_speed":
			attack_speed_mult += val
		"pickup_radius":
			pickup_radius += val
		"pierce":
			pierce_count += int(val)
		"projectile_count":
			projectile_count += int(val)
		"armor":
			armor = clamp(armor + val, 0.0, 0.85)
		"crit_chance":
			crit_chance = clamp(crit_chance + val, 0.0, 1.0)
			
	check_synergies()

var _word_db_instance = null

func get_word_db():
	if not _word_db_instance:
		if is_inside_tree() and get_tree().root.has_node("WordDatabase"):
			_word_db_instance = get_tree().root.get_node("WordDatabase")
		else:
			_word_db_instance = load("res://scripts/word_database.gd").new()
	return _word_db_instance

func check_synergies():
	var db = get_word_db()
	var type_counts = {}
	for word_name in words_learned:
		var info = db.get_word_info(word_name)
		if not info.is_empty():
			var t = info.get("type", "General")
			type_counts[t] = type_counts.get(t, 0) + 1
			
	# 3 Adjectives = Swift Linguist (+35 move speed)
	if type_counts.get("Adjective", 0) >= 3 and not active_synergies.has("Swift Linguist"):
		active_synergies["Swift Linguist"] = true
		move_speed += 35.0
		emit_signal("synergy_activated", "Swift Linguist", "+35 Hareket Hızı (3 Sıfat Kombosu)")
		
	# 3 Verbs = Action Master (+25% Damage)
	if type_counts.get("Verb", 0) >= 3 and not active_synergies.has("Action Master"):
		active_synergies["Action Master"] = true
		damage_mult += 0.25
		emit_signal("synergy_activated", "Action Master", "+%25 Hasar Gücü (3 Fiil Kombosu)")

	# 2 Prefixes = Prefix Overdrive (+1 Pierce)
	if type_counts.get("Prefix", 0) >= 2 and not active_synergies.has("Prefix Overdrive"):
		active_synergies["Prefix Overdrive"] = true
		pierce_count += 1
		emit_signal("synergy_activated", "Prefix Overdrive", "+1 Delici Atış (2 Ön Ek Kombosu)")

	# 3 Grammars = Syntax Guardian (+%15 Armor)
	var grammar_count = type_counts.get("Grammar", 0) + type_counts.get("Grammar Pattern", 0) + type_counts.get("Conjunction", 0) + type_counts.get("Preposition", 0)
	if grammar_count >= 3 and not active_synergies.has("Syntax Guardian"):
		active_synergies["Syntax Guardian"] = true
		armor = clamp(armor + 0.15, 0.0, 0.85)
		emit_signal("synergy_activated", "Syntax Guardian", "+%15 Zırh & Hasar Direnci (3 Dilbilgisi Kombosu)")

	# 2 Collocations = Word Weaver (+%20 Attack Speed)
	if type_counts.get("Collocation", 0) >= 2 and not active_synergies.has("Word Weaver"):
		active_synergies["Word Weaver"] = true
		attack_speed_mult += 0.20
		emit_signal("synergy_activated", "Word Weaver", "+%20 Saldırı Hızı (2 Kalıp İfade Kombosu)")
