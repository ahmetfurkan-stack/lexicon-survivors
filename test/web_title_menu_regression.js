(() => {
  const assert = (condition, message) => {
    if (!condition) throw new Error(`Title menu regression: ${message}`);
  };

  window.runTitleMenuRegression = () => {
    const cards = [...document.querySelectorAll("#char-selection-grid [data-hero]")];
    assert(cards.length === 6, `expected six playable character cards, got ${cards.length}`);
    assert(new Set(cards.map((card) => card.dataset.hero)).size === 6, "character IDs must be unique");
    for (const card of cards) {
      assert(card.getAttribute("role") === "button" && card.tabIndex === 0, `${card.dataset.hero} must be keyboard reachable`);
      assert(card.getAttribute("aria-label")?.includes("karakterini seç"), `${card.dataset.hero} needs a Turkish accessible name`);
      assert(card.getAttribute("aria-pressed") === String(card.dataset.hero === state.selected_char), `${card.dataset.hero} selection state must be announced`);
    }

    const target = cards.find((card) => card.dataset.hero === "shadow_lexicographer");
    target.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    assert(state.selected_char === "shadow_lexicographer", "Enter should select the focused hero");
    assert(document.querySelector('#char-selection-grid [data-hero="shadow_lexicographer"]')?.getAttribute("aria-pressed") === "true",
      "keyboard selection must update its announced state");

    const difficultyButtons = [...document.querySelectorAll("#diff-selection-container button")];
    assert(difficultyButtons.length === 3, `expected three difficulty choices, got ${difficultyButtons.length}`);
    difficultyButtons[2].click();
    assert(state.difficulty === "hard", "the hard difficulty menu choice must apply");
    assert(document.getElementById("diff-desc").textContent === DIFFICULTIES.hard.desc, "the difficulty description must match the selected option");

    setMusicChoice("last_stand");
    assert(bgm.musicChoice === "last_stand", "menu music choice must reach the audio controller");
    for (const id of ["title-music-select", "mobile-music-select"]) {
      assert(document.getElementById(id)?.value === "last_stand", `${id} must remain synchronized with the chosen score`);
    }
    assert(localStorage.getItem("lexicon_music_choice") === "last_stand", "music preference must persist for the next visit");

    return { characters: cards.length, selectedCharacter: state.selected_char, difficulty: state.difficulty, music: bgm.musicChoice };
  };
})();
