const assert = require("node:assert/strict");
const fs = require("node:fs");

const source = fs.readFileSync(new URL("../build/web/game.js", `file://${__filename}`), "utf8");
const skillStart = source.indexOf("function updateMilestoneBossSkill(");
const skillEnd = source.indexOf("\nfunction updateCommanderAuras(", skillStart);
assert(skillStart >= 0 && skillEnd > skillStart, "Milestone boss skill controller should exist");
const skillController = source.slice(skillStart, skillEnd);

const requiredMechanics = {
  sever: ["resolveBossLine", "slash.timer = duration + delay", "[[-0.19, 0, 27], [0.19, 0.34, 31]]"],
  split: ["const perpX = -dirY", "offset = phase === 3 ? 116 : 104", "groundMark(markX, markY"],
  eclipse: ["const escapeAngle = Math.atan2", "if (Math.abs(difference) < 0.42) continue", "clampPlayerToArena(state.player)"],
  void_bloom: ["for (let index = 0; index < 3; index++)", "bloom.timer += delay", "fireBossProjectile(boss, shard * Math.PI * 2 / shardCount"]
};

for (const [skill, markers] of Object.entries(requiredMechanics)) {
  const start = skillController.indexOf(`case "${skill}":`);
  const next = skillController.indexOf("\n    case \"", start + 1);
  assert(start >= 0, `${skill} should have a dedicated boss ability`);
  const handler = skillController.slice(start, next > start ? next : skillController.length);
  for (const marker of markers) assert(handler.includes(marker), `${skill} should include ${marker}`);
  assert(source.includes(`${skill}: "`), `${skill} should have player-facing telegraph guidance`);
}

for (const boss of ["The Redactor", "The Split-Truth Ogre", "The False Neris", "The Unwritten"]) {
  assert(source.includes(`\"${boss}\"`), `${boss} should be present in the milestone roster`);
}
for (const skill of Object.keys(requiredMechanics)) {
  assert.match(source, new RegExp(`\\\"(?:The Redactor|The Split-Truth Ogre|The False Neris|The Unwritten)\\\"[^\\n]+\\\"${skill}\\\"`),
    `${skill} should be assigned to one of the newly distinct bosses`);
}
assert(!skillController.includes("spawnEnemy("), "Boss abilities must not add regular enemies to solo encounters");
console.log("Boss unique ability regression passed (sever, split, eclipse, void bloom, telegraphs, solo encounters).");
