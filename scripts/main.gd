extends Node2D

@onready var wave_manager = $WaveManager
@onready var hud = $HUD
@onready var shop_ui = $ShopLayer/ShopUI
@onready var game_over_layer = $GameOverLayer
@onready var game_over_panel = $GameOverLayer/GameOverPanel
@onready var game_over_summary = $GameOverLayer/GameOverPanel/SummaryLabel
@onready var restart_button = $GameOverLayer/GameOverPanel/RestartButton
@onready var title_layer = $TitleLayer
@onready var title_screen = $TitleLayer/TitleScreen
@onready var player = $Player

func _ready():
	process_mode = Node.PROCESS_MODE_ALWAYS
	game_over_layer.hide()
	shop_ui.hide()
	
	wave_manager.wave_timer_updated.connect(_on_wave_timer_updated)
	wave_manager.wave_finished.connect(_on_wave_finished)
	shop_ui.shop_closed.connect(_on_shop_closed)
	StatsManager.player_died.connect(_on_player_died)
	restart_button.pressed.connect(_on_restart_pressed)
	
	if title_screen:
		title_screen.game_started.connect(_on_title_game_started)
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

func _on_wave_finished():
	if is_inside_tree():
		get_tree().paused = true
	shop_ui.open_shop()

func _on_shop_closed():
	if is_inside_tree():
		get_tree().paused = false
	wave_manager.start_wave()

func _on_player_died():
	if is_inside_tree():
		get_tree().paused = true
	game_over_layer.show()
	
	var words_list = ""
	if StatsManager.words_learned.is_empty():
		words_list = "Henüz kelime öğrenilemedi."
	else:
		words_list = ", ".join(StatsManager.words_learned)
		
	var summary_text = "Öğrenilen Kelimeler (" + str(StatsManager.words_learned.size()) + "):\n"
	summary_text += words_list + "\n\n"
	summary_text += "Seçilen Karakter: " + StatsManager.characters.get(StatsManager.selected_character, {}).get("name", "Inky") + "\n"
	summary_text += "Zorluk: " + StatsManager.difficulties.get(StatsManager.difficulty, {}).get("name", "Orta") + "\n"
	summary_text += "Ulaşılan Dalga: " + str(StatsManager.current_wave) + "\n"
	summary_text += "Yok Edilen Dil Hataları: " + str(StatsManager.kill_count) + "\n"
	summary_text += "Kazanılan Mürekkep: " + str(StatsManager.ink_count)
	
	game_over_summary.text = summary_text

func _on_restart_pressed():
	get_tree().paused = false
	get_tree().reload_current_scene()
