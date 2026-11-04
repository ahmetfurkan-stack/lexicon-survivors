extends Node

func _ready():
	print("Instantiating main.tscn in headless test...")
	var scene = load("res://scenes/main.tscn")
	assert(scene != null, "main.tscn should load")
	var main_node = scene.instantiate()
	add_child(main_node)
	print("main_node instantiated successfully!")
	assert(main_node.has_node("Player"), "Player should exist")
	assert(main_node.has_node("WaveManager"), "WaveManager should exist")
	assert(main_node.has_node("HUD"), "HUD should exist")
	assert(main_node.has_node("ShopLayer/ShopUI"), "ShopUI should exist")
	assert(main_node.has_node("TitleLayer/TitleScreen"), "TitleScreen should exist")
	print("All scene components verified! Quitting cleanly.")
	get_tree().quit(0)
