extends Area2D

@export var damage: float = 35.0
@export var blast_radius: float = 125.0
@export var lifetime: float = 8.0

var has_detonated: bool = false
var pulse_time: float = 0.0

@onready var sprite = $Sprite2D
@onready var collision_shape = $CollisionShape2D

func _ready():
	body_entered.connect(_on_body_entered)

func setup(pos: Vector2, dmg: float, radius: float = 125.0):
	global_position = pos
	damage = dmg
	blast_radius = radius

func _process(delta: float):
	if has_detonated:
		return
		
	pulse_time += delta * 5.0
	if sprite:
		var s = 1.0 + sin(pulse_time) * 0.15
		sprite.scale = Vector2(s, s)
		
	lifetime -= delta
	if lifetime <= 0:
		detonate()

func _on_body_entered(body: Node2D):
	if has_detonated:
		return
	if body.is_in_group("enemies"):
		detonate()

func detonate():
	if has_detonated:
		return
	has_detonated = true
	
	# Blast shockwave visual
	spawn_shockwave()
	
	# Deal AOE damage to all enemies in blast radius
	if is_inside_tree():
		var enemies = get_tree().get_nodes_in_group("enemies")
		for e in enemies:
			if is_instance_valid(e):
				var dist = global_position.distance_to(e.global_position)
				if dist <= blast_radius:
					var falloff = 1.0 - (dist / blast_radius) * 0.35
					var final_dmg = max(10.0, damage * falloff)
					var knock = (e.global_position - global_position).normalized()
					if knock == Vector2.ZERO:
						knock = Vector2.RIGHT
					if e.has_method("take_damage"):
						e.take_damage(final_dmg, knock * 220.0)
						
	queue_free()

func spawn_shockwave():
	if not is_inside_tree() or not get_tree().current_scene:
		return
	# Visual effect node
	var shock = ShockwaveEffect.new()
	shock.global_position = global_position
	shock.max_radius = blast_radius
	get_tree().current_scene.add_child(shock)

# Inline shockwave drawer class
class ShockwaveEffect extends Node2D:
	var current_radius: float = 10.0
	var max_radius: float = 125.0
	var alpha: float = 1.0
	
	func _ready():
		set_process(true)
		
	func _process(delta: float):
		current_radius += delta * 450.0
		alpha -= delta * 3.5
		queue_redraw()
		if alpha <= 0.0 or current_radius >= max_radius:
			queue_free()
			
	func _draw():
		var col = Color(1.0, 0.5, 0.15, clamp(alpha, 0.0, 1.0))
		var fill_col = Color(1.0, 0.85, 0.3, clamp(alpha * 0.35, 0.0, 0.35))
		draw_circle(Vector2.ZERO, current_radius, fill_col)
		draw_arc(Vector2.ZERO, current_radius, 0, TAU, 32, col, 3.0)
