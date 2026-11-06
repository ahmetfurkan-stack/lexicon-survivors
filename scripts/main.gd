extends Node2D

@onready var wave_manager = $WaveManager
@onready var hud = $HUD
@onready var shop_ui = $ShopLayer/ShopUI
@onready var game_over_layer = $GameOverLayer
@onready var game_over_panel = $GameOverLayer/GameOverPanel
@onready var game_over_title: Label = $GameOverLayer/GameOverPanel/Title
@onready var game_over_summary = $GameOverLayer/GameOverPanel/SummaryLabel
@onready var restart_button = $GameOverLayer/GameOverPanel/RestartButton
@onready var title_layer = $TitleLayer
@onready var title_screen = $TitleLayer/TitleScreen
@onready var player = $Player
@onready var arena_floor = $Floor
@onready var arena_frame = $ArenaFrame
@onready var audio_manager = $AudioManager
@onready var leaderboard_panel = $LeaderboardPanel
@onready var leaderboard_button: Button = $GameOverLayer/GameOverPanel/LeaderboardButton

var _run_started_at_msec: int = 0
var _latest_run_result: Dictionary = {}

func _ready():
	process_mode = Node.PROCESS_MODE_PAUSABLE
	# The scene-specific frame contains its own coherent, non-repeating floor.
	arena_floor.hide()
	game_over_layer.hide()
	shop_ui.hide()
	
	wave_manager.wave_timer_updated.connect(_on_wave_timer_updated)
	wave_manager.wave_finished.connect(_on_wave_finished)
	wave_manager.wave_started.connect(_on_wave_started)
	shop_ui.shop_closed.connect(_on_shop_closed)
	StatsManager.player_died.connect(_on_player_died)
	restart_button.pressed.connect(_on_restart_pressed)
	leaderboard_button.pressed.connect(_open_run_leaderboard)
	
	if title_screen:
		title_screen.game_started.connect(_on_title_game_started)
		title_screen.leaderboard_requested.connect(_open_title_leaderboard)
		get_tree().paused = true
		title_layer.show()
	else:
		start_game()

func _on_title_game_started():
	title_layer.hide()
	start_game()

func start_game():
	if is_inside_tree():
		get_tree().paused = false
	StatsManager.reset()
	_run_started_at_msec = Time.get_ticks_msec()
	_latest_run_result.clear()
	game_over_layer.hide()
	shop_ui.hide()
	if player:
		player.apply_character_appearance()
		player.sync_weapons()
	if hud and hud.has_method("update_info_row"):
		hud.update_info_row()
	wave_manager.start_wave()

func _on_wave_timer_updated(time_left: float):
	hud.update_timer(time_left, StatsManager.current_wave)

func _on_wave_started(wave_number: int):
	if StatsManager.selected_character == "lexicon_alchemist":
		StatsManager.add_ink(10)
	var stage_index = 0 if wave_number < 26 else (1 if wave_number < 51 else (2 if wave_number < 76 else 3))
	arena_frame.set_stage(stage_index)
	if audio_manager and audio_manager.has_method("set_biome"):
		audio_manager.set_biome(stage_index, wave_number % 5 == 0)
	if wave_number in [1, 26, 51, 76] and hud.has_method("show_arena_transition"):
		hud.show_arena_transition(stage_index)

func _on_wave_finished():
	if is_inside_tree():
		get_tree().paused = true
	var wave_number := StatsManager.current_wave
	if wave_number % 5 == 0:
		if audio_manager and audio_manager.has_method("play_effect"):
			audio_manager.play_effect("chapter_transition")
		await hud.play_story_intermission(wave_number)
	if wave_number >= StatsManager.max_waves:
		_on_run_victory()
	else:
		shop_ui.open_shop()

func _on_run_victory() -> void:
	if is_inside_tree():
		get_tree().paused = true
	shop_ui.hide()
	game_over_title.text = "ARŞİVİN YENİ SONU"
	var elapsed := maxi(1000, Time.get_ticks_msec() - _run_started_at_msec)
	_latest_run_result = {
		"submissionId": LeaderboardClient.create_submission_id(),
		"alias": LeaderboardClient.get_saved_alias(),
		"wavesCleared": StatsManager.max_waves,
		"kills": StatsManager.kill_count,
		"elapsedMs": elapsed,
		"characterId": StatsManager.selected_character,
		"difficultyId": StatsManager.difficulty
	}
	var alias := str(_latest_run_result.get("alias", "Oyuncu"))
	LeaderboardClient.save_local_result(_latest_run_result, alias if not alias.is_empty() else "Oyuncu")
	game_over_summary.text = "100 DALGA TAMAMLANDI\n\n" + str(StatsManager.characters.get(StatsManager.selected_character, {}).get("name", "Kâşif")) + " kendi sonunu seçti.\n" + str(StatsManager.kill_count) + " boss ve yaratık yenildi."
	game_over_layer.show()

func _on_shop_closed():
	if is_inside_tree():
		get_tree().paused = false
	wave_manager.start_wave()

func _on_player_died():
	if game_over_layer.visible:
		return
	game_over_title.text = "KİTAP KAPANDI"
	if is_inside_tree():
		get_tree().paused = true
	game_over_layer.show()
	_latest_run_result = {
		"submissionId": LeaderboardClient.create_submission_id(),
		"alias": LeaderboardClient.get_saved_alias(),
		"wavesCleared": maxi(0, StatsManager.current_wave - 1),
		"kills": maxi(0, StatsManager.kill_count),
		"elapsedMs": maxi(1000, Time.get_ticks_msec() - _run_started_at_msec),
		"characterId": StatsManager.selected_character,
		"difficultyId": StatsManager.difficulty
	}
	LeaderboardClient.save_local_result(_latest_run_result, str(_latest_run_result.get("alias", "Oyuncu")) if not str(_latest_run_result.get("alias", "")).is_empty() else "Oyuncu")
	
	var words_list = ""
	if StatsManager.words_learned.is_empty():
		words_list = "Henüz kelime öğrenilemedi."
	else:
		words_list = ", ".join(StatsManager.words_learned)
		
	var summary_text = "ÖĞRENİLEN KELİMELER  ·  " + str(StatsManager.words_learned.size()) + "\n"
	summary_text += words_list + "\n\n"
	summary_text += "KARAKTER  ·  " + StatsManager.characters.get(StatsManager.selected_character, {}).get("name", "Inky") + "\n"
	var difficulty_labels = {"easy": "A1–A2", "normal": "B1", "hard": "B2–C1"}
	summary_text += "SEVİYE  ·  " + difficulty_labels.get(StatsManager.difficulty, "B1") + "\n"
	summary_text += "ULAŞILAN DALGA  ·  " + str(StatsManager.current_wave) + "\n"
	summary_text += "YOK EDİLEN DÜŞMAN  ·  " + str(StatsManager.kill_count) + "\n"
	summary_text += "KAZANILAN MÜREKKEP  ·  " + str(StatsManager.ink_count)
	
	game_over_summary.text = summary_text

func _open_title_leaderboard() -> void:
	leaderboard_panel.open_board()

func _open_run_leaderboard() -> void:
	leaderboard_panel.open_board(_latest_run_result)

func _on_restart_pressed():
	get_tree().paused = false
	get_tree().reload_current_scene()
