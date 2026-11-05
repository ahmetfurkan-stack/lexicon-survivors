(() => {
  const assert = (condition, message) => {
    if (!condition) throw new Error(`Inventory pause regression: ${message}`);
  };
  const readGame = () => JSON.parse(window.render_game_to_text());
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  window.runInventoryPauseRegression = async ({ waitMs = 1600 } = {}) => {
    const initial = readGame();
    assert(initial.mode === "wave", `expected active wave, received ${initial.mode}`);

    document.getElementById("touch-gadget-btn").click();
    const gadgetUsed = readGame();
    assert(gadgetUsed.player.gadget_cooldown > 0, "gadget activation should start its cooldown");

    document.getElementById("touch-inv-btn").click();
    assert(document.getElementById("inventory-modal").style.display === "flex", "inventory should open");
    const paused = readGame();
    await wait(waitMs);
    const stillPaused = readGame();

    assert(Math.abs(stillPaused.wave_time_left - paused.wave_time_left) < 0.05, "wave timer advanced while inventory was open");
    assert(stillPaused.player.hp === paused.player.hp, "player HP changed while inventory was open");
    assert(stillPaused.player.x === paused.player.x && stillPaused.player.y === paused.player.y, "player moved while inventory was open");
    assert(stillPaused.player.gadget_cooldown === paused.player.gadget_cooldown, "gadget cooldown advanced while inventory was open");
    assert(JSON.stringify(stillPaused.enemies) === JSON.stringify(paused.enemies), "enemy state changed while inventory was open");

    document.getElementById("close-inventory-btn").click();
    assert(document.getElementById("inventory-modal").style.display === "none", "inventory should close");
    assert(getComputedStyle(document.getElementById("mobile-touch-controls")).display === "block", "mobile controls should return after close");

    const joystickSurface = document.getElementById("touch-joystick-surface");
    const rect = joystickSurface.getBoundingClientRect();
    const startX = Math.max(12, Math.min(rect.width - 12, 70));
    const startY = Math.round(rect.height * 0.62);
    joystickSurface.dispatchEvent(new PointerEvent("pointerdown", {
      bubbles: true, cancelable: true, pointerId: 712, pointerType: "touch", isPrimary: true,
      clientX: rect.left + startX, clientY: rect.top + startY
    }));
    window.dispatchEvent(new PointerEvent("pointermove", {
      bubbles: true, cancelable: true, pointerId: 712, pointerType: "touch", isPrimary: true,
      clientX: rect.left + startX + 36, clientY: rect.top + startY
    }));
    await wait(320);
    window.dispatchEvent(new PointerEvent("pointerup", {
      bubbles: true, cancelable: true, pointerId: 712, pointerType: "touch", isPrimary: true,
      clientX: rect.left + startX + 36, clientY: rect.top + startY
    }));
    const moved = readGame();
    assert(moved.player.x > stillPaused.player.x + 10, "joystick movement did not resume after closing inventory");

    await new Promise((resolve, reject) => {
      const started = performance.now();
      const poll = () => {
        if (document.getElementById("gadget-status").textContent === "HAZIR") return resolve();
        if (performance.now() - started > 8000) return reject(new Error("Inventory pause regression: gadget cooldown did not resume after close"));
        setTimeout(poll, 50);
      };
      poll();
    });
    await wait(150);
    document.getElementById("touch-gadget-btn").click();
    const gadgetResumed = readGame();
    assert(gadgetResumed.player.gadget_cooldown > 0, "gadget could not be activated after cooldown resumed");

    return {
      frozen: {
        waveTime: paused.wave_time_left,
        hp: paused.player.hp,
        player: { x: paused.player.x, y: paused.player.y },
        gadgetCooldown: paused.player.gadget_cooldown,
        enemyCount: paused.enemies.length
      },
      resumed: {
        player: { x: moved.player.x, y: moved.player.y },
        gadgetCooldown: gadgetResumed.player.gadget_cooldown
      }
    };
  };
})();
