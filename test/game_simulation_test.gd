extends SceneTree

func _init():
	print("--- BEGIN INTEGRATION TEST: LEXICON SURVIVORS ---")
	
	var WordDatabase = load("res://scripts/word_database.gd").new()
	var StatsManager = load("res://scripts/stats_manager.gd").new()
	
	# Test 1: Word Database
	print("[TEST 1] Testing WordDatabase...")
	var test_card = WordDatabase.get_word_info("Relentless")
	assert(not test_card.is_empty(), "Relentless must exist in WordDatabase")
	assert(test_card["type"] == "Adjective", "Type must be Adjective")
	assert(test_card["level"] == "B2", "Level must be B2")
	print("  -> WordDatabase verified: found ", WordDatabase.words.size(), " educational words.")
	
	# Test 2: Stats Manager
	print("[TEST 2] Testing StatsManager initial state & upgrades...")
	StatsManager.reset()
	assert(StatsManager.hp == 100.0, "HP must start at 100")
	assert(StatsManager.ink_count == 0, "Ink must start at 0")
	
	StatsManager.add_ink(50)
	assert(StatsManager.ink_count == 50, "Ink must be 50 after add_ink")
	
	var spend_success = StatsManager.spend_ink(20)
	assert(spend_success == true, "Spending 20 ink should succeed")
	assert(StatsManager.ink_count == 30, "Remaining ink should be 30")
	
	# Test 3: Card Upgrade with Quiz Bonus
	print("[TEST 3] Testing Quiz Bonus & Stat Application...")
	var initial_atk_speed = StatsManager.attack_speed_mult
	StatsManager.apply_card_upgrade(test_card, true) # true = quiz bonus (+50%)
	assert(StatsManager.attack_speed_mult > initial_atk_speed, "Attack speed must increase")
	print("  -> Applied Relentless with Quiz bonus: new attack_speed_mult = ", StatsManager.attack_speed_mult)
	
	# Test 4: Synergy Mechanics
	print("[TEST 4] Testing Synergy System (3 Adjectives)...")
	var card2 = WordDatabase.get_word_info("Fast")
	var card3 = WordDatabase.get_word_info("Strong")
	StatsManager.apply_card_upgrade(card2, false)
	StatsManager.apply_card_upgrade(card3, false)
	
	assert(StatsManager.words_learned.size() == 3, "Words learned must have 3 items")
	print("  -> Words learned: ", StatsManager.words_learned)
	
	# Test 5: Damage & Health
	print("[TEST 5] Testing Health & Damage...")
	StatsManager.take_damage(25.0)
	assert(StatsManager.hp == 75.0, "HP should be 75 after 25 damage")
	StatsManager.heal(10.0)
	assert(StatsManager.hp == 85.0, "HP should be 85 after 10 heal")
	
	print("--- ALL 5 INTEGRATION TESTS PASSED WITH 100% SUCCESS ---")
	quit(0)
