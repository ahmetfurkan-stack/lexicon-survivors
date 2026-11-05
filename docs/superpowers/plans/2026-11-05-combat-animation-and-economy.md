# Combat Animation and Economy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep hero locomotion readable during automatic fire, give weapons distinct action feedback, and make shop math agree between Godot and web.

**Architecture:** Separate hero locomotion from weapon action events; keep the current 14 weapon identities but make every role readable through its behavior, timing, and weapon-specific response. Store shared balance fields in one JSON asset consumed by GDScript and the web client.

**Tech Stack:** Godot 4.x GDScript, JavaScript Canvas, JSON, existing gameplay regression tests.

**Spec:** `docs/superpowers/specs/2026-11-05-library-exploration-mobile-leaderboard-design.md`

## Global Constraints

- Do not turn the game into survival-until-full-screen-cap play; waves remain discrete and the player retains the current choice to advance.
- Use one versioned JSON balance source for weapon price, damage, cadence, and relevant utility.
- Run ink resets between runs; keep any long-term unlocks cosmetic or sidegrade based.
- This is a 2D pixel-art game; use layered sprite poses, weapon sprites, particles, and UI motion rather than introducing 3D assets.

## Review Focus

- Fast attack speed with multiple equipped weapons: attack feedback cannot suppress the run animation continuously. Pin with an automatic-fire locomotion regression.
- Locomotion should carry a little momentum through direction changes, settle smoothly after input release, and pace the existing foot cycle from actual travel speed. Preserve average move speed and all shelf collision limits.
- No enemies in range: facing and movement continue without a forced attack pose. Pin in both runtime tests.
- Melee weapon starts/stops mid-swing: resolve damage only once at the attack's hit frame, with recovery before the next swing. Pin existing weapon hit regression.
- Price just below/above available ink: purchase succeeds/fails atomically and leaves the correct balance. Pin shop affordability tests.
- Web build cannot fetch the balance asset: use a bundled safe fallback or block start with a clear retry message; do not start a half-configured run. Pin fetch failure behavior.

---

### Task 1: Define Action Events and Animation State Rules

**Files:**
- Modify: `scripts/player.gd` animation timers and `play_attack_animation()`
- Modify: `scripts/weapon.gd` firing and melee action events
- Modify: `build/web/game.js` `updatePlayer()`, `shootWeapon()`, and player rendering
- Test: `test/gameplay_regression_test.gd`

**Interfaces:**
- Produces: `request_attack_pose(weapon_id: String, action_kind: String, aim: Vector2)` in Godot; web equivalent `requestAttackPose(weaponId, actionKind, aim)`
- `action_kind` is one of `ranged`, `melee`, `cast`, `heavy`; locomotion state remains independently selected from velocity
- Locomotion response keeps current top speed, but uses deliberate acceleration, gentle braking, and velocity-scaled run cadence. Attacks do not reset foot-cycle phase; facing follows the last meaningful aim or movement direction.

- [ ] **Step 1: Add tests proving idle/run state is not replaced by every ranged projectile**

Assert continuous movement remains `run` across several ranged shots; assert the run phase advances during fire; assert velocity eases from rest and settles on release without changing top speed; assert melee/cast events request their action pose; assert movement resumes after the action recovery window.

- [ ] **Step 2: Run the focused regression and observe the per-shot interruption**

Run: `godot --headless --path . -s test/gameplay_regression_test.gd`

Expected: new locomotion assertion fails while current 0.28s timer is restarted by every weapon.

- [ ] **Step 3: Implement action request routing**

Remove unconditional hero attack-timer writes from the shared projectile function. Pass weapon ID/action kind/aim from each weapon action; only an active attack event can trigger a brief hero response. Preserve weapon recoil, projectile cadence, and one-hit melee timing.

- [ ] **Step 4: Verify continuous movement and discrete attacks in both runtimes**

Run the Godot regression and browser animation check. Expected: running hero cycles continuously; a melee swing or cast shows its full start/hit/recovery sequence; ranged fire produces weapon recoil/flash without foot-cycle stutter.

### Task 2: Create One Shared Weapon Balance File

**Files:**
- Create: `assets/data/weapon_balance.json`
- Create: `build/web/assets/data/weapon_balance.json`
- Modify: `scripts/stats_manager.gd`
- Modify: `build/web/game.js` bootstrap and weapon catalog initialization
- Test: `test/gameplay_regression_test.gd` and a balance parity check in `test/`

**Interfaces:**
- JSON top-level keys: `version`, `run_start_ink`, and `weapons`
- Each weapon entry contains `cost`, `damage`, `cooldown`, and `role`; runtime-specific display text and sprite references remain in existing catalogs
- Godot loads via `StatsManager.load_weapon_balance()`; web awaits `loadWeaponBalance()` before a new run can start

- [ ] **Step 1: Capture a parity test for every shared weapon ID and run-start currency**

Compare the 14 Godot/web weapon IDs, `cost`, `damage`, `cooldown`, and start ink. Also assert each `role` is a non-empty entry from the documented role set.

- [ ] **Step 2: Run the parity check to identify existing divergence**

Run: `godot --headless --path . -s test/gameplay_regression_test.gd` and `node test/weapon_balance_parity_test.js`.

Expected: fail on Quill Blaster values and initial ink before the canonical file is applied.

- [ ] **Step 3: Add canonical balance records and load them in both runtimes**

Use web's current 15 starting ink as the initial parity target. Preserve all 14 existing weapon IDs. Merge only shared gameplay fields into runtime catalogs. The web loader must expose a ready Promise and defer `onStartGame()` until resolved; a fetch failure keeps the title interactive and presents a retryable status.

- [ ] **Step 4: Tune price/output relationships using current run income**

For each role, compute expected damage per second or utility per cooldown and compare with cost and wave ink income. Keep melee close-range premium tied to safety/uptime; do not allow one low-cost weapon to dominate other choices. Record final ratios in the regression's expected bounds.

- [ ] **Step 5: Verify JSON loading and all shop affordability boundaries**

Run the Godot regression, parity check, `node --check build/web/game.js`, and browser shop purchase flow. Expected: identical shared weapon values in both clients, correct 15 starting ink, and purchases update balance exactly once.

### Task 3: Validate Weapon Identity and Balance Across a Run

**Files:**
- Modify: `test/gameplay_regression_test.gd`
- Create: `test/weapon_balance_parity_test.js`
- Verify: `scripts/weapon.gd`, `build/web/game.js`

- [ ] **Step 1: Assert role-specific weapon behavior for the existing 14 weapons**

Check representative projectile, spread, beam, explosive, melee, orbit/deployable, and utility roles produce their expected attack event and visual feedback.

- [ ] **Step 2: Exercise a complete wave-shop-wave purchase chain**

Verify a player can earn, compare, buy, equip, and use at least one ranged and one melee choice; starting currency and wave income stay identical in both runtimes.

- [ ] **Step 3: Run all gameplay regression and static checks**

Run: `godot --headless --path . -s test/gameplay_regression_test.gd`, `node test/weapon_balance_parity_test.js`, and `node --check build/web/game.js`.

Expected: all 14 IDs resolve, all balance invariants pass, attacks retain distinct roles, and the wave shop remains turn based.
