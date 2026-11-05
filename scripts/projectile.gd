extends Area2D

@export var speed: float = 520.0
var direction: Vector2 = Vector2.RIGHT
var damage: float = 15.0
var pierce: int = 1
var lifetime: float = 2.5
var hit_enemies: Array = []
var is_critical: bool = false

func _ready():
	body_entered.connect(_on_body_entered)

func setup(dir: Vector2, dmg: float, prc: int, custom_speed: float = 520.0, tint: Color = Color.WHITE, crit: bool = false):
	direction = dir.normalized()
	rotation = direction.angle()
	damage = dmg
	pierce = prc
	speed = custom_speed
	is_critical = crit
	
	if crit:
		modulate = Color(2.4, 2.2, 0.4) # Glowing golden crit
		scale = Vector2(1.35, 1.35)
	elif tint != Color.WHITE:
		modulate = tint

func _physics_process(delta: float):
	position += direction * speed * delta
	lifetime -= delta
	if lifetime <= 0:
		queue_free()

func _on_body_entered(body: Node2D):
	if body.is_in_group("enemies") and not body in hit_enemies:
		hit_enemies.append(body)
		if body.has_method("take_damage"):
			body.take_damage(damage, direction)
		if is_critical and StatsManager.selected_character == "shadow_lexicographer" and body.has_method("apply_slow"):
			body.apply_slow(1.25, 0.6)
		pierce -= 1
		if pierce <= 0:
			queue_free()
