extends CharacterBody2D

signal gadget_cooldown_updated(time_left: float, total_time: float)

@onready var sprite = $Sprite2D
@onready var invuln_timer = $InvulnerabilityTimer
@onready var weapons_container = $Weapons

var weapon_scene: PackedScene = preload("res://scenes/weapon.tscn")

var is_invulnerable: bool = false
var blink_timer: float = 0.0
var character_base_color: Color = Color.WHITE

# Active Gadget: Eraser Dash (Silgi Atılımı)
var is_dashing: bool = false
var dash_timer: float = 0.0
var dash_duration: float = 0.22
var dash_velocity: Vector2 = Vector2.ZERO
var gadget_cooldown: float = 4.0
var gadget_timer: float = 0.0
var _rmb_was_pressed: bool = false
var shield_health: float = 0.0
var shield_timer: float = 0.0
var dash_hit_ids: Dictionary = {}
var hero_anim_clock: float = 0.0
var attack_anim_timer: float = 0.0
var current_hero_frame: int = -1
var current_hero_animation: String = ""

const INKY_IDLE_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/inky_idle_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/inky_idle_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/inky_idle_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/inky_idle_3.png")
]
const INKY_RUN_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/inky_run_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/inky_run_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/inky_run_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/inky_run_3.png")
]
const INKY_ATTACK_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/inky_attack_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/inky_attack_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/inky_attack_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/inky_attack_3.png")
]
const WORD_KNIGHT_IDLE_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/word_knight_idle_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/word_knight_idle_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/word_knight_idle_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/word_knight_idle_3.png")
]
const WORD_KNIGHT_RUN_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/word_knight_run_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/word_knight_run_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/word_knight_run_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/word_knight_run_3.png")
]
const WORD_KNIGHT_ATTACK_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/word_knight_attack_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/word_knight_attack_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/word_knight_attack_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/word_knight_attack_3.png")
]
const SHADOW_SCRIBE_IDLE_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/shadow_scribe_idle_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/shadow_scribe_idle_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/shadow_scribe_idle_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/shadow_scribe_idle_3.png")
]
const SHADOW_SCRIBE_RUN_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/shadow_scribe_run_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/shadow_scribe_run_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/shadow_scribe_run_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/shadow_scribe_run_3.png")
]
const SHADOW_SCRIBE_ATTACK_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/shadow_scribe_attack_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/shadow_scribe_attack_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/shadow_scribe_attack_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/shadow_scribe_attack_3.png")
]
const QUILLMASTER_IDLE_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/quillmaster_idle_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/quillmaster_idle_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/quillmaster_idle_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/quillmaster_idle_3.png")
]
const QUILLMASTER_RUN_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/quillmaster_run_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/quillmaster_run_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/quillmaster_run_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/quillmaster_run_3.png")
]
const QUILLMASTER_ATTACK_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/quillmaster_attack_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/quillmaster_attack_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/quillmaster_attack_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/quillmaster_attack_3.png")
]
const RUNE_SORCERESS_IDLE_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/rune_sorceress_idle_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/rune_sorceress_idle_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/rune_sorceress_idle_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/rune_sorceress_idle_3.png")
]
const RUNE_SORCERESS_RUN_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/rune_sorceress_run_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/rune_sorceress_run_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/rune_sorceress_run_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/rune_sorceress_run_3.png")
]
const RUNE_SORCERESS_ATTACK_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/rune_sorceress_attack_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/rune_sorceress_attack_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/rune_sorceress_attack_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/rune_sorceress_attack_3.png")
]
const ALCHEMIST_IDLE_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/alchemist_idle_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/alchemist_idle_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/alchemist_idle_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/alchemist_idle_3.png")
]
const ALCHEMIST_RUN_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/alchemist_run_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/alchemist_run_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/alchemist_run_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/alchemist_run_3.png")
]
const ALCHEMIST_ATTACK_FRAMES := [
	preload("res://assets/sprites/upgrade_v1/animations/alchemist_attack_0.png"),
	preload("res://assets/sprites/upgrade_v1/animations/alchemist_attack_1.png"),
	preload("res://assets/sprites/upgrade_v1/animations/alchemist_attack_2.png"),
	preload("res://assets/sprites/upgrade_v1/animations/alchemist_attack_3.png")
]
const HERO_ANIMATIONS := {
	"inky": {"idle": INKY_IDLE_FRAMES, "run": INKY_RUN_FRAMES, "attack": INKY_ATTACK_FRAMES},
	"word_knight": {"idle": WORD_KNIGHT_IDLE_FRAMES, "run": WORD_KNIGHT_RUN_FRAMES, "attack": WORD_KNIGHT_ATTACK_FRAMES},
	"shadow_lexicographer": {"idle": SHADOW_SCRIBE_IDLE_FRAMES, "run": SHADOW_SCRIBE_RUN_FRAMES, "attack": SHADOW_SCRIBE_ATTACK_FRAMES},
	"quillmaster": {"idle": QUILLMASTER_IDLE_FRAMES, "run": QUILLMASTER_RUN_FRAMES, "attack": QUILLMASTER_ATTACK_FRAMES},
	"rune_sorceress": {"idle": RUNE_SORCERESS_IDLE_FRAMES, "run": RUNE_SORCERESS_RUN_FRAMES, "attack": RUNE_SORCERESS_ATTACK_FRAMES},
	"lexicon_alchemist": {"idle": ALCHEMIST_IDLE_FRAMES, "run": ALCHEMIST_RUN_FRAMES, "attack": ALCHEMIST_ATTACK_FRAMES}
}

func _ready():
	add_to_group("player")
	StatsManager.hp_changed.connect(_on_hp_changed)
	StatsManager.weapon_equipped.connect(_on_weapon_equipped)
	StatsManager.weapon_switched.connect(_on_weapon_switched)
	StatsManager.character_selected.connect(_on_character_changed)
	StatsManager.gadget_switched.connect(_on_gadget_changed)
	
	apply_character_appearance()
	sync_weapons()

func apply_character_appearance():
	var char_id = StatsManager.selected_character
	current_hero_frame = -1
	current_hero_animation = ""
	var sprite_names = {
		"inky": "hero_inky.png",
		"quillmaster": "hero_quillmaster.png",
		"word_knight": "hero_word_knight.png",
		"rune_sorceress": "hero_rune_sorceress.png",
		"lexicon_alchemist": "hero_alchemist.png",
		"shadow_lexicographer": "hero_shadow_scribe.png"
	}
	var sprite_path = "res://assets/sprites/upgrade_v1/" + sprite_names.get(char_id, "hero_inky.png")
	var loaded_sprite = load(sprite_path) as Texture2D
	if loaded_sprite:
		sprite.texture = loaded_sprite
	var character_data = StatsManager.characters.get(char_id, StatsManager.characters["inky"])
	character_base_color = character_data.get("color", Color.WHITE)
	sprite.modulate = character_base_color
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST

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
		weapons_container.add_child(w_inst)
		if w_inst.has_method("setup_weapon"):
			w_inst.setup_weapon(w_id)
		if w_inst.has_method("set_active_focus"):
			w_inst.set_active_focus(is_active)
		if w_inst.has_method("set_mount_pose"):
			w_inst.set_mount_pose(i, is_active, sprite.flip_h)

func update_weapon_mounts():
	# Keep the selected weapon at the hero's forward hand. Remaining auto-fire
	# weapons sit in a compact, fixed holster stack instead of circling the hero.
	var active_idx = StatsManager.active_weapon_index
	for i in range(weapons_container.get_child_count()):
		var weapon = weapons_container.get_child(i)
		if weapon.has_method("set_mount_pose"):
			weapon.set_mount_pose(i, i == active_idx, sprite.flip_h)

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
	hero_anim_clock += delta
	attack_anim_timer = maxf(0.0, attack_anim_timer - delta)
	# Gadget Cooldown
	if gadget_timer > 0:
		gadget_timer -= delta
		emit_signal("gadget_cooldown_updated", max(0.0, gadget_timer), gadget_cooldown)
	if shield_timer > 0.0:
		shield_timer = maxf(0.0, shield_timer - delta)
		if shield_timer == 0.0:
			shield_health = 0.0
			queue_redraw()
	
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
		_update_hero_animation()
		return
		
	var input_vector = Input.get_vector("move_left", "move_right", "move_up", "move_down")
	var target_velocity = input_vector * StatsManager.move_speed
	velocity = velocity.move_toward(target_velocity, 2200.0 * delta)
	move_and_slide()
	
	if input_vector.x != 0:
		sprite.flip_h = input_vector.x < 0
	update_weapon_mounts()
		
	# Check Gadget Activation (Eraser Dash)
	var rmb_now = Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT)
	var rmb_just_pressed = rmb_now and not _rmb_was_pressed
	_rmb_was_pressed = rmb_now
	
	var wants_dash = Input.is_action_just_pressed("dash") or rmb_just_pressed
	if wants_dash and gadget_timer <= 0:
		activate_active_gadget(input_vector)
		
	# Handle i-frames blink
	if is_invulnerable:
		blink_timer += delta * 18.0
		var a = 0.35 if int(blink_timer) % 2 == 0 else 1.0
		sprite.modulate = Color(character_base_color.r, character_base_color.g, character_base_color.b, a)
	else:
		sprite.modulate = character_base_color
	_update_hero_animation()

func play_attack_animation() -> void:
	attack_anim_timer = 0.28

func _update_hero_animation() -> void:
	var animation_set: Dictionary = HERO_ANIMATIONS.get(StatsManager.selected_character, {})
	if animation_set.is_empty():
		return
	var animation_name: String
	if attack_anim_timer > 0.0:
		animation_name = "attack"
	else:
		animation_name = "run" if velocity.length() > 30.0 else "idle"
	var frames: Array = animation_set[animation_name]
	var frame_index: int = clampi(int((0.28 - attack_anim_timer) / 0.07), 0, 3) if animation_name == "attack" else int(hero_anim_clock / (0.09 if animation_name == "run" else 0.24)) % frames.size()
	if frame_index != current_hero_frame or animation_name != current_hero_animation:
		current_hero_frame = frame_index
		current_hero_animation = animation_name
		sprite.texture = frames[frame_index]

func start_eraser_dash(input_dir: Vector2):
	gadget_cooldown = maxf(1.5, float(StatsManager.gadgets_catalog.get("dash", {}).get("cooldown", StatsManager.gadget_cooldown_base)) * StatsManager.gadget_cooldown_mult)
	gadget_timer = gadget_cooldown
	emit_signal("gadget_cooldown_updated", gadget_timer, gadget_cooldown)
	
	var dir = input_dir
	if dir == Vector2.ZERO:
		dir = Vector2.LEFT if sprite.flip_h else Vector2.RIGHT
	dir = dir.normalized()
	
	is_dashing = true
	dash_hit_ids.clear()
	is_invulnerable = true
	dash_timer = dash_duration
	dash_velocity = dir * (StatsManager.move_speed * 2.8 + 260.0)
	
	# Screen flash / particle impulse
	sprite.modulate = Color(2.0, 2.0, 2.5)
	var tween = create_tween()
	tween.tween_property(sprite, "modulate", character_base_color, dash_duration)

func activate_active_gadget(input_dir: Vector2) -> void:
	var gadget_id: String = StatsManager.active_gadget
	if gadget_id == "dash":
		start_eraser_dash(input_dir)
		StatsManager.gadget_activated.emit(gadget_id)
		return
	var gadget_data: Dictionary = StatsManager.gadgets_catalog.get(gadget_id, {})
	if gadget_data.is_empty():
		return
	gadget_cooldown = maxf(1.5, float(gadget_data.get("cooldown", 8.0)) * StatsManager.gadget_cooldown_mult)
	gadget_timer = gadget_cooldown
	emit_signal("gadget_cooldown_updated", gadget_timer, gadget_cooldown)
	StatsManager.gadget_activated.emit(gadget_id)
	match gadget_id:
		"ink_bomb":
			for enemy in get_tree().get_nodes_in_group("enemies"):
				if is_instance_valid(enemy) and global_position.distance_to(enemy.global_position) <= 520.0:
					var knock = (enemy.global_position - global_position).normalized() * 280.0
					enemy.take_damage(120.0 * StatsManager.damage_mult, knock)
					if enemy.has_method("apply_stun"):
						enemy.apply_stun(1.75)
		"time_stop":
			for enemy in get_tree().get_nodes_in_group("enemies"):
				if is_instance_valid(enemy) and enemy.has_method("apply_slow"):
					enemy.apply_slow(3.5, 0.20)
		"shield":
			shield_health = 100.0
			shield_timer = 5.0
			queue_redraw()
		"magnet":
			for drop in get_tree().get_nodes_in_group("ink_drops"):
				if is_instance_valid(drop):
					drop.target = self
					drop.is_attracted = true
			for rune in get_tree().get_nodes_in_group("runes"):
				if is_instance_valid(rune) and rune.has_method("attract_to"):
					rune.attract_to(self)

func _on_gadget_changed(_gadget_id: String) -> void:
	var gadget_data: Dictionary = StatsManager.gadgets_catalog.get(StatsManager.active_gadget, {})
	gadget_cooldown = float(gadget_data.get("cooldown", 4.0)) * StatsManager.gadget_cooldown_mult
	emit_signal("gadget_cooldown_updated", maxf(gadget_timer, 0.0), gadget_cooldown)

func _draw() -> void:
	if shield_timer > 0.0:
		var strength := clampf(shield_health / 100.0, 0.25, 1.0)
		draw_arc(Vector2.ZERO, 40.0, 0.0, TAU, 48, Color(0.58, 0.82, 0.84, 0.38 + strength * 0.48), 2.6, true)

func erase_nearby_enemies():
	var enemies = get_tree().get_nodes_in_group("enemies")
	var erase_dmg = 45.0 * StatsManager.damage_mult
	for e in enemies:
		var enemy_id := e.get_instance_id() if is_instance_valid(e) else 0
		if is_instance_valid(e) and not dash_hit_ids.has(enemy_id) and global_position.distance_to(e.global_position) <= 48.0:
			var knock = (e.global_position - global_position).normalized() * 300.0
			if e.has_method("take_damage"):
				dash_hit_ids[enemy_id] = true
				e.take_damage(erase_dmg, knock)

func take_damage(amount: float):
	if is_invulnerable or is_dashing:
		return
		
	var remaining_damage := amount
	if shield_timer > 0.0 and shield_health > 0.0:
		var absorbed := minf(remaining_damage, shield_health)
		shield_health -= absorbed
		remaining_damage -= absorbed
		queue_redraw()
		if shield_health <= 0.0:
			shield_timer = 0.0
	if remaining_damage > 0.0:
		StatsManager.take_damage(remaining_damage)
	else:
		return
	is_invulnerable = true
	invuln_timer.start(0.55)

func _on_invulnerability_timer_timeout():
	if not is_dashing:
		is_invulnerable = false
		sprite.modulate = character_base_color

func _on_hp_changed(curr: float, _max_h: float):
	if curr <= 0:
		set_physics_process(false)
