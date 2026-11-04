extends CharacterBody2D

signal gadget_cooldown_updated(time_left: float, total_time: float)

@onready var sprite = $Sprite2D
@onready var invuln_timer = $InvulnerabilityTimer
@onready var weapons_container = $Weapons
@onready var camera = $Camera2D

var weapon_scene: PackedScene = preload("res://scenes/weapon.tscn")

var is_invulnerable: bool = false
var blink_timer: float = 0.0
var character_base_color: Color = Color.WHITE

# Camera Screen Shake
var shake_timer: float = 0.0
var shake_intensity: float = 0.0

# Active Gadget
var is_dashing: bool = false
var dash_timer: float = 0.0
var dash_duration: float = 0.22
var dash_velocity: Vector2 = Vector2.ZERO
var gadget_cooldown: float = 4.0
var gadget_timer: float = 0.0
var _rmb_was_pressed: bool = false

func _ready():
	add_to_group("player")
	StatsManager.hp_changed.connect(_on_hp_changed)
	StatsManager.weapon_equipped.connect(_on_weapon_equipped)
	StatsManager.weapon_switched.connect(_on_weapon_switched)
	StatsManager.character_selected.connect(_on_character_changed)
	StatsManager.screen_shake_requested.connect(_on_screen_shake_requested)
	
	apply_character_appearance()
	sync_weapons()

func _on_screen_shake_requested(duration: float, intensity: float):
	shake_timer = duration
	shake_intensity = intensity

func apply_character_appearance():
	var char_id = StatsManager.selected_character
	match char_id:
		"quillmaster":
			if ResourceLoader.exists("res://assets/sprites/player_quillmaster.png"):
				sprite.texture = load("res://assets/sprites/player_quillmaster.png")
			character_base_color = Color(1.0, 0.95, 0.8)
		"word_knight":
			if ResourceLoader.exists("res://assets/sprites/player_knight.png"):
				sprite.texture = load("res://assets/sprites/player_knight.png")
			character_base_color = Color(0.85, 1.0, 0.9)
		_:
			if ResourceLoader.exists("res://assets/sprites/player.png"):
				sprite.texture = load("res://assets/sprites/player.png")
			character_base_color = Color.WHITE
			
	sprite.modulate = character_base_color

func sync_weapons():
	if not weapons_container:
		return
		
	# Clear existing weapons
	for child in weapons_container.get_children():
		weapons_container.remove_child(child)
		child.queue_free()
		
	var weaps = StatsManager.equipped_weapons
	var count = weaps.size()
	var active_idx = StatsManager.active_weapon_index
	
	for i in range(count):
		var w_id = weaps[i]
		var w_inst = weapon_scene.instantiate()
		w_inst.weapon_id = w_id
		
		var is_active = (i == active_idx)
		
		# Active weapon orbits forward, others orbit around
		if count == 1:
			w_inst.position = Vector2(0, 0)
		else:
			var angle = (float(i) / float(count)) * TAU
			var dist = 26.0 if is_active else 20.0
			w_inst.position = Vector2(cos(angle), sin(angle)) * dist
			
		weapons_container.add_child(w_inst)
		if w_inst.has_method("setup_weapon"):
			w_inst.setup_weapon(w_id)
		if w_inst.has_method("set_active_focus"):
			w_inst.set_active_focus(is_active)

func _unhandled_input(event: InputEvent):
	if event is InputEventKey and event.is_pressed() and not event.is_echo():
		match event.keycode:
			KEY_Q:
				StatsManager.switch_prev_weapon()
			KEY_E:
				StatsManager.switch_next_weapon()
			KEY_1:
				StatsManager.select_weapon_index(0)
			KEY_2:
				StatsManager.select_weapon_index(1)
			KEY_3:
				StatsManager.select_weapon_index(2)
			KEY_4:
				StatsManager.select_weapon_index(3)
			KEY_5:
				StatsManager.select_weapon_index(4)
	elif event is InputEventMouseButton and event.is_pressed():
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			StatsManager.switch_prev_weapon()
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			StatsManager.switch_next_weapon()

func _on_weapon_equipped(_w_id: String):
	sync_weapons()

func _on_weapon_switched(_w_id: String, _w_idx: int):
	sync_weapons()

func _on_character_changed(_char_id: String):
	apply_character_appearance()
	sync_weapons()

func _physics_process(delta: float):
	# Camera Screen Shake
	if shake_timer > 0 and camera:
		shake_timer -= delta
		camera.offset = Vector2(randf_range(-shake_intensity, shake_intensity), randf_range(-shake_intensity, shake_intensity))
		if shake_timer <= 0:
			camera.offset = Vector2.ZERO
			
	# Gadget Cooldown
	if gadget_timer > 0:
		gadget_timer -= delta
		emit_signal("gadget_cooldown_updated", max(0.0, gadget_timer), gadget_cooldown)
	
	# Dash execution
	if is_dashing:
		dash_timer -= delta
		velocity = dash_velocity
		move_and_slide()
		
		# Erase / damage slimes in contact while dashing
		erase_nearby_enemies()
		
		if dash_timer <= 0:
			is_dashing = false
			is_invulnerable = false
		return
		
	var input_vector = Input.get_vector("move_left", "move_right", "move_up", "move_down")
	if StatsManager.touch_input_direction != Vector2.ZERO:
		input_vector = StatsManager.touch_input_direction
		
	var target_velocity = input_vector * StatsManager.move_speed
	velocity = velocity.move_toward(target_velocity, 2200.0 * delta)
	move_and_slide()
	
	if input_vector.x != 0:
		sprite.flip_h = input_vector.x < 0
		
	# Check Gadget Activation (Space / Right Mouse / Action)
	var rmb_now = Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT)
	var rmb_just_pressed = rmb_now and not _rmb_was_pressed
	_rmb_was_pressed = rmb_now
	
	var wants_gadget = Input.is_action_just_pressed("dash") or rmb_just_pressed or Input.is_key_pressed(KEY_SPACE)
	if wants_gadget and gadget_timer <= 0:
		trigger_current_gadget(input_vector)
		
	# Handle i-frames blink
	if is_invulnerable:
		blink_timer += delta * 18.0
		var a = 0.35 if int(blink_timer) % 2 == 0 else 1.0
		sprite.modulate = Color(character_base_color.r, character_base_color.g, character_base_color.b, a)
	else:
		sprite.modulate = character_base_color

func trigger_current_gadget(input_dir: Vector2 = Vector2.ZERO):
	if gadget_timer > 0:
		return
		
	var gid = StatsManager.active_gadget
	var base_cd = StatsManager.gadgets_catalog.get(gid, {}).get("cooldown", 4.0)
	gadget_cooldown = max(1.5, base_cd * StatsManager.gadget_cooldown_mult)
	gadget_timer = gadget_cooldown
	emit_signal("gadget_cooldown_updated", gadget_timer, gadget_cooldown)
	
	match gid:
		"dash":
			start_eraser_dash(input_dir)
		"ink_bomb":
			activate_ink_bomb()
		"time_stop":
			activate_chrono_comma()
		"shield":
			activate_lexicon_aegis()
		"magnet":
			activate_grammar_magnet()
		_:
			start_eraser_dash(input_dir)

func activate_ink_bomb():
	StatsManager.trigger_screen_shake(0.35, 12.0)
	StatsManager.add_floating_text(global_position + Vector2(0, -35), "💥 MÜREKKEP KIYAMETİ!", Color(0.2, 0.9, 1.0), 22)
	var enemies = get_tree().get_nodes_in_group("enemies")
	var bomb_dmg = 120.0 * StatsManager.damage_mult
	for e in enemies:
		if is_instance_valid(e) and global_position.distance_to(e.global_position) <= 220.0:
			var knock = (e.global_position - global_position).normalized() * 450.0
			if e.has_method("take_damage"):
				e.take_damage(bomb_dmg, knock)

func activate_chrono_comma():
	StatsManager.trigger_screen_shake(0.2, 6.0)
	StatsManager.add_floating_text(global_position + Vector2(0, -35), "⏸️ KRONOS VİRGÜLÜ (ZAMAN YAVAŞLADI)", Color(0.4, 0.7, 1.0), 22)
	var enemies = get_tree().get_nodes_in_group("enemies")
	for e in enemies:
		if is_instance_valid(e) and "speed" in e:
			var orig_spd = e.speed
			e.speed = max(15.0, orig_spd * 0.2)
			var tw = create_tween()
			tw.tween_interval(3.5)
			tw.tween_callback(func():
				if is_instance_valid(e):
					e.speed = orig_spd
			)

func activate_lexicon_aegis():
	StatsManager.trigger_screen_shake(0.2, 5.0)
	StatsManager.add_floating_text(global_position + Vector2(0, -35), "🛡️ LEKSİKON KALKANI (4s DOKUNULMAZ)", Color(0.3, 1.0, 0.5), 22)
	StatsManager.heal(20.0)
	is_invulnerable = true
	invuln_timer.start(4.0)

func activate_grammar_magnet():
	StatsManager.trigger_screen_shake(0.15, 4.0)
	StatsManager.add_floating_text(global_position + Vector2(0, -35), "🧲 GRAMER MIKNATISI!", Color(1.0, 0.85, 0.3), 22)
	var drops = get_tree().get_nodes_in_group("ink_drops")
	for d in drops:
		if is_instance_valid(d):
			var tw = create_tween()
			tw.tween_property(d, "global_position", global_position, 0.3).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)

func start_eraser_dash(input_dir: Vector2):
	gadget_cooldown = max(1.5, StatsManager.gadget_cooldown_base * StatsManager.gadget_cooldown_mult)
	gadget_timer = gadget_cooldown
	emit_signal("gadget_cooldown_updated", gadget_timer, gadget_cooldown)
	
	var dir = input_dir
	if dir == Vector2.ZERO:
		dir = Vector2.LEFT if sprite.flip_h else Vector2.RIGHT
	dir = dir.normalized()
	
	is_dashing = true
	is_invulnerable = true
	dash_timer = dash_duration
	dash_velocity = dir * (StatsManager.move_speed * 2.8 + 260.0)
	
	# Screen flash / particle impulse
	sprite.modulate = Color(2.0, 2.0, 2.5)
	var tween = create_tween()
	tween.tween_property(sprite, "modulate", character_base_color, dash_duration)

func erase_nearby_enemies():
	var enemies = get_tree().get_nodes_in_group("enemies")
	var erase_dmg = 45.0 * StatsManager.damage_mult
	for e in enemies:
		if is_instance_valid(e) and global_position.distance_to(e.global_position) <= 48.0:
			var knock = (e.global_position - global_position).normalized() * 300.0
			if e.has_method("take_damage"):
				e.take_damage(erase_dmg, knock)
				StatsManager.add_floating_text(e.global_position + Vector2(0, -20), str(int(erase_dmg)), Color(0.3, 1.0, 0.4), 18)

func take_damage(amount: float):
	if is_invulnerable or is_dashing:
		return
		
	StatsManager.take_damage(amount)
	is_invulnerable = true
	invuln_timer.start(0.55)

func _on_invulnerability_timer_timeout():
	if not is_dashing:
		is_invulnerable = false
		sprite.modulate = character_base_color

func _on_hp_changed(curr: float, _max_h: float):
	if curr <= 0:
		set_physics_process(false)
