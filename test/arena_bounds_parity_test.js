const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const webSource = fs.readFileSync("build/web/game.js", "utf8");
const godotSource = fs.readFileSync("scripts/arena_frame.gd", "utf8");
const arenaLayout = webSource.match(/const ARENA_LAYOUT = Object\.freeze\(\{[\s\S]*?\}\);/);
const boundConstants = webSource.match(/const PLAYER_CENTER_LIMIT_X[\s\S]*?const PLAYER_CENTER_MAX_Y[^\n]*;/);
const clampFunction = webSource.match(/function clampPlayerToArena\(player\) \{[\s\S]*?\n\}/);
assert(arenaLayout && boundConstants && clampFunction, "Web build must expose a named fixed-room clamp");

const webArena = vm.runInNewContext(`${arenaLayout[0]}\n${boundConstants[0]}\n${clampFunction[0]}\n({ARENA_LAYOUT, PLAYER_CENTER_LIMIT_X, PLAYER_CENTER_MIN_Y, PLAYER_CENTER_MAX_Y, clampPlayerToArena})`);
const shelfEdge = godotSource.match(/const INNER_SHELF_EDGE := Vector2\((\d+), (\d+)\)/);
const colliderRadius = godotSource.match(/const PLAYER_COLLIDER_RADIUS := ([\d.]+)/);
const colliderOffset = godotSource.match(/const PLAYER_COLLIDER_OFFSET := Vector2\(([-\d.]+), ([-\d.]+)\)/);
const visualExtent = godotSource.match(/const PLAYER_MAX_VISUAL_HALF_EXTENT := Vector2\(([\d.]+), ([\d.]+)\)/);
assert(shelfEdge && colliderRadius && colliderOffset && visualExtent, "Godot build must expose shelf edge, collider, and visual extents");

assert.equal(webArena.ARENA_LAYOUT.width, 2800);
assert.equal(webArena.ARENA_LAYOUT.height, 2100);
assert.equal(webArena.ARENA_LAYOUT.innerShelfX, Number(shelfEdge[1]));
assert.equal(webArena.ARENA_LAYOUT.innerShelfY, Number(shelfEdge[2]));
assert.equal(webArena.ARENA_LAYOUT.playerColliderRadius, Number(colliderRadius[1]));
assert.equal(webArena.ARENA_LAYOUT.playerColliderOffsetY, Number(colliderOffset[2]));
assert.equal(webArena.ARENA_LAYOUT.playerVisualHalfWidth, Number(visualExtent[1]), "Web and Godot use the same measured sprite-safe x margin");
assert.equal(webArena.ARENA_LAYOUT.playerVisualHalfHeight, Number(visualExtent[2]), "Web and Godot use the same measured sprite-safe y margin");
assert.equal(Number(visualExtent[1]), 39.5, "Godot visual margin matches max scaled alpha width");
assert.equal(Number(visualExtent[2]), 42, "Godot visual margin matches max scaled alpha height");
assert.match(webSource, /ctx\.drawImage\(pSpr, -44, -44, 88, 88\)/, "Web visual margin must match the rendered player dimensions");

for (const [x, y, expectedX, expectedY] of [
  [10000, 0, 1205.5, 0],
  [-10000, 0, -1205.5, 0],
  [0, 10000, 0, 828],
  [0, -10000, 0, -828],
  [10000, 10000, 1205.5, 828],
  [-10000, 10000, -1205.5, 828],
  [10000, -10000, 1205.5, -828],
  [-10000, -10000, -1205.5, -828],
  [1160, 780, 1160, 780],
]) {
  const player = { x, y };
  webArena.clampPlayerToArena(player);
  assert.equal(player.x, expectedX, `Unexpected web x bound for input (${x}, ${y})`);
  assert.equal(player.y, expectedY, `Unexpected web y bound for input (${x}, ${y})`);
}

assert.match(webSource, /ctx\.drawImage\(frameImg, -ARENA_LAYOUT\.width \/ 2, -ARENA_LAYOUT\.height \/ 2, ARENA_LAYOUT\.width, ARENA_LAYOUT\.height\)/, "Web room art must be anchored at the fixed room origin");
assert.doesNotMatch(webSource, /const sceneW = Math\.max\(viewW, viewH \* \(4 \/ 3\)\)/, "Web room art must not be recentered and resized with the camera");

console.log("Arena bounds parity passed: fixed world-space frame, sprite-safe player limits, Godot/web edge dimensions");
