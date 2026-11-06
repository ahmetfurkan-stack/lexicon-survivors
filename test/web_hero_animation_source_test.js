const assert = require("node:assert/strict");
const fs = require("node:fs");

const source = fs.readFileSync("build/web/game.js", "utf8");
assert.match(source, /function getHeroAnimationFrame\(action, player\)/);
assert.match(source, /if \(action === "attack" \|\| action === "ranged"\) return getAttackAnimationFrame\(player\);/);
assert.match(source, /const frame = getHeroAnimationFrame\(action, p\);/);
console.log("Hero animation source wiring passed");
