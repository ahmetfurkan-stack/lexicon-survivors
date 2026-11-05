// Lexicon Survivors: The Word Guardian - Web Engine v4.0
// Hardcore Roguelite, 100 Waves, Weapon Slots & Multi-Gadget System

// =========================================
// 1. WEB AUDIO SYNTHESIZER
// =========================================
class SoundManager {
  constructor() {
    this.ctx = null;
  }
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  playTone(freq, type, duration, gainVal = 0.15) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }
  shoot(weaponType = "quill_blaster") {
    this.init();
    switch (weaponType) {
      case "syllable_shotgun":
        this.playTone(170, "sawtooth", 0.13, 0.22);
        break;
      case "lexicon_beam":
        this.playTone(560, "sine", 0.09, 0.14);
        break;
      case "punctuation_bomb":
        this.playTone(150, "triangle", 0.18, 0.22);
        break;
      case "dictionary_blade":
      case "calligraphy_katana":
        this.playTone(310, "triangle", 0.14, 0.20);
        break;
      case "crossword_crossbow":
      case "grammar_sniper":
        this.playTone(490, "sawtooth", 0.11, 0.22);
        break;
      case "hyphen_boomerang":
        this.playTone(340, "sine", 0.20, 0.16);
        break;
      case "ink_flamethrower":
        this.playTone(110 + Math.random() * 40, "square", 0.05, 0.08);
        break;
      case "thesaurus_rocket":
        this.playTone(95, "sawtooth", 0.25, 0.25);
        break;
      case "quote_pistols":
      case "scroll_turret":
        this.playTone(620, "triangle", 0.06, 0.12);
        break;
      case "rune_orb":
        this.playTone(740, "sine", 0.12, 0.18);
        break;
      default:
        this.playTone(420, "triangle", 0.08, 0.12);
        break;
    }
  }
  enemyShoot() {
    this.init();
    this.playTone(210, "sawtooth", 0.14, 0.15);
  }
  detonateMine() {
    this.init();
    this.playTone(80, "square", 0.28, 0.3);
  }
  rocketBlast() {
    this.init();
    this.playTone(70, "sawtooth", 0.35, 0.35);
  }
  gadget() {
    this.init();
    this.playTone(520, "sine", 0.18, 0.25);
    setTimeout(() => this.playTone(780, "triangle", 0.22, 0.25), 80);
  }
  hit() {
    this.init();
    this.playTone(110, "square", 0.08, 0.15);
  }
  enemyDeath() {
    this.init();
    this.playTone(90, "sawtooth", 0.15, 0.16);
  }
  bossRoar() {
    this.init();
    this.playTone(55, "sawtooth", 0.7, 0.45);
    setTimeout(() => this.playTone(85, "square", 0.5, 0.35), 180);
  }
  pickup() {
    this.init();
    this.playTone(720, "sine", 0.07, 0.1);
  }
  quizSuccess() {
    this.init();
    this.playTone(523.25, "sine", 0.15, 0.2);
    setTimeout(() => this.playTone(659.25, "sine", 0.2, 0.2), 120);
    setTimeout(() => this.playTone(783.99, "sine", 0.35, 0.25), 240);
  }
  quizFail() {
    this.init();
    this.playTone(190, "sawtooth", 0.2, 0.2);
    setTimeout(() => this.playTone(140, "sawtooth", 0.35, 0.25), 180);
  }
}
const sounds = new SoundManager();

// =========================================
// 1.5 PROCEDURAL MEDIEVAL BGM SYNTHESIZER
// =========================================
class MedievalBGM {
  constructor(soundManager) {
    this.sm = soundManager;
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = 0.24;
    this.mode = "peaceful"; // "peaceful" | "battle" | "boss"
    this.biome = -1;
    this.step = 0;
    this.timerId = null;

    this.notes = {
      D2: 73.42, F2: 87.31, G2: 98.00, A2: 110.00, Bb2: 116.54, C3: 130.81,
      D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, Bb3: 233.08, C4: 261.63,
      D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, C5: 523.25
    };

    this.harpPatterns = {
      peaceful: [
        "D3", "F3", "A3", "D4", "F3", "A3", "D4", "A3",
        "D3", "F3", "A3", "F4", "D4", "A3", "F3", "A3",
        "Bb2", "D3", "F3", "Bb3", "D4", "F3", "Bb3", "D4",
        "Bb2", "F3", "Bb3", "D4", "F4", "D4", "Bb3", "F3",
        "C3", "E3", "G3", "C4", "E4", "G3", "C4", "E4",
        "C3", "G3", "C4", "E4", "G4", "E4", "C4", "G3",
        "A2", "C3", "E3", "A3", "C4", "E3", "A3", "C4",
        "A2", "E3", "A3", "C4", "E4", "C4", "A3", "E3"
      ],
      battle: [
        "D3", "A3", "D4", "F4", "D4", "A3", "D4", "A3",
        "D3", "A3", "F4", "A4", "F4", "D4", "A3", "D4",
        "Bb2", "F3", "Bb3", "D4", "F4", "D4", "Bb3", "D4",
        "Bb2", "F3", "D4", "F4", "D4", "Bb3", "F3", "Bb3",
        "C3", "G3", "C4", "E4", "G4", "E4", "C4", "E4",
        "C3", "G3", "E4", "G4", "E4", "C4", "G3", "C4",
        "A2", "E3", "A3", "C4", "E4", "C4", "A3", "E3",
        "A2", "E3", "G3", "A3", "C4", "E4", "A4", "E4"
      ],
      boss: [
        "D2", "D3", "F3", "D3", "A3", "D3", "F3", "D3",
        "D2", "D3", "G2", "D3", "A3", "D3", "C4", "A3",
        "Bb2", "Bb3", "D4", "Bb3", "F4", "Bb3", "D4", "Bb3",
        "A2", "A3", "C4", "A3", "E4", "A3", "G4", "E4"
      ]
    };

    this.bassNotes = {
      peaceful: ["D2", "Bb2", "C3", "A2"],
      battle: ["D2", "Bb2", "C3", "A2"],
      boss: ["D2", "D2", "Bb2", "A2"]
    };
  }

  start() {
    if (this.isPlaying) return;
    this.sm.init();
    if (!this.sm.ctx) return;
    this.isPlaying = true;
    this.step = 0;
    this.tick();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  setMode(newMode) {
    if (this.harpPatterns[newMode]) {
      this.mode = newMode;
    }
  }

  setBiomeForWave(wave) {
    const nextBiome = wave >= 76 ? 3 : wave >= 51 ? 2 : wave >= 26 ? 1 : 0;
    if (nextBiome === this.biome) return;
    this.biome = nextBiome;
    if (this.isPlaying && !this.isMuted) this.playChapterChime();
  }

  playChapterChime() {
    const ctx = this.sm.ctx;
    if (!ctx || this.isMuted) return;
    const roots = [293.66, 261.63, 349.23, 233.08];
    const root = roots[this.biome] || roots[0];
    [1, 1.25, 1.5].forEach((ratio, index) => {
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + index * 0.11;
        osc.type = "sine";
        osc.frequency.setValueAtTime(root * ratio, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(0.035 * this.volume, start + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 1.18);
      } catch (e) {}
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return !this.isMuted;
  }

  tick() {
    if (!this.isPlaying) return;
    const ctx = this.sm.ctx;
    if (!ctx) return;

    const pattern = this.harpPatterns[this.mode] || this.harpPatterns.peaceful;
    const totalSteps = pattern.length;
    const currentNoteName = pattern[this.step % totalSteps];
    const bpm = this.mode === "boss" ? 140 : (this.mode === "battle" ? 122 : 94);
    const stepDuration = 60 / bpm / 4;
    const semitones = [0, -2, 5, -3][this.biome] || 0;
    const transpose = Math.pow(2, semitones / 12);

    if (!this.isMuted && this.volume > 0) {
      const now = ctx.currentTime;
      if (currentNoteName && this.notes[currentNoteName]) {
        this.playPluckedString(this.notes[currentNoteName] * transpose, now, stepDuration * 2.5, 0.08 * this.volume);
      }

      if (this.step % 16 === 0) {
        const barIdx = Math.floor((this.step % totalSteps) / 16);
        const bList = this.bassNotes[this.mode] || this.bassNotes.peaceful;
        const bNote = bList[barIdx % bList.length];
        if (bNote && this.notes[bNote]) {
          this.playBassDrone(this.notes[bNote] * transpose, now, stepDuration * 15, 0.12 * this.volume);
        }
        if (this.step % 64 === 0) {
          this.playAmbientBed([110, 98, 130.81, 87.31][this.biome], now, stepDuration * 60, 0.025 * this.volume);
        }
      }

      if (this.mode !== "peaceful") {
        const stepInBar = this.step % 16;
        if (stepInBar === 0 || stepInBar === 8) {
          this.playDrumKick(now, 0.13 * this.volume);
        }
        if (stepInBar === 4 || stepInBar === 12) {
          this.playPercTick(now, 0.06 * this.volume);
        }
        if (this.mode === "boss" && (stepInBar === 6 || stepInBar === 14)) {
          this.playPercTick(now, 0.08 * this.volume);
        }
      }
    }

    this.step++;
    this.timerId = setTimeout(() => this.tick(), stepDuration * 1000);
  }

  playPluckedString(freq, time, dur, gainVal) {
    try {
      const ctx = this.sm.ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(gainVal, time + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + dur);
    } catch(e) {}
  }

  playBassDrone(freq, time, dur, gainVal) {
    try {
      const ctx = this.sm.ctx;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, time);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(260, time);

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(gainVal, time + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + dur);
    } catch(e) {}
  }

  playAmbientBed(freq, time, dur, gainVal) {
    try {
      const ctx = this.sm.ctx;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, time);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(420, time);
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(gainVal, time + 1.2);
      gain.gain.setValueAtTime(gainVal, Math.max(time + 1.2, time + dur - 1.4));
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + dur);
    } catch (e) {}
  }

  playDrumKick(time, gainVal) {
    try {
      const ctx = this.sm.ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(115, time);
      osc.frequency.exponentialRampToValueAtTime(36, time + 0.12);

      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.14);
    } catch(e) {}
  }

  playPercTick(time, gainVal) {
    try {
      const ctx = this.sm.ctx;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(800 + Math.random() * 200, time);

      filter.type = "highpass";
      filter.frequency.setValueAtTime(1200, time);

      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.05);
    } catch(e) {}
  }
}

const bgm = new MedievalBGM(sounds);

// =========================================
// 2. CHARACTERS & DIFFICULTIES (BALANCED)
// =========================================
const CHARACTERS = {
  inky: {
    id: "inky",
    name: "Inky",
    title: "Dengeli Bilgin (The Balanced Scholar)",
    desc: "Kütüphanenin kadim koruyucusu. Dengeli nitelikler ve kararlı mürekkep akışı.",
    hp: 125,
    speed: 235,
    damage_mult: 1.05,
    attack_speed_mult: 1.05,
    armor: 0.10,
    crit_chance: 0.10,
    starting_weapon: "quill_blaster",
    starting_gadget: "eraser_dash",
    passive: "Mürekkep Ustası: Dengeli öğrenme ve her alanda tam yetkinlik.",
    sprite: "upgrade_v1/hero_inky.png",
    color: "#ffffff"
  },
  quillmaster: {
    id: "quillmaster",
    name: "Quillmaster",
    title: "Hızlı Kalemşör (Glass Cannon)",
    desc: "+%35 Saldırı Hızı, +%20 Hasar ve +30 Hareket Hızı! Seri kritik vuruşlar.",
    hp: 95,
    speed: 265,
    damage_mult: 1.25,
    attack_speed_mult: 1.35,
    armor: 0.0,
    crit_chance: 0.20,
    starting_weapon: "syllable_shotgun",
    starting_gadget: "chrono_comma",
    passive: "Zaman Bükücü: Chrono Comma ile başlar, yüksek seri atış.",
    sprite: "upgrade_v1/hero_quillmaster.png",
    color: "#fff176"
  },
  word_knight: {
    id: "word_knight",
    name: "Word Knight",
    title: "Sözcük Şövalyesi (The Citadel Tank)",
    desc: "+55 Maksimum Can (180 HP), +%30 Hasar Direnci (Zırh), sağlam savunma kalkanı.",
    hp: 180,
    speed: 210,
    damage_mult: 1.15,
    attack_speed_mult: 0.95,
    armor: 0.30,
    crit_chance: 0.08,
    starting_weapon: "dictionary_blade",
    starting_gadget: "lexicon_aegis",
    passive: "Sözlük Kalkanı: Aegis Kalkanı ile başlar, ağır darbe soğurma.",
    sprite: "upgrade_v1/hero_word_knight.png",
    color: "#81c784"
  },
  rune_sorceress: {
    id: "rune_sorceress",
    name: "Rune Sorceress",
    title: "Kadim Rün Büyücüsü (Mystic Archmage)",
    desc: "Büyülü rünlerle geniş alan hasarı, +%30 Hasar ve Rün Küresi ile başlar.",
    hp: 105,
    speed: 245,
    damage_mult: 1.30,
    attack_speed_mult: 1.10,
    armor: 0.05,
    crit_chance: 0.15,
    starting_weapon: "rune_orb",
    starting_gadget: "ink_cataclysm",
    passive: "Rün İnfilakı: Düşmanları alt ettiğinde sıçrayan rün patlamaları.",
    sprite: "upgrade_v1/hero_rune_sorceress.png",
    color: "#c084fc"
  },
  lexicon_alchemist: {
    id: "lexicon_alchemist",
    name: "Alchemist",
    title: "Sözlük Simyacısı (Resource Alchemist)",
    desc: "+%40 Mürekkep Kazanımı, Gramer Mıknatısı ve Mürekkep Alevi ile başlar.",
    hp: 115,
    speed: 240,
    damage_mult: 1.10,
    attack_speed_mult: 1.20,
    armor: 0.12,
    crit_chance: 0.12,
    starting_weapon: "ink_flamethrower",
    starting_gadget: "grammar_magnet",
    passive: "Simya Özütü: Her dalga başında +10 Mürekkep, can iksirleri +%50 etkili.",
    sprite: "upgrade_v1/hero_alchemist.png",
    color: "#34d399"
  },
  shadow_lexicographer: {
    id: "shadow_lexicographer",
    name: "Shadow Scribe",
    title: "Gölge Hattatı (Critical Assassin)",
    desc: "290 Hız, +%35 Kritik Vuruş Şansı ve Hattat Katanası ile seri ölümcül kesişler.",
    hp: 90,
    speed: 290,
    damage_mult: 1.45,
    attack_speed_mult: 1.25,
    armor: 0.0,
    crit_chance: 0.35,
    starting_weapon: "calligraphy_katana",
    starting_gadget: "eraser_dash",
    passive: "Kritik İnfaz: Kritik vuruşlar %250 hasar verir ve düşmanı yavaşlatır.",
    sprite: "upgrade_v1/hero_shadow_scribe.png",
    color: "#f43f5e"
  }
};

const DIFFICULTIES = {
  easy: {
    id: "easy",
    name: "A1–A2",
    desc: "Düşmanlar yavaş (%-25), canları az (%-35). Başlangıç canı +40 HP. Rahat öğrenme ortamı.",
    enemy_speed_mult: 0.75,
    enemy_hp_mult: 0.65,
    enemy_damage_mult: 0.60,
    player_hp_bonus: 40,
    ink_bonus_mult: 1.40
  },
  normal: {
    id: "normal",
    name: "B1",
    desc: "Dengeli arcade deneyimi! Pürüzsüz dalga geçişleri, toplanabilir can parşömenleri ve ödüllendirici sorular.",
    enemy_speed_mult: 0.90,
    enemy_hp_mult: 0.85,
    enemy_damage_mult: 0.80,
    player_hp_bonus: 15,
    ink_bonus_mult: 1.20
  },
  hard: {
    id: "hard",
    name: "B2–C1",
    desc: "Akademik arena! Düşmanlar çevik, canları daha yüksek (%+15), yoğun düşman akını ve sınav tuzakları.",
    enemy_speed_mult: 1.08,
    enemy_hp_mult: 1.15,
    enemy_damage_mult: 1.15,
    player_hp_bonus: 0,
    ink_bonus_mult: 1.35
  }
};

// =========================================
// 3. 14 WEAPONS CATALOG & TIERS
// =========================================
const WEAPONS_CATALOG = {
  quill_blaster: {
    id: "quill_blaster",
    name: "Tüy Kalem (Quill Blaster)",
    desc: "Hedefe keskin mürekkep iğneleri fırlatır.",
    cost: 10, cooldown: 0.48, damage: 26.0, sprite: "quill_blaster.png"
  },
  syllable_shotgun: {
    id: "syllable_shotgun",
    name: "Hece Pompalısı (Syllable Shotgun)",
    desc: "Geniş bir yayda 5 adet hece parçacığı püskürtür.",
    cost: 14, cooldown: 0.95, damage: 18.0, sprite: "syllable_shotgun.png"
  },
  lexicon_beam: {
    id: "lexicon_beam",
    name: "Leksikon Lazeri (Lexicon Beam)",
    desc: "Düşman hatlarını delip geçen odaklanmış ışık oku.",
    cost: 18, cooldown: 0.40, damage: 22.0, sprite: "lexicon_beam.png"
  },
  punctuation_bomb: {
    id: "punctuation_bomb",
    name: "Noktalama Bombası (Punctuation Bomb)",
    desc: "Temasla patlayan virgül ve ünlem mayınları döşer.",
    cost: 16, cooldown: 1.10, damage: 56.0, sprite: "punctuation_bomb.png"
  },
  dictionary_blade: {
    id: "dictionary_blade",
    name: "Sözlük Kılıcı (Dictionary Blade)",
    desc: "Kullanıcı etrafında dönerek yaklaşan hataları biçer.",
    cost: 16, cooldown: 0.60, damage: 40.0, sprite: "dictionary_blade.png"
  },
  crossword_crossbow: {
    id: "crossword_crossbow",
    name: "Bulmaca Tatar Yayı (Crossword Crossbow)",
    desc: "Çarptığı düşmandan 4 yöne dağılan bulmaca okları fırlatır.",
    cost: 22, cooldown: 0.90, damage: 32.0, sprite: "crossword_crossbow.png"
  },
  hyphen_boomerang: {
    id: "hyphen_boomerang",
    name: "Tire Bumerangı (Hyphen Boomerang)",
    desc: "İleri uçup geri dönerken yolundaki tüm düşmanları iki kez keser.",
    cost: 20, cooldown: 1.05, damage: 26.0, sprite: "hyphen_boomerang.png"
  },
  ink_flamethrower: {
    id: "ink_flamethrower",
    name: "Mürekkep Alevi (Ink Flamethrower)",
    desc: "Sürekli bir kor mürekkep alevi püskürtür.",
    cost: 24, cooldown: 0.12, damage: 9.0, sprite: "ink_flamethrower.png"
  },
  thesaurus_rocket: {
    id: "thesaurus_rocket",
    name: "Eşanlamlı Roketi (Thesaurus Rocket)",
    desc: "Çarptığında devasa bir sözlük patlaması yaratan ağır roket.",
    cost: 26, cooldown: 1.55, damage: 68.0, sprite: "thesaurus_rocket.png"
  },
  quote_pistols: {
    id: "quote_pistols",
    name: "Tırnak Çift Tabanca (Quote Pistols)",
    desc: "Çift el tırnak işaretleriyle seri ve yüksek kritik vuruşlar.",
    cost: 22, cooldown: 0.26, damage: 16.0, sprite: "quote_pistols.png"
  },
  // 4 New Weapons
  calligraphy_katana: {
    id: "calligraphy_katana",
    name: "Kaligrafi Katanası (Calligraphy Katana)",
    desc: "Geniş kavisli mürekkep kesiği savurur, yüksek kritik şansı.",
    cost: 25, cooldown: 0.65, damage: 42.0, sprite: "calligraphy_katana.png"
  },
  scroll_turret: {
    id: "scroll_turret",
    name: "Tomar Tareti (Scroll Turret)",
    desc: "Yere otomatik ateş açan kadim büyü kitabı tareti yerleştirir.",
    cost: 26, cooldown: 2.20, damage: 20.0, sprite: "scroll_turret.png"
  },
  rune_orb: {
    id: "rune_orb",
    name: "Kadim Rün Küresi (Arcane Rune Orb)",
    desc: "Düşmanlar arasında seken ve elektrik/mürekkep sıçratan küre.",
    cost: 24, cooldown: 0.85, damage: 25.0, sprite: "rune_orb.png"
  },
  grammar_sniper: {
    id: "grammar_sniper",
    name: "Sözdizimi Ray-Tüfeği (Syntax Rail-Sniper)",
    desc: "Tüm düşman hattını delip geçen yüksek kalibreli delici tüy.",
    cost: 28, cooldown: 1.45, damage: 82.0, sprite: "grammar_sniper.png"
  }
};

const TIER_MULTIPLIERS = {
  1: { name: "Standart", damage: 1.0, cooldown: 1.0, badge: "tier-1", stars: "★" },
  2: { name: "Nadir", damage: 1.35, cooldown: 0.85, badge: "tier-2", stars: "★★" },
  3: { name: "Epik", damage: 1.80, cooldown: 0.75, badge: "tier-3", stars: "★★★", pierce: 1 },
  4: { name: "Efsanevi", damage: 2.50, cooldown: 0.65, badge: "tier-4", stars: "★★★★", projectile: 1, crit: 0.15 }
};

// =========================================
// 4. GADGETS CATALOG (5 UNIQUE ACTIVE GADGETS)
// =========================================
const GADGETS_CATALOG = {
  eraser_dash: {
    id: "eraser_dash",
    name: "Silgi Atılımı (Eraser Dash)",
    desc: "0.28s tam dokunulmazlık ile seri ileri atılır ve temas ettiği düşmanlara 60 silgi hasarı verir.",
    cooldown: 2.4,
    sprite: "eraser_icon.png",
    cost: 0
  },
  ink_cataclysm: {
    id: "ink_cataclysm",
    name: "Mürekkep Kıyameti (Ink Cataclysm)",
    desc: "Tüm düşman mermilerini siler, 350px alandaki düşmanları dondurur ve 90 hasar vurur.",
    cooldown: 6.0,
    sprite: "gadget_ink_bomb.png",
    cost: 16
  },
  chrono_comma: {
    id: "chrono_comma",
    name: "Zamanı Durduran Virgül (Chrono Comma)",
    desc: "4 saniye boyunca tüm düşmanları ve mermilerini %85 yavaşlatır; oyuncuya +%40 atış hızı verir.",
    cooldown: 7.0,
    sprite: "gadget_time_stop.png",
    cost: 18
  },
  lexicon_aegis: {
    id: "lexicon_aegis",
    name: "Sözlük Kalkanı (Lexicon Aegis)",
    desc: "Oyuncu etrafında dönen ve 4 darbeyi soğurup %150 hasarla yansıtan büyü kalkanı.",
    cooldown: 5.5,
    sprite: "gadget_shield.png",
    cost: 16
  },
  grammar_magnet: {
    id: "grammar_magnet",
    name: "Mürekkep Hortumu (Grammar Magnet)",
    desc: "Arenadaki tüm mürekkep damlalarını ve can parşömenlerini oyuncuya çeker.",
    cooldown: 4.5,
    sprite: "gadget_magnet.png",
    cost: 14
  }
};

const ARTIFACTS_CATALOG = {
  magnifying_glass: {
    id: "magnifying_glass",
    name: "Büyüteç (Magnifying Glass)",
    desc: "+%15 Kritik Şans & +%20 Mermi Hasarı",
    cost: 14, stats: { crit_chance: 0.15, damage: 0.20 }
  },
  golden_inkpot: {
    id: "golden_inkpot",
    name: "Altın Mürekkep Hokkası (Golden Inkpot)",
    desc: "Düşmanlardan +%50 daha fazla mürekkep düşer.",
    cost: 15, stats: { ink_mult: 0.50 }
  },
  scholar_boots: {
    id: "scholar_boots",
    name: "Bilgin Çizmeleri (Scholar Boots)",
    desc: "+45 Hareket Hızı",
    cost: 12, stats: { move_speed: 45.0 }
  },
  grammar_guide: {
    id: "grammar_guide",
    name: "Dilbilgisi Kılavuzu (Grammar Guide)",
    desc: "+30 Maks Can & +%15 Hasar Direnci (Zırh)",
    cost: 15, stats: { max_hp: 30.0, armor: 0.15 }
  },
  slot_expansion: {
    id: "slot_expansion",
    name: "Kâtip Teçhizat Kemeri (+1 Silah Yuvası)",
    desc: "Aynı anda ateşleyebileceğiniz silah yuvasını 1 artırır (Maks: 6).",
    cost: 25, stats: { max_weapon_slots: 1 }
  },
  diligence_coffee: {
    id: "diligence_coffee",
    name: "Çalışkanlık Kahvesi (Coffee of Diligence)",
    desc: "+%30 Saldırı Hızı",
    cost: 15, stats: { attack_speed: 0.30 }
  }
};

// =========================================
// 5. GAME STATE
// =========================================
function readStoredBoolean(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === "true";
  } catch (error) {
    return fallback;
  }
}

const state = {
  selected_char: "inky",
  difficulty: "normal",
  max_hp: 110,
  hp: 110,
  move_speed: 230,
  damage_mult: 1.0,
  attack_speed_mult: 1.0,
  armor: 0.05,
  crit_chance: 0.08,
  pickup_radius: 150,
  projectile_count: 1,
  pierce_count: 1,
  ink_mult: 1.0,

  // Weapon Slots & Inventory
  max_weapon_slots: 4,
  equipped_weapons: [], // [{ id: "quill_blaster", tier: 1 }]
  reserve_weapons: [],  // [{ id: "...", tier: 1 }]
  active_weapon_index: 0,

  // Active Gadget
  active_gadget_id: "eraser_dash",
  gadget_timer: 0,
  chrono_timer: 0,
  shield_charges: 0,

  // Game Speed, Auto New Tur (Wave) & Auto New Run
  game_speed: 1.0,
  auto_new_tur: readStoredBoolean("lexicon_auto_new_tur", false),
  auto_new_run: readStoredBoolean("lexicon_auto_new_run", false),

  // 100-Wave Progression
  current_wave: 1,
  max_waves: 100,
  wave_duration: 25.0,
  wave_time_left: 25.0,
  is_wave_active: false,
  ink_count: 15,
  kill_count: 0,
  words_learned: [],
  active_synergies: {},
  artifacts_owned: [],
  asked_question_ids: [],
  mistake_words: [],
  touch_dir: { x: 0, y: 0 },

  // Dynamic entities
  player: {
    x: 0, y: 0, vx: 0, vy: 0,
    facing_left: false,
    invuln_timer: 0,
    is_dashing: false,
    dash_timer: 0,
    dash_dir: { x: 1, y: 0 },
    dash_hit_ids: new Set(),
    attack_anim_timer: 0,
    slow_timer: 0
  },
  weapons: [],
  projectiles: [],
  punctuation_mines: [],
  turrets: [],
  enemies: [],
  enemy_projectiles: [],
  ink_drops: [],
  health_drops: [],
  ink_puddles: [],
  particles: [],
  ambient_motes: [],
  telegraphs: [],
  boss_lasers: [],
  active_boss: null,
  floating_texts: [],
  screen_shake: 0,
  shake_intensity: 0,

  rune_rotation: 0,
  questions: []
};

// Haptic feedback & Game feel helpers
function triggerHaptic(type = "light") {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      if (type === "light") navigator.vibrate(12);
      else if (type === "medium") navigator.vibrate(24);
      else if (type === "heavy") navigator.vibrate([40, 30, 40]);
      else if (type === "success") navigator.vibrate([20, 40, 35]);
      else if (type === "fail") navigator.vibrate([60, 40, 60]);
    } catch (e) {}
  }
}

function triggerScreenShake(duration = 0.16, intensity = 6.0) {
  state.screen_shake = Math.max(state.screen_shake, duration);
  state.shake_intensity = Math.max(state.shake_intensity, intensity);
}

function addFloatingText(x, y, text, color = "#ffffff", size = 13) {
  if (!state.floating_texts) state.floating_texts = [];
  if (state.floating_texts.length > 50) state.floating_texts.shift();
  state.floating_texts.push({
    x, y,
    text,
    color,
    size,
    vy: -48,
    lifetime: 0.70,
    max_lifetime: 0.70
  });
}

// Load persistent mistake notebook from localStorage
try {
  const savedMistakes = localStorage.getItem("lexicon_mistakes");
  if (savedMistakes) {
    state.mistake_words = JSON.parse(savedMistakes);
  }
} catch (e) {
  console.warn("Could not load saved mistakes", e);
}

// Ambient motes
for (let i = 0; i < 45; i++) {
  state.ambient_motes.push({
    x: (Math.random() - 0.5) * 2300,
    y: (Math.random() - 0.5) * 1700,
    radius: 1.0 + Math.random() * 2.5,
    alpha: 0.2 + Math.random() * 0.55,
    speed: 15 + Math.random() * 25,
    angle: Math.random() * Math.PI * 2
  });
}

// =========================================
// 6. ASSET LOADER
// =========================================
const images = {};
const spriteList = [
  "upgrade_v1/hero_inky.png", "upgrade_v1/hero_quillmaster.png",
  "upgrade_v1/hero_word_knight.png", "upgrade_v1/hero_rune_sorceress.png",
  "upgrade_v1/hero_alchemist.png", "upgrade_v1/hero_shadow_scribe.png",
  "upgrade_v1/animations/inky_idle_0.png", "upgrade_v1/animations/inky_idle_1.png", "upgrade_v1/animations/inky_idle_2.png", "upgrade_v1/animations/inky_idle_3.png", "upgrade_v1/animations/inky_run_0.png", "upgrade_v1/animations/inky_run_1.png", "upgrade_v1/animations/inky_run_2.png", "upgrade_v1/animations/inky_run_3.png", "upgrade_v1/animations/inky_attack_0.png", "upgrade_v1/animations/inky_attack_1.png", "upgrade_v1/animations/inky_attack_2.png", "upgrade_v1/animations/inky_attack_3.png",
  "upgrade_v1/animations/word_knight_idle_0.png", "upgrade_v1/animations/word_knight_idle_1.png", "upgrade_v1/animations/word_knight_idle_2.png", "upgrade_v1/animations/word_knight_idle_3.png", "upgrade_v1/animations/word_knight_run_0.png", "upgrade_v1/animations/word_knight_run_1.png", "upgrade_v1/animations/word_knight_run_2.png", "upgrade_v1/animations/word_knight_run_3.png", "upgrade_v1/animations/word_knight_attack_0.png", "upgrade_v1/animations/word_knight_attack_1.png", "upgrade_v1/animations/word_knight_attack_2.png", "upgrade_v1/animations/word_knight_attack_3.png", "upgrade_v1/animations/shadow_scribe_idle_0.png", "upgrade_v1/animations/shadow_scribe_idle_1.png", "upgrade_v1/animations/shadow_scribe_idle_2.png", "upgrade_v1/animations/shadow_scribe_idle_3.png", "upgrade_v1/animations/shadow_scribe_run_0.png", "upgrade_v1/animations/shadow_scribe_run_1.png", "upgrade_v1/animations/shadow_scribe_run_2.png", "upgrade_v1/animations/shadow_scribe_run_3.png", "upgrade_v1/animations/shadow_scribe_attack_0.png", "upgrade_v1/animations/shadow_scribe_attack_1.png", "upgrade_v1/animations/shadow_scribe_attack_2.png", "upgrade_v1/animations/shadow_scribe_attack_3.png",
  "upgrade_v1/animations/quillmaster_idle_0.png", "upgrade_v1/animations/quillmaster_idle_1.png", "upgrade_v1/animations/quillmaster_idle_2.png", "upgrade_v1/animations/quillmaster_idle_3.png", "upgrade_v1/animations/quillmaster_run_0.png", "upgrade_v1/animations/quillmaster_run_1.png", "upgrade_v1/animations/quillmaster_run_2.png", "upgrade_v1/animations/quillmaster_run_3.png", "upgrade_v1/animations/quillmaster_attack_0.png", "upgrade_v1/animations/quillmaster_attack_1.png", "upgrade_v1/animations/quillmaster_attack_2.png", "upgrade_v1/animations/quillmaster_attack_3.png",
  "upgrade_v1/animations/rune_sorceress_idle_0.png", "upgrade_v1/animations/rune_sorceress_idle_1.png", "upgrade_v1/animations/rune_sorceress_idle_2.png", "upgrade_v1/animations/rune_sorceress_idle_3.png", "upgrade_v1/animations/rune_sorceress_run_0.png", "upgrade_v1/animations/rune_sorceress_run_1.png", "upgrade_v1/animations/rune_sorceress_run_2.png", "upgrade_v1/animations/rune_sorceress_run_3.png", "upgrade_v1/animations/rune_sorceress_attack_0.png", "upgrade_v1/animations/rune_sorceress_attack_1.png", "upgrade_v1/animations/rune_sorceress_attack_2.png", "upgrade_v1/animations/rune_sorceress_attack_3.png",
  "upgrade_v1/animations/alchemist_idle_0.png", "upgrade_v1/animations/alchemist_idle_1.png", "upgrade_v1/animations/alchemist_idle_2.png", "upgrade_v1/animations/alchemist_idle_3.png", "upgrade_v1/animations/alchemist_run_0.png", "upgrade_v1/animations/alchemist_run_1.png", "upgrade_v1/animations/alchemist_run_2.png", "upgrade_v1/animations/alchemist_run_3.png", "upgrade_v1/animations/alchemist_attack_0.png", "upgrade_v1/animations/alchemist_attack_1.png", "upgrade_v1/animations/alchemist_attack_2.png", "upgrade_v1/animations/alchemist_attack_3.png",
  "upgrade_v1/monster_grammar_goblin.png", "upgrade_v1/monster_typo_slime.png",
  "upgrade_v1/monster_punctuation_phantom.png", "upgrade_v1/monster_spelling_spectre.png",
  "upgrade_v1/monster_typo_splinter.png", "upgrade_v1/monster_homophone_harpy.png",
  "upgrade_v1/monster_idiom_imp.png", "upgrade_v1/monster_tautology_twin.png",
  "upgrade_v1/monster_dangling_modifier.png", "upgrade_v1/monster_double_negative_drake.png",
  "upgrade_v1/monster_run_on_reaper.png",
  "upgrade_v1/monster_lexicon_dragon_boss.png", "upgrade_v1/monster_red_pen_boss.png",
  "upgrade_v1/threat_seal.png",
  "player.png", "player_quillmaster.png", "player_knight.png",
  "player_sorceress.png", "player_alchemist.png", "player_assassin.png",
  // 14 Weapons
  "quill_blaster.png", "syllable_shotgun.png", "lexicon_beam.png",
  "punctuation_bomb.png", "punctuation_mine.png", "dictionary_blade.png",
  "crossword_crossbow.png", "hyphen_boomerang.png", "ink_flamethrower.png",
  "thesaurus_rocket.png", "quote_pistols.png", "calligraphy_katana.png",
  "scroll_turret.png", "rune_orb.png", "grammar_sniper.png",
  // Gadgets
  "eraser_icon.png", "gadget_ink_bomb.png", "gadget_time_stop.png",
  "gadget_shield.png", "gadget_magnet.png",
  // Bullets & Drops
  "bullet_bolt.png", "bullet_boomerang.png", "bullet_rocket.png",
  "bullet_flame.png", "bullet_enemy_red.png", "ink_bullet.png", "ink_drop.png",
  // Enemies
  "typo_slime.png", "typo_splinter.png", "grammar_goblin.png",
  "punctuation_phantom.png", "syntax_titan.png", "spelling_spectre.png",
  "red_pen_boss.png", "oxymoron_ogre.png", "vocabulary_void.png",
  "malapropism_mimic.png", "homophone_harpy.png", "idiom_imp.png",
  "lexicon_dragon_boss.png", "elite_crown.png",
  "tautology_twin.png", "run_on_reaper.png", "dangling_modifier.png",
  "double_negative_drake.png", "palindrome_phantom.png",
  // Environment & UI
  "upgrade_v1/arena_dungeon.png", "upgrade_v1/arena_observatory.png", "upgrade_v1/arena_void.png",
  "upgrade_v1/arena_frame_library.png", "upgrade_v1/arena_frame_dungeon.png",
  "upgrade_v1/arena_frame_observatory.png", "upgrade_v1/arena_frame_void.png",
  "tile_floor.png", "tile_library_parquet.png", "magical_rune_circle.png",
  "tile_dungeon_stone.png", "magical_rune_cyan.png",
  "tile_astral_observatory.png", "magical_rune_astral.png",
  "tile_void_sanctum.png", "magical_rune_void.png",
  "brazier_pedestal.png", "illuminated_lectern.png", "touch_weapon_icon.png",
  "bookshelf_wall.png", "wax_seal.png"
];

function loadAssets(callback) {
  let loaded = 0;
  const generatedEnemyAliases = {
    "upgrade_v1/monster_grammar_goblin.png": "grammar_goblin.png",
    "upgrade_v1/monster_typo_slime.png": "typo_slime.png",
    "upgrade_v1/monster_punctuation_phantom.png": "punctuation_phantom.png",
    "upgrade_v1/monster_spelling_spectre.png": "spelling_spectre.png",
    "upgrade_v1/monster_typo_splinter.png": "typo_splinter.png",
    "upgrade_v1/monster_homophone_harpy.png": "homophone_harpy.png",
    "upgrade_v1/monster_idiom_imp.png": "idiom_imp.png",
    "upgrade_v1/monster_tautology_twin.png": "tautology_twin.png",
    "upgrade_v1/monster_dangling_modifier.png": "dangling_modifier.png",
    "upgrade_v1/monster_double_negative_drake.png": "double_negative_drake.png",
    "upgrade_v1/monster_run_on_reaper.png": "run_on_reaper.png",
    "upgrade_v1/monster_lexicon_dragon_boss.png": "lexicon_dragon_boss.png",
    "upgrade_v1/monster_red_pen_boss.png": "red_pen_boss.png"
  };
  spriteList.forEach(name => {
    const img = new Image();
    img.src = "assets/sprites/" + name;
    img.onload = () => {
      loaded++;
      images[name] = img;
      if (generatedEnemyAliases[name]) images[generatedEnemyAliases[name]] = img;
      if (loaded === spriteList.length) callback();
    };
    img.onerror = () => {
      loaded++;
      console.warn("Could not load sprite:", name);
      if (loaded === spriteList.length) callback();
    };
  });
}

// Load Questions JSON
fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    state.questions = data;
    console.log("Loaded questions:", state.questions.length);
  })
  .catch(err => console.error("Failed loading questions.json:", err));

// =========================================
// 7. CONTROLS, INVENTORY & FULLSCREEN
// =========================================
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
let lastTime = performance.now();

// Adaptive Responsive Canvas Viewport for Zero-Void Mobile Experience
function resizeGameCanvas() {
  const container = document.getElementById("game-container");
  if (!container || !canvas) return;
  const isMobile = window.innerWidth <= 1080 || ('ontouchstart' in window);

  if (isMobile) {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    const isPortrait = h > w;

    if (isPortrait) {
      canvas.width = 720;
      canvas.height = Math.round(720 * (h / Math.max(1, w)));
    } else {
      canvas.height = 720;
      canvas.width = Math.round(720 * (w / Math.max(1, h)));
    }
  } else {
    canvas.width = 1280;
    canvas.height = 720;
  }
}
window.addEventListener("resize", resizeGameCanvas);
window.addEventListener("orientationchange", () => setTimeout(resizeGameCanvas, 150));
resizeGameCanvas();

// Fullscreen
document.getElementById("fullscreen-btn").onclick = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
};

const touchToggleBtn = document.getElementById("touch-toggle-btn");
if (touchToggleBtn) {
  touchToggleBtn.onclick = () => {
    const controls = document.getElementById("mobile-touch-controls");
    if (controls) {
      const isVisible = window.getComputedStyle(controls).display !== "none";
      controls.style.display = isVisible ? "none" : "block";
    }
  };
}

const musicBtn = document.getElementById("music-btn");
function toggleMusic() {
  sounds.init();
  if (!bgm.isPlaying) {
    bgm.isMuted = false;
    bgm.start();
    return true;
  }
  return bgm.toggleMute();
}

if (musicBtn) {
  musicBtn.onclick = (e) => {
    e.stopPropagation();
    const isUnmuted = toggleMusic();
    musicBtn.textContent = isUnmuted ? "MÜZİK" : "MÜZİK KAPALI";
    updateMobileQuickMenuUI();
  };
}

// =========================================
// SPEED & AUTO NEW RUN CONTROLS
// =========================================
const SPEED_STEPS = [0.5, 1.0, 1.5, 2.0, 3.0];

function setGameSpeed(speed) {
  state.game_speed = speed;
  const speedText = speed.toFixed(1) + "x";

  const speedBtn = document.getElementById("speed-btn");
  if (speedBtn) speedBtn.textContent = `HIZ ${speedText}`;
  const titleSpeedBtn = document.getElementById("title-speed-btn");
  if (titleSpeedBtn) titleSpeedBtn.innerHTML = `<img class="ui-icon" src="assets/ui/icons/speed.svg" alt="">Hız: ${speedText}`;

  const toast = document.getElementById("speed-toast");
  if (toast) {
    toast.textContent = `OYUN HIZI: ${speedText}`;
    toast.style.display = "block";
    toast.style.opacity = "1";
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.style.display = "none";
    }, 1100);
  }
}

function cycleGameSpeed() {
  const cur = state.game_speed || 1.0;
  const idx = SPEED_STEPS.indexOf(cur);
  const nextIdx = (idx === -1 || idx === SPEED_STEPS.length - 1) ? 0 : idx + 1;
  setGameSpeed(SPEED_STEPS[nextIdx]);
}

function adjustGameSpeed(direction) {
  const cur = state.game_speed || 1.0;
  let idx = SPEED_STEPS.indexOf(cur);
  if (idx === -1) idx = 1;
  const nextIdx = Math.max(0, Math.min(SPEED_STEPS.length - 1, idx + direction));
  setGameSpeed(SPEED_STEPS[nextIdx]);
}

function toggleAutoNewTur() {
  state.auto_new_tur = !state.auto_new_tur;
  try {
    localStorage.setItem("lexicon_auto_new_tur", state.auto_new_tur ? "true" : "false");
  } catch(e){}
  updateAutoTurUI();
  const shopScreen = document.getElementById("shop-screen");
  if (shopScreen && shopScreen.style.display !== "none") {
    if (state.auto_new_tur) startShopAutoWaveCountdown(4);
    else clearShopAutoWaveTimer();
  }
}

function updateAutoTurUI() {
  const isAuto = !!state.auto_new_tur;
  const btn = document.getElementById("auto-tur-btn");
  if (btn) {
    btn.textContent = isAuto ? "OTO TUR: AÇIK" : "OTO TUR: KAPALI";
    btn.style.color = isAuto ? "#587767" : "#7c7668";
    btn.style.borderColor = isAuto ? "#718a79" : "#827965";
  }
  const titleBtn = document.getElementById("title-auto-tur-btn");
  if (titleBtn) {
    titleBtn.textContent = isAuto ? "Otomatik Tur: AÇIK" : "Otomatik Tur: KAPALI";
    titleBtn.style.color = isAuto ? "#587767" : "#7c7668";
  }
  const shopBtn = document.getElementById("shop-auto-tur-btn");
  if (shopBtn) {
    shopBtn.textContent = isAuto ? "Oto Tur: AÇIK" : "Oto Tur: KAPALI";
    shopBtn.style.color = isAuto ? "#587767" : "#7c7668";
  }
}

let shopAutoWaveTimer = null;
let shopAutoWaveEndTime = 0;

function startShopAutoWaveCountdown(seconds) {
  if (!state.auto_new_tur) return;
  const container = document.getElementById("shop-auto-wave-container");
  const label = document.getElementById("shop-auto-wave-label");
  const bar = document.getElementById("shop-auto-wave-bar");
  const nextWaveText = document.getElementById("shop-next-wave-text");
  if (!container || !label || !bar) return;

  container.style.display = "block";
  shopAutoWaveEndTime = Date.now() + seconds * 1000;

  if (shopAutoWaveTimer) clearInterval(shopAutoWaveTimer);
  shopAutoWaveTimer = setInterval(() => {
    const leftMs = shopAutoWaveEndTime - Date.now();
    const leftSec = Math.max(0, Math.ceil(leftMs / 1000));
    label.textContent = `Otomatik sonraki tur: ${leftSec}s`;
    if (nextWaveText) {
      nextWaveText.textContent = `SONRAKİ DALGA · ${leftSec}s`;
    }
    const pct = Math.max(0, Math.min(100, (leftMs / (seconds * 1000)) * 100));
    bar.style.width = pct + "%";

    if (leftMs <= 0) {
      clearShopAutoWaveTimer();
      advanceNextWave();
    }
  }, 100);
}

function clearShopAutoWaveTimer() {
  if (shopAutoWaveTimer) {
    clearInterval(shopAutoWaveTimer);
    shopAutoWaveTimer = null;
  }
  const container = document.getElementById("shop-auto-wave-container");
  if (container) container.style.display = "none";
  const nextWaveText = document.getElementById("shop-next-wave-text");
  if (nextWaveText) {
    nextWaveText.textContent = "SONRAKİ DALGA";
  }
}

function advanceNextWave() {
  const shopScreen = document.getElementById("shop-screen");
  if (state.is_wave_active || !shopScreen || shopScreen.style.display === "none" || state.current_wave >= state.max_waves) return;
  clearShopAutoWaveTimer();
  shopScreen.style.display = "none";
  state.current_wave++;
  startWave();
  syncMobileControlsVisibility();
}

function toggleAutoNewRun() {
  state.auto_new_run = !state.auto_new_run;
  try {
    localStorage.setItem("lexicon_auto_new_run", state.auto_new_run ? "true" : "false");
  } catch(e){}
  updateAutoRunUI();
}

function updateAutoRunUI() {
  const isAuto = !!state.auto_new_run;
  const btn = document.getElementById("auto-run-btn");
  if (btn) {
    btn.textContent = isAuto ? "OTO RUN: AÇIK" : "OTO RUN: KAPALI";
    btn.style.color = isAuto ? "#587767" : "#7c7668";
    btn.style.borderColor = isAuto ? "#718a79" : "#827965";
  }
  const titleBtn = document.getElementById("title-auto-run-btn");
  if (titleBtn) {
    titleBtn.textContent = isAuto ? "Otomatik Yeni Run: AÇIK" : "Otomatik Yeni Run: KAPALI";
    titleBtn.style.color = isAuto ? "#587767" : "#7c7668";
  }
  const goBtn = document.getElementById("gameover-auto-run-toggle");
  if (goBtn) {
    goBtn.textContent = isAuto ? "Oto Run: AÇIK" : "Oto Run: KAPALI";
    goBtn.style.color = isAuto ? "#587767" : "#7c7668";
  }
}

let autoRunTimer = null;
let autoRunEndTime = 0;

function startAutoRunCountdown(seconds) {
  if (!state.auto_new_run) return;
  const container = document.getElementById("auto-run-countdown-container");
  const text = document.getElementById("auto-run-countdown-text");
  const bar = document.getElementById("auto-run-countdown-bar");
  if (!container || !text || !bar) return;

  container.style.display = "block";
  autoRunEndTime = Date.now() + seconds * 1000;

  if (autoRunTimer) clearInterval(autoRunTimer);
  autoRunTimer = setInterval(() => {
    const leftMs = autoRunEndTime - Date.now();
    const leftSec = Math.max(0, Math.ceil(leftMs / 1000));
    text.textContent = `Otomatik yeni run: ${leftSec}s`;
    const pct = Math.max(0, Math.min(100, (leftMs / (seconds * 1000)) * 100));
    bar.style.width = pct + "%";

    if (leftMs <= 0) {
      clearAutoRunCountdown();
      instantStartRun();
    }
  }, 100);
}

function clearAutoRunCountdown() {
  if (autoRunTimer) {
    clearInterval(autoRunTimer);
    autoRunTimer = null;
  }
  const container = document.getElementById("auto-run-countdown-container");
  if (container) container.style.display = "none";
}

function instantStartRun() {
  clearAutoRunCountdown();
  document.getElementById("game-over-screen").style.display = "none";
  document.getElementById("title-screen").style.display = "none";
  sounds.init();
  bgm.start();
  bgm.setMode("battle");
  startGame();
  syncMobileControlsVisibility();
}

const speedBtn = document.getElementById("speed-btn");
if (speedBtn) {
  speedBtn.onclick = (e) => {
    e.stopPropagation();
    cycleGameSpeed();
  };
}

const autoTurBtn = document.getElementById("auto-tur-btn");
if (autoTurBtn) {
  autoTurBtn.onclick = (e) => {
    e.stopPropagation();
    toggleAutoNewTur();
  };
}

const autoRunBtn = document.getElementById("auto-run-btn");
if (autoRunBtn) {
  autoRunBtn.onclick = (e) => {
    e.stopPropagation();
    toggleAutoNewRun();
  };
}

const titleSpeedBtn = document.getElementById("title-speed-btn");
if (titleSpeedBtn) {
  titleSpeedBtn.onclick = (e) => {
    e.stopPropagation();
    cycleGameSpeed();
  };
}

const titleAutoTurBtn = document.getElementById("title-auto-tur-btn");
if (titleAutoTurBtn) {
  titleAutoTurBtn.onclick = (e) => {
    e.stopPropagation();
    toggleAutoNewTur();
  };
}

const titleAutoRunBtn = document.getElementById("title-auto-run-btn");
if (titleAutoRunBtn) {
  titleAutoRunBtn.onclick = (e) => {
    e.stopPropagation();
    toggleAutoNewRun();
  };
}

const instantRestartBtn = document.getElementById("instant-restart-btn");
if (instantRestartBtn) {
  instantRestartBtn.onclick = (e) => {
    e.stopPropagation();
    instantStartRun();
  };
}

const gameoverAutoRunToggle = document.getElementById("gameover-auto-run-toggle");
if (gameoverAutoRunToggle) {
  gameoverAutoRunToggle.onclick = (e) => {
    e.stopPropagation();
    toggleAutoNewRun();
    if (state.auto_new_run) {
      startAutoRunCountdown(3);
    } else {
      clearAutoRunCountdown();
    }
  };
}

const cancelAutoRunBtn = document.getElementById("cancel-auto-run-btn");
if (cancelAutoRunBtn) {
  cancelAutoRunBtn.onclick = (e) => {
    e.stopPropagation();
    clearAutoRunCountdown();
  };
}

const shopAutoTurBtn = document.getElementById("shop-auto-tur-btn");
if (shopAutoTurBtn) {
  shopAutoTurBtn.onclick = (e) => {
    e.stopPropagation();
    toggleAutoNewTur();
  };
}

const shopCancelAutoBtn = document.getElementById("shop-auto-wave-cancel-btn");
if (shopCancelAutoBtn) {
  shopCancelAutoBtn.onclick = (e) => {
    e.stopPropagation();
    clearShopAutoWaveTimer();
  };
}

// Inventory modal toggle
document.getElementById("inventory-btn").onclick = () => toggleInventoryModal();
document.getElementById("close-inventory-btn").onclick = () => toggleInventoryModal(false);
document.getElementById("gadget-panel").onclick = () => activateActiveGadget();

// Mobile Quick Menu & Weapon Cycle
function cycleActiveWeapon(dir = 1) {
  if (state.weapons.length <= 1) return;
  state.active_weapon_index = (state.active_weapon_index + dir + state.weapons.length) % state.weapons.length;
  sounds.playTone(420, "sine", 0.07, 0.16);
  updateHUD();
}

function toggleMobileQuickMenu(forcedState) {
  const modal = document.getElementById("mobile-quick-menu");
  if (!modal) return;
  const isCurrentlyOpen = modal.style.display !== "none" && modal.style.display !== "";
  const show = forcedState !== undefined ? forcedState : !isCurrentlyOpen;
  modal.style.display = show ? "flex" : "none";
  syncMobileControlsVisibility();
  if (show) {
    updateMobileQuickMenuUI();
  }
}

function updateMobileQuickMenuUI() {
  const speedOpts = document.querySelectorAll(".mobile-speed-opt");
  speedOpts.forEach(btn => {
    const spd = parseFloat(btn.dataset.speed);
    if (Math.abs(spd - (state.game_speed || 1.0)) < 0.01) {
      btn.classList.add("btn-seal");
    } else {
      btn.classList.remove("btn-seal");
    }
  });

  const autoTurBtn = document.getElementById("mobile-toggle-autowave-btn");
  if (autoTurBtn) {
    autoTurBtn.textContent = state.auto_new_tur ? "Otomatik Tur: AÇIK" : "Otomatik Tur: KAPALI";
    if (state.auto_new_tur) autoTurBtn.classList.add("btn-emerald");
    else autoTurBtn.classList.remove("btn-emerald");
  }

  const autoRunBtn = document.getElementById("mobile-toggle-autorun-btn");
  if (autoRunBtn) {
    autoRunBtn.textContent = state.auto_new_run ? "Otomatik Run: AÇIK" : "Otomatik Run: KAPALI";
    if (state.auto_new_run) autoRunBtn.classList.add("btn-emerald");
    else autoRunBtn.classList.remove("btn-emerald");
  }

  const musicBtn = document.getElementById("mobile-toggle-music-btn");
  if (musicBtn) {
    musicBtn.textContent = bgm.isMuted ? "Müzik: KAPALI" : "Müzik: AÇIK";
  }

  const joyBtn = document.getElementById("mobile-toggle-joy-btn");
  if (joyBtn) {
    const active = state.show_touch_controls !== false;
    joyBtn.textContent = active ? "Sanal joystick: açık" : "Sanal joystick: kapalı";
  }
}

const mobileMenuBtn = document.getElementById("mobile-menu-btn");
if (mobileMenuBtn) {
  mobileMenuBtn.onclick = (e) => {
    e.stopPropagation();
    toggleMobileQuickMenu();
  };
}

const closeMobileMenuBtn = document.getElementById("close-mobile-menu-btn");
if (closeMobileMenuBtn) {
  closeMobileMenuBtn.onclick = (e) => {
    e.stopPropagation();
    toggleMobileQuickMenu(false);
  };
}

const mobileAutoTurBtn = document.getElementById("mobile-toggle-autowave-btn");
if (mobileAutoTurBtn) {
  mobileAutoTurBtn.onclick = (e) => {
    e.stopPropagation();
    toggleAutoNewTur();
    updateMobileQuickMenuUI();
  };
}

const mobileAutoRunBtn = document.getElementById("mobile-toggle-autorun-btn");
if (mobileAutoRunBtn) {
  mobileAutoRunBtn.onclick = (e) => {
    e.stopPropagation();
    toggleAutoNewRun();
    updateMobileQuickMenuUI();
  };
}

const mobileMusicBtn = document.getElementById("mobile-toggle-music-btn");
if (mobileMusicBtn) {
  mobileMusicBtn.onclick = (e) => {
    e.stopPropagation();
    toggleMusic();
    updateMobileQuickMenuUI();
  };
}

const mobileOpenInvBtn = document.getElementById("mobile-open-inv-btn");
if (mobileOpenInvBtn) {
  mobileOpenInvBtn.onclick = (e) => {
    e.stopPropagation();
    toggleMobileQuickMenu(false);
    toggleInventoryModal(true);
  };
}

const mobileOpenMistakesBtn = document.getElementById("mobile-open-mistakes-btn");
if (mobileOpenMistakesBtn) {
  mobileOpenMistakesBtn.onclick = (e) => {
    e.stopPropagation();
    toggleMobileQuickMenu(false);
    toggleMistakesModal(true);
  };
}

const mobileToggleJoyBtn = document.getElementById("mobile-toggle-joy-btn");
if (mobileToggleJoyBtn) {
  mobileToggleJoyBtn.onclick = (e) => {
    e.stopPropagation();
    state.show_touch_controls = (state.show_touch_controls === false);
    syncMobileControlsVisibility();
    updateMobileQuickMenuUI();
  };
}

const mobileToggleFsBtn = document.getElementById("mobile-toggle-fs-btn");
if (mobileToggleFsBtn) {
  mobileToggleFsBtn.onclick = (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };
}

document.querySelectorAll(".mobile-speed-opt").forEach(btn => {
  btn.onclick = (e) => {
    e.stopPropagation();
    setGameSpeed(parseFloat(btn.dataset.speed));
    updateMobileQuickMenuUI();
  };
});

function triggerTacticalAlert(title, desc, tone = "threat") {
  const banner = document.getElementById("tactical-alert-banner");
  const titleEl = document.getElementById("tactical-alert-title");
  const descEl = document.getElementById("tactical-alert-desc");
  if (!banner || !titleEl || !descEl) return;
  const isBiome = tone === "biome";
  banner.style.borderColor = isBiome ? "#7b8978" : "#a75d50";
  titleEl.style.color = isBiome ? "#c9cfb3" : "#e2a79c";
  titleEl.textContent = title;
  descEl.textContent = desc;
  banner.style.display = "block";
  banner.style.opacity = "1";
  if (state.alert_timeout) clearTimeout(state.alert_timeout);
  state.alert_timeout = setTimeout(() => {
    banner.style.opacity = "0";
    setTimeout(() => { banner.style.display = "none"; }, 400);
  }, 4200);
}

const chapterTransitions = [
  {
    title: "KARANLIK KÜTÜPHANE",
    kicker: "BÖLÜM I · DALGALAR 01–25",
    narration: "Kayıp kelimeleri rafların arasından geri çağır.",
    accent: "#c5aa72",
    numeral: "I"
  },
  {
    title: "SÖZ DEHLİZİ",
    kicker: "BÖLÜM II · DALGALAR 26–50",
    narration: "Taş kapı açılır; duvarlardaki yanlış kelimeler uyanır.",
    accent: "#99a99d",
    numeral: "II"
  },
  {
    title: "ASTRAL GÖZLEMEVİ",
    kicker: "BÖLÜM III · DALGALAR 51–75",
    narration: "Dehlizin son kapısı açılır; yıldızlar yeni sözcükler dizer.",
    accent: "#9baad1",
    numeral: "III"
  },
  {
    title: "SON SAYFA",
    kicker: "BÖLÜM IV · DALGALAR 76–100",
    narration: "Kitap kapanır; boşlukta son kelimeler uyanır.",
    accent: "#bd91b7",
    numeral: "IV"
  }
];

let chapterCardTimeout = null;

function showChapterCard(stageIndex) {
  const chapter = chapterTransitions[Math.max(0, Math.min(chapterTransitions.length - 1, stageIndex))];
  const card = document.getElementById("chapter-transition-card");
  if (!card) return;
  card.style.setProperty("--chapter-accent", chapter.accent);
  document.getElementById("chapter-transition-kicker").textContent = chapter.kicker;
  document.getElementById("chapter-transition-number").textContent = chapter.numeral;
  document.getElementById("chapter-transition-title").textContent = chapter.title;
  document.getElementById("chapter-transition-narration").textContent = chapter.narration;
  card.hidden = false;
  card.classList.remove("is-leaving");
  if (chapterCardTimeout) clearTimeout(chapterCardTimeout);
  chapterCardTimeout = setTimeout(() => {
    card.classList.add("is-leaving");
    setTimeout(() => { card.hidden = true; }, 350);
  }, 5600);
}

function getChapterForWave(wave) {
  return chapterTransitions[wave >= 76 ? 3 : wave >= 51 ? 2 : wave >= 26 ? 1 : 0];
}

function toggleInventoryModal(forcedState) {
  const modal = document.getElementById("inventory-modal");
  const isVisible = forcedState !== undefined ? !forcedState : (modal.style.display === "flex");
  modal.style.display = isVisible ? "none" : "flex";
  if (!isVisible) {
    renderInventoryView();
  }
  syncMobileControlsVisibility();
}

// Scribe's Mistake Notebook (Hata Defteri & Pekiştirme)
const mistakesBtn = document.getElementById("mistakes-btn");
if (mistakesBtn) mistakesBtn.onclick = () => toggleMistakesModal();
const closeMistakesBtn = document.getElementById("close-mistakes-btn");
if (closeMistakesBtn) closeMistakesBtn.onclick = () => toggleMistakesModal(false);
const clearMistakesBtn = document.getElementById("clear-mistakes-btn");
if (clearMistakesBtn) clearMistakesBtn.onclick = () => clearMistakes();

function toggleMistakesModal(forcedState) {
  const modal = document.getElementById("mistakes-modal");
  if (!modal) return;
  const isVisible = forcedState !== undefined ? !forcedState : (modal.style.display === "flex");
  modal.style.display = isVisible ? "none" : "flex";
  if (!isVisible) {
    renderMistakesList();
  }
  syncMobileControlsVisibility();
}

function renderMistakesList() {
  const listEl = document.getElementById("mistakes-list");
  const summaryEl = document.getElementById("mistakes-summary-text");
  if (!listEl || !summaryEl) return;
  listEl.innerHTML = "";

  if (!state.mistake_words || state.mistake_words.length === 0) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: 25px; font-family: 'IBM Plex Sans', serif; color: #1b4d2e;">
        <strong style="font-size: 16px; font-family: 'IBM Plex Serif', serif;">Hata defteri temiz</strong>
        <p style="font-size: 13px; color: #634325; margin-top: 4px;">Henüz bilinemeyen bir kelime yok. Sınavlarda harika bir başarı gösteriyorsun!</p>
      </div>
    `;
    summaryEl.textContent = "Kayıtlı pekiştirilecek hata bulunmuyor.";
    return;
  }

  summaryEl.textContent = `Toplam ${state.mistake_words.length} kelime pekiştirilmeyi bekliyor (Sonraki turlarda önünüze çıkacaktır)`;

  state.mistake_words.forEach(m => {
    const card = document.createElement("div");
    card.className = "mistake-card";
    card.innerHTML = `
      <div class="mistake-card-top">
        <span class="mistake-word">${m.word} <span style="font-size: 11px; color: #7a481d;">[${m.type} • ${m.level}]</span></span>
        <span class="mistake-badge">Hata: ${m.fail_count || 1} Kez (Dalga ${m.last_failed_wave || 1})</span>
      </div>
      <div class="mistake-desc"><strong>Soru:</strong> ${m.question}</div>
      <div class="mistake-desc" style="color: #1b4d2e;"><strong>Doğru Yanıt:</strong> <em>"${m.correct_answer}"</em></div>
      ${m.example ? `<div class="mistake-ex">Örnek: "${m.example}"</div>` : ''}
    `;
    listEl.appendChild(card);
  });
}

function clearMistakes() {
  if (confirm("Kâtip Hata Defterindeki tüm kelimeler sıfırlansın mı?")) {
    state.mistake_words = [];
    try { localStorage.removeItem("lexicon_mistakes"); } catch(e){}
    renderMistakesList();
    updateHUD();
  }
}

const keys = {};
window.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
  if (e.code === "Space" || e.key === "Shift") {
    activateActiveGadget();
    e.preventDefault();
  }
  if (e.key.toLowerCase() === "i") {
    toggleInventoryModal();
  }
  if (e.key.toLowerCase() === "m") {
    toggleMistakesModal();
  }
  if (e.key.toLowerCase() === "q") {
    switchPrevWeapon();
  } else if (e.key.toLowerCase() === "e") {
    switchNextWeapon();
  } else if (e.key >= "1" && e.key <= "6") {
    selectWeaponIndex(parseInt(e.key) - 1);
  } else if (e.key === "[" || e.key === "-") {
    adjustGameSpeed(-1);
  } else if (e.key === "]" || e.key === "+" || e.key === "=") {
    adjustGameSpeed(1);
  } else if (e.key === "0") {
    setGameSpeed(1.0);
  }
});
window.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});
window.addEventListener("contextmenu", e => {
  e.preventDefault();
  activateActiveGadget();
});
window.addEventListener("wheel", e => {
  if (e.deltaY > 0) switchNextWeapon();
  else if (e.deltaY < 0) switchPrevWeapon();
}, { passive: true });

function switchNextWeapon() {
  if (state.equipped_weapons.length <= 1) return;
  state.active_weapon_index = (state.active_weapon_index + 1) % state.equipped_weapons.length;
  sounds.playTone(480, "sine", 0.08, 0.15);
  syncWeapons();
  updateHUD();
}

function switchPrevWeapon() {
  if (state.equipped_weapons.length <= 1) return;
  state.active_weapon_index = (state.active_weapon_index - 1 + state.equipped_weapons.length) % state.equipped_weapons.length;
  sounds.playTone(440, "sine", 0.08, 0.15);
  syncWeapons();
  updateHUD();
}

function selectWeaponIndex(idx) {
  if (idx >= 0 && idx < state.equipped_weapons.length) {
    state.active_weapon_index = idx;
    sounds.playTone(460, "sine", 0.08, 0.15);
    syncWeapons();
    updateHUD();
  }
}

// =========================================
// 7.5 MOBILE VIRTUAL JOYSTICK & TOUCH CONTROLS
// =========================================
let touchControlsInitialized = false;
function initTouchControls() {
  if (touchControlsInitialized) return;
  touchControlsInitialized = true;
  const joystickZone = document.getElementById("joystick-zone");
  const joystickBase = document.getElementById("joystick-base");
  const joystickKnob = document.getElementById("joystick-knob");
  const touchSurface = document.getElementById("touch-joystick-surface");
  const touchWeaponBtn = document.getElementById("touch-weapon-btn");
  const touchGadgetBtn = document.getElementById("touch-gadget-btn");
  const touchInvBtn = document.getElementById("touch-inv-btn");
  const touchMistakesBtn = document.getElementById("touch-mistakes-btn");

  if (touchWeaponBtn) {
    const cycleWeapon = (e) => {
      e.preventDefault();
      e.stopPropagation();
      triggerHaptic("light");
      cycleActiveWeapon(1);
    };
    touchWeaponBtn.onclick = cycleWeapon;
  }

  if (touchGadgetBtn) {
    const fireGadget = (e) => {
      e.preventDefault();
      e.stopPropagation();
      triggerHaptic("medium");
      activateActiveGadget();
    };
    touchGadgetBtn.onclick = fireGadget;
  }

  if (touchInvBtn) {
    const openInv = (e) => {
      e.preventDefault();
      e.stopPropagation();
      triggerHaptic("light");
      toggleInventoryModal();
    };
    touchInvBtn.onclick = openInv;
  }

  if (touchMistakesBtn) {
    const openMistakes = (e) => {
      e.preventDefault();
      e.stopPropagation();
      triggerHaptic("light");
      toggleMistakesModal();
    };
    touchMistakesBtn.onclick = openMistakes;
  }

  if (!joystickZone || !joystickBase || !joystickKnob) return;

  let activeTouchId = null;
  let centerX = 0;
  let centerY = 0;
  const maxRadius = 45;

  function updateJoystickPosition(clientX, clientY) {
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist < 8) {
      state.touch_dir = { x: 0, y: 0 };
      joystickKnob.style.transform = "translate(0px, 0px)";
      return;
    }

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, maxRadius);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;

    // A confident flick (>14px) delivers 100% full directional speed immediately,
    // eliminating any floaty, sluggish feeling on mobile and matching PC WASD velocity!
    const speedFactor = dist >= 16 ? 1.0 : (dist - 8) / 8;
    state.touch_dir = {
      x: Math.cos(angle) * speedFactor,
      y: Math.sin(angle) * speedFactor
    };
  }

  function resetJoystick() {
    activeTouchId = null;
    state.touch_dir = { x: 0, y: 0 };
    joystickKnob.style.transform = "translate(0px, 0px)";
    joystickZone.style.opacity = "0.8";
  }

  const startFloatingAt = (clientX, clientY, identifier) => {
    if (activeTouchId !== null) return;
    activeTouchId = identifier;

    // Dynamically anchor joystick base directly to thumb position
    const container = document.getElementById("game-container") || document.body;
    const cRect = container.getBoundingClientRect();
    const relX = clientX - cRect.left;
    const relY = clientY - cRect.top;

    joystickZone.style.left = (relX - 60) + "px";
    joystickZone.style.top = (relY - 60) + "px";
    joystickZone.style.bottom = "auto";
    joystickZone.style.opacity = "1";

    centerX = clientX;
    centerY = clientY;
    updateJoystickPosition(clientX, clientY);
  };

  const supportsPointerEvents = "PointerEvent" in window;
  if (touchSurface) {
    if (supportsPointerEvents) touchSurface.addEventListener("pointerdown", (e) => {
      startFloatingAt(e.clientX, e.clientY, e.pointerId);
      try { touchSurface.setPointerCapture(e.pointerId); } catch(err){}
      e.preventDefault();
    });
    else touchSurface.addEventListener("touchstart", (e) => {
      const touch = e.changedTouches[0];
      startFloatingAt(touch.clientX, touch.clientY, touch.identifier);
      e.preventDefault();
    }, { passive: false });
  }

  const onJoystickPointerDown = (e) => {
    if (activeTouchId !== null) return;
    startFloatingAt(e.clientX, e.clientY, e.pointerId);
    try { joystickZone.setPointerCapture(e.pointerId); } catch(err){}
    e.preventDefault();
  };
  const onJoystickTouchStart = (e) => {
    if (activeTouchId !== null || !e.changedTouches.length) return;
    const touch = e.changedTouches[0];
    startFloatingAt(touch.clientX, touch.clientY, touch.identifier);
    e.preventDefault();
  };
  if (supportsPointerEvents) joystickZone.addEventListener("pointerdown", onJoystickPointerDown);
  else joystickZone.addEventListener("touchstart", onJoystickTouchStart, { passive: false });

  const onPointerMove = (e) => {
    if (activeTouchId === e.pointerId) {
      updateJoystickPosition(e.clientX, e.clientY);
      e.preventDefault();
    }
  };
  const onTouchMove = (e) => {
    if (activeTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId) {
        updateJoystickPosition(touch.clientX, touch.clientY);
        e.preventDefault();
        break;
      }
    }
  };
  if (supportsPointerEvents) window.addEventListener("pointermove", onPointerMove);
  else window.addEventListener("touchmove", onTouchMove, { passive: false });

  const endPointer = (e) => {
    if (activeTouchId === e.pointerId) {
      resetJoystick();
    }
  };
  if (supportsPointerEvents) {
    window.addEventListener("pointerup", endPointer);
    window.addEventListener("pointercancel", endPointer);
  }

  const endTouch = (e) => {
    if (activeTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId) {
        resetJoystick();
        break;
      }
    }
  };
  if (!supportsPointerEvents) {
    window.addEventListener("touchend", endTouch);
    window.addEventListener("touchcancel", endTouch);
  }
}

// =========================================
// 7.8 MOBILE CONTROLS VISIBILITY SYNC
// =========================================
function syncMobileControlsVisibility() {
  const controls = document.getElementById("mobile-touch-controls");
  if (!controls) return;
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 1080;
  const isOverlayOpen =
    (document.getElementById("title-screen") && document.getElementById("title-screen").style.display !== "none") ||
    (document.getElementById("shop-screen") && document.getElementById("shop-screen").style.display !== "none") ||
    (document.getElementById("game-over-screen") && document.getElementById("game-over-screen").style.display !== "none") ||
    (document.getElementById("quiz-modal") && document.getElementById("quiz-modal").style.display === "flex") ||
    (document.getElementById("inventory-modal") && document.getElementById("inventory-modal").style.display === "flex") ||
    (document.getElementById("mistakes-modal") && document.getElementById("mistakes-modal").style.display === "flex") ||
    (document.getElementById("mobile-quick-menu") && document.getElementById("mobile-quick-menu").style.display !== "none");

  if (state.is_wave_active && !isOverlayOpen && isTouch && state.show_touch_controls !== false) {
    controls.style.display = "block";
  } else {
    controls.style.display = "none";
  }
}

// =========================================
// 8. TITLE & START GAME (6 CHARACTERS)
// =========================================
function initTitleScreen() {
  syncMobileControlsVisibility();
  const charGrid = document.getElementById("char-selection-grid");
  charGrid.innerHTML = "";
  ["inky", "quillmaster", "word_knight", "rune_sorceress", "lexicon_alchemist", "shadow_lexicographer"].forEach(cid => {
    const c = CHARACTERS[cid];
    const card = document.createElement("div");
    card.className = "choice-card" + (cid === state.selected_char ? " selected" : "");
    card.setAttribute("role", "button");
    card.setAttribute("aria-pressed", String(cid === state.selected_char));
    card.setAttribute("aria-label", `${c.name} karakterini seç`);
    card.tabIndex = 0;
    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="assets/sprites/${c.sprite}" style="width: 26px; height: 26px; image-rendering: pixelated;" alt="${c.name}">
          <div>
            <h3 style="margin: 0; font-size: 13.5px;">${c.name}</h3>
            <div class="subtitle" style="margin: 0; font-size: 10px;">${c.title}</div>
          </div>
        </div>
        <div class="stats-text" style="font-size: 9.5px; text-align: right; line-height: 1.25;">
          ${c.hp} HP | ${c.damage_mult}× hasar<br>${c.speed} hız ${c.armor > 0 ? '| %' + Math.round(c.armor*100) + ' zırh' : ''}
        </div>
      </div>
      <div class="desc" style="font-size: 10.5px; margin: 3px 0 2px 0;">${c.desc}</div>
      <div class="passive" style="font-size: 9.5px; padding-top: 2px;">${c.passive}</div>
    `;

    const pickChar = (e) => {
      if (e) e.stopPropagation();
      state.selected_char = cid;
      sounds.init();
      sounds.playTone(480, "sine", 0.08, 0.15);
      initTitleScreen();
    };
    card.onclick = pickChar;
    card.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        pickChar(e);
      }
    };
    charGrid.appendChild(card);
  });

  const diffContainer = document.getElementById("diff-selection-container");
  diffContainer.innerHTML = "";
  ["easy", "normal", "hard"].forEach(did => {
    const d = DIFFICULTIES[did];
    const btn = document.createElement("button");
    btn.className = "btn" + (did === state.difficulty ? " btn-seal" : "");
    btn.textContent = d.name;
    const pickDiff = (e) => {
      if (e) e.stopPropagation();
      state.difficulty = did;
      sounds.init();
      sounds.playTone(420, "sine", 0.08, 0.15);
      initTitleScreen();
    };
    btn.onclick = pickDiff;
    diffContainer.appendChild(btn);
  });

  document.getElementById("diff-desc").textContent = DIFFICULTIES[state.difficulty].desc;
  updateAutoTurUI();
  updateAutoRunUI();
  setGameSpeed(state.game_speed || 1.0);
}

const onStartGame = (e) => {
  if (e) e.stopPropagation();
  if (state.is_wave_active) return;
  sounds.init();
  bgm.start();
  bgm.setMode("battle");
  document.getElementById("title-screen").style.display = "none";
  startGame();
};
document.getElementById("start-game-btn").onclick = onStartGame;

function resetStats() {
  const c = CHARACTERS[state.selected_char];
  const d = DIFFICULTIES[state.difficulty];

  state.max_hp = c.hp + d.player_hp_bonus;
  state.hp = state.max_hp;
  state.move_speed = c.speed;
  state.damage_mult = c.damage_mult;
  state.attack_speed_mult = c.attack_speed_mult;
  state.armor = c.armor;
  state.crit_chance = c.crit_chance;
  state.pickup_radius = 150;
  state.projectile_count = 1;
  state.pierce_count = 1;
  state.ink_mult = d.ink_bonus_mult;

  state.max_weapon_slots = 4;
  state.equipped_weapons = [{ id: c.starting_weapon, tier: 1 }];
  state.reserve_weapons = [];
  state.active_weapon_index = 0;

  state.active_gadget_id = c.starting_gadget || "eraser_dash";
  state.gadget_timer = 0;
  state.chrono_timer = 0;
  state.shield_charges = 0;

  state.current_wave = 1;
  state.ink_count = 15;
  state.kill_count = 0;
  state.words_learned = [];
  state.active_synergies = {};
  state.artifacts_owned = [];

  state.player.x = 0;
  state.player.y = 0;
  state.player.vx = 0;
  state.player.vy = 0;
  state.player.invuln_timer = 0;
  state.player.is_dashing = false;
  state.player.dash_timer = 0;
  state.player.dash_hit_ids = new Set();
  state.player.attack_anim_timer = 0;
  state.player.slow_timer = 0;

  state.enemies = [];
  state.enemy_projectiles = [];
  state.projectiles = [];
  state.punctuation_mines = [];
  state.turrets = [];
  state.ink_drops = [];
  state.health_drops = [];
  state.ink_puddles = [];
  state.particles = [];
  state.active_boss = null;

  document.getElementById("boss-hp-container").style.display = "none";

  syncWeapons();
  updateHUD();
}

function syncWeapons() {
  state.weapons = [];
  state.equipped_weapons.forEach((item, i) => {
    const wData = WEAPONS_CATALOG[item.id] || WEAPONS_CATALOG["quill_blaster"];
    const tierBonus = TIER_MULTIPLIERS[item.tier] || TIER_MULTIPLIERS[1];
    state.weapons.push({
      id: item.id,
      data: wData,
      tier: item.tier,
      tier_data: tierBonus,
      shoot_timer: 0.1 * i,
      rotation: 0,
      recoil: 0,
      flash_timer: 0,
      swing_timer: 0,
      swing_hit: false,
      is_active: (i === state.active_weapon_index),
      alt_side: false
    });
  });
}

function startGame() {
  resetStats();
  startWave();
}

function startWave() {
  state.wave_duration = Math.min(42.0, 22.0 + (state.current_wave - 1) * 0.25);
  state.wave_time_left = state.wave_duration;
  state.is_wave_active = true;
  if (state.selected_char === "lexicon_alchemist") state.ink_count += 10;
  document.getElementById("shop-screen").style.display = "none";
  updateHUD();
  syncMobileControlsVisibility();
  bgm.start();
  bgm.setMode(state.current_wave % 5 === 0 ? "boss" : "battle");
  bgm.setBiomeForWave(state.current_wave);

  // Tactical Alert Announcements on Key Waves
  const w = state.current_wave;
  if (w === 1 || w === 26 || w === 51 || w === 76) {
    showChapterCard(w >= 76 ? 3 : w >= 51 ? 2 : w >= 26 ? 1 : 0);
  } else if (w === 10) {
    triggerTacticalAlert("RED PEN INQUISITOR", "Elebaşının etrafında dönün ve kırmızı mermilerden sakının!");
  } else if (w === 15) {
    triggerTacticalAlert("KALKANLI MUHAFIZLAR", "Ön zırhları %75 hasar emer. Arkadan vurun veya bomba kullanın.");
  } else if (w === 25) {
    triggerTacticalAlert("IŞINLANAN SUİKASTÇİLER", "Kırmızı zemin işaretlerine dikkat edin; belirdiklerinde Silgi Atılımı yapın.");
  } else if (w === 35) {
    triggerTacticalAlert("AURA LİDERLERİ", "Yakındaki canavarları %35 hızlandırırlar. Önce liderleri hedefleyin.");
  } else if (w === 50) {
    triggerTacticalAlert("LEKSİKON EJDERHASI", "Lazer çizgilerinden kaçının; mermi fırtınasında atılımı zamanlayın.");
  } else if (w === 65) {
    triggerTacticalAlert("PATLAYICI GOLEMLER", "Ölüm patlamalarını düşman sürülerine karşı kullanın.");
  } else if (w === 75) {
    triggerTacticalAlert("ASTROLABE MERKEZİ", "Kozmik çekim ve spiral mermilere karşı hareketli kalın.");
  } else if (w === 85) {
    triggerTacticalAlert("ŞAMPİYONLAR ORDUSU", "Kalkanlılar ve Aura liderleri birlikte. Silahınızı duruma göre değiştirin.");
  } else if (w === 100) {
    triggerTacticalAlert("OMEGA EJDERHA", "Son kuşatma başladı. Cephaneliğinizi ve gereçlerinizi kullanın.");
  }

  // Milestone Boss every 5 waves
  if (state.current_wave % 5 === 0) {
    setTimeout(() => {
      if (state.is_wave_active) spawnMilestoneBoss(state.current_wave);
    }, 1800);
  }
}

function endWave() {
  if (!state.is_wave_active) return;
  state.is_wave_active = false;
  // Enemies still alive when the timer expires were not defeated by the player.
  // Clear them without awarding kill credit, drops, or rewards.
  state.enemies = [];
  state.enemy_projectiles = [];
  state.active_boss = null;
  document.getElementById("boss-hp-container").style.display = "none";
  syncMobileControlsVisibility();
  bgm.setMode("peaceful");

  if (state.current_wave >= state.max_waves) {
    victoryScreen();
  } else {
    openShop();
  }
}

// =========================================
// 9. GADGET ACTIVATION LOGIC (5 GADGETS)
// =========================================
function activateActiveGadget() {
  if (state.gadget_timer > 0 || !state.is_wave_active) return;
  const gid = state.active_gadget_id;
  const gData = GADGETS_CATALOG[gid] || GADGETS_CATALOG["eraser_dash"];
  state.gadget_timer = gData.cooldown;
  sounds.gadget();

  const p = state.player;

  if (gid === "eraser_dash") {
    let dx = 0, dy = 0;
    if (state.touch_dir && (state.touch_dir.x !== 0 || state.touch_dir.y !== 0)) {
      dx = state.touch_dir.x;
      dy = state.touch_dir.y;
    } else {
      if (keys["w"] || keys["arrowup"]) dy -= 1;
      if (keys["s"] || keys["arrowdown"]) dy += 1;
      if (keys["a"] || keys["arrowleft"]) dx -= 1;
      if (keys["d"] || keys["arrowright"]) dx += 1;
    }
    if (dx === 0 && dy === 0) dx = p.facing_left ? -1 : 1;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;

    p.is_dashing = true;
    p.dash_timer = 0.22;
    p.dash_dir = { x: dx, y: dy };
    p.dash_hit_ids = new Set();
    p.invuln_timer = 0.28;
    triggerHaptic("medium");
    triggerScreenShake(0.12, 3.5);

    const eraseDmg = 65.0 * state.damage_mult;
    state.enemies.forEach(e => {
      if (!p.dash_hit_ids.has(e) && Math.hypot(e.x - p.x, e.y - p.y) < 75) {
        p.dash_hit_ids.add(e);
        e.hp -= eraseDmg;
        e.vx = dx * 360; e.vy = dy * 360;
        addFloatingText(e.x, e.y - 12, `${Math.round(eraseDmg)}`, "#55efc4", 15);
      }
    });
  } else if (gid === "ink_cataclysm") {
    // Screen-wide ink bomb: delete all enemy projectiles, stun & deal AoE damage
    state.enemy_projectiles = [];
    state.particles.push({
      x: p.x, y: p.y, radius: 20, max_radius: 360,
      alpha: 1.0, color: "rgba(147, 51, 234, "
    });
    state.enemies.forEach(e => {
      const dist = Math.hypot(e.x - p.x, e.y - p.y);
      if (dist < 340) {
        e.hp -= 85.0 * state.damage_mult;
        e.vx = 0; e.vy = 0;
        e.speed *= 0.1; // Stunned for 2.5s
        setTimeout(() => { e.speed /= 0.1; }, 2500);
      }
    });
  } else if (gid === "chrono_comma") {
    state.chrono_timer = 4.0;
    state.particles.push({
      x: p.x, y: p.y, radius: 10, max_radius: 280,
      alpha: 0.9, color: "rgba(56, 189, 248, "
    });
  } else if (gid === "lexicon_aegis") {
    state.shield_charges = 4;
    state.particles.push({
      x: p.x, y: p.y, radius: 10, max_radius: 80,
      alpha: 1.0, color: "rgba(56, 189, 248, "
    });
  } else if (gid === "grammar_magnet") {
    // Instantly attract all ink drops & health parchments on map
    state.ink_drops.forEach(d => { d.x = p.x; d.y = p.y; });
    state.health_drops.forEach(h => { h.x = p.x; h.y = p.y; });
    sounds.pickup();
    state.particles.push({
      x: p.x, y: p.y, radius: 10, max_radius: 200,
      alpha: 1.0, color: "rgba(250, 204, 21, "
    });
  }
}

// =========================================
// 10. SIMULTANEOUS WEAPONS FIRING & PLAYER LOGIC
// =========================================
function updatePlayer(dt) {
  const p = state.player;

  if (state.gadget_timer > 0) state.gadget_timer -= dt;
  if (state.chrono_timer > 0) state.chrono_timer -= dt;
  if (p.invuln_timer > 0) p.invuln_timer -= dt;
  if (p.slow_timer > 0) p.slow_timer -= dt;
  if (p.attack_anim_timer > 0) p.attack_anim_timer = Math.max(0, p.attack_anim_timer - dt);

  const effectiveSpeed = p.slow_timer > 0 ? state.move_speed * 0.72 : state.move_speed;

  if (p.is_dashing) {
    p.dash_timer -= dt;
    const dashSpd = effectiveSpeed * 3.0 + 280;
    p.x += p.dash_dir.x * dashSpd * dt;
    p.y += p.dash_dir.y * dashSpd * dt;

    const eraseDmg = 65.0 * state.damage_mult;
    state.enemies.forEach(e => {
      if (!p.dash_hit_ids.has(e) && Math.hypot(e.x - p.x, e.y - p.y) < 65) {
        p.dash_hit_ids.add(e);
        e.hp -= eraseDmg;
        e.vx = p.dash_dir.x * 320;
        e.vy = p.dash_dir.y * 320;
        addFloatingText(e.x, e.y - 12, `${Math.round(eraseDmg)}`, "#55efc4", 15);
      }
    });
    if (p.dash_timer <= 0) p.is_dashing = false;
  } else {
    let dx = 0, dy = 0;
    if (keys["w"] || keys["arrowup"]) dy -= 1;
    if (keys["s"] || keys["arrowdown"]) dy += 1;
    if (keys["a"] || keys["arrowleft"]) dx -= 1;
    if (keys["d"] || keys["arrowright"]) dx += 1;

    // Mobile Virtual Touch Joystick integration
    if (state.touch_dir && (state.touch_dir.x !== 0 || state.touch_dir.y !== 0)) {
      dx = state.touch_dir.x;
      dy = state.touch_dir.y;
    } else if (dx !== 0 && dy !== 0) {
      dx *= 0.7071; dy *= 0.7071;
    }

    p.vx = dx * effectiveSpeed;
    p.vy = dy * effectiveSpeed;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    if (dx !== 0) p.facing_left = dx < 0;
  }

  p.x = Math.max(-1168, Math.min(1168, p.x));
  p.y = Math.max(-868, Math.min(868, p.y));

  // Ink drops
  state.ink_drops.forEach(drop => {
    const dist = Math.hypot(drop.x - p.x, drop.y - p.y);
    if (dist < state.pickup_radius) {
      const pull = (380 + (state.pickup_radius - dist) * 2.5) * dt;
      drop.x += ((p.x - drop.x) / dist) * pull;
      drop.y += ((p.y - drop.y) / dist) * pull;
      if (dist < 24) {
        drop.collected = true;
        sounds.pickup();
        const earned = Math.ceil(drop.value * state.ink_mult);
        state.ink_count += earned;
        addFloatingText(p.x + (Math.random() - 0.5) * 20, p.y - 20, `+${earned}`, "#a9c6b6", 12);
        updateHUD();
      }
    }
  });
  state.ink_drops = state.ink_drops.filter(d => !d.collected);

  // Health Drops / Şifa Parşömeni (+18 HP)
  state.health_drops.forEach(drop => {
    const dist = Math.hypot(drop.x - p.x, drop.y - p.y);
    if (dist < state.pickup_radius) {
      const pull = (380 + (state.pickup_radius - dist) * 2.5) * dt;
      drop.x += ((p.x - drop.x) / dist) * pull;
      drop.y += ((p.y - drop.y) / dist) * pull;
      if (dist < 26) {
        drop.collected = true;
        sounds.pickup();
        const healing = Math.round(drop.value * (state.selected_char === "lexicon_alchemist" ? 1.5 : 1.0));
        state.hp = Math.min(state.max_hp, state.hp + healing);
        addFloatingText(p.x, p.y - 25, `+${healing} HP`, "#4ade80", 14);
        triggerHaptic("light");
        state.particles.push({
          x: p.x, y: p.y, radius: 10, max_radius: 50,
          alpha: 1.0, color: "rgba(34, 197, 94, "
        });
        updateHUD();
      }
    }
  });
  state.health_drops = state.health_drops.filter(d => !d.collected);

  // Floating Combat Damage Numbers update
  if (state.floating_texts && state.floating_texts.length) {
    for (let i = state.floating_texts.length - 1; i >= 0; i--) {
      const ft = state.floating_texts[i];
      ft.y += ft.vy * dt;
      ft.lifetime -= dt;
      if (ft.lifetime <= 0) state.floating_texts.splice(i, 1);
    }
  }

  // Screen shake decay
  if (state.screen_shake > 0) {
    state.screen_shake -= dt;
    if (state.screen_shake <= 0) state.shake_intensity = 0;
  }

  // Ink puddles slow
  state.ink_puddles.forEach(puddle => {
    puddle.lifetime -= dt;
    if (Math.hypot(puddle.x - p.x, puddle.y - p.y) < puddle.radius) {
      p.slow_timer = 1.0;
    }
  });
  state.ink_puddles = state.ink_puddles.filter(puddle => puddle.lifetime > 0);

  // ALL SLOTTED WEAPONS FIRE SIMULTANEOUSLY (Brotato Mechanic!)
  state.weapons.forEach((w, idx) => {
    w.shoot_timer -= dt;
    w.recoil = Math.max(0, (w.recoil || 0) - dt * 8.5);
    w.flash_timer = Math.max(0, (w.flash_timer || 0) - dt);
    if (w.swing_timer > 0) {
      const previousSwing = w.swing_timer;
      w.swing_timer = Math.max(0, w.swing_timer - dt);
      if (!w.swing_hit && previousSwing > 0.11 && w.swing_timer <= 0.11) {
        w.swing_hit = true;
        resolveMeleeWeaponHit(w);
      }
    }

    let nearest = null;
    let minDist = 650;
    state.enemies.forEach(e => {
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < minDist) {
        minDist = d;
        nearest = e;
      }
    });

    if (nearest) {
      w.rotation = Math.atan2(nearest.y - p.y, nearest.x - p.x);
    }

    let effectiveAtkSpd = Math.max(0.1, state.attack_speed_mult);
    if (state.chrono_timer > 0) effectiveAtkSpd *= 1.40;
    if (idx === state.active_weapon_index) effectiveAtkSpd *= 1.25;

    const tierCdMult = w.tier_data.cooldown || 1.0;
    const effectiveCd = Math.max(0.06, (w.data.cooldown * tierCdMult) / effectiveAtkSpd);

    if (w.shoot_timer <= 0) {
      w.shoot_timer = effectiveCd;

      if (w.id === "dictionary_blade") {
        sounds.shoot("dictionary_blade");
        w.swing_timer = 0.24;
        w.swing_hit = false;
        p.attack_anim_timer = 0.28;
      } else if (w.id === "calligraphy_katana") {
        sounds.shoot("calligraphy_katana");
        const slashDmg = w.data.damage * (w.tier_data.damage || 1.0) * state.damage_mult;
        w.swing_timer = 0.28;
        w.swing_hit = false;
        p.attack_anim_timer = 0.28;
        // Crescent ink wave projectile forward
        if (nearest) {
          const dirX = Math.cos(w.rotation); const dirY = Math.sin(w.rotation);
          spawnProjectile({
            type: "katana_wave", x: p.x, y: p.y, dx: dirX, dy: dirY,
            dmg: slashDmg * 0.8, pierce: 3, spd: 540, color: "#38bdf8", size: 28
          });
        }
      } else if (w.id === "scroll_turret") {
        // Place turret near player
        if (state.turrets.length < 3) {
          state.turrets.push({
            x: p.x + (Math.random() - 0.5) * 60,
            y: p.y + (Math.random() - 0.5) * 60,
            lifetime: 14.0, shoot_timer: 0.35, damage: w.data.damage * (w.tier_data.damage || 1.0)
          });
        }
      } else if (w.id === "punctuation_bomb") {
        dropPunctuationMine(w, nearest);
      } else if (nearest) {
        shootWeapon(w, nearest);
      }
    }
  });

  // Update Turrets
  state.turrets.forEach(t => {
    t.lifetime -= dt;
    t.shoot_timer -= dt;
    if (t.shoot_timer <= 0) {
      t.shoot_timer = 0.45;
      let near = null; let minD = 500;
      state.enemies.forEach(e => {
        const d = Math.hypot(e.x - t.x, e.y - t.y);
        if (d < minD) { minD = d; near = e; }
      });
      if (near) {
        sounds.shoot("scroll_turret");
        const dirX = (near.x - t.x) / minD;
        const dirY = (near.y - t.y) / minD;
        spawnProjectile({
          type: "turret_bolt", x: t.x, y: t.y, dx: dirX, dy: dirY,
          dmg: t.damage * state.damage_mult, pierce: 1, spd: 620, color: "#00e5ff", size: 16
        });
      }
    }
  });
  state.turrets = state.turrets.filter(t => t.lifetime > 0);

  updatePunctuationMines(dt);
  updateProjectiles(dt);
}

function dropPunctuationMine(w, target) {
  sounds.shoot("punctuation_bomb");
  w.recoil = 0.75;
  w.flash_timer = 0.05;
  state.player.attack_anim_timer = 0.28;
  const p = state.player;
  let offX = (Math.random() - 0.5) * 60;
  let offY = (Math.random() - 0.5) * 60;
  if (target) {
    const ang = Math.atan2(target.y - p.y, target.x - p.x);
    offX = Math.cos(ang) * 50;
    offY = Math.sin(ang) * 50;
  }
  const isCrit = Math.random() < state.crit_chance;
  state.punctuation_mines.push({
    x: p.x + offX, y: p.y + offY,
    damage: w.data.damage * (w.tier_data.damage || 1.0) * state.damage_mult * (isCrit ? 2.0 : 1.0),
    blast_radius: 140, lifetime: 8.0, pulse: 0
  });
}

function updatePunctuationMines(dt) {
  state.punctuation_mines.forEach(mine => {
    mine.pulse += dt * 5;
    mine.lifetime -= dt;
    let trigger = (mine.lifetime <= 0);
    if (!trigger) {
      for (const e of state.enemies) {
        if (Math.hypot(e.x - mine.x, e.y - mine.y) < 36) { trigger = true; break; }
      }
    }
    if (trigger && !mine.detonated) {
      mine.detonated = true;
      sounds.detonateMine();
      state.particles.push({
        x: mine.x, y: mine.y, radius: 12, max_radius: mine.blast_radius,
        alpha: 1.0, color: "rgba(255, 120, 20, "
      });
      state.enemies.forEach(e => {
        const d = Math.hypot(e.x - mine.x, e.y - mine.y);
        if (d <= mine.blast_radius) {
          const falloff = 1.0 - (d / mine.blast_radius) * 0.35;
          e.hp -= mine.damage * falloff;
          const ang = Math.atan2(e.y - mine.y, e.x - mine.x);
          e.vx = Math.cos(ang) * 320; e.vy = Math.sin(ang) * 320;
        }
      });
    }
  });
  state.punctuation_mines = state.punctuation_mines.filter(m => !m.detonated);
}

// =========================================
// 11. PROJECTILES (14 WEAPONS)
// =========================================
function shootWeapon(w, target) {
  w.recoil = 1.0;
  w.flash_timer = 0.065;
  state.player.attack_anim_timer = 0.28;
  const p = state.player;
  const isCrit = Math.random() < (state.crit_chance + (w.tier_data.crit || 0));
  const critMult = isCrit ? 2.0 : 1.0;
  const tierDmg = w.tier_data.damage || 1.0;
  const baseDmg = w.data.damage * tierDmg * state.damage_mult * critMult;
  const extraPrc = w.tier_data.pierce || 0;
  const extraProj = w.tier_data.projectile || 0;
  const dirX = Math.cos(w.rotation);
  const dirY = Math.sin(w.rotation);

  sounds.shoot(w.id);

  switch (w.id) {
    case "quill_blaster": {
      const count = state.projectile_count + extraProj;
      if (count === 1) {
        spawnProjectile({
          type: "quill", x: p.x, y: p.y, dx: dirX, dy: dirY,
          dmg: baseDmg, pierce: state.pierce_count + extraPrc, spd: 590,
          color: "#fff8e7", crit: isCrit, sprite: "ink_bullet.png", size: 18
        });
      } else {
        const spread = 0.22;
        const start = -((count - 1) * spread) / 2;
        for (let i = 0; i < count; i++) {
          const ang = w.rotation + start + i * spread;
          spawnProjectile({
            type: "quill", x: p.x, y: p.y, dx: Math.cos(ang), dy: Math.sin(ang),
            dmg: baseDmg, pierce: state.pierce_count + extraPrc, spd: 590,
            color: "#fff8e7", crit: isCrit, sprite: "ink_bullet.png", size: 18
          });
        }
      }
      break;
    }
    case "syllable_shotgun": {
      const pellets = 5 + (state.projectile_count - 1 + extraProj) * 2;
      for (let i = 0; i < pellets; i++) {
        const spread = (Math.random() - 0.5) * 0.55;
        const spd = 480 + Math.random() * 150;
        spawnProjectile({
          type: "pellet", x: p.x, y: p.y, dx: Math.cos(w.rotation + spread), dy: Math.sin(w.rotation + spread),
          dmg: baseDmg * 0.85, pierce: 1 + extraPrc, spd: spd,
          color: "#ffa726", crit: isCrit, sprite: "bullet_flame.png", size: 16
        });
      }
      break;
    }
    case "lexicon_beam": {
      spawnProjectile({
        type: "beam", x: p.x, y: p.y, dx: dirX, dy: dirY,
        dmg: baseDmg * 1.1, pierce: state.pierce_count + 8 + extraPrc, spd: 960,
        color: "#5ce1e6", crit: isCrit, size: 24
      });
      break;
    }
    case "crossword_crossbow": {
      spawnProjectile({
        type: "crossword_bolt", x: p.x, y: p.y, dx: dirX, dy: dirY,
        dmg: baseDmg, pierce: 1 + extraPrc, spd: 630,
        color: "#d4af37", crit: isCrit, sprite: "bullet_bolt.png", size: 24
      });
      break;
    }
    case "hyphen_boomerang": {
      spawnProjectile({
        type: "boomerang", x: p.x, y: p.y, dx: dirX, dy: dirY,
        dmg: baseDmg, pierce: 999, spd: 530,
        color: "#ff7043", crit: isCrit, sprite: "bullet_boomerang.png", size: 24,
        origin_x: p.x, origin_y: p.y, time_alive: 0
      });
      break;
    }
    case "ink_flamethrower": {
      const spread = (Math.random() - 0.5) * 0.4;
      spawnProjectile({
        type: "flame", x: p.x + dirX * 20, y: p.y + dirY * 20,
        dx: Math.cos(w.rotation + spread), dy: Math.sin(w.rotation + spread),
        dmg: baseDmg, pierce: 3 + extraPrc, spd: 370 + Math.random() * 80,
        color: "#ff5722", crit: isCrit, sprite: "bullet_flame.png", size: 18, lifetime: 0.65
      });
      break;
    }
    case "thesaurus_rocket": {
      spawnProjectile({
        type: "rocket", x: p.x, y: p.y, dx: dirX, dy: dirY,
        dmg: baseDmg, pierce: 1, spd: 430,
        color: "#ab47bc", crit: isCrit, sprite: "bullet_rocket.png", size: 26
      });
      break;
    }
    case "quote_pistols": {
      w.alt_side = !w.alt_side;
      const side = (w.alt_side ? 1 : -1) * 12;
      spawnProjectile({
        type: "quote", x: p.x - dirY * side, y: p.y + dirX * side, dx: dirX, dy: dirY,
        dmg: baseDmg * 1.05, pierce: state.pierce_count + extraPrc, spd: 650,
        color: "#ffd54f", crit: isCrit, sprite: "bullet_bolt.png", size: 16
      });
      break;
    }
    case "rune_orb": {
      spawnProjectile({
        type: "bouncing_orb", x: p.x, y: p.y, dx: dirX, dy: dirY,
        dmg: baseDmg, pierce: 4 + extraPrc, spd: 510,
        color: "#f472b6", crit: isCrit, sprite: "rune_orb.png", size: 20
      });
      break;
    }
    case "grammar_sniper": {
      spawnProjectile({
        type: "rail_slug", x: p.x, y: p.y, dx: dirX, dy: dirY,
        dmg: baseDmg * 1.35, pierce: 12 + extraPrc, spd: 1100,
        color: "#00f0ff", crit: isCrit, size: 28
      });
      break;
    }
  }
}

function resolveMeleeWeaponHit(w) {
  const p = state.player;
  const range = w.id === "calligraphy_katana" ? 170 : 150;
  const force = w.id === "calligraphy_katana" ? 300 : 260;
  const damage = w.data.damage * (w.tier_data.damage || 1.0) * state.damage_mult;
  const forwardX = Math.cos(w.rotation);
  const forwardY = Math.sin(w.rotation);
  state.enemies.forEach(e => {
    const dx = e.x - p.x;
    const dy = e.y - p.y;
    const distance = Math.hypot(dx, dy);
    if (distance > range || distance < 0.001 || (dx / distance) * forwardX + (dy / distance) * forwardY < -0.1) return;
    e.hp -= damage;
    e.vx = (dx / distance) * force;
    e.vy = (dy / distance) * force;
  });
}

function spawnProjectile(proj) {
  state.projectiles.push(Object.assign({
    lifetime: 2.2, hitEnemies: new Set()
  }, proj));
}

function updateProjectiles(dt) {
  const p = state.player;

  state.projectiles.forEach(pr => {
    pr.lifetime -= dt;

    if (pr.type === "boomerang") {
      pr.time_alive = (pr.time_alive || 0) + dt;
      if (pr.time_alive < 0.6) {
        pr.x += pr.dx * pr.spd * dt; pr.y += pr.dy * pr.spd * dt;
      } else {
        const dist = Math.hypot(p.x - pr.x, p.y - pr.y);
        if (dist > 10) {
          pr.dx = (p.x - pr.x) / dist; pr.dy = (p.y - pr.y) / dist;
          pr.x += pr.dx * (pr.spd * 1.3) * dt; pr.y += pr.dy * (pr.spd * 1.3) * dt;
        }
        if (dist < 30 && pr.time_alive > 0.8) pr.pierce = 0;
      }
    } else {
      pr.x += pr.dx * pr.spd * dt;
      pr.y += pr.dy * pr.spd * dt;
    }

    state.enemies.forEach(e => {
      if (pr.pierce > 0 && !pr.hitEnemies.has(e)) {
        const hitDist = (pr.size || 18) / 2 + (e.size || 34) / 2;
        if (Math.hypot(e.x - pr.x, e.y - pr.y) < hitDist) {
          pr.hitEnemies.add(e);
          let effectiveDmg = pr.dmg;

          // Tactical Shielded Affix Check
          if (e.affix === "shielded") {
            const facingLeft = e.facing_left;
            const isFrontHit = facingLeft ? (pr.dx > 0) : (pr.dx < 0);
            if (isFrontHit && pr.type !== "rocket" && pr.type !== "punctuation_bomb") {
              effectiveDmg *= 0.25; // 75% absorbed by frontal shield!
              sounds.playTone(650, "triangle", 0.05, 0.14);
              state.particles.push({
                x: pr.x, y: pr.y, radius: 4, max_radius: 18, alpha: 0.85,
                color: "rgba(255, 215, 0, "
              });
            }
          }

          e.hp -= effectiveDmg;
          e.vx = pr.dx * 180;
          e.vy = pr.dy * 180;
          addFloatingText(e.x + (Math.random() - 0.5) * 16, e.y - 14, pr.crit ? `CRIT ${Math.round(effectiveDmg)}!` : `${Math.round(effectiveDmg)}`, pr.crit ? "#ffd700" : "#ffffff", pr.crit ? 16 : 13);
          if (pr.crit) triggerHaptic("light");
          if (pr.crit && state.selected_char === "shadow_lexicographer") {
            e.slow_timer = 1.2;
            e.slow_factor = 0.58;
          }
          pr.pierce--;

          if (pr.type === "crossword_bolt") {
            [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach(a => {
              spawnProjectile({
                type: "splinter_bolt", x: pr.x, y: pr.y,
                dx: Math.cos(a), dy: Math.sin(a), dmg: pr.dmg * 0.55,
                pierce: 1, spd: 460, color: "#ffd700", size: 14, lifetime: 0.8
              });
            });
          }

          if (pr.type === "rocket") {
            sounds.rocketBlast();
            state.particles.push({
              x: pr.x, y: pr.y, radius: 15, max_radius: 140,
              alpha: 1.0, color: "rgba(171, 71, 188, "
            });
            state.enemies.forEach(target => {
              if (Math.hypot(target.x - pr.x, target.y - pr.y) < 140) {
                target.hp -= pr.dmg * 0.75;
                const ang = Math.atan2(target.y - pr.y, target.x - pr.x);
                target.vx = Math.cos(ang) * 320; target.vy = Math.sin(ang) * 320;
              }
            });
          }
        }
      }
    });
  });

  state.projectiles = state.projectiles.filter(p => p.lifetime > 0 && p.pierce > 0);
}

// =========================================
// 12. HARDCORE 100-WAVE HORDE SYSTEM
// =========================================
const MAX_ALIVE_ENEMIES = 220;

function getWaveEnemyCap(wave = state.current_wave) {
  return Math.min(MAX_ALIVE_ENEMIES, 48 + Math.max(0, wave - 1) * 2);
}

function addAliveEnemy(enemy) {
  if (!enemy || enemy.dead) return false;
  // Keep radial spawns and boss formations inside the playable bounds.
  enemy.x = Math.max(-1150, Math.min(1150, enemy.x));
  enemy.y = Math.max(-850, Math.min(850, enemy.y));
  const aliveCount = state.enemies.reduce((count, current) => count + (current.dead ? 0 : 1), 0);
  if (aliveCount < getWaveEnemyCap()) {
    state.enemies.push(enemy);
    return true;
  }

  const isBoss = enemy.is_boss || enemy.type === "Red Pen Boss" || enemy.type === "Lexicon Dragon Boss";
  if (!isBoss) return false;

  // Keep a milestone boss visible even if the regular horde reached its cap.
  for (let i = state.enemies.length - 1; i >= 0; i--) {
    const current = state.enemies[i];
    const currentIsBoss = current.is_boss || current.type === "Red Pen Boss" || current.type === "Lexicon Dragon Boss";
    if (!current.dead && !currentIsBoss) {
      state.enemies.splice(i, 1);
      state.enemies.push(enemy);
      return true;
    }
  }
  return false;
}

function getArenaSpawnPosition(origin, minDistance = 560, preferredAngle = null) {
  const clampPoint = (x, y) => ({
    x: Math.max(-1150, Math.min(1150, x)),
    y: Math.max(-850, Math.min(850, y))
  });
  const firstAngle = preferredAngle ?? Math.random() * Math.PI * 2;
  for (let attempt = 0; attempt < 16; attempt++) {
    const angle = firstAngle + attempt * (Math.PI * 2 / 16);
    const point = clampPoint(origin.x + Math.cos(angle) * 700, origin.y + Math.sin(angle) * 700);
    if (Math.hypot(point.x - origin.x, point.y - origin.y) >= minDistance) return point;
  }

  const perimeter = [];
  for (let x = -1050; x <= 1050; x += 175) perimeter.push({x, y:-820}, {x, y:820});
  for (let y = -750; y <= 750; y += 150) perimeter.push({x:-1120, y}, {x:1120, y});
  const safePoints = perimeter.filter(point => Math.hypot(point.x - origin.x, point.y - origin.y) >= minDistance);
  if (safePoints.length) return safePoints[Math.floor(Math.random() * safePoints.length)];
  return clampPoint(0, 0);
}

let spawnTimer = 0.3;
const typoWords = ["Teh", "Woudl", "Recieve", "Becaue", "Definately", "Seperate", "Tomorow", "Untill", "Beautifull", "Acommodate"];
const grammarPairs = ["is/are", "have/has", "their/there", "your/you're", "its/it's", "to/too", "affect/effect"];
const phantomPunct = ["?", ";", "!", ":", "—", "..."];
const tautologyWords = ["free gift", "past history", "close proximity", "repeat again", "sum total", "safe haven", "final outcome"];
const palindromeWords = ["RACECAR", "MADAM", "ROTATOR", "KAYAK", "LEVEL", "DEIFIED", "NOON", "REVIVER"];
const danglingPhrases = ["Walking slowly...", "Hoping for rain...", "Having arrived...", "Running fast..."];
const doubleNegPhrases = ["not impossible", "never not", "scarcely none", "hardly unready", "can't no"];
const runOnSentences = ["neverending runon sentence with no pauses", "the sun shone and the wind blew and we kept walking", "words words words chained endlessly without fullstops"];

function getWaveHpMult(wave) {
  if (wave <= 25) {
    return 1.0 + (wave - 1) * 0.10;
  } else if (wave <= 50) {
    return 3.5 + (wave - 25) * 0.22 + Math.pow((wave - 25) / 12.0, 1.8);
  } else if (wave <= 75) {
    return 9.8 + (wave - 50) * 0.42 + Math.pow((wave - 50) / 9.0, 2.0);
  } else {
    return 22.5 + (wave - 75) * 0.75 + Math.pow((wave - 75) / 7.0, 2.2);
  }
}
function getWaveSpeedMult(wave) {
  if (wave <= 25) {
    return 1.0 + (wave - 1) * 0.006;
  } else if (wave <= 50) {
    return 1.15 + (wave - 25) * 0.012;
  } else if (wave <= 75) {
    return 1.45 + (wave - 50) * 0.010;
  } else {
    return 1.70 + Math.min(0.35, (wave - 75) * 0.012);
  }
}
function getWaveDamageMult(wave) {
  if (wave <= 25) {
    return 1.0 + (wave - 1) * 0.02;
  } else if (wave <= 50) {
    return 1.5 + (wave - 25) * 0.04;
  } else if (wave <= 75) {
    return 2.5 + (wave - 50) * 0.055;
  } else {
    return 3.9 + (wave - 75) * 0.07;
  }
}

function updateBossHealthBar() {
  const bar = document.getElementById("boss-hp-container");
  if (!bar) return;
  const aliveBosses = state.enemies.filter(e => (e.is_boss || e.type === "Red Pen Boss" || e.type === "Lexicon Dragon Boss") && !e.dead);
  if (aliveBosses.length === 0) {
    bar.style.display = "none";
    state.active_boss = null;
    return;
  }

  bar.style.display = "flex";
  let totalHp = 0;
  let totalMax = 0;
  aliveBosses.forEach(b => {
    totalHp += Math.max(0, b.hp);
    totalMax += b.max_hp;
  });
  const pct = totalMax > 0 ? (totalHp / totalMax) * 100 : 0;
  const fill = document.getElementById("boss-hp-fill");
  if (fill) fill.style.width = Math.max(0, Math.min(100, pct)) + "%";

  const title = document.getElementById("boss-hp-title");
  if (title) {
    if (aliveBosses.length === 1) {
      const bossName = aliveBosses[0].type === "Lexicon Dragon Boss" ? "LEKSİKON EJDERHASI" : "KIRMIZI KALEM";
      title.textContent = `${bossName} · %${Math.ceil(pct)}`;
    } else {
      title.textContent = `ELEBAŞLARI ORDUSU · ${aliveBosses.length} · %${Math.ceil(pct)}`;
    }
  }
}

function updateEnemies(dt) {
  if (!state.is_wave_active) return;

  state.wave_time_left -= dt;
  if (state.wave_time_left <= 0) {
    endWave();
    return;
  }

  // Update Active Tactical Telegraphs (Warning circles, bombs, lasers)
  if (state.telegraphs) {
    state.telegraphs.forEach(tg => {
      tg.timer -= dt;
      if (tg.timer <= 0 && !tg.executed) {
        tg.executed = true;
        if (tg.action) tg.action();
      }
    });
    state.telegraphs = state.telegraphs.filter(tg => tg.timer > 0);
  }

  // Hardcore Massive Horde Swarm Spawn Curve: rapid spawn rate & batch spawns
  spawnTimer -= dt;
  const diffFactor = state.difficulty === "easy" ? 1.15 : (state.difficulty === "hard" ? 0.75 : 1.0);
  const interval = Math.max(0.12, (0.60 - state.current_wave * 0.04) * diffFactor);

  if (spawnTimer <= 0) {
    spawnTimer = interval;
    // Match the readable early-wave cadence in the Godot build, then grow it.
    const batchCount = state.current_wave >= 25 ? 3 : (state.current_wave >= 8 ? 2 : 1);
    for (let s = 0; s < batchCount; s++) {
      const livingCount = state.enemies.reduce((count, enemy) => count + (enemy.dead ? 0 : 1), 0);
      if (livingCount < getWaveEnemyCap()) {
        spawnEnemy();
      }
    }
  }

  const p = state.player;
  const chronoMult = state.chrono_timer > 0 ? 0.15 : 1.0;

  // Commander Aura buff reset & calculation
  state.enemies.forEach(e => { e.is_buffed = false; });
  state.enemies.forEach(e => {
    if (e.affix === "commander" && !e.dead) {
      state.enemies.forEach(other => {
        if (other !== e && Math.hypot(other.x - e.x, other.y - e.y) < 160) {
          other.is_buffed = true;
        }
      });
    }
  });

  state.enemies.forEach(e => {
    e.vx *= Math.pow(0.06, dt);
    e.vy *= Math.pow(0.06, dt);
    e.slow_timer = Math.max(0, (e.slow_timer || 0) - dt);

    const dist = Math.hypot(p.x - e.x, p.y - e.y);
    const dirX = dist > 0.1 ? (p.x - e.x) / dist : 0;
    const dirY = dist > 0.1 ? (p.y - e.y) / dist : 0;
    e.facing_left = dirX < 0;

    let spd = e.speed * chronoMult * (e.slow_timer > 0 ? (e.slow_factor || 0.58) : 1.0);
    if (e.is_buffed) spd *= 1.35; // Commander aura buff!

    // Tactical Blinker Teleport
    if (e.affix === "blinker" && !e.dead) {
      e.blink_timer = (e.blink_timer || 3.8) - dt;
      if (e.blink_timer <= 0 && dist < 450) {
        e.blink_timer = 4.2;
        const targetX = p.x - dirX * 50;
        const targetY = p.y - dirY * 50;
        state.telegraphs.push({
          x: targetX, y: targetY, radius: 28, timer: 0.65, max_timer: 0.65,
          action: () => {
            if (e.dead) return;
            e.x = targetX; e.y = targetY;
            sounds.playTone(320, "sine", 0.10, 0.18);
            state.particles.push({
              x: targetX, y: targetY, radius: 8, max_radius: 35, alpha: 0.9,
              color: "rgba(239, 68, 68, "
            });
          }
        });
      }
    }

    switch (e.type) {
      case "Grammar Goblin": {
        e.dash_cooldown = (e.dash_cooldown || 3.0) - dt;
        if (e.dash_cooldown <= 0 && dist < 300) {
          e.dash_cooldown = 3.6;
          e.vx = dirX * 240 * chronoMult;
          e.vy = dirY * 240 * chronoMult;
        }
        e.x += (dirX * spd + e.vx) * dt;
        e.y += (dirY * spd + e.vy) * dt;
        break;
      }
      case "Punctuation Phantom": {
        e.shoot_cooldown = (e.shoot_cooldown || 2.4) - dt;
        if (dist < 200) {
          e.x -= dirX * spd * 0.6 * dt; e.y -= dirY * spd * 0.6 * dt;
        } else if (dist > 270) {
          e.x += dirX * spd * dt; e.y += dirY * spd * dt;
        }
        e.x += e.vx * dt; e.y += e.vy * dt;

        if (e.shoot_cooldown <= 0) {
          e.shoot_cooldown = 2.4;
          sounds.enemyShoot();
          spawnEnemyProjectile(e.x, e.y, dirX, dirY, e.damage * 0.85, 240 * chronoMult);
        }
        break;
      }
      case "Idiom Imp": {
        e.puddle_timer = (e.puddle_timer || 3.5) - dt;
        if (e.puddle_timer <= 0) {
          e.puddle_timer = 4.0;
          state.ink_puddles.push({ x: e.x, y: e.y, radius: 24, lifetime: 4.5 });
        }
        e.x += (dirX * spd + e.vx) * dt;
        e.y += (dirY * spd + e.vy) * dt;
        break;
      }
      case "Homophone Harpy": {
        e.dive_timer = (e.dive_timer || 3.5) - dt;
        if (e.dive_timer <= 0 && dist < 420) {
          e.dive_timer = 4.2;
          e.vx = dirX * 300 * chronoMult; e.vy = dirY * 300 * chronoMult;
          sounds.enemyShoot();
        }
        e.x += (dirX * spd + e.vx) * dt;
        e.y += (dirY * spd + e.vy) * dt;
        break;
      }
      case "Vocabulary Void": {
        if (dist < 340) {
          const pull = (1.0 - dist / 340) * 32 * dt;
          p.x += -dirX * pull; p.y += -dirY * pull;
        }
        e.x += (dirX * spd + e.vx) * dt;
        e.y += (dirY * spd + e.vy) * dt;
        break;
      }
      case "Oxymoron Ogre": {
        e.slam_timer = (e.slam_timer || 4.0) - dt;
        if (e.slam_timer <= 0 && dist < 130) {
          e.slam_timer = 4.5;
          sounds.detonateMine();
          state.particles.push({
            x: e.x, y: e.y, radius: 10, max_radius: 110,
            alpha: 1.0, color: "rgba(234, 88, 12, "
          });
          if (dist < 110 && p.invuln_timer <= 0 && !p.is_dashing) {
            takePlayerDamage(e.damage * 1.2);
            p.invuln_timer = 0.70;
          }
        }
        e.x += (dirX * spd + e.vx) * dt;
        e.y += (dirY * spd + e.vy) * dt;
        break;
      }
      case "Tautology Twin": {
        e.twin_wiggle = (e.twin_wiggle || 0) + dt * 4;
        const perpX = -dirY; const perpY = dirX;
        const sideOffset = Math.sin(e.twin_wiggle) * 45;
        e.x += (dirX * spd + perpX * sideOffset + e.vx) * dt;
        e.y += (dirY * spd + perpY * sideOffset + e.vy) * dt;
        break;
      }
      case "Run-on Reaper": {
        e.x += (dirX * spd * 1.15 + e.vx) * dt;
        e.y += (dirY * spd * 1.15 + e.vy) * dt;
        if (Math.random() < 0.25) {
          state.particles.push({
            x: e.x, y: e.y, radius: 4, max_radius: 12, alpha: 0.6,
            color: "rgba(147, 51, 234, "
          });
        }
        break;
      }
      case "Dangling Modifier": {
        e.swoop_phase = (e.swoop_phase || Math.random() * Math.PI) + dt * 3.5;
        const lateralSpd = Math.cos(e.swoop_phase) * 120;
        e.x += (dirX * spd + (-dirY * lateralSpd) + e.vx) * dt;
        e.y += (dirY * spd + (dirX * lateralSpd) + e.vy) * dt;
        break;
      }
      case "Double Negative Drake": {
        e.spark_timer = (e.spark_timer || 3.0) - dt;
        if (e.spark_timer <= 0 && dist < 360) {
          e.spark_timer = 3.8;
          spawnEnemyProjectile(e.x, e.y, dirX, dirY, e.damage * 0.7, 220 * chronoMult);
        }
        e.x += (dirX * spd * 0.9 + e.vx) * dt;
        e.y += (dirY * spd * 0.9 + e.vy) * dt;
        break;
      }
      case "Palindrome Phantom": {
        e.flip_timer = (e.flip_timer || 2.4) - dt;
        if (e.flip_timer <= 0) {
          e.flip_timer = 2.4;
          e.vx = -dirX * 220 * chronoMult;
          e.vy = -dirY * 220 * chronoMult;
        }
        e.x += (dirX * spd + e.vx) * dt;
        e.y += (dirY * spd + e.vy) * dt;
        break;
      }
      case "Red Pen Boss":
      case "Lexicon Dragon Boss": {
        // Enraged Phase 2 transition at < 50% HP
        if (e.hp < e.max_hp * 0.5 && !e.enraged) {
          e.enraged = true;
          sounds.bossRoar();
          e.speed *= 1.25;
          for (let r = 20; r <= 100; r += 25) {
            state.particles.push({
              x: e.x, y: e.y, radius: r, max_radius: r + 40, alpha: 0.9,
              color: "rgba(220, 38, 38, "
            });
          }
          // Summon 2 elite guards
          for (let g = 0; g < 2; g++) {
            const ga = (g / 2) * Math.PI * 2;
            addAliveEnemy({
              type: "Oxymoron Ogre",
              x: e.x + Math.cos(ga) * 80, y: e.y + Math.sin(ga) * 80,
              vx: 0, vy: 0,
              hp: 450 * getWaveHpMult(state.current_wave),
              max_hp: 450 * getWaveHpMult(state.current_wave),
              speed: 95, damage: 45, ink_reward: 10,
              label: "ENRAGE GUARD", sprite: "oxymoron_ogre.png",
              size: 54, affix: "shielded", is_elite: true, facing_left: false
            });
          }
        }

        // Enraged Telegraphed Red Line Judgment Laser
        if (e.enraged) {
          e.laser_cooldown = (e.laser_cooldown || 4.2) - dt;
          if (e.laser_cooldown <= 0) {
            e.laser_cooldown = 4.6;
            const lDirX = dirX; const lDirY = dirY;
            const lOrigX = e.x; const lOrigY = e.y;
            state.telegraphs.push({
              is_laser: true, x1: lOrigX, y1: lOrigY,
              x2: lOrigX + lDirX * 1200, y2: lOrigY + lDirY * 1200,
              timer: 0.75, max_timer: 0.75,
              action: () => {
                if (e.dead) return;
                sounds.enemyShoot();
                for (let b = 1; b <= 6; b++) {
                  spawnEnemyProjectile(
                    lOrigX + lDirX * b * 110,
                    lOrigY + lDirY * b * 110,
                    lDirX, lDirY, e.damage * 0.9, 450
                  );
                }
              }
            });
          }
        }

        e.boss_timer = (e.boss_timer || 3.0) - dt;
        if (e.boss_timer <= 0) {
          e.boss_timer = e.type === "Lexicon Dragon Boss" ? 2.5 : 3.0;
          sounds.bossRoar();
          if (e.type === "Lexicon Dragon Boss") {
            const count = e.enraged ? 12 : 8;
            for (let i = 0; i < count; i++) {
              const ang = (i / count) * Math.PI * 2;
              spawnEnemyProjectile(e.x, e.y, Math.cos(ang), Math.sin(ang), e.damage * 0.75, 280 * chronoMult);
            }
          } else {
            const baseAng = Math.atan2(dirY, dirX);
            const spreads = e.enraged ? [-2, -1, 0, 1, 2] : [-1, 0, 1];
            spreads.forEach(i => {
              const ang = baseAng + i * 0.22;
              spawnEnemyProjectile(e.x, e.y, Math.cos(ang), Math.sin(ang), e.damage * 0.75, 260 * chronoMult);
            });
          }
          e.vx = dirX * 180 * chronoMult; e.vy = dirY * 180 * chronoMult;
        }
        e.x += (dirX * spd + e.vx) * dt;
        e.y += (dirY * spd + e.vy) * dt;
        break;
      }
      default: {
        e.x += (dirX * spd + e.vx) * dt;
        e.y += (dirY * spd + e.vy) * dt;
        break;
      }
    }

    // Contact damage with generous 0.70s i-frame & pushback spacing
    const contactDist = (e.size || 34) / 2 + 15;
    if (dist < contactDist && p.invuln_timer <= 0 && !p.is_dashing) {
      sounds.hit();
      takePlayerDamage(e.damage);
      p.invuln_timer = 0.70;
      // Push enemy back gently so player can escape the clump
      e.vx = -dirX * 220;
      e.vy = -dirY * 220;
    }
  });

  updateBossHealthBar();

  // Enemy projectiles
  state.enemy_projectiles.forEach(ep => {
    ep.x += ep.dx * ep.spd * dt;
    ep.y += ep.dy * ep.spd * dt;
    ep.lifetime -= dt;

    const pDist = Math.hypot(p.x - ep.x, p.y - ep.y);
    if (pDist < 20 && p.invuln_timer <= 0 && !p.is_dashing) {
      ep.dead = true;
      sounds.hit();
      takePlayerDamage(ep.damage);
      p.invuln_timer = 0.70;
    }
  });
  state.enemy_projectiles = state.enemy_projectiles.filter(ep => ep.lifetime > 0 && !ep.dead);

  // Dead enemies & splitting & health drops & volatile bomb
  const newEnemies = [];
  state.enemies.forEach(e => {
    if (e.hp <= 0 && !e.dead) {
      e.dead = true;
      sounds.enemyDeath();
      state.kill_count++;
      spawnInkDrop(e.x, e.y, e.ink_reward);

      if (state.selected_char === "rune_sorceress") {
        state.particles.push({x:e.x,y:e.y,radius:12,max_radius:128,alpha:0.95,color:"rgba(166, 119, 255, "});
        state.enemies.forEach(other => {
          const burstDist = Math.hypot(other.x - e.x, other.y - e.y);
          if (other !== e && !other.dead && burstDist < 118) {
            other.hp -= 34 * state.damage_mult;
            const knock = burstDist > 0.001 ? 220 / burstDist : 0;
            other.vx += (other.x - e.x) * knock;
            other.vy += (other.y - e.y) * knock;
          }
        });
      }

      // Tactical Volatile Death Bomb
      if (e.affix === "volatile") {
        const exX = e.x; const exY = e.y;
        state.telegraphs.push({
          x: exX, y: exY, radius: 125, timer: 1.1, max_timer: 1.1, is_bomb: true,
          action: () => {
            sounds.rocketBlast();
            triggerScreenShake(0.24, 7.5);
            state.particles.push({
              x: exX, y: exY, radius: 15, max_radius: 130, alpha: 1.0,
              color: "rgba(249, 115, 22, "
            });
            state.enemies.forEach(other => {
              if (Math.hypot(other.x - exX, other.y - exY) < 125) {
                other.hp -= 140;
                addFloatingText(other.x, other.y - 12, "140", "#f97316", 15);
                const a = Math.atan2(other.y - exY, other.x - exX);
                other.vx = Math.cos(a) * 320; other.vy = Math.sin(a) * 320;
              }
            });
            if (Math.hypot(p.x - exX, p.y - exY) < 125 && p.invuln_timer <= 0 && !p.is_dashing) {
              takePlayerDamage(28);
            }
          }
        });
      }

      // 15% Chance to drop Healing Parchment (+18 HP)
      if (Math.random() < 0.15) {
        state.health_drops.push({ x: e.x, y: e.y, value: 18, collected: false });
      }

      if (e.type === "Typo Slime") {
        for (let i = 0; i < 2; i++) {
          const offAng = Math.random() * Math.PI * 2;
          newEnemies.push({
            type: "Typo Splinter",
            x: e.x + Math.cos(offAng) * 20, y: e.y + Math.sin(offAng) * 20,
            vx: Math.cos(offAng) * 140, vy: Math.sin(offAng) * 140,
            hp: 36 * getWaveHpMult(state.current_wave), max_hp: 36 * getWaveHpMult(state.current_wave),
            speed: 175 * getWaveSpeedMult(state.current_wave), damage: 18 * getWaveDamageMult(state.current_wave),
            ink_reward: 1, label: "Splinter", sprite: "typo_splinter.png", size: 22, facing_left: false
          });
        }
      }

      if (e.is_boss || e.type === "Red Pen Boss" || e.type === "Lexicon Dragon Boss") {
        // Guaranteed Boss Elixir (+50 HP)
        state.health_drops.push({ x: e.x, y: e.y, value: 50, collected: false });
        for (let i = 0; i < 18; i++) {
          spawnInkDrop(e.x + (Math.random() - 0.5) * 90, e.y + (Math.random() - 0.5) * 90, 5);
        }
        updateBossHealthBar();
      }
      updateHUD();
    }
  });

  state.enemies = state.enemies.filter(e => !e.dead);
  newEnemies.forEach(addAliveEnemy);
}

function spawnEnemy() {
  const p = state.player;
  const spawnPoint = getArenaSpawnPosition(p, 560);
  const x = spawnPoint.x;
  const y = spawnPoint.y;

  const d = DIFFICULTIES[state.difficulty];
  const wave = state.current_wave;
  const hpM = getWaveHpMult(wave) * d.enemy_hp_mult;
  const spdM = getWaveSpeedMult(wave) * d.enemy_speed_mult;
  const dmgM = getWaveDamageMult(wave) * d.enemy_damage_mult;

  const roll = Math.random();

  // Rare Wave 20+ Mini-Boss Encounter (2% chance if no boss is active)
  if (wave >= 20 && roll < 0.02 && !state.enemies.some(e => (e.is_boss || e.type === "Red Pen Boss") && !e.dead)) {
    addAliveEnemy({
      type: "Red Pen Boss", x, y, vx: 0, vy: 0,
      hp: (1600 + wave * 90) * hpM, max_hp: (1600 + wave * 90) * hpM,
      speed: 52 * d.enemy_speed_mult, damage: (75 + wave * 1.4) * d.enemy_damage_mult,
      ink_reward: 45, label: `RED PEN PATROL (MINI-BOSS)`,
      sprite: "red_pen_boss.png", size: 64, is_boss: true, is_elite: true, facing_left: false
    });
    updateBossHealthBar();
    return;
  }

  // 13 Diverse Linguistic Enemies
  if (wave >= 30 && roll < 0.10) {
    addAliveEnemy({
      type: "Oxymoron Ogre", x, y, vx: 0, vy: 0,
      hp: 640 * hpM, max_hp: 640 * hpM, speed: 92 * spdM, damage: 58 * dmgM,
      ink_reward: 12, label: "OXYMORON OGRE", sprite: "oxymoron_ogre.png", size: 58,
      is_elite: wave > 40, facing_left: false
    });
  } else if (wave >= 25 && roll < 0.18) {
    addAliveEnemy({
      type: "Double Negative Drake", x, y, vx: 0, vy: 0,
      hp: 340 * hpM, max_hp: 340 * hpM, speed: 110 * spdM, damage: 42 * dmgM,
      ink_reward: 10, label: doubleNegPhrases[Math.floor(Math.random() * doubleNegPhrases.length)],
      sprite: "double_negative_drake.png", size: 52, is_elite: wave > 45, facing_left: false
    });
  } else if (wave >= 25 && roll < 0.26) {
    addAliveEnemy({
      type: "Vocabulary Void", x, y, vx: 0, vy: 0,
      hp: 360 * hpM, max_hp: 360 * hpM, speed: 82 * spdM, damage: 44 * dmgM,
      ink_reward: 10, label: "VOCAB VOID", sprite: "vocabulary_void.png", size: 50,
      is_elite: wave > 50, facing_left: false
    });
  } else if (wave >= 20 && roll < 0.35) {
    addAliveEnemy({
      type: "Palindrome Phantom", x, y, vx: 0, vy: 0,
      hp: 145 * hpM, max_hp: 145 * hpM, speed: 170 * spdM, damage: 30 * dmgM,
      ink_reward: 8, label: palindromeWords[Math.floor(Math.random() * palindromeWords.length)],
      sprite: "palindrome_phantom.png", size: 44, facing_left: false
    });
  } else if (wave >= 20 && roll < 0.44) {
    addAliveEnemy({
      type: "Homophone Harpy", x, y, vx: 0, vy: 0,
      hp: 150 * hpM, max_hp: 150 * hpM, speed: 180 * spdM, damage: 34 * dmgM,
      ink_reward: 7, label: "HARPY", sprite: "homophone_harpy.png", size: 46, facing_left: false
    });
  } else if (wave >= 15 && roll < 0.52) {
    addAliveEnemy({
      type: "Dangling Modifier", x, y, vx: 0, vy: 0,
      hp: 130 * hpM, max_hp: 130 * hpM, speed: 165 * spdM, damage: 26 * dmgM,
      ink_reward: 6, label: danglingPhrases[Math.floor(Math.random() * danglingPhrases.length)],
      sprite: "dangling_modifier.png", size: 44, facing_left: false
    });
  } else if (wave >= 15 && roll < 0.60) {
    addAliveEnemy({
      type: "Malapropism Mimic", x, y, vx: 0, vy: 0,
      hp: 210 * hpM, max_hp: 210 * hpM, speed: 160 * spdM, damage: 38 * dmgM,
      ink_reward: 7, label: "MIMIC", sprite: "malapropism_mimic.png", size: 42, facing_left: false
    });
  } else if (wave >= 10 && roll < 0.68) {
    addAliveEnemy({
      type: "Run-on Reaper", x, y, vx: 0, vy: 0,
      hp: 180 * hpM, max_hp: 180 * hpM, speed: 195 * spdM, damage: 36 * dmgM,
      ink_reward: 7, label: "RUN-ON REAPER", sprite: "run_on_reaper.png", size: 46,
      facing_left: false
    });
  } else if (wave >= 10 && roll < 0.76) {
    addAliveEnemy({
      type: "Idiom Imp", x, y, vx: 0, vy: 0,
      hp: 110 * hpM, max_hp: 110 * hpM, speed: 185 * spdM, damage: 30 * dmgM,
      ink_reward: 5, label: "IDIOM IMP", sprite: "idiom_imp.png", size: 36, facing_left: false
    });
  } else if (wave >= 5 && roll < 0.83) {
    addAliveEnemy({
      type: "Tautology Twin", x, y, vx: 0, vy: 0,
      hp: 160 * hpM, max_hp: 160 * hpM, speed: 140 * spdM, damage: 32 * dmgM,
      ink_reward: 6, label: tautologyWords[Math.floor(Math.random() * tautologyWords.length)],
      sprite: "tautology_twin.png", size: 44, facing_left: false
    });
  } else if (wave >= 5 && roll < 0.90) {
    addAliveEnemy({
      type: "Punctuation Phantom", x, y, vx: 0, vy: 0,
      hp: 120 * hpM, max_hp: 120 * hpM, speed: 135 * spdM, damage: 28 * dmgM,
      ink_reward: 5, label: phantomPunct[Math.floor(Math.random() * phantomPunct.length)],
      sprite: "punctuation_phantom.png", size: 42, shoot_cooldown: 2.0 + Math.random() * 0.8, facing_left: false
    });
  } else if (roll < 0.95) {
    addAliveEnemy({
      type: "Grammar Goblin", x, y, vx: 0, vy: 0,
      hp: 76 * hpM, max_hp: 76 * hpM, speed: 155 * spdM, damage: 14 * dmgM,
      ink_reward: 4, label: grammarPairs[Math.floor(Math.random() * grammarPairs.length)],
      sprite: "grammar_goblin.png", size: 34, dash_cooldown: 2.5 + Math.random() * 1.0, facing_left: false
    });
  } else {
    addAliveEnemy({
      type: "Typo Slime", x, y, vx: 0, vy: 0,
      hp: 96 * hpM, max_hp: 96 * hpM, speed: 98 * spdM, damage: 18 * dmgM,
      ink_reward: 4, label: typoWords[Math.floor(Math.random() * typoWords.length)],
      sprite: "typo_slime.png", size: 36, facing_left: false
    });
  }

  // Tactical Elite Affixes in higher waves (Wave 15+)
  const newEnemy = state.enemies[state.enemies.length - 1];
  if (newEnemy && !newEnemy.is_boss && wave >= 15) {
    const affixChance = Math.min(0.50, 0.12 + (wave - 15) * 0.008);
    if (Math.random() < affixChance) {
      const affixes = ["shielded", "blinker", "commander", "volatile"];
      newEnemy.affix = affixes[Math.floor(Math.random() * affixes.length)];
      newEnemy.is_elite = true;
      newEnemy.max_hp *= 1.30;
      newEnemy.hp = newEnemy.max_hp;
      if (newEnemy.affix === "shielded") {
        newEnemy.label = "KALKANLI " + newEnemy.label;
      } else if (newEnemy.affix === "blinker") {
        newEnemy.label = "HIZLI " + newEnemy.label;
        newEnemy.blink_timer = 3.0 + Math.random() * 1.5;
      } else if (newEnemy.affix === "commander") {
        newEnemy.label = "AURA " + newEnemy.label;
      } else if (newEnemy.affix === "volatile") {
        newEnemy.label = "PATLAYICI " + newEnemy.label;
      }
    }
  }
}

function spawnMilestoneBoss(wave) {
  const p = state.player;
  const d = DIFFICULTIES[state.difficulty];
  const hpM = getWaveHpMult(wave) * d.enemy_hp_mult;

  sounds.bossRoar();

  const bossList = [];

  if (wave === 100) {
    // Ultimate Climax: The Omega Dragon + 2 Great Dragons + 4 Inquisitors (7 Bosses)
    bossList.push({
      type: "Lexicon Dragon Boss",
      hp: 38000 * d.enemy_hp_mult, max_hp: 38000 * d.enemy_hp_mult,
      speed: 62 * d.enemy_speed_mult, damage: 220 * d.enemy_damage_mult,
      ink_reward: 180, label: "THE OMEGA LEXICON DRAGON (FINAL BOSS)",
      sprite: "lexicon_dragon_boss.png", size: 92, is_elite: true, is_boss: true
    });
    for (let i = 0; i < 2; i++) {
      bossList.push({
        type: "Lexicon Dragon Boss",
        hp: 14000 * d.enemy_hp_mult, max_hp: 14000 * d.enemy_hp_mult,
        speed: 65 * d.enemy_speed_mult, damage: 130 * d.enemy_damage_mult,
        ink_reward: 100, label: `ELDER DRAGON #${i + 1}`,
        sprite: "lexicon_dragon_boss.png", size: 80, is_elite: true, is_boss: true
      });
    }
    for (let i = 0; i < 4; i++) {
      bossList.push({
        type: "Red Pen Boss",
        hp: 6000 * hpM, max_hp: 6000 * hpM,
        speed: 55 * d.enemy_speed_mult, damage: 140 * d.enemy_damage_mult,
        ink_reward: 70, label: `OMEGA INQUISITOR #${i + 1}`,
        sprite: "red_pen_boss.png", size: 70, is_elite: true, is_boss: true
      });
    }
  } else if (wave === 50) {
    // Great Dragon + 3 Inquisitors (4 Bosses)
    bossList.push({
      type: "Lexicon Dragon Boss",
      hp: 16500 * d.enemy_hp_mult, max_hp: 16500 * d.enemy_hp_mult,
      speed: 58 * d.enemy_speed_mult, damage: 145 * d.enemy_damage_mult,
      ink_reward: 100, label: "GREAT LEXICON DRAGON (WAVE 50 OVERLORD)",
      sprite: "lexicon_dragon_boss.png", size: 84, is_elite: true, is_boss: true
    });
    for (let i = 0; i < 3; i++) {
      bossList.push({
        type: "Red Pen Boss",
        hp: (2000 + wave * 90) * hpM, max_hp: (2000 + wave * 90) * hpM,
        speed: 54 * d.enemy_speed_mult, damage: (85 + wave * 1.5) * d.enemy_damage_mult,
        ink_reward: 60, label: `DRAGON GUARD INQUISITOR #${i + 1}`,
        sprite: "red_pen_boss.png", size: 68, is_elite: true, is_boss: true
      });
    }
  } else {
    // Progressive Multi-Boss count: scales as wave increases!
    // Wave 5-10: 1, Wave 15-20: 2, Wave 25-30: 3, Wave 35-40: 4, Wave 45: 5, Wave 60: 6, Wave 70: 7, Wave 80+: 8
    const bossCount = Math.min(8, Math.max(1, Math.floor(wave / 10) + (wave % 10 >= 5 ? 1 : 0)));
    for (let i = 0; i < bossCount; i++) {
      bossList.push({
        type: "Red Pen Boss",
        hp: (2400 + wave * 130) * hpM, max_hp: (2400 + wave * 130) * hpM,
        speed: 52 * d.enemy_speed_mult, damage: (95 + wave * 1.8) * d.enemy_damage_mult,
        ink_reward: 60,
        label: bossCount > 1 ? `RED PEN INQUISITOR #${i + 1} (WAVE ${wave})` : `RED PEN INQUISITOR (WAVE ${wave} BOSS)`,
        sprite: "red_pen_boss.png", size: 70, is_elite: wave > 30, is_boss: true
      });
    }
  }

  // Ring Encirclement: Encircle the player symmetrically!
  bossList.forEach((boss, idx) => {
    const ang = (idx / bossList.length) * Math.PI * 2 + (Math.random() * 0.2);
    const spawnPoint = getArenaSpawnPosition(p, 540, ang);
    boss.x = spawnPoint.x;
    boss.y = spawnPoint.y;
    boss.vx = 0;
    boss.vy = 0;
    boss.facing_left = Math.cos(ang) > 0;
    addAliveEnemy(boss);
  });

  updateBossHealthBar();
}

function spawnEnemyProjectile(x, y, dx, dy, dmg, spd) {
  state.enemy_projectiles.push({
    x, y, dx, dy, damage: dmg, spd: spd, lifetime: 3.2, dead: false
  });
}

function spawnInkDrop(x, y, value) {
  state.ink_drops.push({ x, y, value, collected: false });
}

function takePlayerDamage(amount) {
  if (state.shield_charges > 0) {
    state.shield_charges--;
    sounds.hit();
    // Reflect shockwave
    state.enemies.forEach(e => {
      if (Math.hypot(e.x - state.player.x, e.y - state.player.y) < 160) {
        e.hp -= amount * 1.5;
        const a = Math.atan2(e.y - state.player.y, e.x - state.player.x);
        e.vx = Math.cos(a) * 320; e.vy = Math.sin(a) * 320;
      }
    });
    return;
  }

  const reduction = Math.min(0.85, Math.max(0, state.armor));
  const finalDmg = Math.max(1, amount * (1.0 - reduction));
  state.hp = Math.max(0, state.hp - finalDmg);
  triggerHaptic("heavy");
  triggerScreenShake(0.18, 6.0);
  addFloatingText(state.player.x, state.player.y - 30, `-${Math.round(finalDmg)}`, "#ef4444", 16);
  updateHUD();

  if (state.hp <= 0) gameOver();
}

function gameOver() {
  triggerHaptic("fail");
  state.is_wave_active = false;
  bgm.setMode("peaceful");
  syncMobileControlsVisibility();
  const modal = document.getElementById("game-over-screen");
  const title = document.getElementById("game-over-title");
  const kicker = document.getElementById("game-over-kicker");
  const summary = document.getElementById("game-over-summary");
  const wordsList = state.words_learned.length ? state.words_learned.join(", ") : "Henüz kelime mühürlenemedi.";

  modal.dataset.result = "defeat";
  kicker.textContent = "RUN SONUCU  ·  KAYIT KAPANDI";
  title.textContent = "KİTAP KAPANDI";

  summary.textContent = `Mühürlenen kelimeler (${state.words_learned.length})\n${wordsList}\n\n` +
    `Kâtip: ${CHARACTERS[state.selected_char].name}\n` +
    `Seviye: ${DIFFICULTIES[state.difficulty].name}\n` +
    `Ulaşılan dalga: ${state.current_wave} / 100\n` +
    `Yok edilen düşman: ${state.kill_count}\n` +
    `Toplanan mürekkep: ${state.ink_count}`;

  updateAutoRunUI();
  modal.style.display = "flex";

  if (state.auto_new_run) {
    startAutoRunCountdown(3);
  } else {
    clearAutoRunCountdown();
  }
}

function victoryScreen() {
  state.is_wave_active = false;
  bgm.setMode("peaceful");
  syncMobileControlsVisibility();
  const modal = document.getElementById("game-over-screen");
  const title = document.getElementById("game-over-title");
  const kicker = document.getElementById("game-over-kicker");
  const summary = document.getElementById("game-over-summary");
  const wordsList = state.words_learned.length ? state.words_learned.join(", ") : "Tüm sözlükler kurtarıldı!";

  modal.dataset.result = "victory";
  kicker.textContent = "RUN SONUCU  ·  KAYIT TAMAMLANDI";
  title.textContent = "SÖZLÜK KURTARILDI";

  summary.textContent = `Yüz dalga tamamlandı. Son kayıt alındı.\n\n` +
    `Kurtarılan kelimeler (${state.words_learned.length})\n${wordsList}\n\n` +
    `Kâtip: ${CHARACTERS[state.selected_char].name}\n` +
    `Seviye: ${DIFFICULTIES[state.difficulty].name}\n` +
    `Yok edilen düşman: ${state.kill_count}\n` +
    `Toplanan mürekkep: ${state.ink_count}`;

  modal.style.display = "flex";
}

const onRestart = () => {
  clearAutoRunCountdown();
  document.getElementById("game-over-screen").style.display = "none";
  document.getElementById("title-screen").style.display = "flex";
  initTitleScreen();
  syncMobileControlsVisibility();
};
document.getElementById("restart-game-btn").onclick = onRestart;

// =========================================
// 13. SCRIPTORIUM BAZAAR, GADGETS & INVENTORY
// =========================================
let currentShopTab = "cards";
let shopCards = [];

function openShop() {
  document.getElementById("shop-screen").style.display = "flex";
  syncMobileControlsVisibility();
  currentShopTab = "cards";
  highlightShopTabs();
  refreshShopCards();
  renderShopView();
  updateShopTopBar();
  updateShopChapterHeader();
  updateAutoTurUI();

  if (state.auto_new_tur) {
    startShopAutoWaveCountdown(4);
  } else {
    clearShopAutoWaveTimer();
  }
}

function updateShopTopBar() {
  document.getElementById("shop-ink-display").textContent = "MÜREKKEP  " + state.ink_count;
  const synKeys = Object.keys(state.active_synergies);
  if (synKeys.length === 0) {
    document.getElementById("shop-synergy-text").textContent = "Aktif Sinerji: Yok (Aynı türden 3 kelime tomârı toplayarak antik sinerji kilidini aç!)";
  } else {
    document.getElementById("shop-synergy-text").textContent = "Aktif sinerjiler: " + synKeys.map(k => `[${k}]`).join(" ");
  }
}

function updateShopChapterHeader() {
  const chapter = getChapterForWave(state.current_wave);
  const title = document.getElementById("shop-chapter-title");
  const narration = document.getElementById("shop-chapter-narration");
  const kicker = document.getElementById("shop-chapter-kicker");
  const strip = document.getElementById("shop-chapter-strip");
  if (!title || !narration || !kicker || !strip) return;
  title.textContent = chapter.title;
  narration.textContent = chapter.narration;
  kicker.textContent = `DALGA ARASI  ·  ${String(state.current_wave).padStart(2, "0")} TAMAMLANDI`;
  strip.style.setProperty("--chapter-accent", chapter.accent);
}

function refreshShopCards() {
  let targetLevels = ["A1", "A2"];
  if (state.difficulty === "easy") {
    if (state.current_wave > 20) targetLevels = ["A1", "A2", "B1"];
    else if (state.current_wave > 10) targetLevels = ["A1", "A2"];
    else targetLevels = ["A1", "A2"];
  } else if (state.difficulty === "hard") {
    if (state.current_wave > 40) targetLevels = ["B2", "C1"];
    else if (state.current_wave > 15) targetLevels = ["B1", "B2", "C1"];
    else targetLevels = ["A2", "B1", "B2"];
  } else { // normal
    if (state.current_wave > 45) targetLevels = ["B2", "C1"];
    else if (state.current_wave > 25) targetLevels = ["B1", "B2"];
    else if (state.current_wave > 10) targetLevels = ["A2", "B1"];
    else targetLevels = ["A1", "A2"];
  }

  // Filter out questions already asked in this run (no duplicates!)
  let availablePool = state.questions.filter(q => {
    return targetLevels.includes(q.level) && !state.asked_question_ids.includes(q.id);
  });

  // Recycle if pool runs low
  if (availablePool.length < 4) {
    state.asked_question_ids = [];
    availablePool = state.questions.filter(q => targetLevels.includes(q.level));
  }
  if (availablePool.length < 4) availablePool = state.questions.slice();

  availablePool.sort(() => Math.random() - 0.5);

  const selected = [];

  // Spaced Repetition (Leitner System): If player has mistakes in notebook, prioritize 1 redemption card!
  if (state.mistake_words && state.mistake_words.length > 0) {
    const mistakeItem = state.mistake_words[Math.floor(Math.random() * state.mistake_words.length)];
    const matchingQ = state.questions.find(q => q.word === mistakeItem.word);
    if (matchingQ) {
      selected.push(Object.assign({}, matchingQ, { is_review_redemption: true }));
    }
  }

  // Fill up to 4 cards
  for (let q of availablePool) {
    if (selected.length >= 4) break;
    if (!selected.some(s => s.word === q.word)) {
      selected.push(q);
    }
  }

  shopCards = selected;
}

function highlightShopTabs() {
  ["cards", "weapons", "gadgets", "artifacts"].forEach((tab) => {
    const button = document.getElementById(`tab-${tab}-btn`);
    const selected = currentShopTab === tab;
    button.className = "tab-btn" + (selected ? " active" : "");
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  document.getElementById("shop-reroll-btn").style.display = currentShopTab === "cards" ? "inline-flex" : "none";
}

document.getElementById("tab-cards-btn").onclick = () => { clearShopAutoWaveTimer(); currentShopTab = "cards"; highlightShopTabs(); renderShopView(); };
document.getElementById("tab-weapons-btn").onclick = () => { clearShopAutoWaveTimer(); currentShopTab = "weapons"; highlightShopTabs(); renderShopView(); };
document.getElementById("tab-gadgets-btn").onclick = () => { clearShopAutoWaveTimer(); currentShopTab = "gadgets"; highlightShopTabs(); renderShopView(); };
document.getElementById("tab-artifacts-btn").onclick = () => { clearShopAutoWaveTimer(); currentShopTab = "artifacts"; highlightShopTabs(); renderShopView(); };
const shopTabIds = ["cards", "weapons", "gadgets", "artifacts"];
shopTabIds.forEach((tab, index) => {
  document.getElementById(`tab-${tab}-btn`).onkeydown = (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const target = event.key === "Home" ? 0 : event.key === "End" ? shopTabIds.length - 1
      : (index + (event.key === "ArrowRight" ? 1 : -1) + shopTabIds.length) % shopTabIds.length;
    const nextButton = document.getElementById(`tab-${shopTabIds[target]}-btn`);
    nextButton.focus();
    nextButton.click();
  };
});

document.getElementById("shop-reroll-btn").onclick = () => {
  clearShopAutoWaveTimer();
  if (state.ink_count >= 5) {
    state.ink_count -= 5;
    refreshShopCards();
    renderShopView();
    updateShopTopBar();
    updateHUD();
  }
};

document.getElementById("shop-next-wave-btn").onclick = advanceNextWave;

function renderShopView() {
  const grid = document.getElementById("shop-items-grid");
  grid.innerHTML = "";

  if (currentShopTab === "cards") {
    shopCards.forEach((c, idx) => {
      const isRedemption = !!c.is_review_redemption;
      const card = document.createElement("div");
      card.className = "choice-card shop-card";
      if (isRedemption) {
        card.classList.add("shop-redemption");
      }
      card.innerHTML = `
        <div class="shop-meta">
          <span>${c.type} · ${c.level}</span>
          ${isRedemption ? '<span class="shop-review-mark">Pekiştirme</span>' : '<span>Kelime kartı</span>'}
        </div>
        <h3 class="shop-title">${c.word}</h3>
        <div class="shop-description">${c.description}</div>
        <div class="shop-example">“${c.example || ''}”</div>
        <div class="shop-buy-row">
          <span class="shop-price">${c.cost} <img class="ui-icon" src="assets/ui/icons/ink.svg" alt=""> mürekkep</span>
          <button class="btn shop-buy" id="card-buy-${idx}" ${state.ink_count < c.cost ? "disabled" : ""}>${state.ink_count < c.cost ? "Mürekkep yetersiz" : "Sınavı başlat"}</button>
        </div>
      `;
      const buyBtn = card.querySelector(`#card-buy-${idx}`);
      const handleBuy = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable) e.preventDefault();
        }
        triggerHaptic("light");
        openQuiz(c, idx);
      };
      if (buyBtn) {
        buyBtn.onclick = handleBuy;
      }
      card.onclick = (e) => {
        if (e.target !== buyBtn && state.ink_count >= c.cost) {
          handleBuy(e);
        }
      };
      grid.appendChild(card);
    });
  } else if (currentShopTab === "weapons") {
    Object.keys(WEAPONS_CATALOG).forEach(wId => {
      const w = WEAPONS_CATALOG[wId];
      const card = document.createElement("div");
      card.className = "choice-card shop-card";
      card.innerHTML = `
        <div class="shop-meta"><span>Silah</span><span>Teçhizat</span></div>
        <div style="display: flex; align-items: center; gap: 8px; margin: 2px 0;">
          <img src="assets/sprites/${w.sprite}" style="width: 32px; height: 32px; object-fit: contain;" alt="${w.name}">
          <h3 class="shop-title">${w.name.split(" ")[0]}</h3>
        </div>
        <div class="shop-description">${w.desc}</div>
        <div class="shop-data">
          Hasar: ${w.damage} | Atış: ${w.cooldown}s
        </div>
        <div class="shop-buy-row"><span class="shop-price">${w.cost} <img class="ui-icon" src="assets/ui/icons/ink.svg" alt=""></span><button class="btn shop-buy" id="weap-buy-${wId}" ${state.ink_count < w.cost ? "disabled" : ""}>${state.ink_count < w.cost ? "Mürekkep yetersiz" : "Satın al"}</button></div>
      `;
      card.querySelector(`#weap-buy-${wId}`).onclick = () => {
        if (state.ink_count >= w.cost) {
          state.ink_count -= w.cost;
          if (state.equipped_weapons.length < state.max_weapon_slots) {
            state.equipped_weapons.push({ id: wId, tier: 1 });
          } else {
            state.reserve_weapons.push({ id: wId, tier: 1 });
          }
          syncWeapons();
          renderShopView();
          updateShopTopBar();
          updateHUD();
        }
      };
      grid.appendChild(card);
    });
  } else if (currentShopTab === "gadgets") {
    Object.keys(GADGETS_CATALOG).forEach(gId => {
      const g = GADGETS_CATALOG[gId];
      const isAct = state.active_gadget_id === gId;
      const card = document.createElement("div");
      card.className = "choice-card shop-card";
      card.innerHTML = `
        <div class="shop-meta"><span>Gereç</span><span>Aktif donanım</span></div>
        <div style="display: flex; align-items: center; gap: 8px; margin: 2px 0;">
          <img src="assets/sprites/${g.sprite}" style="width: 32px; height: 32px; object-fit: contain;" alt="${g.name}">
          <h3 class="shop-title">${g.name.split(" ")[0]}</h3>
        </div>
        <div class="shop-description">${g.desc}</div>
        <div class="shop-data">
          Bekleme Süresi: ${g.cooldown}s
        </div>
        <div class="shop-buy-row"><span class="shop-price">${isAct ? 'Kuşanıldı' : (g.cost > 0 ? `${g.cost} mürekkep` : 'Ücretsiz')}</span><button class="btn shop-buy" id="gad-buy-${gId}" ${isAct || state.ink_count < g.cost ? 'disabled' : ''}>${isAct ? 'Kuşanıldı' : (state.ink_count < g.cost ? 'Mürekkep yetersiz' : 'Kuşan')}</button></div>
      `;
      if (!isAct) {
        card.querySelector(`#gad-buy-${gId}`).onclick = () => {
          if (state.ink_count >= g.cost) {
            state.ink_count -= g.cost;
            state.active_gadget_id = gId;
            renderShopView();
            updateShopTopBar();
            updateHUD();
          }
        };
      }
      grid.appendChild(card);
    });
  } else if (currentShopTab === "artifacts") {
    Object.keys(ARTIFACTS_CATALOG).forEach(aId => {
      const a = ARTIFACTS_CATALOG[aId];
      const isOwned = state.artifacts_owned.includes(aId) && aId !== "slot_expansion";
      const card = document.createElement("div");
      card.className = "choice-card shop-card";
      card.innerHTML = `
        <div class="shop-meta"><span>Yadigâr</span><span>Pasif eser</span></div>
        <h3 class="shop-title">${a.name}</h3>
        <div class="shop-description">${a.desc}</div>
        <div class="shop-buy-row"><span class="shop-price">${isOwned ? 'Sahip' : `${a.cost} mürekkep <img class="ui-icon" src="assets/ui/icons/ink.svg" alt="">`}</span><button class="btn shop-buy" id="art-buy-${aId}" ${isOwned || state.ink_count < a.cost ? "disabled" : ""}>${isOwned ? 'Alındı' : (state.ink_count < a.cost ? 'Mürekkep yetersiz' : 'Satın al')}</button></div>
      `;
      if (!isOwned) {
        card.querySelector(`#art-buy-${aId}`).onclick = () => {
          if (state.ink_count >= a.cost) {
            state.ink_count -= a.cost;
            if (aId === "slot_expansion") {
              if (state.max_weapon_slots < 6) state.max_weapon_slots++;
            } else {
              state.artifacts_owned.push(aId);
              applyArtifact(a);
            }
            renderShopView();
            updateShopTopBar();
            updateHUD();
          }
        };
      }
      grid.appendChild(card);
    });
  }
}

function applyArtifact(art) {
  Object.keys(art.stats).forEach(k => {
    const val = art.stats[k];
    if (k === "max_hp") { state.max_hp += val; state.hp += val; }
    else if (k === "move_speed") state.move_speed += val;
    else if (k === "damage") state.damage_mult += val;
    else if (k === "attack_speed") state.attack_speed_mult += val;
    else if (k === "armor") state.armor = Math.min(0.85, state.armor + val);
    else if (k === "crit_chance") state.crit_chance = Math.min(1.0, state.crit_chance + val);
    else if (k === "ink_mult") state.ink_mult += val;
  });
}

function openQuiz(card, cardIndex) {
  // Ensure quick menu is closed
  toggleMobileQuickMenu(false);

  const modal = document.getElementById("quiz-modal");
  modal.style.display = "flex";
  modal.classList.remove("hidden");
  syncMobileControlsVisibility();

  document.getElementById("quiz-word-title").textContent = `${card.word} [${card.type} • ${card.level}]`;
  document.getElementById("quiz-question-text").textContent = card.question;
  document.getElementById("quiz-example-text").textContent = `Örnek Metin: "${card.example || ''}"`;

  const resText = document.getElementById("quiz-result-text");
  resText.textContent = "";

  const continueBtn = document.getElementById("quiz-continue-btn");
  continueBtn.style.display = "none";

  const optsContainer = document.getElementById("quiz-options-container");
  optsContainer.innerHTML = "";

  let answered = false;
  const shuffledOptions = card.options.map((text, originalIndex) => ({ text, originalIndex }));
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }

  shuffledOptions.forEach((item, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-opt-btn";
    btn.setAttribute("type", "button");
    btn.textContent = `${['A', 'B', 'C', 'D'][idx] || (idx + 1)}) ${item.text}`;

    const handleAnswer = (e) => {
      if (answered) return;
      if (e) {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
      }
      answered = true;

      btn.classList.add("active-press");
      optsContainer.querySelectorAll(".quiz-opt-btn").forEach(b => {
        b.disabled = true;
        b.style.pointerEvents = "none";
      });

      const isCorrect = item.originalIndex === card.correct_index;

      if (card.id && !state.asked_question_ids.includes(card.id)) {
        state.asked_question_ids.push(card.id);
      }

      if (isCorrect) {
        btn.style.setProperty("background", "#e6f4ea", "important");
        btn.style.setProperty("border-color", "#2e7d32", "important");
        btn.style.setProperty("color", "#1b4d2e", "important");
        sounds.quizSuccess();
        triggerHaptic("success");
        addFloatingText(state.player.x, state.player.y - 30, "KÂTİP MÜHRÜ · +%50", "#587767", 15);

        const discCost = Math.ceil(card.cost * 0.5);
        state.ink_count -= discCost;

        // Check if this was a mistake redemption from the notebook
        const mIdx = state.mistake_words.findIndex(m => m.word === card.word);
        if (mIdx !== -1) {
          state.mistake_words.splice(mIdx, 1);
          try { localStorage.setItem("lexicon_mistakes", JSON.stringify(state.mistake_words)); } catch(e){}
          state.hp = Math.min(state.max_hp, state.hp + 35);
          resText.textContent = `PEKİŞTİRME TAMAMLANDI · HATA DEFTERİNDEN SİLİNDİ\n%50 indirim, +%75 nitelik ve +35 HP yenilendi.\nÖdenen: ${discCost} mürekkep`;
          resText.style.color = "#1b4d2e";
          resText.style.background = "rgba(46, 125, 50, 0.22)";
          applyCardUpgrade(card, true, 1.75);
        } else {
          state.hp = Math.min(state.max_hp, state.hp + 25);
          resText.textContent = `DOĞRU CEVAP · KÂTİP MÜHRÜ KAZANILDI\n%50 indirim, +%50 nitelik ve +25 HP yenilendi.\nÖdenen: ${discCost} mürekkep`;
          resText.style.color = "#1b4d2e";
          resText.style.background = "rgba(46, 125, 50, 0.15)";
          applyCardUpgrade(card, true, 1.5);
        }
      } else {
        btn.style.setProperty("background", "#fce8e6", "important");
        btn.style.setProperty("border-color", "#c5221f", "important");
        btn.style.setProperty("color", "#8b0000", "important");

        // Highlight correct option in green
        const allBtns = optsContainer.querySelectorAll(".quiz-opt-btn");
        const correctDisplayIndex = shuffledOptions.findIndex(option => option.originalIndex === card.correct_index);
        if (allBtns[correctDisplayIndex]) {
          allBtns[correctDisplayIndex].style.setProperty("background", "#e6f4ea", "important");
          allBtns[correctDisplayIndex].style.setProperty("border-color", "#2e7d32", "important");
          allBtns[correctDisplayIndex].style.setProperty("color", "#1b4d2e", "important");
        }

        sounds.quizFail();
        triggerHaptic("fail");
        addFloatingText(state.player.x, state.player.y - 30, "YANLIŞ CEVAP", "#c5221f", 15);

        state.ink_count -= card.cost;
        resText.textContent = `YANLIŞ CEVAP! Doğru Seçenek: "${card.options[card.correct_index]}"\nKelime Kâtip Hata Defterine eklendi (sonraki turlarda pekiştirilecek)!\nÖdenen: ${card.cost} Mürekkep`;
        resText.style.color = "#8b0000";
        resText.style.background = "rgba(139, 0, 0, 0.12)";
        applyCardUpgrade(card, false, 1.0);

        // Record into persistent mistake notebook
        const existing = state.mistake_words.find(m => m.word === card.word);
        if (existing) {
          existing.fail_count = (existing.fail_count || 1) + 1;
          existing.last_failed_wave = state.current_wave;
        } else {
          state.mistake_words.push({
            id: card.id,
            word: card.word,
            type: card.type,
            level: card.level,
            question: card.question,
            correct_answer: card.options[card.correct_index],
            example: card.example || "",
            fail_count: 1,
            last_failed_wave: state.current_wave
          });
        }
        try { localStorage.setItem("lexicon_mistakes", JSON.stringify(state.mistake_words)); } catch(e){}
      }

      shopCards.splice(cardIndex, 1);
      continueBtn.style.display = "inline-flex";
      updateHUD();
    };

    btn.onclick = handleAnswer;
    optsContainer.appendChild(btn);
  });

  const handleContinue = (e) => {
    if (e) {
      e.stopPropagation();
      if (e.cancelable) e.preventDefault();
    }
    triggerHaptic("light");
    modal.style.display = "none";
    modal.classList.add("hidden");
    renderShopView();
    updateShopTopBar();
    updateHUD();
    syncMobileControlsVisibility();
  };

  continueBtn.onclick = handleContinue;
}

function applyCardUpgrade(card, quizBonus, customMultiplier) {
  state.words_learned.push(card.word);
  const mult = customMultiplier || (quizBonus ? 1.5 : 1.0);
  const val = (card.value || 0) * mult;

  switch (card.stat) {
    case "max_hp": state.max_hp += val; state.hp += val; break;
    case "heal": state.hp = Math.min(state.max_hp, state.hp + val); break;
    case "move_speed": state.move_speed += val; break;
    case "damage": state.damage_mult += val; break;
    case "attack_speed": state.attack_speed_mult += val; break;
    case "pickup_radius": state.pickup_radius += val; break;
    case "pierce": state.pierce_count += Math.round(val); break;
    case "projectile_count": state.projectile_count += Math.round(val); break;
    case "armor": state.armor = Math.min(0.85, state.armor + val); break;
    case "crit_chance": state.crit_chance = Math.min(1.0, state.crit_chance + val); break;
  }
  checkSynergies();
}

function checkSynergies() {
  const counts = {};
  state.words_learned.forEach(wName => {
    const q = state.questions.find(x => x.word === wName);
    if (q) counts[q.type] = (counts[q.type] || 0) + 1;
  });

  if ((counts["Adjective"] || 0) >= 3 && !state.active_synergies["Swift Linguist"]) {
    state.active_synergies["Swift Linguist"] = true;
    state.move_speed += 40.0;
    triggerSynergyBanner("Swift Linguist", "+40 Hareket Hızı (3 Sıfat)");
  }
  if ((counts["Verb"] || 0) >= 3 && !state.active_synergies["Action Master"]) {
    state.active_synergies["Action Master"] = true;
    state.damage_mult += 0.28;
    triggerSynergyBanner("Action Master", "+%28 Hasar Gücü (3 Fiil)");
  }
  if ((counts["Prefix"] || 0) >= 2 && !state.active_synergies["Prefix Overdrive"]) {
    state.active_synergies["Prefix Overdrive"] = true;
    state.pierce_count += 2;
    triggerSynergyBanner("Prefix Overdrive", "+2 Delici Atış (2 Ön Ek)");
  }
  if ((counts["Grammar"] || 0) >= 3 && !state.active_synergies["Syntax Guardian"]) {
    state.active_synergies["Syntax Guardian"] = true;
    state.armor = Math.min(0.85, state.armor + 0.18);
    triggerSynergyBanner("Syntax Guardian", "+%18 Zırh (3 Dilbilgisi)");
  }
}

function triggerSynergyBanner(name, desc) {
  const banner = document.getElementById("synergy-banner");
  document.getElementById("syn-title").textContent = `YENİ SİNERJİ · ${name}`;
  document.getElementById("syn-desc").textContent = desc;
  banner.style.display = "block";
  setTimeout(() => { banner.style.display = "none"; }, 4500);
}

// =========================================
// 14. INVENTORY MODAL & COMBINE VIEW
// =========================================
function renderInventoryView() {
  const activeContainer = document.getElementById("inv-active-slots");
  const reserveContainer = document.getElementById("inv-reserve-slots");
  activeContainer.innerHTML = "";
  reserveContainer.innerHTML = "";

  // Active Slots (up to max_weapon_slots)
  for (let i = 0; i < state.max_weapon_slots; i++) {
    const item = state.equipped_weapons[i];
    const box = document.createElement("div");
    box.className = "slot-box" + (i === state.active_weapon_index ? " active-weapon" : "");
    if (item) {
      const w = WEAPONS_CATALOG[item.id];
      const t = TIER_MULTIPLIERS[item.tier];
      box.innerHTML = `
        <span class="tier-badge ${t.badge}">${t.stars} ${t.name}</span>
        <img src="assets/sprites/${w.sprite}" style="width: 32px; height: 32px;" alt="${w.name}">
        <span style="font-size: 11px; font-weight: bold; color: #2b170c;">${w.name.split(" ")[0]}</span>
        <button class="btn" style="font-size: 10px; padding: 2px 6px;" id="inv-unequip-${i}">Çantaya Al</button>
      `;
      box.querySelector(`#inv-unequip-${i}`).onclick = () => {
        if (state.equipped_weapons.length > 1) {
          state.reserve_weapons.push(item);
          state.equipped_weapons.splice(i, 1);
          state.active_weapon_index = 0;
          syncWeapons();
          renderInventoryView();
          updateHUD();
        }
      };
    } else {
      box.innerHTML = `<span style="font-size: 11px; color: #78350f;">[BOŞ YUVA ${i + 1}]</span>`;
    }
    activeContainer.appendChild(box);
  }

  // Reserve Backpack
  state.reserve_weapons.forEach((item, idx) => {
    const w = WEAPONS_CATALOG[item.id];
    const t = TIER_MULTIPLIERS[item.tier];
    const box = document.createElement("div");
    box.className = "slot-box";
    box.innerHTML = `
      <span class="tier-badge ${t.badge}">${t.stars} ${t.name}</span>
      <img src="assets/sprites/${w.sprite}" style="width: 28px; height: 28px;" alt="${w.name}">
      <span style="font-size: 10.5px; font-weight: bold; color: #2b170c;">${w.name.split(" ")[0]}</span>
      <button class="btn btn-emerald" style="font-size: 10px; padding: 2px 6px;" id="inv-equip-${idx}">Kuşan</button>
    `;
    box.querySelector(`#inv-equip-${idx}`).onclick = () => {
      if (state.equipped_weapons.length < state.max_weapon_slots) {
        state.equipped_weapons.push(item);
        state.reserve_weapons.splice(idx, 1);
      } else {
        // Swap with active weapon
        const temp = state.equipped_weapons[state.active_weapon_index];
        state.equipped_weapons[state.active_weapon_index] = item;
        state.reserve_weapons[idx] = temp;
      }
      syncWeapons();
      renderInventoryView();
      updateHUD();
    };
    reserveContainer.appendChild(box);
  });

  // Check Combinable weapons
  const allWeapons = state.equipped_weapons.concat(state.reserve_weapons);
  let canCombine = null;
  for (let i = 0; i < allWeapons.length; i++) {
    for (let j = i + 1; j < allWeapons.length; j++) {
      if (allWeapons[i].id === allWeapons[j].id && allWeapons[i].tier === allWeapons[j].tier && allWeapons[i].tier < 4) {
        canCombine = { id: allWeapons[i].id, tier: allWeapons[i].tier };
        break;
      }
    }
    if (canCombine) break;
  }

  const combineBtn = document.getElementById("inv-combine-btn");
  if (canCombine) {
    combineBtn.style.display = "inline-flex";
    combineBtn.textContent = `[${WEAPONS_CATALOG[canCombine.id].name.split(" ")[0]}] BİRLEŞTİR → ${TIER_MULTIPLIERS[canCombine.tier + 1].name}`;
    combineBtn.onclick = () => {
      // Find and merge
      let foundFirst = false;
      let targetTier = canCombine.tier;
      // Search active
      for (let i = state.equipped_weapons.length - 1; i >= 0; i--) {
        if (state.equipped_weapons[i].id === canCombine.id && state.equipped_weapons[i].tier === targetTier) {
          if (!foundFirst) {
            state.equipped_weapons[i].tier++;
            foundFirst = true;
          } else {
            state.equipped_weapons.splice(i, 1);
            break;
          }
        }
      }
      if (!foundFirst) {
        for (let i = state.reserve_weapons.length - 1; i >= 0; i--) {
          if (state.reserve_weapons[i].id === canCombine.id && state.reserve_weapons[i].tier === targetTier) {
            if (!foundFirst) {
              state.reserve_weapons[i].tier++;
              foundFirst = true;
            } else {
              state.reserve_weapons.splice(i, 1);
              break;
            }
          }
        }
      } else {
        // Also remove second if in reserve
        for (let i = state.reserve_weapons.length - 1; i >= 0; i--) {
          if (state.reserve_weapons[i].id === canCombine.id && state.reserve_weapons[i].tier === targetTier) {
            state.reserve_weapons.splice(i, 1);
            break;
          }
        }
      }
      sounds.quizSuccess();
      syncWeapons();
      renderInventoryView();
      updateHUD();
    };
  } else {
    combineBtn.style.display = "none";
  }

  // Summary stats
  document.getElementById("inv-stats-summary").textContent =
    `Can: ${Math.round(state.hp)}/${Math.round(state.max_hp)} | Hasar: ${state.damage_mult.toFixed(2)}x | ` +
    `Atış Hızı: ${state.attack_speed_mult.toFixed(2)}x | Zırh: %${Math.round(state.armor * 100)} | ` +
    `Kritik: %${Math.round(state.crit_chance * 100)} | Hız: ${Math.round(state.move_speed)} | Yuvalar: ${state.equipped_weapons.length}/${state.max_weapon_slots}`;
}

// =========================================
// 15. HUD UPDATE
// =========================================
function updateHUD() {
  document.getElementById("hp-fill").style.width = `${Math.max(0, (state.hp / state.max_hp) * 100)}%`;
  document.getElementById("hp-text").textContent = `${Math.round(state.hp)} / ${Math.round(state.max_hp)} HP`;
  const biomeName = state.current_wave < 26 ? "KÜTÜPHANE" : state.current_wave < 51 ? "DEHLİZ" : state.current_wave < 76 ? "GÖZLEMEVİ" : "SON SAYFA";
  document.getElementById("timer-badge").textContent = `${biomeName} · ${state.current_wave} / 100 · ${Math.ceil(state.wave_time_left)}s`;
  document.getElementById("ink-value").textContent = state.ink_count;
  document.getElementById("kill-value").textContent = state.kill_count;

  const c = CHARACTERS[state.selected_char];
  const d = DIFFICULTIES[state.difficulty];
  document.getElementById("char-diff-info").textContent = `${c.name} · ${d.name}`;

  // Slotted weapons preview
  const weaponsEl = document.getElementById("weapons-info");
  weaponsEl.innerHTML = "";
  state.equipped_weapons.forEach((item, idx) => {
    const isAct = (idx === state.active_weapon_index);
    const w = WEAPONS_CATALOG[item.id] || { name: item.id };
    const t = TIER_MULTIPLIERS[item.tier] || TIER_MULTIPLIERS[1];
    const badge = document.createElement("span");
    badge.style.cursor = "pointer";
    badge.style.padding = "2px 6px";
    badge.style.borderRadius = "3px";
    badge.style.marginRight = "4px";
    badge.style.display = "inline-flex";
    badge.style.alignItems = "center";
    badge.style.gap = "3px";
    badge.style.pointerEvents = "auto";
    badge.style.fontFamily = "'IBM Plex Sans', sans-serif";
    badge.style.fontSize = "11px";

    if (isAct) {
      badge.style.background = "#263d39";
      badge.style.border = "1px solid #70988d";
      badge.style.color = "#f1ead7";
      badge.style.fontWeight = "bold";
      badge.textContent = `${idx + 1} · ${w.name.split(" ")[0]} ${t.stars}`;
    } else {
      badge.style.background = "rgba(25, 31, 29, 0.82)";
      badge.style.border = "1px solid rgba(213, 204, 183, 0.25)";
      badge.style.color = "#d7cfbc";
      badge.textContent = `${idx + 1} · ${w.name.split(" ")[0]}`;
    }
    badge.onclick = (ev) => {
      ev.stopPropagation();
      selectWeaponIndex(idx);
    };
    weaponsEl.appendChild(badge);
  });

  // Gadget badge
  const gData = GADGETS_CATALOG[state.active_gadget_id] || GADGETS_CATALOG["eraser_dash"];
  document.getElementById("gadget-panel-icon").src = "assets/sprites/" + gData.sprite;
  document.getElementById("gadget-panel-name").textContent = `${gData.name.split(" ")[0]} [SPACE]:`;
  const gStatus = document.getElementById("gadget-status");
  if (state.gadget_timer <= 0.05) {
    gStatus.textContent = "HAZIR";
    gStatus.style.color = "#a9bda9";
  } else {
    gStatus.textContent = state.gadget_timer.toFixed(1) + "s";
    gStatus.style.color = "#c89a87";
  }
}

// =========================================
// 16. RENDERING
// =========================================
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const p = state.player;

  ctx.save();

  // Screen shake impact
  let shakeX = 0, shakeY = 0;
  if (state.screen_shake > 0) {
    shakeX = (Math.random() - 0.5) * state.shake_intensity;
    shakeY = (Math.random() - 0.5) * state.shake_intensity;
  }
  ctx.translate(cx + shakeX, cy + shakeY);

  // Dynamic Camera Zoom: On mobile/tablets, zoom in so action is big, punchy and clear!
  const isTouchOrSmall = window.innerWidth <= 1080 || ('ontouchstart' in window);
  const zoom = isTouchOrSmall ? (window.innerWidth < 650 ? 1.38 : 1.20) : 1.0;
  if (zoom !== 1.0) {
    ctx.scale(zoom, zoom);
  }
  ctx.translate(-p.x, -p.y);

  // 4 Dynamic Biomes based on progression across 100 Waves
  let frameSprite = "upgrade_v1/arena_frame_library.png";
  let runeSprite = "magical_rune_circle.png";
  let propSprite = "illuminated_lectern.png";
  let brazierFlameColor = "rgba(255, 180, 50, ";
  let ambientMoteColor = "rgba(255, 215, 0, ";

  if (state.current_wave >= 76) {
    // Biome 4: The Omega Void Sanctum (Waves 76-100)
    frameSprite = "upgrade_v1/arena_frame_void.png";
    runeSprite = "magical_rune_void.png";
    propSprite = "brazier_pedestal.png";
    brazierFlameColor = "rgba(239, 68, 68, ";
    ambientMoteColor = "rgba(248, 113, 113, ";
  } else if (state.current_wave >= 51) {
    // Biome 3: Astral Observatory of Cosmic Etymology (Waves 51-75)
    frameSprite = "upgrade_v1/arena_frame_observatory.png";
    runeSprite = "magical_rune_astral.png";
    propSprite = "brazier_pedestal.png";
    brazierFlameColor = "rgba(168, 85, 247, ";
    ambientMoteColor = "rgba(192, 132, 252, ";
  } else if (state.current_wave >= 26) {
    // Biome 2: Forbidden Catacombs of Forgotten Words (Waves 26-50)
    frameSprite = "upgrade_v1/arena_frame_dungeon.png";
    runeSprite = "magical_rune_cyan.png";
    propSprite = "brazier_pedestal.png";
    brazierFlameColor = "rgba(34, 211, 238, ";
    ambientMoteColor = "rgba(103, 232, 249, ";
  }

  // One full arena illustration keeps the playable surface coherent and avoids
  // a high-contrast repeating tile beneath the characters.
  ctx.fillStyle = "#0a0e0c";
  ctx.fillRect(-2250, -1800, 4500, 3600);
  const frameImg = images[frameSprite];
  if (frameImg) {
    // Fit the illustrated room to the visible viewport so its unique frame
    // stays around the play area instead of disappearing beyond world bounds.
    const viewW = canvas.width / zoom;
    const viewH = canvas.height / zoom;
    const sceneW = Math.max(viewW, viewH * (4 / 3));
    const sceneH = sceneW * (3 / 4);
    ctx.drawImage(frameImg, p.x - sceneW / 2, p.y - sceneH / 2, sceneW, sceneH);
  }

  // Central Double-Rotating Magical Rune Circle
  state.rune_rotation += 0.003;
  const runeImg = images[runeSprite] || images["magical_rune_circle.png"];
  if (runeImg) {
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(state.rune_rotation);
    ctx.globalAlpha = 0.30 + Math.sin(state.rune_rotation * 4) * 0.05;
    ctx.drawImage(runeImg, -210, -210, 420, 420);
    ctx.restore();

    // Inner counter-rotating magical glyph core
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(-state.rune_rotation * 1.5);
    ctx.globalAlpha = 0.18;
    ctx.drawImage(runeImg, -110, -110, 220, 220);
    ctx.restore();
  }

  // Four Corner Environmental Props with Animated Flames & Floor Light Halos
  const now = performance.now();
  const cornerProps = [[-900, -650], [900, -650], [-900, 650], [900, 650]];
  cornerProps.forEach(([bx, by], idx) => {
    // Floor ambient radial glow
    const bGlow = ctx.createRadialGradient(bx, by - 12, 10, bx, by - 12, 96);
    bGlow.addColorStop(0, brazierFlameColor + "0.20)");
    bGlow.addColorStop(1, brazierFlameColor + "0)");
    ctx.fillStyle = bGlow;
    ctx.beginPath();
    ctx.arc(bx, by - 12, 96, 0, Math.PI * 2);
    ctx.fill();

    // Prop Sprite (Lectern or Brazier Pedestal)
    const pImg = images[propSprite] || images["brazier_pedestal.png"] || images["illuminated_lectern.png"];
    if (pImg) {
      ctx.drawImage(pImg, bx - 26, by - 26, 52, 52);
    }

    // Dancing flame particles
    for (let f = 0; f < 2; f++) {
      const fAngle = now * 0.005 + idx * 1.5 + f * 2.1;
      const fOffset = Math.sin(fAngle) * 4;
      const fRadius = 4.5 + Math.sin(fAngle * 2) * 2;
      ctx.fillStyle = brazierFlameColor + (0.75 + Math.sin(fAngle) * 0.25) + ")";
      ctx.beginPath();
      ctx.arc(bx + fOffset, by - 20 - f * 4, fRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Active Tactical Telegraphs (Warning Circles & Red Line Laser Guides)
  if (state.telegraphs) {
    state.telegraphs.forEach(tg => {
      if (tg.is_laser) {
        ctx.save();
        const pProg = Math.max(0, tg.timer / (tg.max_timer || 0.75));
        ctx.strokeStyle = `rgba(255, 40, 40, ${0.45 + (1 - pProg) * 0.5})`;
        ctx.lineWidth = 3.5 + (1 - pProg) * 3;
        ctx.setLineDash([14, 8]);
        ctx.beginPath();
        ctx.moveTo(tg.x1, tg.y1);
        ctx.lineTo(tg.x2, tg.y2);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.save();
        ctx.translate(tg.x, tg.y);
        const pProg = Math.max(0, tg.timer / (tg.max_timer || 1.0));
        const seal = images["upgrade_v1/threat_seal.png"];
        if (seal) {
          const sealSize = Math.min(88, Math.max(36, (tg.radius || 42) * 1.05));
          ctx.globalAlpha = 0.16 + (1 - pProg) * 0.36;
          ctx.drawImage(seal, -sealSize / 2, -sealSize / 2, sealSize, sealSize);
        }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = tg.is_bomb ? "rgba(249, 115, 22, 0.9)" : "rgba(239, 68, 68, 0.9)";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, tg.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = tg.is_bomb ? `rgba(249, 115, 22, ${0.2 + (1 - pProg) * 0.35})` : `rgba(239, 68, 68, ${0.2 + (1 - pProg) * 0.35})`;
        ctx.beginPath();
        ctx.arc(0, 0, tg.radius * (1 - pProg), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  // Motes
  state.ambient_motes.forEach(m => {
    m.x += Math.cos(m.angle) * m.speed * 0.016;
    m.y += Math.sin(m.angle) * m.speed * 0.016;
    if (m.x < -1150) m.x = 1150;
    if (m.x > 1150) m.x = -1150;
    if (m.y < -850) m.y = 850;
    if (m.y > 850) m.y = -850;

    ctx.save();
    ctx.fillStyle = ambientMoteColor + `${m.alpha})`;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Ink puddles
  state.ink_puddles.forEach(puddle => {
    ctx.save();
    ctx.fillStyle = "rgba(20, 10, 40, 0.65)";
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(puddle.x, puddle.y, puddle.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });

  // Turrets
  state.turrets.forEach(t => {
    ctx.save();
    ctx.translate(t.x, t.y);
    const spr = images["scroll_turret.png"];
    if (spr) ctx.drawImage(spr, -22, -22, 44, 44);
    ctx.restore();
  });

  // Ink drops
  state.ink_drops.forEach(drop => {
    if (images["ink_drop.png"]) {
      ctx.drawImage(images["ink_drop.png"], drop.x - 10, drop.y - 10, 20, 20);
    } else {
      ctx.fillStyle = "#5ce1e6";
      ctx.beginPath(); ctx.arc(drop.x, drop.y, 6, 0, Math.PI * 2); ctx.fill();
    }
  });

  // Health drops (Şifa Parşömeni)
  state.health_drops.forEach(drop => {
    ctx.save();
    ctx.translate(drop.x, drop.y);
    const pulse = 1.0 + Math.sin(Date.now() * 0.007) * 0.18;
    ctx.scale(pulse, pulse);
    ctx.fillStyle = "rgba(34, 197, 94, 0.35)";
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✚", 0, 0.5);
    ctx.restore();
  });

  // Mines
  state.punctuation_mines.forEach(mine => {
    ctx.save();
    ctx.translate(mine.x, mine.y);
    const s = 1.0 + Math.sin(mine.pulse) * 0.16;
    ctx.scale(s, s);
    const mSpr = images["punctuation_mine.png"];
    if (mSpr) ctx.drawImage(mSpr, -16, -16, 32, 32);
    ctx.restore();
  });

  // Shockwaves
  state.particles.forEach(pt => {
    pt.radius += 5.5;
    pt.alpha -= 0.05;
    if (pt.alpha > 0) {
      ctx.save();
      ctx.strokeStyle = pt.color + Math.max(0, pt.alpha) + ")";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  });
  state.particles = state.particles.filter(pt => pt.alpha > 0);

  // Enemy Projectiles
  state.enemy_projectiles.forEach(ep => {
    ctx.save();
    ctx.translate(ep.x, ep.y);
    const spr = images["bullet_enemy_red.png"];
    if (spr) {
      ctx.drawImage(spr, -10, -10, 20, 20);
    } else {
      ctx.fillStyle = "#ff1744"; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  });

  // Labels are reserved for nearby elites and bosses to keep crowds readable.
  const enemyLabelBoxes = [];

  // Enemies
  state.enemies.forEach(e => {
    // Commander Aura Ring
    if (e.affix === "commander") {
      ctx.save();
      const ringAlpha = 0.25 + Math.sin(performance.now() * 0.006) * 0.15;
      ctx.strokeStyle = `rgba(234, 179, 8, ${ringAlpha + 0.35})`;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(e.x, e.y, 160, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    ctx.translate(e.x, e.y);

    // Enraged Boss Aura
    if (e.enraged) {
      ctx.shadowColor = "#ef4444";
      ctx.shadowBlur = 22;
      ctx.fillStyle = "rgba(239, 68, 68, 0.28)";
      ctx.beginPath();
      ctx.arc(0, 0, (e.size || 60) * 0.75, 0, Math.PI * 2);
      ctx.fill();
    }

    if (e.facing_left) ctx.scale(-1, 1);

    const spr = images[e.sprite];
    const sz = e.size || 36;
    const spriteSize = sz * 1.55;
    if (spr) ctx.drawImage(spr, -spriteSize / 2, -spriteSize / 2, spriteSize, spriteSize);

    if (e.is_elite && images["elite_crown.png"]) {
      ctx.drawImage(images["elite_crown.png"], -10, -sz / 2 - 16, 20, 20);
    }

    // Shielded Frontal Arc Barrier
    if (e.affix === "shielded") {
      ctx.save();
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 3.5;
      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, sz * 0.68, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();

    if (e.max_hp > 150) {
      const barW = e.size || 40;
      const pct = Math.max(0, e.hp / e.max_hp);
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(e.x - barW / 2, e.y - (e.size / 2) - 10, barW, 4);
      ctx.fillStyle = e.enraged ? "#dc2626" : "#ff5252";
      ctx.fillRect(e.x - barW / 2, e.y - (e.size / 2) - 10, barW * pct, 4);
    }

    if ((e.is_boss || e.is_elite) && Math.hypot(e.x - state.player.x, e.y - state.player.y) < 520 && enemyLabelBoxes.length < 5) {
      const label = e.is_boss
        ? (e.type === "Lexicon Dragon Boss" ? "LEKSİKON EJDERHASI" : "KIRMIZI KALEM")
        : (e.label || "ELİT DÜŞMAN");
      ctx.font = "500 9px 'IBM Plex Mono', monospace";
      ctx.textAlign = "center";
      const labelWidth = Math.min(156, ctx.measureText(label).width);
      const labelY = e.y - (e.size / 2) - 14;
      const box = { left: e.x - labelWidth / 2 - 5, right: e.x + labelWidth / 2 + 5, top: labelY - 10, bottom: labelY + 4 };
      const overlapsLabel = enemyLabelBoxes.some(other => box.left < other.right && box.right > other.left && box.top < other.bottom && box.bottom > other.top);
      if (!overlapsLabel) {
        ctx.lineJoin = "round";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(15, 21, 18, 0.92)";
        ctx.strokeText(label, e.x, labelY, 156);
        ctx.fillStyle = e.is_boss ? "#e7dfcd" : "#d6ddd2";
        ctx.fillText(label, e.x, labelY, 156);
        enemyLabelBoxes.push(box);
      }
    }
  });

  // Projectiles
  state.projectiles.forEach(pr => {
    ctx.save();
    ctx.translate(pr.x, pr.y);
    ctx.rotate(Math.atan2(pr.dy, pr.dx));

    const prSpr = pr.sprite ? images[pr.sprite] : null;
    if (prSpr && !pr.crit) {
      const sz = pr.size || 18;
      ctx.drawImage(prSpr, -sz / 2, -sz / 2, sz, sz);
    } else {
      ctx.fillStyle = pr.crit ? "#ffd700" : pr.color;
      ctx.shadowColor = pr.color;
      ctx.shadowBlur = pr.crit ? 14 : 6;
      ctx.fillRect(-8, -3, 16, 6);
    }
    ctx.restore();
  });

  // Player
  ctx.save();
  ctx.translate(p.x, p.y);
  if (p.invuln_timer > 0 && Math.floor(performance.now() / 60) % 2 === 0) {
    ctx.globalAlpha = 0.35;
  }
  if (p.is_dashing) {
    ctx.shadowColor = "#55efc4"; ctx.shadowBlur = 25;
  }
  if (state.shield_charges > 0) {
    ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2); ctx.stroke();
  }
  if (p.facing_left) ctx.scale(-1, 1);

  const cData = CHARACTERS[state.selected_char];
  const isMoving = Math.hypot(p.vx, p.vy) > 20;
  const action = p.attack_anim_timer > 0 ? "attack" : isMoving ? "run" : "idle";
  const frame = action === "attack"
    ? Math.min(3, Math.floor((0.28 - p.attack_anim_timer) / 0.07))
    : Math.floor(performance.now() / (action === "run" ? 90 : 240)) % 4;
  const animationKey = state.selected_char === "inky" ? "inky"
    : state.selected_char === "quillmaster" ? "quillmaster"
    : state.selected_char === "word_knight" ? "word_knight"
    : state.selected_char === "rune_sorceress" ? "rune_sorceress"
    : state.selected_char === "lexicon_alchemist" ? "alchemist"
    : state.selected_char === "shadow_lexicographer" ? "shadow_scribe" : null;
  const actionSprite = animationKey
    ? images[`upgrade_v1/animations/${animationKey}_${action}_${frame}.png`]
    : null;
  const pSpr = actionSprite || images[cData.sprite] || images["player.png"];
  if (pSpr) ctx.drawImage(pSpr, -44, -44, 88, 88);
  ctx.restore();

  // Floating Slotted Weapons Arsenal
  state.weapons.forEach((w, idx) => {
    ctx.save();
    let wx = p.x; let wy = p.y;
    const isAct = (idx === state.active_weapon_index);
    const facing = p.facing_left ? -1 : 1;
    if (isAct) {
      wx += 10 * facing - Math.cos(w.rotation) * (w.recoil || 0) * 5;
      wy += 2 - Math.sin(w.rotation) * (w.recoil || 0) * 5;
    } else {
      const holsterRow = idx < state.active_weapon_index ? idx : idx - 1;
      wx += 6 * facing;
      wy += 11 + Math.max(0, holsterRow) * 5;
    }
    ctx.translate(wx, wy);
    ctx.rotate(w.rotation);

    if (isAct) {
      ctx.shadowColor = "rgba(190, 156, 99, 0.55)";
      ctx.shadowBlur = 7;
      ctx.scale(1.12, 1.12);
    }

    const wSpr = images[w.data.sprite];
    const weaponInHeroFrame = (state.selected_char === "inky" && w.id === "quill_blaster")
      || (state.selected_char === "quillmaster" && w.id === "syllable_shotgun")
      || (state.selected_char === "word_knight" && w.id === "dictionary_blade")
      || (state.selected_char === "rune_sorceress" && w.id === "rune_orb")
      || (state.selected_char === "shadow_lexicographer" && w.id === "calligraphy_katana");
    if (wSpr && !weaponInHeroFrame) ctx.drawImage(wSpr, 4, -16, 32, 32);
    if (w.flash_timer > 0 && isAct) {
      ctx.fillStyle = `rgba(232, 205, 148, ${Math.min(0.9, w.flash_timer * 12)})`;
      ctx.beginPath();
      ctx.arc(36, 0, 4 + w.flash_timer * 48, 0, Math.PI * 2);
      ctx.fill();
    }
    if (w.swing_timer > 0 && (w.id === "dictionary_blade" || w.id === "calligraphy_katana")) {
      const progress = 1 - w.swing_timer / (w.id === "calligraphy_katana" ? 0.28 : 0.24);
      ctx.strokeStyle = `rgba(226, 215, 185, ${Math.max(0, 0.82 - progress * 0.72)})`;
      ctx.lineWidth = w.id === "calligraphy_katana" ? 4 : 3;
      ctx.beginPath();
      ctx.arc(5, 0, w.id === "calligraphy_katana" ? 54 : 44, -0.96 + progress * 0.32, 0.96 + progress * 0.32);
      ctx.stroke();
    }
    ctx.restore();
  });

  // Floating Combat Damage Numbers & Pickup Text
  if (state.floating_texts && state.floating_texts.length) {
    state.floating_texts.forEach(ft => {
      const prog = Math.max(0, ft.lifetime / ft.max_lifetime);
      ctx.save();
      ctx.font = `bold ${ft.size || 13}px 'IBM Plex Serif', serif`;
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.min(1.0, prog * 1.6);
      ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
      ctx.shadowBlur = 4;
      ctx.textAlign = "center";
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  ctx.restore();

  // Dynamic Atmospheric Player Radial Lighting & Dark Academia Vignette
  const lightGrad = ctx.createRadialGradient(cx, cy, 140, cx, cy, 680);
  lightGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
  lightGrad.addColorStop(0.65, "rgba(8, 4, 3, 0.20)");
  lightGrad.addColorStop(1, "rgba(4, 2, 2, 0.72)");
  ctx.fillStyle = lightGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// =========================================
// 17. MAIN GAME LOOP
// =========================================
function gameLoop(now) {
  const rawDt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  const dt = rawDt * (state.game_speed || 1.0);

  updateGame(dt);
  render();
  requestAnimationFrame(gameLoop);
}

function updateGame(dt) {
  if (state.is_wave_active) {
    updatePlayer(dt);
    updateEnemies(dt);
    updateHUD();
  }
}

window.render_game_to_text = () => JSON.stringify({
  coordinate_system: "arena origin at center; +x right, +y down",
  mode: state.hp <= 0 ? "gameover" : state.is_wave_active ? "wave" : (getComputedStyle(document.getElementById("shop-screen")).display !== "none" ? "shop" : "title"),
  wave: state.current_wave,
  wave_time_left: Number(state.wave_time_left.toFixed(1)),
  character: state.selected_char,
  player: {
    x: Math.round(state.player.x), y: Math.round(state.player.y),
    vx: Math.round(state.player.vx), vy: Math.round(state.player.vy),
    hp: Math.round(state.hp), max_hp: Math.round(state.max_hp),
    animation: state.player.attack_anim_timer > 0 ? "attack" : Math.hypot(state.player.vx, state.player.vy) > 20 ? "run" : "idle",
    dashing: state.player.is_dashing, gadget_cooldown: Number(state.gadget_timer.toFixed(1))
  },
  enemies: state.enemies.filter(e => !e.dead).slice(0, 24).map(e => ({
    type: e.type, x: Math.round(e.x), y: Math.round(e.y), hp: Math.round(e.hp),
    boss: !!e.is_boss
  })),
  alive_count: state.enemies.reduce((n, e) => n + (e.dead ? 0 : 1), 0),
  alive_cap: getWaveEnemyCap(),
  ink: state.ink_count, kills: state.kill_count
});

window.advanceTime = (ms) => {
  const stepCount = Math.max(1, Math.round(ms / (1000 / 60)));
  const dt = 1 / 60 * (state.game_speed || 1.0);
  for (let i = 0; i < stepCount; i++) updateGame(dt);
  render();
};

// Immediate initial sync for instant interactivity on mobile & iPad
initTitleScreen();
initTouchControls();

loadAssets(() => {
  initTitleScreen();
  initTouchControls();
  requestAnimationFrame(gameLoop);
});
