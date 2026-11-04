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

    if (!this.isMuted && this.volume > 0) {
      const now = ctx.currentTime;
      if (currentNoteName && this.notes[currentNoteName]) {
        this.playPluckedString(this.notes[currentNoteName], now, stepDuration * 2.5, 0.08 * this.volume);
      }

      if (this.step % 16 === 0) {
        const barIdx = Math.floor((this.step % totalSteps) / 16);
        const bList = this.bassNotes[this.mode] || this.bassNotes.peaceful;
        const bNote = bList[barIdx % bList.length];
        if (bNote && this.notes[bNote]) {
          this.playBassDrone(this.notes[bNote], now, stepDuration * 15, 0.12 * this.volume);
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
    sprite: "player.png",
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
    starting_weapon: "quote_pistols",
    starting_gadget: "chrono_comma",
    passive: "Zaman Bükücü: Chrono Comma ile başlar, yüksek seri atış.",
    sprite: "player_quillmaster.png",
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
    sprite: "player_knight.png",
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
    sprite: "player_sorceress.png",
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
    sprite: "player_alchemist.png",
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
    sprite: "player_assassin.png",
    color: "#f43f5e"
  }
};

const DIFFICULTIES = {
  easy: {
    id: "easy",
    name: "LGS / A1-A2 (Kolay & Akıcı)",
    desc: "Düşmanlar yavaş (%-25), canları az (%-35). Başlangıç canı +40 HP. Rahat öğrenme ortamı.",
    enemy_speed_mult: 0.75,
    enemy_hp_mult: 0.65,
    enemy_damage_mult: 0.60,
    player_hp_bonus: 40,
    ink_bonus_mult: 1.40
  },
  normal: {
    id: "normal",
    name: "YKS-YDT / B1 (Orta - Dengeli Roguelite)",
    desc: "Dengeli arcade deneyimi! Pürüzsüz dalga geçişleri, toplanabilir can parşömenleri ve ödüllendirici sorular.",
    enemy_speed_mult: 0.90,
    enemy_hp_mult: 0.85,
    enemy_damage_mult: 0.80,
    player_hp_bonus: 15,
    ink_bonus_mult: 1.20
  },
  hard: {
    id: "hard",
    name: "IELTS-TOEFL / B2-C1 (Hardcore Meydan Okuma)",
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
  active_boss: null,

  rune_rotation: 0,
  questions: []
};

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
  // Environment & UI
  "tile_floor.png", "tile_library_parquet.png", "magical_rune_circle.png",
  "tile_dungeon_stone.png", "magical_rune_cyan.png",
  "tile_astral_observatory.png", "magical_rune_astral.png",
  "bookshelf_wall.png", "wax_seal.png"
];

function loadAssets(callback) {
  let loaded = 0;
  spriteList.forEach(name => {
    const img = new Image();
    img.src = "assets/sprites/" + name;
    img.onload = () => {
      loaded++;
      images[name] = img;
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
if (musicBtn) {
  musicBtn.onclick = (e) => {
    e.stopPropagation();
    sounds.init();
    if (!bgm.isPlaying) {
      bgm.start();
      musicBtn.textContent = "🎵 MÜZİK";
    } else {
      const isUnmuted = bgm.toggleMute();
      musicBtn.textContent = isUnmuted ? "🎵 MÜZİK" : "🔇 MÜZİK";
    }
  };
}

// Inventory modal toggle
document.getElementById("inventory-btn").onclick = () => toggleInventoryModal();
document.getElementById("close-inventory-btn").onclick = () => toggleInventoryModal(false);
document.getElementById("gadget-panel").onclick = () => activateActiveGadget();

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
      <div style="text-align: center; padding: 25px; font-family: 'Lora', serif; color: #1b4d2e;">
        <div style="font-size: 32px; margin-bottom: 6px;">📜✨</div>
        <strong style="font-size: 16px; font-family: 'Cinzel', serif;">KÂTİP DEFTERİ TERTEMİZ!</strong>
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
function initTouchControls() {
  const joystickZone = document.getElementById("joystick-zone");
  const joystickBase = document.getElementById("joystick-base");
  const joystickKnob = document.getElementById("joystick-knob");
  const touchGadgetBtn = document.getElementById("touch-gadget-btn");
  const touchInvBtn = document.getElementById("touch-inv-btn");
  const touchMistakesBtn = document.getElementById("touch-mistakes-btn");

  if (touchGadgetBtn) {
    const fireGadget = (e) => {
      e.preventDefault();
      e.stopPropagation();
      activateActiveGadget();
    };
    touchGadgetBtn.addEventListener("pointerdown", fireGadget);
    touchGadgetBtn.addEventListener("touchstart", fireGadget, { passive: false });
  }

  if (touchInvBtn) {
    const openInv = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleInventoryModal();
    };
    touchInvBtn.addEventListener("pointerdown", openInv);
    touchInvBtn.addEventListener("touchstart", openInv, { passive: false });
  }

  if (touchMistakesBtn) {
    const openMistakes = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleMistakesModal();
    };
    touchMistakesBtn.addEventListener("pointerdown", openMistakes);
    touchMistakesBtn.addEventListener("touchstart", openMistakes, { passive: false });
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

    if (dist === 0) {
      state.touch_dir = { x: 0, y: 0 };
      joystickKnob.style.transform = "translate(0px, 0px)";
      return;
    }

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, maxRadius);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;

    state.touch_dir = {
      x: Math.cos(angle) * (clampedDist / maxRadius),
      y: Math.sin(angle) * (clampedDist / maxRadius)
    };
  }

  function resetJoystick() {
    activeTouchId = null;
    state.touch_dir = { x: 0, y: 0 };
    joystickKnob.style.transform = "translate(0px, 0px)";
  }

  joystickZone.addEventListener("pointerdown", (e) => {
    if (activeTouchId !== null) return;
    activeTouchId = e.pointerId;
    const rect = joystickBase.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;
    updateJoystickPosition(e.clientX, e.clientY);
    try { joystickZone.setPointerCapture(e.pointerId); } catch(err){}
    e.preventDefault();
  });

  window.addEventListener("pointermove", (e) => {
    if (activeTouchId === e.pointerId) {
      updateJoystickPosition(e.clientX, e.clientY);
      e.preventDefault();
    }
  });

  const endPointer = (e) => {
    if (activeTouchId === e.pointerId) {
      resetJoystick();
    }
  };
  window.addEventListener("pointerup", endPointer);
  window.addEventListener("pointercancel", endPointer);

  joystickZone.addEventListener("touchstart", (e) => {
    if (activeTouchId !== null) return;
    const touch = e.changedTouches[0];
    activeTouchId = touch.identifier;
    const rect = joystickBase.getBoundingClientRect();
    centerX = rect.left + rect.width / 2;
    centerY = rect.top + rect.height / 2;
    updateJoystickPosition(touch.clientX, touch.clientY);
    e.preventDefault();
  }, { passive: false });

  window.addEventListener("touchmove", (e) => {
    if (activeTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchId) {
        updateJoystickPosition(touch.clientX, touch.clientY);
        e.preventDefault();
        break;
      }
    }
  }, { passive: false });

  const endTouch = (e) => {
    if (activeTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchId) {
        resetJoystick();
        break;
      }
    }
  };
  window.addEventListener("touchend", endTouch);
  window.addEventListener("touchcancel", endTouch);
}

// =========================================
// 7.8 MOBILE CONTROLS VISIBILITY SYNC
// =========================================
function syncMobileControlsVisibility() {
  const controls = document.getElementById("mobile-touch-controls");
  if (!controls) return;
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.innerWidth <= 820;
  const isOverlayOpen =
    (document.getElementById("title-screen") && document.getElementById("title-screen").style.display !== "none") ||
    (document.getElementById("shop-screen") && document.getElementById("shop-screen").style.display !== "none") ||
    (document.getElementById("game-over-screen") && document.getElementById("game-over-screen").style.display !== "none") ||
    (document.getElementById("quiz-modal") && document.getElementById("quiz-modal").style.display === "flex") ||
    (document.getElementById("inventory-modal") && document.getElementById("inventory-modal").style.display === "flex") ||
    (document.getElementById("mistakes-modal") && document.getElementById("mistakes-modal").style.display === "flex");

  if (state.is_wave_active && !isOverlayOpen && isTouch) {
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
          ❤️ ${c.hp} HP | ⚔️ ${c.damage_mult}x<br>⚡ ${c.speed} HIZ ${c.armor > 0 ? '| 🛡️ +%' + Math.round(c.armor*100) : ''}
        </div>
      </div>
      <div class="desc" style="font-size: 10.5px; margin: 3px 0 2px 0;">${c.desc}</div>
      <div class="passive" style="font-size: 9.5px; padding-top: 2px;">✦ ${c.passive}</div>
    `;

    const pickChar = (e) => {
      if (e) e.stopPropagation();
      state.selected_char = cid;
      sounds.init();
      sounds.playTone(480, "sine", 0.08, 0.15);
      initTitleScreen();
    };
    card.onclick = pickChar;
    card.addEventListener("pointerup", pickChar);
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
    btn.addEventListener("pointerup", pickDiff);
    diffContainer.appendChild(btn);
  });

  document.getElementById("diff-desc").textContent = DIFFICULTIES[state.difficulty].desc;
}

const onStartGame = (e) => {
  if (e) e.stopPropagation();
  sounds.init();
  bgm.start();
  bgm.setMode("battle");
  document.getElementById("title-screen").style.display = "none";
  startGame();
};
document.getElementById("start-game-btn").onclick = onStartGame;
document.getElementById("start-game-btn").addEventListener("pointerup", onStartGame);

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
  document.getElementById("shop-screen").style.display = "none";
  updateHUD();
  syncMobileControlsVisibility();
  bgm.start();
  bgm.setMode(state.current_wave % 5 === 0 ? "boss" : "battle");

  // Milestone Boss every 5 waves
  if (state.current_wave % 5 === 0) {
    setTimeout(() => {
      if (state.is_wave_active) spawnMilestoneBoss(state.current_wave);
    }, 1800);
  }
}

function endWave() {
  state.is_wave_active = false;
  state.enemies.forEach(e => spawnInkDrop(e.x, e.y, e.ink_reward));
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
    if (keys["w"] || keys["arrowup"]) dy -= 1;
    if (keys["s"] || keys["arrowdown"]) dy += 1;
    if (keys["a"] || keys["arrowleft"]) dx -= 1;
    if (keys["d"] || keys["arrowright"]) dx += 1;
    if (dx === 0 && dy === 0) dx = p.facing_left ? -1 : 1;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;

    p.is_dashing = true;
    p.dash_timer = 0.22;
    p.dash_dir = { x: dx, y: dy };
    p.invuln_timer = 0.28;

    const eraseDmg = 65.0 * state.damage_mult;
    state.enemies.forEach(e => {
      if (Math.hypot(e.x - p.x, e.y - p.y) < 75) {
        e.hp -= eraseDmg;
        e.vx = dx * 360; e.vy = dy * 360;
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

  const effectiveSpeed = p.slow_timer > 0 ? state.move_speed * 0.72 : state.move_speed;

  if (p.is_dashing) {
    p.dash_timer -= dt;
    const dashSpd = effectiveSpeed * 3.0 + 280;
    p.x += p.dash_dir.x * dashSpd * dt;
    p.y += p.dash_dir.y * dashSpd * dt;

    const eraseDmg = 65.0 * state.damage_mult;
    state.enemies.forEach(e => {
      if (Math.hypot(e.x - p.x, e.y - p.y) < 65) {
        e.hp -= eraseDmg;
        e.vx = p.dash_dir.x * 320;
        e.vy = p.dash_dir.y * 320;
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

  p.x = Math.max(-1150, Math.min(1150, p.x));
  p.y = Math.max(-850, Math.min(850, p.y));

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
        state.ink_count += Math.ceil(drop.value * state.ink_mult);
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
        state.hp = Math.min(state.max_hp, state.hp + drop.value);
        state.particles.push({
          x: p.x, y: p.y, radius: 10, max_radius: 50,
          alpha: 1.0, color: "rgba(34, 197, 94, "
        });
        updateHUD();
      }
    }
  });
  state.health_drops = state.health_drops.filter(d => !d.collected);

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

    let nearest = null;
    let minDist = 650;
    state.enemies.forEach(e => {
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < minDist) {
        minDist = d;
        nearest = e;
      }
    });

    if (w.id === "dictionary_blade" || w.id === "calligraphy_katana") {
      w.rotation += dt * 4.5;
    } else if (nearest) {
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
        const bladeDmg = w.data.damage * (w.tier_data.damage || 1.0) * state.damage_mult;
        state.enemies.forEach(e => {
          if (Math.hypot(e.x - p.x, e.y - p.y) < 155) {
            e.hp -= bladeDmg;
            const ang = Math.atan2(e.y - p.y, e.x - p.x);
            e.vx = Math.cos(ang) * 260; e.vy = Math.sin(ang) * 260;
          }
        });
      } else if (w.id === "calligraphy_katana") {
        sounds.shoot("calligraphy_katana");
        const slashDmg = w.data.damage * (w.tier_data.damage || 1.0) * state.damage_mult;
        state.enemies.forEach(e => {
          if (Math.hypot(e.x - p.x, e.y - p.y) < 170) {
            e.hp -= slashDmg;
            const ang = Math.atan2(e.y - p.y, e.x - p.x);
            e.vx = Math.cos(ang) * 300; e.vy = Math.sin(ang) * 300;
          }
        });
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
          e.hp -= pr.dmg;
          e.vx = pr.dx * 180;
          e.vy = pr.dy * 180;
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
let spawnTimer = 0.3;
const typoWords = ["Teh", "Woudl", "Recieve", "Becaue", "Definately", "Seperate", "Tomorow", "Untill", "Beautifull", "Acommodate"];
const grammarPairs = ["is/are", "have/has", "their/there", "your/you're", "its/it's", "to/too", "affect/effect"];
const phantomPunct = ["?", ";", "!", ":", "—", "..."];

function getWaveHpMult(wave) {
  return 1.0 + (wave - 1) * 0.08 + Math.pow((wave - 1) / 22.0, 1.8);
}
function getWaveSpeedMult(wave) {
  return 1.0 + Math.min(0.45, (wave - 1) * 0.005);
}
function getWaveDamageMult(wave) {
  return 1.0 + (wave - 1) * 0.025;
}

function updateEnemies(dt) {
  if (!state.is_wave_active) return;

  state.wave_time_left -= dt;
  if (state.wave_time_left <= 0) {
    endWave();
    return;
  }

  // Golden Roguelite Spawn Curve: 1.30s at Wave 1, smoothly tightens with wave progression
  spawnTimer -= dt;
  const diffFactor = state.difficulty === "easy" ? 1.25 : (state.difficulty === "hard" ? 0.85 : 1.0);
  const waveProg = Math.min(1.0, (state.current_wave - 1) / 45.0);
  const baseInterval = 1.30 - waveProg * 1.10; // 1.30s down to 0.20s
  const interval = Math.max(0.09, baseInterval * diffFactor);

  if (spawnTimer <= 0) {
    spawnTimer = interval;
    spawnEnemy();
  }

  const p = state.player;
  const chronoMult = state.chrono_timer > 0 ? 0.15 : 1.0;

  state.enemies.forEach(e => {
    e.vx *= Math.pow(0.06, dt);
    e.vy *= Math.pow(0.06, dt);

    const dist = Math.hypot(p.x - e.x, p.y - e.y);
    const dirX = dist > 0.1 ? (p.x - e.x) / dist : 0;
    const dirY = dist > 0.1 ? (p.y - e.y) / dist : 0;
    e.facing_left = dirX < 0;

    const spd = e.speed * chronoMult;

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
      case "Red Pen Boss":
      case "Lexicon Dragon Boss": {
        e.boss_timer = (e.boss_timer || 3.0) - dt;
        if (e.boss_timer <= 0) {
          e.boss_timer = e.type === "Lexicon Dragon Boss" ? 2.6 : 3.2;
          sounds.bossRoar();
          if (e.type === "Lexicon Dragon Boss") {
            for (let i = 0; i < 8; i++) {
              const ang = (i / 8.0) * Math.PI * 2;
              spawnEnemyProjectile(e.x, e.y, Math.cos(ang), Math.sin(ang), e.damage * 0.75, 280 * chronoMult);
            }
          } else {
            const baseAng = Math.atan2(dirY, dirX);
            for (let i = -1; i <= 1; i++) {
              const ang = baseAng + i * 0.25;
              spawnEnemyProjectile(e.x, e.y, Math.cos(ang), Math.sin(ang), e.damage * 0.75, 260 * chronoMult);
            }
          }
          e.vx = dirX * 180 * chronoMult; e.vy = dirY * 180 * chronoMult;
        }
        e.x += (dirX * spd + e.vx) * dt;
        e.y += (dirY * spd + e.vy) * dt;

        if (state.active_boss === e) {
          const pct = Math.max(0, (e.hp / e.max_hp) * 100);
          document.getElementById("boss-hp-fill").style.width = pct + "%";
        }
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

  // Dead enemies & splitting & health drops
  const newEnemies = [];
  state.enemies.forEach(e => {
    if (e.hp <= 0 && !e.dead) {
      e.dead = true;
      sounds.enemyDeath();
      state.kill_count++;
      spawnInkDrop(e.x, e.y, e.ink_reward);

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
            vx: Math.cos(offAng) * 120, vy: Math.sin(offAng) * 120,
            hp: 14 * getWaveHpMult(state.current_wave), max_hp: 14 * getWaveHpMult(state.current_wave),
            speed: 120 * getWaveSpeedMult(state.current_wave), damage: 6 * getWaveDamageMult(state.current_wave),
            ink_reward: 1, label: "Splinter", sprite: "typo_splinter.png", size: 22, facing_left: false
          });
        }
      }

      if (e.type === "Red Pen Boss" || e.type === "Lexicon Dragon Boss") {
        state.active_boss = null;
        document.getElementById("boss-hp-container").style.display = "none";
        // Guaranteed Boss Elixir (+50 HP)
        state.health_drops.push({ x: e.x, y: e.y, value: 50, collected: false });
        for (let i = 0; i < 18; i++) {
          spawnInkDrop(e.x + (Math.random() - 0.5) * 90, e.y + (Math.random() - 0.5) * 90, 5);
        }
      }
      updateHUD();
    }
  });

  state.enemies = state.enemies.filter(e => !e.dead).concat(newEnemies);
}

function spawnEnemy() {
  const p = state.player;
  const ang = Math.random() * Math.PI * 2;
  const dist = 700;
  const x = p.x + Math.cos(ang) * dist;
  const y = p.y + Math.sin(ang) * dist;

  const d = DIFFICULTIES[state.difficulty];
  const wave = state.current_wave;
  const hpM = getWaveHpMult(wave) * d.enemy_hp_mult;
  const spdM = getWaveSpeedMult(wave) * d.enemy_speed_mult;
  const dmgM = getWaveDamageMult(wave) * d.enemy_damage_mult;

  const roll = Math.random();

  if (wave >= 30 && roll < 0.14) {
    state.enemies.push({
      type: "Oxymoron Ogre", x, y, vx: 0, vy: 0,
      hp: 280 * hpM, max_hp: 280 * hpM, speed: 65 * spdM, damage: 22 * dmgM,
      ink_reward: 10, label: "OXYMORON OGRE", sprite: "oxymoron_ogre.png", size: 58,
      is_elite: wave > 40, facing_left: false
    });
  } else if (wave >= 25 && roll < 0.26) {
    state.enemies.push({
      type: "Vocabulary Void", x, y, vx: 0, vy: 0,
      hp: 160 * hpM, max_hp: 160 * hpM, speed: 55 * spdM, damage: 16 * dmgM,
      ink_reward: 8, label: "VOCAB VOID", sprite: "vocabulary_void.png", size: 50,
      is_elite: wave > 50, facing_left: false
    });
  } else if (wave >= 20 && roll < 0.40) {
    state.enemies.push({
      type: "Homophone Harpy", x, y, vx: 0, vy: 0,
      hp: 68 * hpM, max_hp: 68 * hpM, speed: 130 * spdM, damage: 12 * dmgM,
      ink_reward: 6, label: "HARPY", sprite: "homophone_harpy.png", size: 46, facing_left: false
    });
  } else if (wave >= 15 && roll < 0.52) {
    state.enemies.push({
      type: "Malapropism Mimic", x, y, vx: 0, vy: 0,
      hp: 95 * hpM, max_hp: 95 * hpM, speed: 115 * spdM, damage: 14 * dmgM,
      ink_reward: 6, label: "MIMIC", sprite: "malapropism_mimic.png", size: 42, facing_left: false
    });
  } else if (wave >= 10 && roll < 0.64) {
    state.enemies.push({
      type: "Idiom Imp", x, y, vx: 0, vy: 0,
      hp: 48 * hpM, max_hp: 48 * hpM, speed: 135 * spdM, damage: 10 * dmgM,
      ink_reward: 4, label: "IDIOM IMP", sprite: "idiom_imp.png", size: 36, facing_left: false
    });
  } else if (wave >= 5 && roll < 0.78) {
    state.enemies.push({
      type: "Punctuation Phantom", x, y, vx: 0, vy: 0,
      hp: 55 * hpM, max_hp: 55 * hpM, speed: 95 * spdM, damage: 10 * dmgM,
      ink_reward: 4, label: phantomPunct[Math.floor(Math.random() * phantomPunct.length)],
      sprite: "punctuation_phantom.png", size: 42, shoot_cooldown: 2.0 + Math.random() * 0.8, facing_left: false
    });
  } else if (roll < 0.90) {
    state.enemies.push({
      type: "Grammar Goblin", x, y, vx: 0, vy: 0,
      hp: 34 * hpM, max_hp: 34 * hpM, speed: 110 * spdM, damage: 9 * dmgM,
      ink_reward: 3, label: grammarPairs[Math.floor(Math.random() * grammarPairs.length)],
      sprite: "grammar_goblin.png", size: 34, dash_cooldown: 2.5 + Math.random() * 1.0, facing_left: false
    });
  } else {
    state.enemies.push({
      type: "Typo Slime", x, y, vx: 0, vy: 0,
      hp: 44 * hpM, max_hp: 44 * hpM, speed: 68 * spdM, damage: 8 * dmgM,
      ink_reward: 3, label: typoWords[Math.floor(Math.random() * typoWords.length)],
      sprite: "typo_slime.png", size: 36, facing_left: false
    });
  }
}

function spawnMilestoneBoss(wave) {
  const p = state.player;
  const ang = Math.random() * Math.PI * 2;
  const dist = 600;
  const d = DIFFICULTIES[state.difficulty];
  const hpM = getWaveHpMult(wave) * d.enemy_hp_mult;

  sounds.bossRoar();

  let boss = null;
  if (wave === 100) {
    boss = {
      type: "Lexicon Dragon Boss", x: p.x + Math.cos(ang) * dist, y: p.y + Math.sin(ang) * dist,
      vx: 0, vy: 0, hp: 6500 * d.enemy_hp_mult, max_hp: 6500 * d.enemy_hp_mult,
      speed: 95 * d.enemy_speed_mult, damage: 40 * d.enemy_damage_mult,
      ink_reward: 120, label: "THE OMEGA LEXICON DRAGON (WAVE 100 FINAL BOSS)",
      sprite: "lexicon_dragon_boss.png", size: 88, is_elite: true, facing_left: false
    };
  } else if (wave === 50) {
    boss = {
      type: "Lexicon Dragon Boss", x: p.x + Math.cos(ang) * dist, y: p.y + Math.sin(ang) * dist,
      vx: 0, vy: 0, hp: 2800 * d.enemy_hp_mult, max_hp: 2800 * d.enemy_hp_mult,
      speed: 90 * d.enemy_speed_mult, damage: 32 * d.enemy_damage_mult,
      ink_reward: 70, label: "GREAT LEXICON DRAGON (WAVE 50 OVERLORD)",
      sprite: "lexicon_dragon_boss.png", size: 80, is_elite: true, facing_left: false
    };
  } else {
    boss = {
      type: "Red Pen Boss", x: p.x + Math.cos(ang) * dist, y: p.y + Math.sin(ang) * dist,
      vx: 0, vy: 0, hp: (420 + wave * 22) * hpM, max_hp: (420 + wave * 22) * hpM,
      speed: 80 * d.enemy_speed_mult, damage: (20 + wave * 0.3) * d.enemy_damage_mult,
      ink_reward: 45, label: `RED PEN INQUISITOR (WAVE ${wave} BOSS)`,
      sprite: "red_pen_boss.png", size: 66, is_elite: wave > 30, facing_left: false
    };
  }

  state.enemies.push(boss);
  state.active_boss = boss;

  const bar = document.getElementById("boss-hp-container");
  document.getElementById("boss-hp-title").textContent = `⚔️ ${boss.label} ⚔️`;
  bar.style.display = "flex";
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
  updateHUD();

  if (state.hp <= 0) gameOver();
}

function gameOver() {
  state.is_wave_active = false;
  bgm.setMode("peaceful");
  syncMobileControlsVisibility();
  const modal = document.getElementById("game-over-screen");
  const title = document.getElementById("game-over-title");
  const summary = document.getElementById("game-over-summary");
  const wordsList = state.words_learned.length ? state.words_learned.join(", ") : "Henüz kelime mühürlenemedi.";

  title.textContent = "OYUN BİTTİ - KİTAP KAPANDI";
  title.style.color = "#8b0000";

  summary.textContent = `✦ Mühürlenen Kelimeler (${state.words_learned.length}):\n${wordsList}\n\n` +
    `👤 Seçilen Kâtip: ${CHARACTERS[state.selected_char].name}\n` +
    `🎯 Zorluk Mertebesi: ${DIFFICULTIES[state.difficulty].name}\n` +
    `⏳ Ulaşılan Dalga: ${state.current_wave} / 100\n` +
    `💀 Biçilen Hatalar: ${state.kill_count}\n` +
    `💧 Toplanan Mürekkep: ${state.ink_count}`;

  modal.style.display = "flex";
}

function victoryScreen() {
  state.is_wave_active = false;
  bgm.setMode("peaceful");
  syncMobileControlsVisibility();
  const modal = document.getElementById("game-over-screen");
  const title = document.getElementById("game-over-title");
  const summary = document.getElementById("game-over-summary");
  const wordsList = state.words_learned.length ? state.words_learned.join(", ") : "Tüm sözlükler kurtarıldı!";

  title.textContent = "✦ EFSANEVİ ZAFER: 100 DALGA TAMAMLANDI! ✦";
  title.style.color = "#1b4d2e";

  summary.textContent = `İNANILMAZ BAŞARI! 100 Dalganın tamamını aşarak The Omega Lexicon Dragon'ı yendiniz!\n` +
    `Tüm dillerin ve sözlüklerin mutlak Koruyucusu (Grand Lexicon Guardian) unvanını kazandınız!\n\n` +
    `✦ Hazinenize Eklenen Kelimeler (${state.words_learned.length}):\n${wordsList}\n\n` +
    `👤 Kahraman: ${CHARACTERS[state.selected_char].name}\n` +
    `💀 Toplam Temizlenen Hata: ${state.kill_count}\n` +
    `💧 Geri Kazanılan Mürekkep: ${state.ink_count}`;

  modal.style.display = "flex";
}

const onRestart = () => {
  document.getElementById("game-over-screen").style.display = "none";
  document.getElementById("title-screen").style.display = "flex";
  initTitleScreen();
  syncMobileControlsVisibility();
};
document.getElementById("restart-game-btn").onclick = onRestart;
document.getElementById("restart-game-btn").addEventListener("pointerup", onRestart);

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
}

function updateShopTopBar() {
  document.getElementById("shop-ink-display").textContent = "💧 Mürekkep: " + state.ink_count;
  const synKeys = Object.keys(state.active_synergies);
  if (synKeys.length === 0) {
    document.getElementById("shop-synergy-text").textContent = "Aktif Sinerji: Yok (Aynı türden 3 kelime tomârı toplayarak antik sinerji kilidini aç!)";
  } else {
    document.getElementById("shop-synergy-text").textContent = "Aktif Kadim Sinerjiler: " + synKeys.map(k => `✦ [${k}]`).join(" ");
  }
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
  document.getElementById("tab-cards-btn").className = "tab-btn" + (currentShopTab === "cards" ? " active" : "");
  document.getElementById("tab-weapons-btn").className = "tab-btn" + (currentShopTab === "weapons" ? " active" : "");
  document.getElementById("tab-gadgets-btn").className = "tab-btn" + (currentShopTab === "gadgets" ? " active" : "");
  document.getElementById("tab-artifacts-btn").className = "tab-btn" + (currentShopTab === "artifacts" ? " active" : "");
  document.getElementById("shop-reroll-btn").style.display = currentShopTab === "cards" ? "inline-flex" : "none";
}

document.getElementById("tab-cards-btn").onclick = () => { currentShopTab = "cards"; highlightShopTabs(); renderShopView(); };
document.getElementById("tab-weapons-btn").onclick = () => { currentShopTab = "weapons"; highlightShopTabs(); renderShopView(); };
document.getElementById("tab-gadgets-btn").onclick = () => { currentShopTab = "gadgets"; highlightShopTabs(); renderShopView(); };
document.getElementById("tab-artifacts-btn").onclick = () => { currentShopTab = "artifacts"; highlightShopTabs(); renderShopView(); };

document.getElementById("shop-reroll-btn").onclick = () => {
  if (state.ink_count >= 5) {
    state.ink_count -= 5;
    refreshShopCards();
    renderShopView();
    updateShopTopBar();
    updateHUD();
  }
};

document.getElementById("shop-next-wave-btn").onclick = () => {
  document.getElementById("shop-screen").style.display = "none";
  state.current_wave++;
  startWave();
};

function renderShopView() {
  const grid = document.getElementById("shop-items-grid");
  grid.innerHTML = "";

  if (currentShopTab === "cards") {
    shopCards.forEach((c, idx) => {
      const isRedemption = !!c.is_review_redemption;
      const card = document.createElement("div");
      card.className = "choice-card";
      if (isRedemption) {
        card.style.border = "2px solid #8b0000";
        card.style.background = "#fff8f5";
        card.style.boxShadow = "0 0 12px rgba(139, 0, 0, 0.25)";
      }
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 10px; color: #8c5d2b; font-family: 'Cinzel', serif;">[${c.type} • ${c.level}]</span>
          ${isRedemption ? '<span style="font-size: 9px; font-weight: bold; background: #8b0000; color: #fff; padding: 1px 4px; border-radius: 2px;">✦ HATA PEKİŞTİRME</span>' : ''}
        </div>
        <h3 style="font-size: 16px; color: #2b170c; margin: 2px 0;">${c.word}</h3>
        <div style="font-size: 11.5px; color: #1b4d2e; font-weight: bold; margin-bottom: 3px;">${c.description}</div>
        <div style="font-size: 11px; color: #5c3e21; font-style: italic; margin-bottom: 6px; flex-grow: 1;">"${c.example || ''}"</div>
        <button class="btn btn-seal" id="card-buy-${idx}" ${state.ink_count < c.cost ? "disabled" : ""}>
          💧 ${c.cost} Sınava Gir & Al
        </button>
      `;
      card.querySelector(`#card-buy-${idx}`).onclick = (e) => {
        e.stopPropagation();
        openQuiz(c, idx);
      };
      grid.appendChild(card);
    });
  } else if (currentShopTab === "weapons") {
    Object.keys(WEAPONS_CATALOG).forEach(wId => {
      const w = WEAPONS_CATALOG[wId];
      const card = document.createElement("div");
      card.className = "choice-card";
      card.innerHTML = `
        <div style="font-size: 10px; color: #b85c18; font-family: 'Cinzel', serif;">[SİLAH]</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin: 2px 0;">
          <img src="assets/sprites/${w.sprite}" style="width: 24px; height: 24px;" alt="${w.name}">
          <h3 style="font-size: 14.5px; color: #2b170c;">${w.name.split(" ")[0]}</h3>
        </div>
        <div style="font-size: 11px; color: #442a18; margin-bottom: 3px;">${w.desc}</div>
        <div style="font-size: 10.5px; color: #8b0000; font-family: 'Cinzel', serif; font-weight: bold; margin-bottom: 6px; flex-grow: 1;">
          Hasar: ${w.damage} | Atış: ${w.cooldown}s
        </div>
        <button class="btn btn-seal" id="weap-buy-${wId}" ${state.ink_count < w.cost ? "disabled" : ""}>
          💧 ${w.cost} Satın Al
        </button>
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
      card.className = "choice-card";
      card.innerHTML = `
        <div style="font-size: 10px; color: #0284c7; font-family: 'Cinzel', serif;">[AKTİF GADGET CİHAZI]</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin: 3px 0;">
          <img src="assets/sprites/${g.sprite}" style="width: 28px; height: 28px;" alt="${g.name}">
          <h3 style="font-size: 15px; color: #2b170c;">${g.name.split(" ")[0]}</h3>
        </div>
        <div style="font-size: 11.5px; color: #442a18; margin-bottom: 4px; flex-grow: 1;">${g.desc}</div>
        <div style="font-size: 10.5px; color: #55efc4; font-family: 'Cinzel', serif; font-weight: bold; margin-bottom: 6px;">
          Bekleme Süresi: ${g.cooldown}s
        </div>
        <button class="btn ${isAct ? '' : 'btn-emerald'}" id="gad-buy-${gId}" ${isAct || state.ink_count < g.cost ? 'disabled' : ''}>
          ${isAct ? '✦ Kuşanıldı' : (g.cost > 0 ? '💧 ' + g.cost + ' Kuşan' : 'Kuşan')}
        </button>
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
      card.className = "choice-card";
      card.innerHTML = `
        <div style="font-size: 10px; color: #6d28d9; font-family: 'Cinzel', serif;">[KÜTÜPHANE YADİGÂRI]</div>
        <h3 style="font-size: 15px; color: #2b170c; margin: 2px 0;">${a.name}</h3>
        <div style="font-size: 11.5px; color: #1b4d2e; font-weight: 600; margin-bottom: 6px; flex-grow: 1;">${a.desc}</div>
        <button class="btn ${isOwned ? '' : 'btn-emerald'}" id="art-buy-${aId}" ${isOwned || state.ink_count < a.cost ? "disabled" : ""}>
          ${isOwned ? '✓ Alındı' : '💧 ' + a.cost + ' Mühürle'}
        </button>
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
  const modal = document.getElementById("quiz-modal");
  modal.style.display = "flex";
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

  card.options.forEach((opt, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-opt-btn";
    btn.textContent = `${['A', 'B', 'C', 'D'][idx] || (idx+1)}) ${opt}`;
    btn.onclick = () => {
      optsContainer.querySelectorAll("button").forEach(b => b.disabled = true);
      const isCorrect = idx === card.correct_index;

      if (card.id && !state.asked_question_ids.includes(card.id)) {
        state.asked_question_ids.push(card.id);
      }

      if (isCorrect) {
        sounds.quizSuccess();
        const discCost = Math.ceil(card.cost * 0.5);
        state.ink_count -= discCost;

        // Check if this was a mistake redemption from the notebook
        const mIdx = state.mistake_words.findIndex(m => m.word === card.word);
        if (mIdx !== -1) {
          state.mistake_words.splice(mIdx, 1);
          try { localStorage.setItem("lexicon_mistakes", JSON.stringify(state.mistake_words)); } catch(e){}
          state.hp = Math.min(state.max_hp, state.hp + 35);
          resText.textContent = `✦ PEKİŞTİRME ZAFERİ! HATA DEFTERİNDEN SİLİNDİ! ✦\n%50 İndirim, +%75 Nitelik Bonusu ve +35 HP Can Yenilendi!\nÖdenen: ${discCost} Mürekkep`;
          resText.style.color = "#1b4d2e";
          resText.style.background = "rgba(46, 125, 50, 0.22)";
          applyCardUpgrade(card, true, 1.75);
        } else {
          state.hp = Math.min(state.max_hp, state.hp + 25);
          resText.textContent = `✦ DOĞRU CEVAP! KÂTİP MÜHRÜ KAZANILDI! ✦\n%50 İndirim, +%50 Nitelik Bonusu ve +25 HP Can Yenilendi!\nÖdenen: ${discCost} Mürekkep`;
          resText.style.color = "#1b4d2e";
          resText.style.background = "rgba(46, 125, 50, 0.15)";
          applyCardUpgrade(card, true, 1.5);
        }
      } else {
        sounds.quizFail();
        state.ink_count -= card.cost;
        resText.textContent = `✗ YANLIŞ CEVAP! Doğru Seçenek: "${card.options[card.correct_index]}"\nKelime Kâtip Hata Defterine eklendi (sonraki turlarda pekiştirilecek)!\nÖdenen: ${card.cost} Mürekkep`;
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
    optsContainer.appendChild(btn);
  });

  continueBtn.onclick = () => {
    modal.style.display = "none";
    renderShopView();
    updateShopTopBar();
    updateHUD();
    syncMobileControlsVisibility();
  };
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
  document.getElementById("syn-title").textContent = `✦ YENİ SİNERJİ AÇILDI: ${name} ✦`;
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
    combineBtn.textContent = `✦ [${WEAPONS_CATALOG[canCombine.id].name.split(" ")[0]}] BİRLEŞTİR ➔ ${TIER_MULTIPLIERS[canCombine.tier + 1].name}`;
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
  document.getElementById("timer-badge").textContent = `⏳ DALGA ${state.current_wave} / 100 • ${Math.ceil(state.wave_time_left)}s`;
  document.getElementById("ink-count").textContent = `💧 ${state.ink_count}`;
  document.getElementById("kill-count").textContent = `💀 ${state.kill_count}`;

  const c = CHARACTERS[state.selected_char];
  const d = DIFFICULTIES[state.difficulty];
  document.getElementById("char-diff-info").textContent = `👤 ${c.name} • 🎯 ${d.name}`;

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
    badge.style.fontFamily = "'Cinzel', serif";
    badge.style.fontSize = "11px";

    if (isAct) {
      badge.style.background = "linear-gradient(180deg, #9b1c1c, #630c0c)";
      badge.style.border = "1.5px solid #ffd700";
      badge.style.color = "#fff8e7";
      badge.style.fontWeight = "bold";
      badge.textContent = `★[${idx + 1}: ${w.name.split(" ")[0]} ${t.stars}]`;
    } else {
      badge.style.background = "rgba(34, 20, 13, 0.75)";
      badge.style.border = "1px solid rgba(212, 175, 55, 0.4)";
      badge.style.color = "#d4af37";
      badge.textContent = `${idx + 1}:${w.name.split(" ")[0]}`;
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
    gStatus.style.color = "#55efc4";
  } else {
    gStatus.textContent = state.gadget_timer.toFixed(1) + "s";
    gStatus.style.color = "#ff7675";
  }
}

// =========================================
// 16. RENDERING
// =========================================
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const p = state.player;

  ctx.save();
  ctx.translate(cx - p.x, cy - p.y);

  // Dynamic Arenas based on progression
  let floorSprite = "tile_library_parquet.png";
  let runeSprite = "magical_rune_circle.png";
  let borderOuter = "#8c6d23";
  let borderInner = "#d4af37";

  if (state.current_wave >= 61) {
    // Arena 3: Astral Observatory (Waves 61-100)
    floorSprite = "tile_astral_observatory.png";
    runeSprite = "magical_rune_astral.png";
    borderOuter = "#4c1d95";
    borderInner = "#f59e0b";
  } else if (state.current_wave >= 26) {
    // Arena 2: Forbidden Archives (Waves 26-60)
    floorSprite = "tile_dungeon_stone.png";
    runeSprite = "magical_rune_cyan.png";
    borderOuter = "#0891b2";
    borderInner = "#22d3ee";
  }

  const floorImg = images[floorSprite] || images["tile_library_parquet.png"] || images["tile_floor.png"];
  if (floorImg) {
    const pattern = ctx.createPattern(floorImg, "repeat");
    ctx.fillStyle = pattern;
    ctx.fillRect(-1200, -900, 2400, 1800);
  } else {
    ctx.fillStyle = "#1e140d";
    ctx.fillRect(-1200, -900, 2400, 1800);
  }

  // Central Magical Rune Circle
  state.rune_rotation += 0.003;
  const runeImg = images[runeSprite] || images["magical_rune_circle.png"];
  if (runeImg) {
    ctx.save();
    ctx.translate(0, 0);
    ctx.rotate(state.rune_rotation);
    ctx.globalAlpha = 0.55 + Math.sin(state.rune_rotation * 4) * 0.15;
    ctx.drawImage(runeImg, -210, -210, 420, 420);
    ctx.restore();
  }

  // Bookshelf Borders
  const shelfImg = images["bookshelf_wall.png"];
  if (shelfImg) {
    const shelfPattern = ctx.createPattern(shelfImg, "repeat");
    ctx.fillStyle = shelfPattern;
    ctx.fillRect(-1220, -920, 2440, 40);
    ctx.fillRect(-1220, 880, 2440, 40);
    ctx.fillRect(-1220, -920, 40, 1840);
    ctx.fillRect(1180, -920, 40, 1840);
  }

  // Gold Borders
  ctx.strokeStyle = borderOuter; ctx.lineWidth = 4;
  ctx.strokeRect(-1180, -880, 2360, 1760);
  ctx.strokeStyle = borderInner; ctx.lineWidth = 1.5;
  ctx.strokeRect(-1174, -874, 2348, 1748);

  // Motes
  state.ambient_motes.forEach(m => {
    m.x += Math.cos(m.angle) * m.speed * 0.016;
    m.y += Math.sin(m.angle) * m.speed * 0.016;
    if (m.x < -1150) m.x = 1150;
    if (m.x > 1150) m.x = -1150;
    if (m.y < -850) m.y = 850;
    if (m.y > 850) m.y = -850;

    ctx.save();
    ctx.fillStyle = `rgba(255, 215, 0, ${m.alpha})`;
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

  // Enemies
  state.enemies.forEach(e => {
    ctx.save();
    ctx.translate(e.x, e.y);
    if (e.facing_left) ctx.scale(-1, 1);

    const spr = images[e.sprite];
    const sz = e.size || 36;
    if (spr) ctx.drawImage(spr, -sz / 2, -sz / 2, sz, sz);

    if (e.is_elite && images["elite_crown.png"]) {
      ctx.drawImage(images["elite_crown.png"], -10, -sz / 2 - 16, 20, 20);
    }
    ctx.restore();

    if (e.max_hp > 150) {
      const barW = e.size || 40;
      const pct = Math.max(0, e.hp / e.max_hp);
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(e.x - barW / 2, e.y - (e.size / 2) - 10, barW, 4);
      ctx.fillStyle = "#ff5252";
      ctx.fillRect(e.x - barW / 2, e.y - (e.size / 2) - 10, barW * pct, 4);
    }

    ctx.fillStyle = "#f6eedb";
    ctx.font = "bold 11px 'Cinzel', serif";
    ctx.textAlign = "center";
    ctx.fillText(e.label, e.x, e.y - (e.size / 2) - 13);
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
  const pSpr = images[cData.sprite] || images["player.png"];
  if (pSpr) ctx.drawImage(pSpr, -26, -26, 52, 52);
  ctx.restore();

  // Floating Slotted Weapons Arsenal
  state.weapons.forEach((w, idx) => {
    ctx.save();
    let wx = p.x; let wy = p.y;
    const isAct = (idx === state.active_weapon_index);
    if (state.weapons.length > 1) {
      const ang = (idx / state.weapons.length) * Math.PI * 2;
      const dist = isAct ? 30 : 23;
      wx += Math.cos(ang) * dist;
      wy += Math.sin(ang) * dist;
    }
    ctx.translate(wx, wy);
    ctx.rotate(w.rotation);

    if (isAct) {
      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 14;
      ctx.scale(1.24, 1.24);
    }

    const wSpr = images[w.data.sprite];
    if (wSpr) ctx.drawImage(wSpr, 4, -16, 32, 32);
    ctx.restore();
  });

  ctx.restore();
}

// =========================================
// 17. MAIN GAME LOOP
// =========================================
function gameLoop(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;

  if (state.is_wave_active) {
    updatePlayer(dt);
    updateEnemies(dt);
    updateHUD();
  }

  render();
  requestAnimationFrame(gameLoop);
}

loadAssets(() => {
  initTitleScreen();
  initTouchControls();
  requestAnimationFrame(gameLoop);
});
