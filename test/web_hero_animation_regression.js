(() => {
  window.runHeroAnimationRegression = () => {
    const player = {
      attack_anim_duration: 0.24,
      attack_anim_windup: 0.08,
      attack_anim_active: 0.04,
      attack_anim_timer: 0.24,
      run_phase: 0
    };
    const timers = [0.24, 0.19, 0.14, 0.04];
    const expected = [0, 1, 2, 3];
    const actual = timers.map(timer => {
      player.attack_anim_timer = timer;
      return getHeroAnimationFrame("ranged", player);
    });
    if (actual.some((frame, index) => frame !== expected[index])) {
      throw new Error(`Ranged attack frames must follow windup, impact, and recovery timing. Expected ${expected}; got ${actual}`);
    }
    const rendered = [
      getHeroRenderAction({ vx: 180, vy: 0, is_dashing: false, attack_anim_timer: 0.08, attack_anim_kind: "ranged" }),
      getHeroRenderAction({ vx: 0, vy: 0, is_dashing: false, attack_anim_timer: 0.08, attack_anim_kind: "ranged" }),
      getHeroRenderAction({ vx: 180, vy: 0, is_dashing: false, attack_anim_timer: 0.08, attack_anim_duration: 0.4, attack_anim_windup: 0.08, attack_anim_active: 0.12, attack_anim_kind: "melee" })
    ];
    if (rendered.join(",") !== "run,ranged,run") {
      throw new Error(`Locomotion should hold through ranged fire and melee recovery. Expected run,ranged,run; got ${rendered}`);
    }
    return { rangedPoseFrames: actual, blendedActions: rendered };
  };
})();
