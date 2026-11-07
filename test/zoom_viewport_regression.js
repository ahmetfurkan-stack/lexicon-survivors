const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const html = fs.readFileSync(path.join(__dirname, "../build/web/index.html"), "utf8");
const viewport = html.match(/<meta\s+name="viewport"\s+content="([^"]+)"/i)?.[1] || "";
assert.match(viewport, /user-scalable=yes/i, "mobile browsers must allow pinch zoom");
assert.match(viewport, /maximum-scale=5(?:\.0)?/i, "zoom must not be capped at 1x");
assert.match(viewport, /viewport-fit=cover/i, "the app must read safe-area insets");
assert.match(viewport, /interactive-widget=resizes-content/i, "keyboard and visual viewport changes should resize page content");

const zoomRules = html.split("/* Browser zoom must remain available.")[1] || "";
assert.match(zoomRules, /--game-viewport-height:\s*100vh/, "older browsers need a viewport-height fallback");
assert.match(zoomRules, /--game-viewport-height:\s*100dvh/, "mobile layout must use the live dynamic viewport height");
assert.match(zoomRules, /safe-area-inset-(top|right|bottom|left)/, "mobile content must account for all safe-area edges");
assert.match(zoomRules, /overflow-y:\s*auto\s*!important/, "zoomed layouts and menus must remain scrollable");
assert.match(zoomRules, /position:\s*relative\s*!important/, "mobile page must not be locked to a clipped fixed viewport");
assert.match(zoomRules, /object-fit:\s*fill\s*!important/, "canvas bitmap must remain visible instead of cropping under narrow viewport ratios");
assert.match(zoomRules, /\.dialog-panel\s*\{[^}]*overflow-y:\s*auto\s*!important/s, "zoomed dialogs must scroll within the dynamic viewport");
assert.match(zoomRules, /\.screen-overlay\s*\{[^}]*overflow-y:\s*auto\s*!important/s, "screen overlays must scroll when zoom enlarges their contents");
assert.match(html, /#archive-intro\s*\{[^}]*pointer-events:\s*none/s, "the decorative intro must not block taps on the title screen behind it");
assert.match(html, /#archive-intro \.archive-intro-skip\s*\{[^}]*pointer-events:\s*auto/s, "the intro skip control must remain directly tappable");
assert.match(fs.readFileSync(path.join(__dirname, "../build/web/game.js"), "utf8"), /const onStartGame = async \(e\) => \{[\s\S]*?finishArchiveIntro\?\.\(true\)/,
  "starting a run should immediately dismiss the decorative intro after the tap passes through");

console.log("Viewport zoom regression passed: pinch scale, dynamic height, safe areas, full canvas, and scrollable overlays.");
