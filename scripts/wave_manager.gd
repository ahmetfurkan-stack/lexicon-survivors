extends Node2D

signal wave_timer_updated(time_remaining: float)
signal wave_finished()
signal wave_started(wave_number: int)

@export var enemy_scene: PackedScene = preload("res://scenes/enemy.tscn")
@export var wave_duration: float = 25.0
@export var max_active_enemies: int = 220

var time_left: float = 25.0
var spawn_timer: float = 0.0
var is_wave_active: bool = false
var player_ref: Node2D = null
var boss_wave_active: bool = false
var boss_spawned: bool = false
var boss_overtime_level: int = 0
var milestone_boss: Node2D = null
const SPAWN_X_LIMIT := 1150.0
const SPAWN_Y_LIMIT := 850.0
const MILESTONE_BOSSES := [
	{"type":"Red Pen Boss", "name":"KIRMIZI MÜFETTİŞ", "sprite":"upgrade_v2/boss_red_inquisitor.png", "color":Color("#e45c54"), "skill":"judgment"},
	{"type":"Syntax Titan", "name":"YARIM KALAN DEV", "sprite":"upgrade_v2/boss_syntax_titan.png", "color":Color("#e2a74b"), "skill":"quake"},
	{"type":"Oxymoron Ogre", "name":"ÇELİŞKİ", "sprite":"oxymoron_ogre.png", "color":Color("#f47b45"), "skill":"nova"},
	{"type":"Homophone Harpy", "name":"İKİ SESLİ HARPY", "sprite":"upgrade_v1/monster_homophone_harpy.png", "color":Color("#9b8ae7"), "skill":"fan"},
	{"type":"Lexicon Dragon Boss", "name":"LEKSİKON EJDERHASI", "sprite":"upgrade_v2/boss_lexicon_dragon.png", "color":Color("#d34b68"), "skill":"orbit"},
	{"type":"Run-on Reaper", "name":"DURAKSIZ ORAKÇI", "sprite":"upgrade_v1/monster_run_on_reaper.png", "color":Color("#c64a42"), "skill":"charge"},
	{"type":"Malapropism Mimic", "name":"ÖDÜNÇ YÜZ", "sprite":"malapropism_mimic.png", "color":Color("#a879d4"), "skill":"mirror"},
	{"type":"Vocabulary Void", "name":"SÖZCÜKSÜZ AĞIZ", "sprite":"upgrade_v2/boss_void_curator.png", "color":Color("#6b64d9"), "skill":"gravity"},
	{"type":"Punctuation Phantom", "name":"SON NOKTA", "sprite":"upgrade_v1/monster_punctuation_phantom.png", "color":Color("#70a8cf"), "skill":"crossfire"},
	{"type":"Double Negative Drake", "name":"ÇİFTE YADSIMA", "sprite":"upgrade_v1/monster_double_negative_drake.png", "color":Color("#7e9b52"), "skill":"rift"},
	{"type":"Palindrome Phantom", "name":"TERS YANSI", "sprite":"palindrome_phantom.png", "color":Color("#bd78cb"), "skill":"return"},
	{"type":"Tautology Twin", "name":"YİNELENEN İKİZ", "sprite":"upgrade_v1/monster_tautology_twin.png", "color":Color("#d07d54"), "skill":"echo"},
	{"type":"Dangling Modifier", "name":"ASKIDA CÜMLE", "sprite":"upgrade_v1/monster_dangling_modifier.png", "color":Color("#5faaa2"), "skill":"snare"},
	{"type":"Spelling Spectre", "name":"SOLUK DÜZELTMEN", "sprite":"upgrade_v1/monster_spelling_spectre.png", "color":Color("#91a9c4"), "skill":"shards"},
	{"type":"Idiom Imp", "name":"HARFÎ ALEV", "sprite":"upgrade_v1/monster_idiom_imp.png", "color":Color("#dc7450"), "skill":"embers"},
	{"type":"Red Pen Boss", "name":"KIRMIZI REDAKTÖR", "sprite":"upgrade_v2/boss_red_inquisitor.png", "color":Color("#d94841"), "skill":"sever"},
	{"type":"Oxymoron Ogre", "name":"İKİLİ GERÇEK", "sprite":"oxymoron_ogre.png", "color":Color("#f18b43"), "skill":"split"},
	{"type":"Malapropism Mimic", "name":"YANLIŞ NERİS", "sprite":"malapropism_mimic.png", "color":Color("#8b65c4"), "skill":"eclipse"},
	{"type":"Vocabulary Void", "name":"YAZILMAMIŞ", "sprite":"upgrade_v2/boss_void_curator.png", "color":Color("#5441b8"), "skill":"void_bloom"},
	{"type":"Lexicon Dragon Boss", "name":"OMEGA · SON SÖZ", "sprite":"upgrade_v2/boss_lexicon_dragon.png", "color":Color("#df3d65"), "skill":"finale"}
]

func start_wave():
	boss_wave_active = StatsManager.current_wave % 5 == 0
	boss_spawned = false
	boss_overtime_level = 0
	milestone_boss = null
	time_left = wave_duration
	is_wave_active = true
	spawn_timer = 1.0 if boss_wave_active else 0.5
	emit_signal("wave_started", StatsManager.current_wave)
	emit_signal("wave_timer_updated", time_left)

func _process(delta: float):
	if not is_wave_active:
		return

	time_left -= delta
	emit_signal("wave_timer_updated", max(0.0, time_left))

	if time_left <= 0:
		if boss_wave_active:
			boss_overtime_level += 1
			time_left = 15.0
			if is_instance_valid(milestone_boss):
				milestone_boss.enrage_boss(boss_overtime_level)
		else:
			end_wave()
			return
	if boss_wave_active:
		if not boss_spawned:
			spawn_timer -= delta
			if spawn_timer <= 0.0:
				spawn_milestone_boss()
		elif _active_enemy_count() == 0:
			end_wave()
		return

	var wave_enemy_cap := _get_wave_enemy_cap()
	var active_count = _active_enemy_count()
	if active_count >= wave_enemy_cap:
		# Hold the spawn clock at the cap so clearing space resumes the cadence cleanly.
		spawn_timer = max(spawn_timer, 0.0)
		return

	spawn_timer -= delta
	var diff_factor = 1.15 if StatsManager.difficulty == "easy" else (0.80 if StatsManager.difficulty == "hard" else 1.0)
	var spawn_interval = max(0.12, (0.60 - (StatsManager.current_wave * 0.04)) * diff_factor)
	if spawn_timer <= 0:
		spawn_timer = spawn_interval
		var batch_count = 3 if StatsManager.current_wave >= 25 else (2 if StatsManager.current_wave >= 8 else 1)
		var available_slots = wave_enemy_cap - _active_enemy_count()
		for i in range(min(batch_count, available_slots)):
			spawn_enemy()

func _active_enemy_count() -> int:
	return Enemy.get_active_enemy_count()

func _get_wave_enemy_cap() -> int:
	# Early waves keep readable space around the player; later waves build into
	# the larger horde the pacing promises, with a performance ceiling at 220.
	return mini(max_active_enemies, 48 + maxi(0, StatsManager.current_wave - 1) * 2)

func get_arena_spawn_position(origin: Vector2, min_distance: float = 560.0, preferred_angle: Variant = null) -> Vector2:
	# Keep spawns inside the visible room and away from a player standing at a shelf corner.
	var first_angle: float = float(preferred_angle) if preferred_angle != null else randf() * TAU
	for attempt in range(16):
		var angle := first_angle + attempt * TAU / 16.0
		var point := origin + Vector2(cos(angle), sin(angle)) * 700.0
		point.x = clampf(point.x, -SPAWN_X_LIMIT, SPAWN_X_LIMIT)
		point.y = clampf(point.y, -SPAWN_Y_LIMIT, SPAWN_Y_LIMIT)
		if point.distance_to(origin) >= min_distance:
			return point

	var safe_points: Array[Vector2] = []
	for x in range(-1050, 1051, 175):
		safe_points.append(Vector2(x, -820))
		safe_points.append(Vector2(x, 820))
	for y in range(-750, 751, 150):
		safe_points.append(Vector2(-1120, y))
		safe_points.append(Vector2(1120, y))
	var candidates := safe_points.filter(func(point: Vector2) -> bool: return point.distance_to(origin) >= min_distance)
	if not candidates.is_empty():
		return candidates[randi() % candidates.size()]
	return Vector2(clampf(0.0, -SPAWN_X_LIMIT, SPAWN_X_LIMIT), clampf(0.0, -SPAWN_Y_LIMIT, SPAWN_Y_LIMIT))

func find_player():
	if not is_inside_tree():
		return
	if not player_ref or not is_instance_valid(player_ref):
		var players = get_tree().get_nodes_in_group("player")
		if players.size() > 0:
			player_ref = players[0]

func spawn_enemy():
	if not is_inside_tree():
		return
	if _active_enemy_count() >= _get_wave_enemy_cap():
		return
	find_player()
	if not player_ref:
		return

	var spawn_pos := get_arena_spawn_position(player_ref.global_position, 560.0)

	var enemy = enemy_scene.instantiate()
	enemy.global_position = spawn_pos

	# Choose type based on wave
	var roll = randf()
	var wave = StatsManager.current_wave
	if wave >= 30 and roll < 0.12:
		enemy.enemy_type = "Oxymoron Ogre"
	elif wave >= 25 and roll < 0.22:
		enemy.enemy_type = "Double Negative Drake"
	elif wave >= 25 and roll < 0.30:
		enemy.enemy_type = "Vocabulary Void"
	elif wave >= 20 and roll < 0.38:
		enemy.enemy_type = "Palindrome Phantom"
	elif wave >= 20 and roll < 0.46:
		enemy.enemy_type = "Homophone Harpy"
	elif wave >= 15 and roll < 0.54:
		enemy.enemy_type = "Dangling Modifier"
	elif wave >= 15 and roll < 0.62:
		enemy.enemy_type = "Malapropism Mimic"
	elif wave >= 10 and roll < 0.70:
		enemy.enemy_type = "Run-on Reaper"
	elif wave >= 10 and roll < 0.78:
		enemy.enemy_type = "Idiom Imp"
	elif wave >= 5 and roll < 0.85:
		enemy.enemy_type = "Tautology Twin"
	elif wave >= 5 and roll < 0.90:
		enemy.enemy_type = "Punctuation Phantom"
	elif roll < 0.95:
		enemy.enemy_type = "Grammar Goblin"
	else:
		enemy.enemy_type = "Typo Slime"

	# Tactical affixes for wave >= 15 (35% chance)
	if wave >= 15 and randf() < 0.35 and enemy.enemy_type != "Red Pen Boss" and enemy.enemy_type != "Lexicon Dragon Boss":
		var affixes = ["shielded", "blinker", "commander", "volatile"]
		enemy.affix = affixes[randi() % affixes.size()]

	get_tree().current_scene.add_child(enemy)

func spawn_milestone_boss() -> void:
	if boss_spawned or not is_inside_tree():
		return
	find_player()
	if not is_instance_valid(player_ref):
		return
	var wave := StatsManager.current_wave
	var index := clampi(int(wave / 5) - 1, 0, MILESTONE_BOSSES.size() - 1)
	var boss_data: Dictionary = MILESTONE_BOSSES[index]
	var boss = enemy_scene.instantiate()
	boss.enemy_type = str(boss_data.type)
	boss.is_milestone_boss = true
	boss.boss_custom_name = str(boss_data.name)
	boss.boss_custom_sprite_path = str(boss_data.sprite)
	boss.boss_custom_color = boss_data.color
	boss.boss_skill_id = str(boss_data.skill)
	var hp_scale := 1.0 + float(wave) * 0.018
	if StatsManager.difficulty == "hard": hp_scale *= 1.22
	if StatsManager.difficulty == "easy": hp_scale *= 0.82
	boss.boss_health_override = (1750.0 + float(wave) * 145.0) * hp_scale
	boss.boss_damage_override = (42.0 + float(wave) * 0.58) * (1.15 if StatsManager.difficulty == "hard" else 1.0)
	boss.boss_reward_override = StatsManager.get_boss_wave_reward(wave)
	var angle := randf() * TAU
	boss.global_position = get_arena_spawn_position(player_ref.global_position, 590.0, angle)
	boss_spawned = true
	milestone_boss = boss
	get_tree().current_scene.add_child(boss)

func end_wave():
	is_wave_active = false
	boss_wave_active = false
	milestone_boss = null
	# Remove survivors without treating a timed wave transition as player kills.
	var enemies := Enemy.get_active_enemies()
	for e in enemies:
		if is_instance_valid(e):
			if e.has_method("despawn_without_rewards"):
				e.despawn_without_rewards()
			else:
				e.queue_free()
	for projectile in get_tree().get_nodes_in_group("enemy_projectiles"):
		if is_instance_valid(projectile):
			projectile.queue_free()
	emit_signal("wave_finished")
