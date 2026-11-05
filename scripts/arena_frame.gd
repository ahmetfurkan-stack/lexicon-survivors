extends Node2D

var frame_paths = [
	"res://assets/sprites/upgrade_v1/arena_frame_library.png",
	"res://assets/sprites/upgrade_v1/arena_frame_dungeon.png",
	"res://assets/sprites/upgrade_v1/arena_frame_observatory.png",
	"res://assets/sprites/upgrade_v1/arena_frame_void.png"
]
const ARENA_FRAME_SIZE := Vector2(2800, 2100)
var frame_sizes = [ARENA_FRAME_SIZE, ARENA_FRAME_SIZE, ARENA_FRAME_SIZE, ARENA_FRAME_SIZE]
var active_frame: Texture2D
var active_size: Vector2 = ARENA_FRAME_SIZE

func set_stage(stage_index: int) -> void:
	var stage = clampi(stage_index, 0, frame_paths.size() - 1)
	active_frame = load(frame_paths[stage]) as Texture2D
	active_size = frame_sizes[stage]
	queue_redraw()

func _draw() -> void:
	if active_frame:
		# Stretch a second copy behind the arena to keep the camera's outer edge
		# inside the same biome material when the player reaches the room walls.
		draw_texture_rect(active_frame, Rect2(Vector2(-2200, -1650), Vector2(4400, 3300)), false)
		draw_texture_rect(active_frame, Rect2(-active_size / 2.0, active_size), false)
