const fs = require("node:fs");
const assert = require("node:assert/strict");

const source = fs.readFileSync("build/web/game.js", "utf8");
const roster = source.match(/const MILESTONE_BOSS_ROSTER = \[([\s\S]*?)\n\];/);
assert.ok(roster, "milestone boss roster exists");
assert.equal((roster[1].match(/^\s*\[/gm) || []).length, 20, "20 authored milestone bosses cover waves 5–100");
assert.match(source, /if \(state\.current_wave % 5 !== 0\) \{\s*spawnTimer -= dt;/, "regular horde spawning is disabled on boss waves");
assert.doesNotMatch(source, /Rare Wave 20\+ Mini-Boss|MINI-BOSS/, "non-milestone waves never inject boss enemies");
assert.match(source, /if \(state\.milestone_boss_delay === 0\) spawnMilestoneBoss\(state\.current_wave\);/, "milestone waves spawn their boss after the reveal delay");
assert.match(source, /const \[type, sprite, name, color, skill\] = MILESTONE_BOSS_ROSTER/, "bosses define distinct visual identity and skill archetype");
assert.match(source, /if \(e\.is_boss && state\.current_wave % 5 === 0\) milestoneBossDefeated = true;/, "defeating the milestone boss completes the wave");
assert.match(source, /if \(milestoneBossDefeated && state\.is_wave_active\) endWave\(\);/, "boss defeat immediately enters the existing intermission flow");
assert.match(source, /const unresolved = \[\.\.\.\(state\.mistake_words \|\| \[\]\)\]/, "boss encounters collect the accumulated mistake notebook");
assert.match(source, /\.slice\(0, 4\)/, "each boss fight caps mistake echoes to four readable adds");
assert.match(source, /is_mistake_echo: true, memory_word: memoryWord/, "echoes visibly name the vocabulary the player missed");
assert.match(source, /if \(state\.current_wave % 5 !== 0\) \{\s*spawnTimer -= dt;/, "echoes do not enable regular horde spawning on boss waves");
assert.match(source, /boss\.boss_phase < 2/);
assert.match(source, /boss\.boss_phase < 3/);
assert.match(source, /const BOSS_TELEGRAPH_GUIDANCE = \{/);
for (const skill of ["judgment", "quake", "nova", "fan", "orbit", "charge", "mirror", "gravity", "crossfire", "rift", "return", "echo", "snare", "shards", "embers", "finale"]) {
  assert.match(source, new RegExp(`\\b${skill}:`), `${skill} has a readable boss tell`);
}

console.log("Boss encounter regressions passed (single-boss 5-wave duels, 20 roster entries, phases, telegraphs, immediate story handoff).");
