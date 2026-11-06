const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const root = path.resolve(__dirname, "..");
const sharedPath = path.join(root, "assets/data/game_economy.json");
const webPath = path.join(root, "build/web/assets/data/game_economy.json");
assert.ok(fs.existsSync(sharedPath), "shared run economy data must be checked in");
assert.ok(fs.existsSync(webPath), "web must ship the same run economy data");
const economy = JSON.parse(fs.readFileSync(sharedPath, "utf8"));
assert.deepEqual(JSON.parse(fs.readFileSync(webPath, "utf8")), economy, "Godot and web must ship identical economy values");
assert.equal(economy.version, 1);
assert.equal(economy.starting_ink, 15, "both platforms should offer the same intentional starter purchase");
for (const [enemy, reward] of Object.entries(economy.enemy_ink_rewards)) {
  assert.ok(enemy && Number.isInteger(reward) && reward > 0, `${enemy} must have a finite positive defeat reward`);
}
assert.equal(Object.keys(economy.enemy_ink_rewards).length, 18, "every common, split, and boss enemy must have a canonical reward");
const godot = fs.readFileSync(path.join(root, "scripts/stats_manager.gd"), "utf8");
const enemyScript = fs.readFileSync(path.join(root, "scripts/enemy.gd"), "utf8");
const web = fs.readFileSync(path.join(root, "build/web/game.js"), "utf8");
assert.match(godot, /load_game_economy\(\)/, "Godot must load the shared economy table");
assert.match(enemyScript, /get_enemy_ink_reward\(/, "Godot enemy setup must use shared rewards");
assert.match(web, /loadGameEconomy\(/, "web must load the shared economy table before starting a run");
assert.match(web, /getEnemyInkReward\(/, "web enemy spawns must use the shared rewards");
console.log(`Economy parity contract passed: ${Object.keys(economy.enemy_ink_rewards).length} enemy rewards; starter ink ${economy.starting_ink}.`);
