const assert = require("node:assert/strict");
const fs = require("node:fs");
const expansion = JSON.parse(fs.readFileSync("assets/data/story_expansion.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync("assets/data/story_art_600_manifest.json", "utf8"));
const story = JSON.parse(fs.readFileSync("assets/data/story_arc.json", "utf8"));

assert.equal(expansion.boss_encounters.length, 20, "every five-wave boss encounter needs its own story arc");
assert.deepEqual(expansion.boss_encounters.map((boss) => boss.wave), Array.from({ length: 20 }, (_, index) => (index + 1) * 5));
for (const boss of expansion.boss_encounters) {
  assert.ok(boss.id && boss.title && boss.skill && boss.location, "wave " + boss.wave + " has complete encounter identity");
  assert.ok(boss.motive.length > 80, "wave " + boss.wave + " motive should be specific enough to guide dialogue");
  assert.ok(boss.combat_story.length > 60, "wave " + boss.wave + " battle should connect to its story");
  assert.ok(boss.reveal.length > 80 && boss.keepsake.length > 20, "wave " + boss.wave + " has a post-fight reveal and earned keepsake");
}

const rosterByWave = new Map(manifest.milestone_boss_roster.map((boss) => [boss.wave, boss]));
for (const boss of expansion.boss_encounters) {
  const roster = rosterByWave.get(boss.wave);
  assert.ok(roster, "wave " + boss.wave + " must remain on the existing boss schedule");
  assert.equal(roster.boss_id, boss.id, "wave " + boss.wave + " expansion must match the gameplay boss ID");
  assert.equal(roster.skill_id, boss.skill, "wave " + boss.wave + " expansion must match the gameplay boss skill");
}

assert.equal(Object.keys(expansion.supporting_cast).length, 14, "the main and extra supporting cast should have full arcs");
for (const [id, person] of Object.entries(expansion.supporting_cast)) {
  assert.ok(person.role && person.desire && person.boundary, id + " needs a role, independent desire and boundary");
  assert.ok(person.turning_points || person.appearances, id + " needs authored story appearances");
  assert.ok(manifest.supporting_cast_arcs[id], id + " must be included in the image production brief");
}

const speakers = new Set(Object.values(story.characters).flatMap((character) =>
  character.episodes.flatMap((episode) => episode.beats.map(([speaker]) =>
    ({ whisper: "blank_page", mother_echo: "lale", lio_echo: "lio" }[speaker] || speaker)))));
for (const requiredVoice of ["mira", "ada", "lale", "sera", "mara", "yel", "tavi", "lira", "ink_child", "silent_mechanic"]) {
  assert.ok(speakers.has(requiredVoice), requiredVoice + " should speak in a playable comic episode");
}

assert.equal(manifest.images.length, 600, "story expansion must preserve the unique 600-panel commission");
for (const image of manifest.images) {
  assert.ok(image.boss_story_canon?.motive, image.id + " must inherit the encounter's boss story context");
  assert.ok(image.prompt.includes("BOSS STORY CANON"), image.id + " prompt must reference the boss story");
}
console.log("Story expansion regression passed (20 boss stories, 14 independent supporting arcs, 600 unique image briefs).");
