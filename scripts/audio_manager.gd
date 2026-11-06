extends Node

const SAMPLE_RATE := 22050
const LOOP_SECONDS := 12.0
const BEAT_SECONDS := 0.75
const STAGE_ROOTS := [38, 36, 43, 34] # D, C, G, Bb
const CHORD_STEPS := [0, 5, 3, 10]
const MELODY_STEPS := [0, 3, 7, 10, 12, 10, 7, 5, 3, 7, 10, 14, 12, 10, 7, 3]

var music_player: AudioStreamPlayer
var cue_player: AudioStreamPlayer
var active_stage := -1
var active_loop: AudioStreamWAV
var _stage_tween: Tween
var _sfx_players: Array[AudioStreamPlayer] = []
var _sfx_cursor := 0
var _main_theme: AudioStream
var _boss_theme: AudioStream
var _boss_mode := false
var _effect_paths := {
	"quill_blaster": "res://assets/audio/weapons/weapon_quill_blaster_v1.wav",
	"syllable_shotgun": "res://assets/audio/weapons/weapon_syllable_shotgun_v1.wav",
	"lexicon_beam": "res://assets/audio/weapons/weapon_lexicon_beam_v1.wav",
	"punctuation_bomb": "res://assets/audio/weapons/weapon_punctuation_mine_drop.wav",
	"dictionary_blade": "res://assets/audio/weapons/weapon_dictionary_blade_v1.wav",
	"crossword_crossbow": "res://assets/audio/weapons/weapon_crossword_crossbow_v1.wav",
	"hyphen_boomerang": "res://assets/audio/weapons/weapon_hyphen_boomerang.wav",
	"ink_flamethrower": "res://assets/audio/weapons/weapon_ink_flamethrower.wav",
	"thesaurus_rocket": "res://assets/audio/weapons/weapon_thesaurus_rocket_launch.wav",
	"quote_pistols": "res://assets/audio/weapons/weapon_quote_pistols_v1.wav",
	"calligraphy_katana": "res://assets/audio/weapons/weapon_calligraphy_katana_v1.wav",
	"scroll_turret": "res://assets/audio/weapons/weapon_scroll_turret_deploy.wav",
	"rune_orb": "res://assets/audio/weapons/weapon_rune_orb.wav",
	"grammar_sniper": "res://assets/audio/weapons/weapon_grammar_sniper.wav",
	"word_loom": "res://assets/audio/weapons/weapon_rune_orb.wav",
	"hit": "res://assets/audio/gameplay/enemy_hit_light.wav",
	"death": "res://assets/audio/gameplay/enemy_defeat.wav",
	"pickup": "res://assets/audio/gameplay/ink_pickup.wav",
	"wave": "res://assets/audio/gameplay/wave_start.wav",
	"chapter_transition": "res://assets/audio/gameplay/chapter_transition.wav",
	"gadget": "res://assets/audio/abilities/gadget_eraser_dash.wav"
}

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	music_player = AudioStreamPlayer.new()
	music_player.name = "ProceduralMusic"
	music_player.process_mode = Node.PROCESS_MODE_ALWAYS
	music_player.volume_db = -19.0
	add_child(music_player)

	cue_player = AudioStreamPlayer.new()
	cue_player.name = "MysticCues"
	cue_player.process_mode = Node.PROCESS_MODE_ALWAYS
	cue_player.volume_db = -11.0
	add_child(cue_player)
	for index in range(10):
		var player := AudioStreamPlayer.new()
		player.process_mode = Node.PROCESS_MODE_ALWAYS
		player.volume_db = -5.0
		add_child(player)
		_sfx_players.append(player)
	_main_theme = load("res://assets/audio/music/main_theme.mp3")
	_boss_theme = load("res://assets/audio/music/boss_theme_dark_last_stand.wav")
	if _main_theme is AudioStreamMP3:
		_main_theme.loop = true
		music_player.stream = _main_theme
		music_player.play()
	if _boss_theme is AudioStreamWAV:
		_boss_theme.loop_mode = AudioStreamWAV.LOOP_FORWARD

func play_effect(key: String) -> void:
	if not _effect_paths.has(key) or _sfx_players.is_empty():
		return
	var stream = load(String(_effect_paths[key]))
	if stream == null:
		return
	var player: AudioStreamPlayer = _sfx_players[_sfx_cursor % _sfx_players.size()]
	_sfx_cursor += 1
	player.stream = stream
	player.play()

func set_biome(stage_index: int, boss_wave: bool = false) -> void:
	var stage := clampi(stage_index, 0, 3)
	if boss_wave != _boss_mode:
		_boss_mode = boss_wave
		var next_theme: AudioStream = _boss_theme if boss_wave and _boss_theme else _main_theme
		if next_theme and music_player.stream != next_theme:
			music_player.stream = next_theme
			music_player.play()
	if stage != active_stage:
		active_stage = stage
		play_effect("chapter_transition")
		_play_chapter_chime(stage)
	elif boss_wave:
		_play_boss_cue(stage)

func _switch_loop(stream: AudioStreamWAV) -> void:
	active_loop = stream
	music_player.stream = active_loop
	music_player.play()

func _make_biome_loop(stage: int) -> AudioStreamWAV:
	var sample_count := int(SAMPLE_RATE * LOOP_SECONDS)
	var bytes := PackedByteArray()
	bytes.resize(sample_count * 2)
	var root: int = int(STAGE_ROOTS[stage])
	var root_hz := _midi_hz(root)
	var chord_ratios := [1.0, 1.189207, 1.498307, 1.781797]
	for i in range(sample_count):
		var t := float(i) / SAMPLE_RATE
		var chord_index := int(t / 3.0) % 4
		var chord_root := _midi_hz(root + CHORD_STEPS[chord_index])
		var section_time := fposmod(t, 3.0)
		var fade := minf(_smoothstep(section_time / 0.18), _smoothstep((3.0 - section_time) / 0.18))
		var pad := 0.0
		for ratio in chord_ratios:
			pad += sin(TAU * chord_root * ratio * t) * 0.012

		var beat_pos := fposmod(t, BEAT_SECONDS)
		var beat_index := int(t / BEAT_SECONDS)
		var bass_envelope := exp(-beat_pos * 4.0)
		var bass := sin(TAU * _midi_hz(root + CHORD_STEPS[chord_index] - 12) * t) * bass_envelope * 0.045
		var degree: int = int(MELODY_STEPS[beat_index % MELODY_STEPS.size()])
		var melody_hz := _midi_hz(root + degree + 12)
		var melody_envelope := exp(-beat_pos * 6.5) * minf(1.0, beat_pos / 0.012)
		var bell := (sin(TAU * melody_hz * t) + 0.24 * sin(TAU * melody_hz * 2.01 * t)) * melody_envelope * 0.026
		var value := (pad * fade) + bass + bell
		var sample := int(clampf(value, -0.92, 0.92) * 32767.0)
		bytes[i * 2] = sample & 0xff
		bytes[i * 2 + 1] = (sample >> 8) & 0xff

	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = SAMPLE_RATE
	stream.stereo = false
	stream.data = bytes
	stream.loop_mode = AudioStreamWAV.LOOP_FORWARD
	stream.loop_begin = 0
	stream.loop_end = sample_count
	return stream

func _play_chapter_chime(stage: int) -> void:
	var root := _midi_hz(STAGE_ROOTS[stage] + 24)
	cue_player.stream = _make_chime([root, root * 1.25, root * 1.5], 1.25)
	cue_player.play()

func _play_boss_cue(stage: int) -> void:
	var root := _midi_hz(STAGE_ROOTS[stage] - 12)
	cue_player.stream = _make_chime([root, root * 1.01], 0.7)
	cue_player.play()

func _make_chime(frequencies: Array, duration: float) -> AudioStreamWAV:
	var sample_count := int(SAMPLE_RATE * duration)
	var bytes := PackedByteArray()
	bytes.resize(sample_count * 2)
	for i in range(sample_count):
		var t := float(i) / SAMPLE_RATE
		var envelope := minf(1.0, t / 0.025) * pow(maxf(0.0001, 1.0 - t / duration), 2.4)
		var value := 0.0
		for index in range(frequencies.size()):
			var delay := float(index) * 0.1
			if t >= delay:
				value += sin(TAU * frequencies[index] * (t - delay)) * envelope * (0.06 / (index + 1))
		var sample := int(clampf(value, -0.92, 0.92) * 32767.0)
		bytes[i * 2] = sample & 0xff
		bytes[i * 2 + 1] = (sample >> 8) & 0xff
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = SAMPLE_RATE
	stream.stereo = false
	stream.data = bytes
	return stream

func _midi_hz(note: int) -> float:
	return 440.0 * pow(2.0, (float(note) - 69.0) / 12.0)

func _smoothstep(value: float) -> float:
	var x := clampf(value, 0.0, 1.0)
	return x * x * (3.0 - 2.0 * x)
