/* =========================================================
   解压火锅店 · 游戏逻辑 / 声音
   ========================================================= */
(function () {
  'use strict';

  const TYPES = window.HOTPOT_INGREDIENTS || [];
  if (!TYPES.length) {
    console.error('食材图鉴没有加载。');
    return;
  }

  const COPIES = 3;
  const REQUIRED = 3;
  const TOTAL = TYPES.length * COPIES;
  const START_SLOTS = 3;
  const MAX_SLOTS = 4;
  const TEMP_SLOTS = 5;
  // 锅内食材按汤深分层，各自做独立物理碰撞。
  // 为了让 57 份食材在同一层里有真正的运动空间，整体尺寸按物理密度回调；
  // 单种食材的相对大小仍由 type.size 控制。
  const ITEM_SCALE = 0.64;
  // 视觉放大倍率：默认恢复为原始大小；四种大件继续保留 3 倍；青花椒 1.5 倍。
  // 为保证每一层图片不重叠，视觉尺寸收进碰撞体范围；
  // 之前几倍大的视觉倍率无法在 3 层 57 份里同时做到不重叠。
  const VISUAL_FIT_SCALE = 0.92;
  const LAYER_COUNT = 3;
  const LAYER_NAMES = ['surface', 'mid', 'deep'];
  const LAYER_SIZE_SCALE = [1, 0.97, 0.94];
  const LAYER_Z_BASE = [7600, 4800, 2000];
  const COLLISION_FACTOR = 0.43;
  const PHYSICS_STEP = 1 / 60;
  // 同层食材之间做完全弹性碰撞；撞完只慢慢回到各自的巡航速度，方向保持自由。
  const PAIR_RESTITUTION = 1;
  const WALL_RESTITUTION = 0.78;
  const MAX_SPEED = 0.085;
  const CRUISE_RELAX = 0.12;
  const SCORE_ITEM = 10;
  const SCORE_PLATE = 40;
  const STORAGE_MUTED = 'hotpot-relax.muted.v1';
  const STORAGE_BEST = 'hotpot-relax.best.v1';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const dom = {
    game: $('#game'),
    startScreen: $('#startScreen'),
    pauseScreen: $('#pauseScreen'),
    finishScreen: $('#finishScreen'),
    pauseBtn: $('#pauseBtn'),
    startBtn: $('#startBtn'),
    resumeBtn: $('#resumeBtn'),
    againBtn: $('#againBtn'),
    restartFromPause: $('#restartFromPause'),
    muteBtn: $('#muteBtn'),
    pauseMuteBtn: $('#pauseMuteBtn'),
    introMuteBtn: $('#introMuteBtn'),
    introAudioText: $('#introAudioText'),
    hintBtn: $('#hintBtn'),
    addPlateBtn: $('#addPlateBtn'),
    shuffleBtn: $('#shuffleBtn'),
    shakeBtn: $('#shakeBtn'),
    plateRow: $('#plateRow'),
    tempShelf: $('#tempShelf'),
    tempPlateRow: $('#tempPlateRow'),
    tempCount: $('#tempCount'),
    itemsLayer: $('#itemsLayer'),
    potWrap: $('#potWrap'),
    potStage: $('#potStage'),
    brothBubbles: $('#brothBubbles'),
    remaining: $('#remaining'),
    timer: $('#timer'),
    score: $('#score'),
    scoreBox: $('#scoreBox'),
    servedCount: $('#servedCount'),
    toastStack: $('#toastStack'),
    announcer: $('#announcer'),
    pauseRemaining: $('#pauseRemaining'),
    pauseServed: $('#pauseServed'),
    pauseScore: $('#pauseScore'),
    finishTime: $('#finishTime'),
    finishPlates: $('#finishPlates'),
    finishScore: $('#finishScore'),
    bestLine: $('#bestLine'),
  };

  const typeById = new Map(TYPES.map((type) => [type.id, type]));
  const gamePanels = [
    $('.hud'),
    $('.orders'),
    $('.temp-shelf'),
    $('.pot-stage'),
    $('.tools'),
  ].filter(Boolean);
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let artSequence = 0;
  let itemSequence = 0;
  let roundSeed = 0;
  const ALPHA_MASK_SIZE = 256;
  const ALPHA_THRESHOLD = 24;
  const alphaMasks = new Map();

  const physics = {
    layers: [],
    world: 0,
    raf: null,
    lastTs: 0,
    accumulator: 0,
    collisions: 0,
    initialOverlap: 0,
    reflowQueued: false,
    reflowClock: 0,
  };

  const state = {
    started: false,
    running: false,
    paused: false,
    ended: false,
    finishPending: false,
    remaining: TOTAL,
    found: 0,
    score: 0,
    served: 0,
    maxSlots: START_SLOTS,
    activeTargets: [],
    queue: [],
    items: [],
    tempSlots: [],
    elapsed: 0,
    clockStart: null,
    clockTimer: null,
    hintTimer: null,
    hintClearTimer: null,
    pendingTimers: new Set(),
    cooldownTimers: new Set(),
    wrongAt: 0,
    lastHintToastAt: 0,
  };

  function later(fn, ms) {
    const id = window.setTimeout(() => {
      state.pendingTimers.delete(id);
      fn();
    }, ms);
    state.pendingTimers.add(id);
    return id;
  }

  function clearPendingTimers() {
    state.pendingTimers.forEach((id) => window.clearTimeout(id));
    state.pendingTimers.clear();
  }

  function clearCooldownTimers() {
    state.cooldownTimers.forEach((id) => window.clearTimeout(id));
    state.cooldownTimers.clear();
  }

  function readStorage(key, fallback = null) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      /* 本地文件打开时，部分浏览器会禁用 localStorage，不影响游戏。 */
    }
  }

  function readMuted() {
    return readStorage(STORAGE_MUTED, '0') === '1';
  }

  function readBestTime() {
    const value = Number(readStorage(STORAGE_BEST, '0'));
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  function formatTime(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function makeRng(seed) {
    let value = seed >>> 0;
    return function random() {
      value += 0x6D2B79F5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(list, random = Math.random) {
    const result = list.slice();
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
  }

  function makeArt(type) {
    artSequence += 1;
    if (type.image) {
      return `<img class="food-img" src="${type.image}" alt="" aria-hidden="true" draggable="false" decoding="async" onload="this.classList.add('is-ready')">`;
    }
    try {
      return type.art(artSequence);
    } catch (error) {
      console.warn('食材绘制失败', type.name, error);
      return `<span style="display:block;width:100%;height:100%;border-radius:50%;background:#e6b169"></span>`;
    }
  }

  function buildAlphaMask(type, image) {
    if (!type || !type.image || alphaMasks.has(type.id)) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = ALPHA_MASK_SIZE;
      canvas.height = ALPHA_MASK_SIZE;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return;
      context.clearRect(0, 0, ALPHA_MASK_SIZE, ALPHA_MASK_SIZE);
      context.drawImage(image, 0, 0, ALPHA_MASK_SIZE, ALPHA_MASK_SIZE);
      const pixels = context.getImageData(0, 0, ALPHA_MASK_SIZE, ALPHA_MASK_SIZE).data;
      const mask = new Uint8Array(ALPHA_MASK_SIZE * ALPHA_MASK_SIZE);
      for (let index = 0; index < mask.length; index += 1) {
        mask[index] = pixels[index * 4 + 3];
      }
      alphaMasks.set(type.id, mask);
    } catch (error) {
      // file:// 打开时 canvas 可能被浏览器视为跨域，退回按圆形范围判断。
    }
  }

  function preloadFoodImages() {
    TYPES.forEach((type) => {
      if (!type.image) return;
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => buildAlphaMask(type, image);
      image.src = type.image;
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[character]));
  }

  /* =======================================================
     声音：轻柔锅物小调 + 捞取音效
     ======================================================= */
  const Soundscape = {
    ctx: null,
    master: null,
    musicGain: null,
    sfxGain: null,
    reverbSend: null,
    ambience: null,
    noiseBuffer: null,
    muted: readMuted(),
    scheduler: null,
    nextStepTime: 0,
    stepIndex: 0,
    stepDur: 60 / 56 / 2,
    barCount: 0,
    bubbleTimer: null,
    bubbleActive: false,
    started: false,

    chords: [
      [50, 57, 62, 66],
      [47, 54, 59, 62],
      [43, 50, 55, 59],
      [45, 52, 57, 59],
      [50, 57, 62, 66],
      [47, 54, 59, 62],
      [43, 50, 55, 59],
      [45, 52, 57, 61]
    ],

    melody: [
      [74, null, 69, null, 66, null, 69, null],
      [71, null, 66, null, 69, null, 74, null],
      [76, null, 74, null, 71, null, 69, null],
      [69, null, 66, null, 64, null, 69, null],
      [74, 78, null, 76, null, 74, null, 69],
      [71, null, 74, null, 69, null, 66, null],
      [76, null, 74, 71, null, 69, null, 66],
      [69, 71, null, 74, null, 71, null, 66]
    ],

    init() {
      if (this.ctx) return;
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      try {
        const context = new AudioCtor();
        this.ctx = context;

        const master = context.createGain();
        master.gain.value = this.muted ? 0 : 0.72;

        const compressor = context.createDynamicsCompressor();
        compressor.threshold.value = -20;
        compressor.knee.value = 24;
        compressor.ratio.value = 3;
        compressor.attack.value = 0.004;
        compressor.release.value = 0.28;

        master.connect(compressor);
        compressor.connect(context.destination);
        this.master = master;

        const musicGain = context.createGain();
        musicGain.gain.value = 0;
        musicGain.connect(master);
        this.musicGain = musicGain;

        const sfxGain = context.createGain();
        sfxGain.gain.value = 0.9;
        sfxGain.connect(master);
        this.sfxGain = sfxGain;

        const reverb = context.createConvolver();
        reverb.buffer = this.makeImpulse(2.1, 2.35);
        const reverbSend = context.createGain();
        reverbSend.gain.value = 0.3;
        reverbSend.connect(reverb);
        reverb.connect(master);
        this.reverbSend = reverbSend;

        this.noiseBuffer = this.makeNoiseBuffer(2.5);
        this.startAmbience();
      } catch (error) {
        console.warn('声音启动失败', error);
        this.ctx = null;
      }
    },

    makeImpulse(duration, decay) {
      const context = this.ctx;
      const rate = context.sampleRate;
      const length = Math.max(1, Math.floor(rate * duration));
      const impulse = context.createBuffer(2, length, rate);
      for (let channel = 0; channel < 2; channel += 1) {
        const data = impulse.getChannelData(channel);
        for (let index = 0; index < length; index += 1) {
          const progress = index / length;
          data[index] = (Math.random() * 2 - 1) * Math.pow(1 - progress, decay);
        }
      }
      return impulse;
    },

    makeNoiseBuffer(seconds) {
      const context = this.ctx;
      const rate = context.sampleRate;
      const length = Math.max(1, Math.floor(rate * seconds));
      const buffer = context.createBuffer(2, length, rate);
      for (let channel = 0; channel < 2; channel += 1) {
        const data = buffer.getChannelData(channel);
        let last = 0;
        for (let index = 0; index < length; index += 1) {
          const white = Math.random() * 2 - 1;
          last = last * 0.985 + white * 0.015;
          data[index] = last * 2.2;
        }
      }
      return buffer;
    },

    startAmbience() {
      if (!this.ctx || !this.noiseBuffer) return;
      const context = this.ctx;
      const source = context.createBufferSource();
      source.buffer = this.noiseBuffer;
      source.loop = true;

      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      filter.Q.value = 0.55;

      const gain = context.createGain();
      gain.gain.value = 0.012;

      const lfo = context.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.075;
      const lfoGain = context.createGain();
      lfoGain.gain.value = 0.006;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      source.start();
      lfo.start();
      this.ambience = { source, gain, lfo };
    },

    ensure() {
      this.init();
      if (!this.ctx) return false;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return true;
    },

    setMuted(muted) {
      this.muted = Boolean(muted);
      writeStorage(STORAGE_MUTED, this.muted ? '1' : '0');
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setTargetAtTime(this.muted ? 0 : 0.72, now, 0.035);
    },

    ensureScheduler() {
      if (!this.ctx || this.muted) return;
      if (!this.scheduler) {
        this.nextStepTime = this.ctx.currentTime + 0.15;
        this.stepIndex = 0;
        this.schedule();
        this.scheduler = window.setInterval(() => this.schedule(), 110);
      }
    },

    startMusic() {
      if (!this.ensure()) return;
      if (this.muted) return;
      const context = this.ctx;
      const now = context.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setTargetAtTime(0.85, now, 0.7);
      this.ensureScheduler();
      this.startBubbles();
    },

    pauseMusic() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setTargetAtTime(0.0001, now, 0.28);
      this.stopBubbles();
    },

    resumeMusic() {
      if (!this.ctx || this.muted) return;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setTargetAtTime(0.85, now, 0.45);
      this.ensureScheduler();
      this.startBubbles();
    },

    duckMusic() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setTargetAtTime(0.22, now, 0.8);
      this.stopBubbles();
    },

    startBubbles() {
      if (!this.ctx || this.muted) return;
      this.bubbleActive = true;
      if (this.bubbleTimer) return;
      const loop = () => {
        if (!this.bubbleActive || !this.ctx || this.ctx.state !== 'running') {
          this.bubbleTimer = window.setTimeout(loop, 2600);
          return;
        }
        this.playBubble();
        this.bubbleTimer = window.setTimeout(loop, 2400 + Math.random() * 3600);
      };
      this.bubbleTimer = window.setTimeout(loop, 1600);
    },

    stopBubbles() {
      this.bubbleActive = false;
      if (this.bubbleTimer) {
        window.clearTimeout(this.bubbleTimer);
        this.bubbleTimer = null;
      }
    },

    midiToFreq(midi) {
      return 440 * Math.pow(2, (midi - 69) / 12);
    },

    schedule() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      if (this.nextStepTime < now - 0.45) this.nextStepTime = now + 0.05;
      while (this.nextStepTime < now + 0.58) {
        this.playStep(this.stepIndex, this.nextStepTime);
        this.stepIndex = (this.stepIndex + 1) % 64;
        this.nextStepTime += this.stepDur;
      }
    },

    playStep(step, time) {
      if (!this.ctx) return;
      const bar = Math.floor(step / 8) % 8;
      const inBar = step % 8;
      const melodyNote = this.melody[bar][inBar];

      if (inBar === 0) {
        this.playPad(this.chords[bar], time);
        this.barCount += 1;
        this.pluck(this.midiToFreq(this.chords[bar][0] + 12), time + 0.015, 0.022, 2.4, 0.32);
        if (this.barCount % 4 === 1) {
          this.playBell(this.midiToFreq(86), time + 0.32, 0.012);
        }
      }

      if (melodyNote !== null && melodyNote !== undefined) {
        const velocity = inBar === 0 ? 0.048 : 0.037;
        const pan = (inBar - 3.5) / 10;
        this.pluck(this.midiToFreq(melodyNote), time + (Math.random() - 0.5) * 0.012, velocity, 1.55, pan);
      }
    },

    pluck(freq, time, volume, duration = 1.4, pan = 0) {
      if (!this.ctx) return;
      const context = this.ctx;
      const output = context.createGain();
      output.gain.setValueAtTime(0.0001, time);
      output.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), time + 0.012);
      output.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      const filter = context.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3200, time);
      filter.frequency.exponentialRampToValueAtTime(780, time + duration);
      filter.Q.value = 0.65;

      const main = context.createOscillator();
      main.type = 'triangle';
      main.frequency.setValueAtTime(freq, time);

      const overtone = context.createOscillator();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 2.005, time);

      const overtoneGain = context.createGain();
      overtoneGain.gain.value = 0.16;

      const panner = context.createStereoPanner ? context.createStereoPanner() : null;
      if (panner) panner.pan.value = Math.max(-0.65, Math.min(0.65, pan));

      main.connect(filter);
      overtone.connect(overtoneGain);
      overtoneGain.connect(filter);
      filter.connect(output);
      if (panner) {
        output.connect(panner);
        panner.connect(this.musicGain);
        panner.connect(this.reverbSend);
      } else {
        output.connect(this.musicGain);
        output.connect(this.reverbSend);
      }

      main.start(time);
      overtone.start(time);
      main.stop(time + duration + 0.05);
      overtone.stop(time + duration + 0.05);
    },

    playPad(chord, time) {
      if (!this.ctx) return;
      const context = this.ctx;
      const duration = this.stepDur * 8 + 1.2;
      chord.forEach((midi, index) => {
        if (index > 2) return;
        const oscillator = context.createOscillator();
        oscillator.type = index === 0 ? 'sine' : 'triangle';
        oscillator.frequency.value = this.midiToFreq(midi + (index === 2 ? 12 : 0));
        oscillator.detune.value = (Math.random() - 0.5) * 5;

        const gain = context.createGain();
        const level = index === 0 ? 0.022 : 0.011;
        gain.gain.setValueAtTime(0.0001, time);
        gain.gain.exponentialRampToValueAtTime(level, time + 1.2);
        gain.gain.setValueAtTime(level, time + duration - 1.0);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        const filter = context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 680;
        filter.Q.value = 0.5;

        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);
        gain.connect(this.reverbSend);
        oscillator.start(time);
        oscillator.stop(time + duration + 0.08);
      });
    },

    playBell(freq, time, volume = 0.018) {
      if (!this.ctx) return;
      const context = this.ctx;
      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(volume, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.6);
      oscillator.connect(gain);
      gain.connect(this.musicGain);
      gain.connect(this.reverbSend);
      oscillator.start(time);
      oscillator.stop(time + 1.7);
    },

    playBubble() {
      if (!this.ctx || this.muted) return;
      const context = this.ctx;
      const time = context.currentTime;
      const oscillator = context.createOscillator();
      oscillator.type = 'sine';
      const base = 210 + Math.random() * 160;
      oscillator.frequency.setValueAtTime(base, time);
      oscillator.frequency.exponentialRampToValueAtTime(base * 1.55, time + 0.08);
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.014, time + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
      oscillator.connect(gain);
      gain.connect(this.musicGain);
      oscillator.start(time);
      oscillator.stop(time + 0.14);
    },

    readySfx() {
      if (!this.ctx || this.muted) return false;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return this.ctx.state === 'running';
    },

    tone(options = {}) {
      if (!this.readySfx()) return;
      const context = this.ctx;
      const {
        freq = 440,
        endFreq = null,
        type = 'sine',
        duration = 0.2,
        volume = 0.035,
        delay = 0,
        pan = 0,
        destination = this.sfxGain,
        reverb = 0.2,
      } = options;
      const time = context.currentTime + delay;
      const oscillator = context.createOscillator();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(freq, time);
      if (endFreq) oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), time + duration);

      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(volume, time + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      let node = oscillator;
      let panner = null;
      if (context.createStereoPanner) {
        panner = context.createStereoPanner();
        panner.pan.value = Math.max(-0.8, Math.min(0.8, pan));
      }
      node.connect(gain);
      if (panner) {
        gain.connect(panner);
        panner.connect(destination);
      } else {
        gain.connect(destination);
      }

      if (reverb > 0) {
        const send = context.createGain();
        send.gain.value = reverb;
        gain.connect(send);
        send.connect(this.reverbSend);
      }

      oscillator.start(time);
      oscillator.stop(time + duration + 0.05);
    },

    noiseSwoosh({ duration = 0.35, from = 380, to = 1600, volume = 0.03, q = 1.2 } = {}) {
      if (!this.readySfx() || !this.noiseBuffer) return;
      const context = this.ctx;
      const time = context.currentTime;
      const source = context.createBufferSource();
      source.buffer = this.noiseBuffer;
      source.playbackRate.value = 0.9 + Math.random() * 0.2;

      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = q;
      filter.frequency.setValueAtTime(from, time);
      filter.frequency.exponentialRampToValueAtTime(to, time + duration);

      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(volume, time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      source.start(time);
      source.stop(time + duration + 0.05);
    },

    playPick(step = 0) {
      if (!this.readySfx()) return;
      const notes = [78, 81, 83, 86];
      this.tone({
        freq: this.midiToFreq(notes[Math.min(notes.length - 1, step)]),
        type: 'sine',
        duration: 0.3,
        volume: 0.032,
        reverb: 0.26,
      });
      this.tone({
        freq: 260,
        endFreq: 155,
        type: 'triangle',
        duration: 0.1,
        volume: 0.018,
        delay: 0.005,
        reverb: 0.05,
      });
    },

    playWrong() {
      if (!this.readySfx()) return;
      this.tone({ freq: 155, endFreq: 92, type: 'triangle', duration: 0.17, volume: 0.026, reverb: 0.05 });
      this.noiseSwoosh({ duration: 0.12, from: 230, to: 90, volume: 0.012, q: 0.7 });
    },

    playSoftClick() {
      if (!this.readySfx()) return;
      this.tone({ freq: 520, endFreq: 360, type: 'triangle', duration: 0.055, volume: 0.012, reverb: 0.04 });
    },

    playServe() {
      if (!this.readySfx()) return;
      const notes = [74, 78, 81, 86];
      notes.forEach((midi, index) => {
        this.tone({
          freq: this.midiToFreq(midi),
          type: index % 2 === 0 ? 'sine' : 'triangle',
          duration: 0.55 + index * 0.07,
          volume: 0.034 - index * 0.003,
          delay: index * 0.085,
          reverb: 0.35,
          pan: (index - 1.5) * 0.12,
        });
      });
    },

    playHint() {
      if (!this.readySfx()) return;
      this.playBellSignal(1174.66, 0.032);
      this.playBellSignal(1760, 0.019, 0.1);
    },

    playBellSignal(freq, volume = 0.025, delay = 0) {
      if (!this.readySfx()) return;
      this.tone({ freq, type: 'sine', duration: 0.7, volume, delay, reverb: 0.5 });
      this.tone({ freq: freq * 2.01, type: 'sine', duration: 0.35, volume: volume * 0.2, delay, reverb: 0.5 });
    },

    playUnlock() {
      if (!this.readySfx()) return;
      [69, 74, 78].forEach((midi, index) => {
        this.tone({
          freq: this.midiToFreq(midi + 12),
          type: 'sine',
          duration: 0.4,
          volume: 0.022,
          delay: index * 0.07,
          reverb: 0.3,
        });
      });
    },

    playShuffle() {
      if (!this.readySfx()) return;
      this.noiseSwoosh({ duration: 0.42, from: 280, to: 1500, volume: 0.026, q: 1.1 });
      this.tone({ freq: 260, endFreq: 440, type: 'sine', duration: 0.25, volume: 0.012, delay: 0.08 });
    },

    playShake() {
      if (!this.readySfx()) return;
      this.tone({ freq: 82, endFreq: 58, type: 'sine', duration: 0.35, volume: 0.055, reverb: 0.08 });
      this.noiseSwoosh({ duration: 0.3, from: 480, to: 160, volume: 0.026, q: 0.7 });
      this.tone({ freq: 110, type: 'triangle', duration: 0.12, volume: 0.016, delay: 0.025 });
    },

    playStart() {
      if (!this.readySfx()) return;
      this.tone({ freq: 196, type: 'sine', duration: 1.5, volume: 0.034, reverb: 0.6 });
      [74, 78, 81, 86].forEach((midi, index) => {
        this.tone({
          freq: this.midiToFreq(midi),
          type: 'sine',
          duration: 0.7,
          volume: 0.018,
          delay: 0.18 + index * 0.1,
          reverb: 0.5,
        });
      });
    },

    playWin() {
      if (!this.readySfx()) return;
      this.pauseMusic();
      const phrase = [74, 76, 78, 81, 83, 86];
      phrase.forEach((midi, index) => {
        this.tone({
          freq: this.midiToFreq(midi),
          type: 'sine',
          duration: 1.0,
          volume: 0.028,
          delay: 0.2 + index * 0.15,
          reverb: 0.55,
        });
      });
      this.tone({ freq: 98, type: 'sine', duration: 3.2, volume: 0.025, reverb: 0.4 });
      this.tone({ freq: this.midiToFreq(62), type: 'triangle', duration: 2.8, volume: 0.018, delay: 0.1, reverb: 0.5 });
    },
  };

  /* =======================================================
     计时 / HUD
     ======================================================= */
  function startClock() {
    stopClock();
    state.clockStart = performance.now() - state.elapsed;
    state.clockTimer = window.setInterval(updateClock, 250);
    updateClock();
  }

  function updateClock() {
    if (!state.running || state.paused || state.ended || state.clockStart === null) return;
    state.elapsed = performance.now() - state.clockStart;
    dom.timer.textContent = formatTime(state.elapsed);
  }

  function freezeClock() {
    if (state.clockStart !== null) {
      state.elapsed = performance.now() - state.clockStart;
      state.clockStart = null;
    }
    stopClock();
    dom.timer.textContent = formatTime(state.elapsed);
  }

  function stopClock() {
    if (state.clockTimer !== null) {
      window.clearInterval(state.clockTimer);
      state.clockTimer = null;
    }
  }

  function updateHud() {
    dom.remaining.textContent = String(state.remaining);
    dom.score.textContent = String(state.score);
    dom.scoreBox.setAttribute('aria-label', `解压值 ${state.score}`);
    dom.servedCount.textContent = `${state.served} / ${TYPES.length}`;
  }

  function setGamePanelsInert(inert) {
    gamePanels.forEach((panel) => {
      if (inert) panel.setAttribute('inert', '');
      else panel.removeAttribute('inert');
    });
  }

  function bumpScore() {
    if (reduceMotion) return;
    try {
      dom.scoreBox.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.08)' },
          { transform: 'scale(1)' }
        ],
        { duration: 260, easing: 'cubic-bezier(.22,.9,.36,1)' }
      );
    } catch (error) {
      /* 忽略不支持 Web Animations 的浏览器 */
    }
  }

  function announce(message) {
    dom.announcer.textContent = '';
    window.setTimeout(() => {
      dom.announcer.textContent = message;
    }, 30);
  }

  function showToast(message, variant = '', duration = 2600) {
    const toast = document.createElement('div');
    toast.className = `toast${variant ? ` is-${variant}` : ''}`;
    toast.innerHTML = message;
    dom.toastStack.replaceChildren(toast);
    window.setTimeout(() => {
      toast.remove();
    }, duration + 350);
  }

  /* =======================================================
     订单 / 餐盘
     ======================================================= */
  const lockIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5.5" y="10" width="13" height="10" rx="3" fill="none" stroke="currentColor" stroke-width="1.7"/>
      <path d="M8.6 10V7.8C8.6 5.8 10.1 4.3 12 4.3C13.9 4.3 15.4 5.8 15.4 7.8V10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M12 13.6V16.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
    </svg>`;

  function createTargetObject(type, slot) {
    return {
      slot,
      typeId: type.id,
      type,
      collected: 0,
      completed: false,
      card: null,
    };
  }

  function updateCardAria(card, target) {
    if (!target || target.completed) {
      if (card && target) {
        card.setAttribute('aria-label', `${target.type.name}已上齐，点击查看提示`);
      }
      return;
    }
    card.setAttribute(
      'aria-label',
      `需要找${target.type.name}，还差${REQUIRED - target.collected}份。点击可让锅里同款食材发光`
    );
  }

  function paintTargetCard(card, target, animateNew = false) {
    if (!card) return;

    const slots = card.querySelectorAll('.plate-food-slot');
    slots.forEach((slot, index) => {
      const shouldFill = index < target.collected;
      if (shouldFill) {
        if (!slot.firstElementChild) {
          slot.innerHTML = makeArt(target.type);
          slot.classList.add('is-filled');
          if (animateNew) {
            slot.classList.remove('just-placed');
            void slot.offsetWidth;
            slot.classList.add('just-placed');
            window.setTimeout(() => {
              if (slot.isConnected) slot.classList.remove('just-placed');
            }, 680);
          }
        }
      } else if (slot.firstElementChild) {
        slot.replaceChildren();
        slot.classList.remove('is-filled', 'just-placed');
      }
    });

    card.querySelectorAll('.plate-progress i').forEach((pip, index) => {
      pip.classList.toggle('is-filled', index < target.collected);
    });
    updateCardAria(card, target);
  }

  function fillTargetCard(card, target) {
    card.classList.remove('is-locked');
    card.dataset.slot = String(target.slot);
    delete card.dataset.locked;
    card.disabled = false;
    card.innerHTML = `
      <span class="plate-basket">
        <span class="plate-order-tag" aria-hidden="true">
          <span class="plate-tag-icon">${makeArt(target.type)}</span>
          <span class="plate-tag-count">×${REQUIRED}</span>
        </span>
        <span class="plate-food-slots" aria-hidden="true">
          <span class="plate-food-slot" data-food-slot="0"></span>
          <span class="plate-food-slot" data-food-slot="1"></span>
          <span class="plate-food-slot" data-food-slot="2"></span>
        </span>
        <span class="plate-progress" aria-hidden="true">
          <i></i><i></i><i></i>
        </span>
      </span>
      <span class="plate-name">${escapeHtml(target.type.name)}</span>
    `;
    paintTargetCard(card, target, false);
  }

  function createTargetCard(target) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'order-plate';
    fillTargetCard(card, target);
    target.card = card;
    return card;
  }

  function createLockedCard() {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'order-plate is-locked';
    card.dataset.locked = 'true';
    card.setAttribute('aria-label', '加一只碟子，增加一道订单');
    card.innerHTML = `
      <span class="plate-basket">
        <span class="locked-icon">${lockIcon}<span>解锁</span></span>
      </span>
      <span class="plate-name">加碟子</span>
    `;
    return card;
  }

  function renderInitialPlates() {
    dom.plateRow.innerHTML = '';
    state.activeTargets.forEach((target) => {
      const card = createTargetCard(target);
      dom.plateRow.appendChild(card);
    });
    if (state.activeTargets.length < MAX_SLOTS) {
      dom.plateRow.appendChild(createLockedCard());
    }
  }

  function buildTempPlates() {
    if (!dom.tempPlateRow) return;
    dom.tempPlateRow.innerHTML = '';
    for (let index = 0; index < TEMP_SLOTS; index += 1) {
      const plate = document.createElement('span');
      plate.className = 'temp-plate';
      plate.dataset.tempSlot = String(index);
      plate.setAttribute('role', 'listitem');
      plate.setAttribute('aria-label', `临时盘${index + 1}：空`);
      dom.tempPlateRow.appendChild(plate);
    }
  }

  function renderTempPlates(highlightSlot = -1) {
    if (!dom.tempPlateRow) return;
    if (dom.tempPlateRow.children.length !== TEMP_SLOTS) buildTempPlates();
    const plates = Array.from(dom.tempPlateRow.children);
    let occupied = 0;
    plates.forEach((plate, index) => {
      const entry = state.tempSlots[index];
      if (!entry) {
        plate.classList.remove('has-food', 'just-added');
        plate.replaceChildren();
        delete plate.dataset.typeId;
        plate.setAttribute('aria-label', `临时盘${index + 1}：空`);
        return;
      }
      occupied += 1;
      plate.classList.add('has-food');
      plate.setAttribute('aria-label', `临时盘${index + 1}：${entry.type.name}`);
      if (plate.dataset.typeId !== entry.typeId) {
        plate.innerHTML = makeArt(entry.type);
        plate.dataset.typeId = entry.typeId;
      }
      if (index === highlightSlot) {
        plate.classList.remove('just-added');
        void plate.offsetWidth;
        plate.classList.add('just-added');
        window.setTimeout(() => {
          if (plate.isConnected) plate.classList.remove('just-added');
        }, 560);
      }
    });
    if (dom.tempCount) dom.tempCount.textContent = `${occupied} / ${TEMP_SLOTS}`;
  }

  function storeItemInTemp(item) {
    if (!item || item.found || !state.running || state.paused || state.ended) return false;
    const slotIndex = state.tempSlots.findIndex((entry) => !entry);
    if (slotIndex < 0) return false;
    const plate = dom.tempPlateRow.children[slotIndex];
    if (!plate) return false;

    const startRect = item.el.getBoundingClientRect();
    const plateRect = plate.getBoundingClientRect();
    item.lastRotation = item.body ? item.body.angle : 0;
    state.tempSlots[slotIndex] = {
      id: item.id,
      type: item.type,
      typeId: item.typeId,
    };

    item.found = true;
    removePhysicsBody(item);
    queueLayerReflow();
    item.el.classList.add('is-collected');
    item.el.setAttribute('aria-hidden', 'true');
    item.el.tabIndex = -1;
    window.setTimeout(() => {
      if (item.el && item.el.isConnected) item.el.remove();
    }, 320);

    renderTempPlates(slotIndex);
    animateFlight(item, startRect, plateRect);
    Soundscape.playPick(0);
    showToast(`不是当前订单，先放临时盘：<b>${escapeHtml(item.type.name)}</b>`, '', 1700);
    announce(`${item.type.name}不是当前订单，先放进了临时盘。`);
    return true;
  }

  function deliverTempToTarget(target) {
    if (!target || target.completed || !state.running || state.paused || state.ended) return;
    if (!state.activeTargets.includes(target) || target.collected >= REQUIRED) return;
    const slotIndex = state.tempSlots.findIndex((entry) => entry && entry.typeId === target.typeId);
    if (slotIndex < 0) return;
    const entry = state.tempSlots[slotIndex];
    const card = getTargetCard(target);
    if (!card || !card.isConnected) return;
    const targetSlot = card.querySelector(`.plate-food-slot[data-food-slot="${Math.min(REQUIRED - 1, target.collected)}"]`);
    if (!targetSlot) return;
    const plate = dom.tempPlateRow.children[slotIndex];
    if (!plate) return;

    const startRect = plate.getBoundingClientRect();
    const targetRect = targetSlot.getBoundingClientRect();
    state.tempSlots[slotIndex] = null;
    renderTempPlates();

    const flightItem = { type: entry.type, found: true, lastRotation: 0 };
    animateFlight(flightItem, startRect, targetRect);

    target.collected += 1;
    state.remaining -= 1;
    state.found += 1;
    state.score += SCORE_ITEM;
    updateHud();
    bumpScore();
    updateTargetProgress(target, true);
    pulseTargetCard(target);
    Soundscape.playPick(target.collected - 1);
    announce(`临时盘里的${entry.type.name}补上了订单，这一碟已经放了${target.collected}份。`);

    later(() => {
      if (target.collected >= REQUIRED) completeTarget(target);
      if (state.remaining === 0 && state.tempSlots.every((temp) => !temp) && !state.finishPending) {
        state.finishPending = true;
        later(() => finishGame(), 1650);
      }
    }, 360);

    later(() => {
      if (!target.completed
        && target.collected < REQUIRED
        && state.tempSlots.some((temp) => temp && temp.typeId === target.typeId)) {
        deliverTempToTarget(target);
      }
    }, 470);

    window.setTimeout(() => renderTempPlates(), 80);
  }

  function sweepTempDeliveries() {
    if (!state.running || state.paused || state.ended) return;
    if (!state.tempSlots.some(Boolean)) return;
    state.activeTargets.forEach((target) => {
      if (target.completed || target.collected >= REQUIRED) return;
      if (state.tempSlots.some((entry) => entry && entry.typeId === target.typeId)) {
        deliverTempToTarget(target);
      }
    });
  }

  function getTargetCard(target) {
    if (!target) return null;
    if (target.card && target.card.isConnected) return target.card;
    target.card = dom.plateRow.querySelector(`.order-plate[data-slot="${target.slot}"]`);
    return target.card;
  }

  function updateTargetProgress(target, animateNew = true) {
    const card = getTargetCard(target);
    if (!card) return;
    paintTargetCard(card, target, animateNew);
  }

  function pulseTargetCard(target) {
    const card = getTargetCard(target);
    if (!card) return;
    card.classList.remove('pop');
    void card.offsetWidth;
    card.classList.add('pop');
    window.setTimeout(() => card.classList.remove('pop'), 550);
  }

  function completeTarget(target) {
    if (!target || target.completed) return;
    target.completed = true;
    state.served += 1;
    state.score += SCORE_PLATE;
    updateHud();
    bumpScore();
    Soundscape.playServe();

    const card = getTargetCard(target);
    if (card) {
      card.classList.add('served');
      updateTargetProgress(target, false);
      updateCardAria(card, target);
    }

    showToast(`上菜！<b>${escapeHtml(target.type.name)}</b> ×${REQUIRED}`, 'serve', 2800);
    announce(`${target.type.name}三份已经上齐，换下一道菜。`);

    // 这一盘有后续订单：稍等片刻换上新单
    if (state.queue.length > 0) {
      later(() => {
        if (state.ended) return;
        const cardNow = getTargetCard(target);
        if (!cardNow) return;
        cardNow.classList.add('swap-out');
        later(() => {
          if (state.ended) return;
          const nextType = state.queue.shift();
          if (!nextType) return;
          target.type = nextType;
          target.typeId = nextType.id;
          target.collected = 0;
          target.completed = false;
          fillTargetCard(cardNow, target);
          cardNow.classList.remove('swap-out', 'served');
          void cardNow.offsetWidth;
          cardNow.classList.add('swap-in');
          later(() => cardNow.classList.remove('swap-in'), 550);
          pulseTargetCard(target);
          announce(`新的订单：${nextType.name}，需要三份。`);
          later(() => deliverTempToTarget(target), 380);
        }, 300);
      }, 880);
    }
  }

  function collectItem(item, target) {
    if (!item || item.found || !state.running || state.paused || state.ended) return;

    const startRect = item.el.getBoundingClientRect();
    const targetCard = getTargetCard(target);
    const slotIndex = Math.min(REQUIRED - 1, target.collected);
    const targetSlot = targetCard
      ? targetCard.querySelector(`.plate-food-slot[data-food-slot="${slotIndex}"]`)
      : null;
    const targetRect = targetSlot
      ? targetSlot.getBoundingClientRect()
      : targetCard
        ? targetCard.querySelector('.plate-basket').getBoundingClientRect()
        : startRect;

    item.found = true;
    state.remaining -= 1;
    state.found += 1;
    state.score += SCORE_ITEM;
    updateHud();
    bumpScore();

    target.collected += 1;
    updateTargetProgress(target, true);
    pulseTargetCard(target);
    announce(`捞到${item.type.name}，这一碟已经放了${target.collected}份，共需${REQUIRED}份。`);
    Soundscape.playPick(target.collected - 1);

    // 原食材快速上浮后移除，再让一个分身飞进餐盘。
    item.el.classList.add('is-collected');
    item.el.setAttribute('aria-hidden', 'true');
    item.el.tabIndex = -1;
    item.lastRotation = item.body ? item.body.angle : 0;
    removePhysicsBody(item);
    queueLayerReflow();
    window.setTimeout(() => {
      if (item.el && item.el.isConnected) item.el.remove();
    }, 320);

    animateFlight(item, startRect, targetRect);
    spawnRipple(startRect.left + startRect.width / 2, startRect.top + startRect.height / 2);
    spawnScoreFloat(startRect.left + startRect.width / 2, startRect.top + startRect.height * 0.34);

    later(() => {
      if (target.collected >= REQUIRED) {
        completeTarget(target);
      }
      if (state.remaining === 0 && state.tempSlots.every((temp) => !temp) && !state.finishPending) {
        state.finishPending = true;
        later(() => finishGame(), 1650);
      }
    }, 360);
  }

  function findItemAtPointer(clientX, clientY) {
    const rect = dom.itemsLayer.getBoundingClientRect();
    if (!rect.width) return null;
    let best = null;
    let bestZ = -Infinity;

    state.items.forEach((item) => {
      if (item.found || !item.body) return;
      const width = item.size * rect.width;
      if (width <= 0) return;
      const centerX = rect.left + item.body.x * rect.width;
      const centerY = rect.top + item.body.y * rect.width;
      const dx = clientX - centerX;
      const dy = clientY - centerY;

      // 先排除明显在方框外的点，再按图片真实 alpha 判断是否点中食材。
      if (Math.abs(dx) > width * 0.55 || Math.abs(dy) > width * 0.55) return;
      const angle = item.body.angle * Math.PI / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const localX = dx * cos + dy * sin;
      const localY = -dx * sin + dy * cos;
      const u = 0.5 + localX / width;
      const v = 0.5 + localY / width;
      if (u < 0 || u > 1 || v < 0 || v > 1) return;

      const mask = alphaMasks.get(item.typeId);
      if (mask) {
        const mx = Math.min(ALPHA_MASK_SIZE - 1, Math.max(0, Math.floor(u * ALPHA_MASK_SIZE)));
        const my = Math.min(ALPHA_MASK_SIZE - 1, Math.max(0, Math.floor(v * ALPHA_MASK_SIZE)));
        if (mask[my * ALPHA_MASK_SIZE + mx] <= ALPHA_THRESHOLD) return;
      } else if (dx * dx + dy * dy > (width * 0.42) * (width * 0.42)) {
        // 图片还没加载出 alpha 蒙版时用较小的圆形兜底，尽量不误抢邻近食材。
        return;
      }

      // 光标下如果叠着不同汤深的食材，取当前视觉上最上面的一份。
      const effectiveZ = item.el.classList.contains('is-hinted') ? 10000 : item.z;
      if (effectiveZ > bestZ) {
        bestZ = effectiveZ;
        best = item;
      }
    });

    return best;
  }

  function handleItemActivate(item) {
    if (!state.running || state.paused || state.ended || !item || item.found) return;
    const target = state.activeTargets.find((entry) => entry.typeId === item.typeId && !entry.completed);
    if (target) {
      collectItem(item, target);
      return;
    }

    if (storeItemInTemp(item)) return;

    const now = performance.now();
    item.el.classList.remove('is-wrong');
    void item.el.offsetWidth;
    item.el.classList.add('is-wrong');
    window.setTimeout(() => item.el && item.el.classList.remove('is-wrong'), 470);
    Soundscape.playWrong();
    if (now - state.wrongAt > 950) {
      state.wrongAt = now;
      showToast(`五只临时盘都满了，先捞订单里的食材`, 'warn', 2200);
      announce('临时盘已经放满五份，先处理桌面上的订单。');
    }
  }

  function animateFlight(item, startRect, targetRect) {
    const width = Math.max(34, startRect.width * 0.9);
    const height = width;
    const clone = document.createElement('div');
    clone.className = 'flying-food';
    clone.style.left = `${startRect.left + startRect.width / 2 - width / 2}px`;
    clone.style.top = `${startRect.top + startRect.height / 2 - height / 2}px`;
    clone.style.width = `${width}px`;
    clone.style.height = `${height}px`;
    const startRotation = Number.isFinite(item.lastRotation) ? item.lastRotation : 0;
    clone.style.transform = `rotate(${startRotation}deg)`;
    clone.innerHTML = makeArt(item.type);
    clone.querySelectorAll('img.food-img').forEach((image) => {
      if (image.complete && image.naturalWidth > 0) image.classList.add('is-ready');
    });
    document.body.appendChild(clone);

    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;
    const dx = endX - startX;
    const dy = endY - startY;
    const arcX = dx * 0.46;
    const arcY = dy * 0.16 - Math.max(42, Math.min(110, Math.abs(dx) * 0.18));
    const endRot = startRotation + 210;

    if (reduceMotion) {
      clone.remove();
      return;
    }

    try {
      const animation = clone.animate(
        [
          { transform: `translate3d(0,0,0) rotate(${startRotation}deg) scale(1)`, opacity: 1 },
          { transform: `translate3d(${arcX}px,${arcY}px,0) rotate(${startRotation + 70}deg) scale(1.24)`, opacity: 1, offset: 0.46 },
          { transform: `translate3d(${dx}px,${dy}px,0) rotate(${endRot}deg) scale(.16)`, opacity: 0.2 }
        ],
        {
          duration: item.found ? 660 : 650,
          easing: 'cubic-bezier(.18,.72,.22,1)',
          fill: 'forwards'
        }
      );
      animation.onfinish = () => clone.remove();
      window.setTimeout(() => clone.remove(), 780);
    } catch (error) {
      clone.remove();
    }

    // 飞行时的小碎金
    if (!reduceMotion) {
      for (let index = 0; index < 3; index += 1) {
        later(() => {
          const spark = document.createElement('i');
          spark.className = 'flying-spark';
          spark.style.left = `${startX + (Math.random() - 0.5) * 28}px`;
          spark.style.top = `${startY + (Math.random() - 0.5) * 24}px`;
          document.body.appendChild(spark);
          try {
            spark.animate(
              [
                { transform: 'translate3d(0,0,0) scale(.6)', opacity: 0 },
                { transform: 'translate3d(0,-6px,0) scale(1)', opacity: 0.9, offset: 0.2 },
                {
                  transform: `translate3d(${dx * (0.25 + index * 0.12)}px,${dy * (0.25 + index * 0.12)}px,0) scale(.2)`,
                  opacity: 0
                }
              ],
              { duration: 500 + index * 80, easing: 'ease-out' }
            ).onfinish = () => spark.remove();
          } catch (error) {
            spark.remove();
          }
          window.setTimeout(() => spark.remove(), 700);
        }, 80 + index * 70);
      }
    }
  }

  function spawnRipple(x, y) {
    if (reduceMotion) return;
    const ripple = document.createElement('i');
    ripple.className = 'soup-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    document.body.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 700);
  }

  function spawnScoreFloat(x, y) {
    if (reduceMotion) return;
    const label = document.createElement('span');
    label.className = 'floating-score';
    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
    label.textContent = `+${SCORE_ITEM}`;
    document.body.appendChild(label);
    window.setTimeout(() => label.remove(), 1000);
  }

  /* =======================================================
     提示 / 换碟 / 打乱 / 震动
     ======================================================= */
  function activeTypes() {
    return new Set(
      state.activeTargets
        .filter((target) => !target.completed)
        .map((target) => target.typeId)
    );
  }

  function clearHint() {
    if (state.hintTimer) {
      window.clearTimeout(state.hintTimer);
      state.hintTimer = null;
    }
    if (state.hintClearTimer) {
      window.clearTimeout(state.hintClearTimer);
      state.hintClearTimer = null;
    }
    $$('.item.is-hinted', dom.itemsLayer).forEach((element) => {
      element.classList.remove('is-hinted');
    });
    dom.itemsLayer.classList.remove('is-hinting');
  }

  function highlightItems(types, duration = 2800) {
    clearHint();
    const typeSet = new Set(types);
    let count = 0;
    state.items.forEach((item) => {
      if (!item.found && typeSet.has(item.typeId)) {
        item.el.classList.add('is-hinted');
        count += 1;
      }
    });
    if (!count) return 0;
    dom.itemsLayer.classList.add('is-hinting');
    state.hintTimer = window.setTimeout(clearHint, duration);
    return count;
  }

  function hintCurrentTargets() {
    if (!state.running || state.paused || state.ended) return;
    if (dom.hintBtn.disabled) return;
    const types = activeTypes();
    if (!types.size) return;

    const count = highlightItems(types, 3000);
    if (count) {
      Soundscape.playHint();
      cooldownTool(dom.hintBtn, 3900);
      announce(`已让${types.size}种目标食材发光，快去锅里找找。`);
      if (performance.now() - state.lastHintToastAt > 1200) {
        state.lastHintToastAt = performance.now();
        showToast('发光的食材，就是这桌要捞的', '', 1900);
      }
    }
  }

  function hintTargetType(typeId) {
    if (!state.running || state.paused || state.ended) return;
    const type = typeById.get(typeId);
    if (!type) return;
    const count = highlightItems([typeId], 3000);
    if (count) {
      Soundscape.playHint();
      announce(`锅里同款${type.name}已经发光了。`);
      if (performance.now() - state.lastHintToastAt > 900) {
        state.lastHintToastAt = performance.now();
        showToast(`在锅里找找<b>${escapeHtml(type.name)}</b>`, '', 1700);
      }
    } else {
      showToast(`锅里暂时没有<b>${escapeHtml(type.name)}</b>了`, 'warn', 1700);
    }
  }

  function cooldownTool(button, ms) {
    if (!button) return;
    button.disabled = true;
    button.classList.add('is-cooling');
    const id = window.setTimeout(() => {
      state.cooldownTimers.delete(id);
      button.disabled = false;
      button.classList.remove('is-cooling');
    }, ms);
    state.cooldownTimers.add(id);
  }

  function addPlate() {
    if (!state.running || state.paused || state.ended) return;
    if (state.maxSlots >= MAX_SLOTS) {
      showToast('四只碟子已经摆满啦', 'warn', 1700);
      return;
    }
    if (!state.queue.length) {
      showToast('已经没有更多订单了', 'warn', 1700);
      return;
    }

    const locked = dom.plateRow.querySelector('.order-plate[data-locked="true"]');
    if (locked) locked.remove();

    state.maxSlots = MAX_SLOTS;
    const type = state.queue.shift();
    const target = createTargetObject(type, state.maxSlots - 1);
    state.activeTargets.push(target);
    const card = createTargetCard(target);
    card.classList.add('swap-in');
    dom.plateRow.appendChild(card);
    window.setTimeout(() => card.classList.remove('swap-in'), 560);

    dom.addPlateBtn.disabled = true;
    dom.addPlateBtn.classList.add('is-disabled');
    dom.addPlateBtn.setAttribute('aria-label', '碟子已经加满了');
    const label = dom.addPlateBtn.querySelector('.tool-label');
    if (label) label.textContent = '已加满';
    const badge = dom.addPlateBtn.querySelector('.tool-badge');
    if (badge) badge.hidden = true;

    Soundscape.playUnlock();
    pulseTargetCard(target);
    showToast(`添了一只碟子，<b>${escapeHtml(type.name)}</b> 也来啦`, 'serve', 2400);
    announce(`添了一只碟子。新订单：${type.name}，需要三份。`);
    later(() => deliverTempToTarget(target), 380);
  }

  function unlockPlate() {
    if (state.maxSlots >= MAX_SLOTS) return;
    addPlate();
  }

  function makeScatter(count, random) {
    const points = [];
    if (count <= 0) return points;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const phase = random() * Math.PI * 2;
    for (let index = 0; index < count; index += 1) {
      const progress = (index + 0.5) / count;
      const radius = (0.035 + 0.35 * Math.sqrt(progress)) * (0.96 + random() * 0.08);
      const angle = phase + index * goldenAngle + (random() - 0.5) * 0.24;
      const jitter = (random() - 0.5) * 0.026;
      const x = 0.5 + Math.cos(angle) * (radius + jitter);
      const y = 0.5 + Math.sin(angle) * (radius + jitter);
      points.push({
        x: Math.min(0.94, Math.max(0.06, x)),
        y: Math.min(0.94, Math.max(0.06, y)),
      });
    }
    return points;
  }

  function layerClearance(item, targetLayer) {
    if (!item || !item.body || item.found) return -Infinity;
    if (targetLayer < 0 || targetLayer >= LAYER_COUNT) return -Infinity;
    if (targetLayer === item.layer) return -Infinity;

    const ratio = LAYER_SIZE_SCALE[targetLayer] / LAYER_SIZE_SCALE[item.layer];
    const nextCollisionSize = item.collisionSize * ratio;
    const nextRadius = nextCollisionSize * COLLISION_FACTOR;
    const body = item.body;
    const centerDistance = Math.hypot(body.x - 0.5, body.y - 0.5);
    if (centerDistance + nextRadius > 0.492) return -Infinity;

    let clearance = 0.5 - centerDistance - nextRadius;
    // 只看紧挨着的上一层：上面那层有任何食材压着，就不浮上去。
    for (const other of physics.layers[targetLayer]) {
      if (other === body) continue;
      const distance = Math.hypot(other.x - body.x, other.y - body.y);
      clearance = Math.min(clearance, distance - other.radius - nextRadius);
    }
    return clearance;
  }

  function promoteItemToLayer(item, targetLayer) {
    if (!item || !item.body || item.layer === targetLayer) return false;
    const body = item.body;
    const sourceLayer = item.layer;
    const source = physics.layers[sourceLayer];
    const sourceIndex = source.indexOf(body);
    if (sourceIndex < 0) return false;

    const ratio = LAYER_SIZE_SCALE[targetLayer] / LAYER_SIZE_SCALE[sourceLayer];
    const nextCollisionSize = item.collisionSize * ratio;
    const nextSize = item.size * ratio;
    const nextRadius = nextCollisionSize * COLLISION_FACTOR;

    source.splice(sourceIndex, 1);
    physics.layers[targetLayer].push(body);
    item.layer = targetLayer;
    body.layer = targetLayer;
    item.size = nextSize;
    item.collisionSize = nextCollisionSize;
    body.radius = nextRadius;
    body.mass = Math.max(nextRadius * nextRadius, 0.0001);

    item.z = LAYER_Z_BASE[targetLayer] + Math.floor(Math.random() * 420);
    item.el.style.width = `${(nextSize * 100).toFixed(2)}%`;
    item.el.style.zIndex = String(item.z);
    LAYER_NAMES.forEach((name) => item.el.classList.remove(`depth-${name}`));
    item.el.classList.add(`depth-${LAYER_NAMES[targetLayer]}`);
    item.el.classList.remove('is-rising');
    void item.el.offsetWidth;
    item.el.classList.add('is-rising');
    window.setTimeout(() => item.el && item.el.classList.remove('is-rising'), 720);
    return true;
  }

  function findPromotionCandidate(sourceLayer, targetLayer) {
    let best = null;
    let bestClearance = 0.006;
    for (const body of physics.layers[sourceLayer]) {
      const clearance = layerClearance(body.item, targetLayer);
      if (clearance > bestClearance) {
        bestClearance = clearance;
        best = body.item;
      }
    }
    return best;
  }

  function reflowLayers() {
    if (!state.running || state.paused || state.ended) return;

    // 上面一层没有食材压着的，就自动上浮一层：
    // 先让中层补面层的空，再让深层补中层的空，循环接力直到没人可浮。
    let promoted = false;
    let progress = true;
    while (progress) {
      progress = false;
      for (let sourceLayer = 1; sourceLayer < LAYER_COUNT; sourceLayer += 1) {
        const targetLayer = sourceLayer - 1;
        let candidate = findPromotionCandidate(sourceLayer, targetLayer);
        while (candidate && promoteItemToLayer(candidate, targetLayer)) {
          promoted = true;
          progress = true;
          candidate = findPromotionCandidate(sourceLayer, targetLayer);
        }
      }
    }

    if (promoted) renderPhysics();
  }

  function queueLayerReflow() {
    if (physics.reflowQueued) return;
    physics.reflowQueued = true;
    window.setTimeout(() => {
      physics.reflowQueued = false;
      reflowLayers();
    }, 160);
  }

  function shufflePot() {
    if (!state.running || state.paused || state.ended) return;
    if (dom.shuffleBtn.disabled) return;
    clearHint();
    const aliveCount = physics.layers.reduce((sum, layer) => sum + layer.length, 0);
    if (aliveCount < 2) return;
    const random = makeRng(Date.now() + Math.floor(Math.random() * 100000));
    applyPhysicsImpulse(0.075, random);

    dom.potWrap.classList.remove('is-shuffling');
    void dom.potWrap.offsetWidth;
    dom.potWrap.classList.add('is-shuffling');
    window.setTimeout(() => dom.potWrap.classList.remove('is-shuffling'), 760);
    Soundscape.playShuffle();
    cooldownTool(dom.shuffleBtn, 2100);
    showToast('汤面打了个旋，食材自己碰开了', '', 1800);
    announce('锅里的食材被汤流推开，开始互相碰撞。');
  }

  function shakePot() {
    if (!state.running || state.paused || state.ended) return;
    if (dom.shakeBtn.disabled) return;
    dom.potWrap.classList.remove('is-shaking');
    void dom.potWrap.offsetWidth;
    dom.potWrap.classList.add('is-shaking');
    window.setTimeout(() => dom.potWrap.classList.remove('is-shaking'), 720);
    applyPhysicsImpulse(0.035, Math.random);
    Soundscape.playShake();
    cooldownTool(dom.shakeBtn, 1600);
    spawnRipple(window.innerWidth / 2, dom.potWrap.getBoundingClientRect().top + dom.potWrap.clientHeight * 0.48);
    announce('锅底咕嘟咕嘟震了震。');
  }

  /* =======================================================
     构建锅里的食材
     ======================================================= */
  function buildBrothBubbles() {
    const bubbleLayer = dom.brothBubbles;
    bubbleLayer.innerHTML = '';
    const random = makeRng(roundSeed ^ 0x91a2b3c4);
    const count = 17;
    for (let index = 0; index < count; index += 1) {
      const bubble = document.createElement('span');
      const size = 2 + random() * 7;
      bubble.style.setProperty('--x', `${8 + random() * 84}%`);
      bubble.style.setProperty('--y', `${10 + random() * 80}%`);
      bubble.style.setProperty('--s', `${size.toFixed(1)}px`);
      bubble.style.setProperty('--dur', `${3.8 + random() * 4}s`);
      bubble.style.setProperty('--delay', `${-random() * 6}s`);
      bubbleLayer.appendChild(bubble);
    }
  }

  function buildItems() {
    dom.itemsLayer.innerHTML = '';
    state.items = [];
    itemSequence = 0;
    const random = makeRng(roundSeed);

    const definitions = [];
    TYPES.forEach((type) => {
      for (let copy = 0; copy < COPIES; copy += 1) {
        definitions.push({ type, copy });
      }
    });

    const shuffled = shuffle(definitions, random);

    shuffled.forEach((definition) => {
      // 57 份食材均分进 3 层，每层 19 份；不再加载第 4 层及更深层。
      const layer = definition.copy;
      const id = `item-${itemSequence += 1}`;
      const collisionSize = definition.type.size * ITEM_SCALE * LAYER_SIZE_SCALE[layer] * (0.92 + random() * 0.14);
      const size = collisionSize * VISUAL_FIT_SCALE;
      const z = LAYER_Z_BASE[layer] + Math.floor(random() * 420);
      const item = {
        id,
        typeId: definition.type.id,
        type: definition.type,
        layer,
        size,
        collisionSize,
        x: 0.5,
        y: 0.5,
        z,
        found: false,
        el: null,
        body: null,
      };

      const button = document.createElement('button');
      button.type = 'button';
      button.className = `item depth-${LAYER_NAMES[layer]}`;
      button.dataset.itemId = id;
      button.dataset.layer = String(layer);
      button.setAttribute('aria-label', `${definition.type.name}，点击捞起`);
      button.style.left = '0';
      button.style.top = '0';
      button.style.width = `${(size * 100).toFixed(2)}%`;
      button.style.zIndex = String(z);
      button.innerHTML = `
        <span class="item-bob">
          <span class="hint-ring" aria-hidden="true"></span>
          <span class="item-art">${makeArt(definition.type)}</span>
        </span>
      `;
      button.addEventListener('click', () => handleItemActivate(item));
      item.el = button;
      state.items.push(item);
      dom.itemsLayer.appendChild(button);
    });

    buildPhysics();
  }

  /* =======================================================
     锅内物理：三层汤深，各自独立碰撞
     ======================================================= */
  function makePhysicsBody(item, random) {
    const radius = item.collisionSize * COLLISION_FACTOR;
    // 每份食材只有一个初始速度：方向随机，越深的层越慢一点。
    // 之后方向全靠碰撞和锅壁改变，不再有外力推着漂移。
    const cruiseSpeed = (0.022 + random() * 0.032) * (1 - item.layer * 0.06);
    const heading = random() * Math.PI * 2;
    return {
      item,
      layer: item.layer,
      radius,
      mass: Math.max(radius * radius, 0.0001),
      x: 0.5,
      y: 0.5,
      vx: Math.cos(heading) * cruiseSpeed,
      vy: Math.sin(heading) * cruiseSpeed,
      cruiseSpeed,
      // 食材只平移，不自转；这里只给一个固定的小角度，避免全部过于整齐。
      angle: (random() - 0.5) * 12,
    };
  }

  function measureOverlaps(bodies) {
    let maxOverlap = 0;
    for (let index = 0; index < bodies.length; index += 1) {
      const a = bodies[index];
      for (let next = index + 1; next < bodies.length; next += 1) {
        const b = bodies[next];
        const distance = Math.hypot(b.x - a.x, b.y - a.y);
        maxOverlap = Math.max(maxOverlap, a.radius + b.radius - distance);
      }
    }
    return maxOverlap;
  }

  function packLayer(bodies, random) {
    const ordered = bodies.slice().sort((a, b) => b.radius - a.radius);
    const placed = [];

    ordered.forEach((body) => {
      const maxCenterRadius = Math.max(0.025, 0.5 - body.radius - 0.01);
      let best = { x: 0.5, y: 0.5, clearance: -Infinity };
      for (let attempt = 0; attempt < 1200; attempt += 1) {
        const angle = random() * Math.PI * 2;
        const distance = Math.sqrt(random()) * maxCenterRadius;
        const x = 0.5 + Math.cos(angle) * distance;
        const y = 0.5 + Math.sin(angle) * distance;
        let clearance = Infinity;
        for (const other of placed) {
          const gap = Math.hypot(x - other.x, y - other.y) - body.radius - other.radius;
          if (gap < clearance) clearance = gap;
        }
        if (clearance > best.clearance) best = { x, y, clearance };
        if (clearance > 0.006) break;
      }
      body.x = best.x;
      body.y = best.y;
      placed.push(body);
    });

    // 把初始重叠推开，尽量让每一层从一开始就是“碰得上但不叠在一起”的液体堆。
    for (let pass = 0; pass < 220; pass += 1) {
      let moved = false;
      for (let index = 0; index < ordered.length; index += 1) {
        const a = ordered[index];
        for (let next = index + 1; next < ordered.length; next += 1) {
          const b = ordered[next];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let distance = Math.hypot(dx, dy);
          const minDistance = a.radius + b.radius + 0.003;
          if (distance >= minDistance) continue;
          if (distance < 0.00001) {
            dx = random() - 0.5;
            dy = random() - 0.5;
            distance = Math.max(Math.hypot(dx, dy), 0.0001);
          }
          const nx = dx / distance;
          const ny = dy / distance;
          const push = (minDistance - distance) * 0.54;
          const inverseA = 1 / a.mass;
          const inverseB = 1 / b.mass;
          const inverseTotal = inverseA + inverseB;
          a.x -= nx * push * (inverseA / inverseTotal);
          a.y -= ny * push * (inverseA / inverseTotal);
          b.x += nx * push * (inverseB / inverseTotal);
          b.y += ny * push * (inverseB / inverseTotal);
          moved = true;
        }
      }
      for (const body of ordered) {
        const dx = body.x - 0.5;
        const dy = body.y - 0.5;
        const distance = Math.hypot(dx, dy) || 0.0001;
        const maxRadius = 0.5 - body.radius - 0.009;
        if (distance > maxRadius) {
          body.x = 0.5 + (dx / distance) * maxRadius;
          body.y = 0.5 + (dy / distance) * maxRadius;
          moved = true;
        }
      }
      if (!moved) break;
    }
  }

  function buildPhysics() {
    physics.layers = Array.from({ length: LAYER_COUNT }, () => []);
    physics.accumulator = 0;
    physics.collisions = 0;
    physics.initialOverlap = 0;
    physics.reflowClock = 0;
    const random = makeRng(roundSeed ^ 0x6d2b79f5);

    state.items.forEach((item) => {
      const body = makePhysicsBody(item, random);
      item.body = body;
      physics.layers[item.layer].push(body);
    });

    physics.layers.forEach((layerBodies, index) => {
      packLayer(layerBodies, makeRng(roundSeed ^ (0x9e3779b9 + index * 0x85ebca6b)));
      physics.initialOverlap = Math.max(physics.initialOverlap, measureOverlaps(layerBodies));

      layerBodies.forEach((body) => {
        // 固定朝向只设置一次，运行中不再旋转。
        body.item.el.style.setProperty('--rot', `${body.angle.toFixed(2)}deg`);
      });
    });

    physics.world = dom.itemsLayer.clientWidth || 0;
    renderPhysics();
    physics.lastTs = performance.now();
    ensurePhysicsLoop();
  }

  function removePhysicsBody(item) {
    if (!item || !item.body) return;
    const layer = physics.layers[item.body.layer];
    if (layer) {
      const index = layer.indexOf(item.body);
      if (index >= 0) layer.splice(index, 1);
    }
    item.body = null;
  }

  function renderPhysics() {
    const world = dom.itemsLayer.clientWidth;
    if (!world) return;
    physics.world = world;
    physics.layers.forEach((layerBodies) => {
      layerBodies.forEach((body) => {
        const button = body.item.el;
        if (!button || body.item.found) return;
        button.style.transform = `translate3d(${(body.x * world).toFixed(2)}px, ${(body.y * world).toFixed(2)}px, 0) translate(-50%, -50%)`;
      });
    });
  }

  function resolvePhysicsPair(a, b) {
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    let distance = Math.hypot(dx, dy);
    const minDistance = a.radius + b.radius + 0.002;
    if (distance >= minDistance) return;

    if (distance < 0.00001) {
      dx = 0.001;
      dy = 0;
      distance = 0.001;
    }
    const nx = dx / distance;
    const ny = dy / distance;
    const inverseA = 1 / a.mass;
    const inverseB = 1 / b.mass;
    const inverseTotal = inverseA + inverseB;
    const correction = (minDistance - distance) * 0.52;

    a.x -= nx * correction * (inverseA / inverseTotal);
    a.y -= ny * correction * (inverseA / inverseTotal);
    b.x += nx * correction * (inverseB / inverseTotal);
    b.y += ny * correction * (inverseB / inverseTotal);

    const relativeX = b.vx - a.vx;
    const relativeY = b.vy - a.vy;
    const normalSpeed = relativeX * nx + relativeY * ny;
    if (normalSpeed >= 0) return;

    const impulse = (-(1 + PAIR_RESTITUTION) * normalSpeed) / inverseTotal;
    a.vx -= impulse * nx * inverseA;
    a.vy -= impulse * ny * inverseA;
    b.vx += impulse * nx * inverseB;
    b.vy += impulse * ny * inverseB;

    physics.collisions += 1;
  }

  function constrainPhysicsBody(body) {
    const dx = body.x - 0.5;
    const dy = body.y - 0.5;
    const distance = Math.hypot(dx, dy);
    const maxRadius = 0.5 - body.radius - 0.008;
    if (distance <= maxRadius) return;

    const nx = dx / (distance || 1);
    const ny = dy / (distance || 1);
    body.x = 0.5 + nx * maxRadius;
    body.y = 0.5 + ny * maxRadius;
    const normalSpeed = body.vx * nx + body.vy * ny;
    if (normalSpeed > 0) {
      body.vx -= (1 + WALL_RESTITUTION) * normalSpeed * nx;
      body.vy -= (1 + WALL_RESTITUTION) * normalSpeed * ny;
      body.vx *= 0.985;
      body.vy *= 0.985;
    }
  }

  function stepPhysics(dt) {
    physics.layers.forEach((layerBodies) => {
      layerBodies.forEach((body) => {
        // 没有外力：食材带着初始速度直线走，方向只在碰撞和撞锅壁时改变。
        // 速度大小会缓慢回到各自的巡航速度，碰撞搅起的快慢都慢慢平复。
        let speed = Math.hypot(body.vx, body.vy);
        if (speed < 0.0006) {
          const heading = Math.random() * Math.PI * 2;
          body.vx = Math.cos(heading) * body.cruiseSpeed;
          body.vy = Math.sin(heading) * body.cruiseSpeed;
        } else {
          const blend = Math.min(1, CRUISE_RELAX * dt);
          const nextSpeed = speed + (body.cruiseSpeed - speed) * blend;
          const scale = nextSpeed / speed;
          body.vx *= scale;
          body.vy *= scale;
          speed = nextSpeed;
        }

        if (speed > MAX_SPEED) {
          const scale = MAX_SPEED / speed;
          body.vx *= scale;
          body.vy *= scale;
        }

        body.x += body.vx * dt;
        body.y += body.vy * dt;
      });

      for (let pass = 0; pass < 2; pass += 1) {
        for (let index = 0; index < layerBodies.length; index += 1) {
          for (let next = index + 1; next < layerBodies.length; next += 1) {
            resolvePhysicsPair(layerBodies[index], layerBodies[next]);
          }
        }
      }
      layerBodies.forEach(constrainPhysicsBody);
    });
  }

  function ensurePhysicsLoop() {
    if (physics.raf !== null) return;
    physics.lastTs = performance.now();
    physics.raf = requestAnimationFrame(tickPhysics);
  }

  function tickPhysics(timestamp) {
    physics.raf = requestAnimationFrame(tickPhysics);
    if (!state.started || !state.running || state.paused || state.ended) {
      physics.lastTs = timestamp;
      return;
    }
    const dt = Math.min(0.04, (timestamp - physics.lastTs) / 1000 || PHYSICS_STEP);
    physics.lastTs = timestamp;
    physics.accumulator += dt;
    let steps = 0;
    while (physics.accumulator >= PHYSICS_STEP && steps < 3) {
      stepPhysics(PHYSICS_STEP);
      physics.accumulator -= PHYSICS_STEP;
      steps += 1;
    }
    if (steps > 0) {
      physics.reflowClock += dt;
      if (physics.reflowClock >= 1.2) {
        physics.reflowClock = 0;
        reflowLayers();
      }
      renderPhysics();
    }
  }

  function applyPhysicsImpulse(strength, random) {
    physics.layers.forEach((layerBodies) => {
      layerBodies.forEach((body) => {
        const dx = body.x - 0.5;
        const dy = body.y - 0.5;
        const distance = Math.hypot(dx, dy) || 0.01;
        const tangential = (-dy / distance) * strength;
        const radial = (random() - 0.5) * strength * 0.7;
        body.vx += tangential + (dx / distance) * radial;
        body.vy += (dy / distance) * radial + (random() - 0.5) * strength * 0.35;
      });
    });
  }

  /* =======================================================
     暂停 / 开始 / 完成 / 重开
     ======================================================= */
  function buildRound() {
    clearPendingTimers();
    clearCooldownTimers();
    clearHint();
    state.finishPending = false;
    state.ended = false;
    state.paused = false;
    state.remaining = TOTAL;
    state.found = 0;
    state.score = 0;
    state.served = 0;
    state.elapsed = 0;
    state.clockStart = null;
    state.maxSlots = START_SLOTS;
    state.activeTargets = [];
    state.queue = [];
    state.tempSlots = Array(TEMP_SLOTS).fill(null);
    state.wrongAt = 0;
    state.lastHintToastAt = 0;
    stopClock();
    dom.timer.textContent = '00:00';
    dom.pauseScreen.hidden = true;
    dom.finishScreen.hidden = true;

    roundSeed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
    const random = makeRng(roundSeed);
    const order = shuffle(TYPES, random);
    state.queue = order.slice(START_SLOTS);
    order.slice(0, START_SLOTS).forEach((type, index) => {
      state.activeTargets.push(createTargetObject(type, index));
    });

    dom.itemsLayer.innerHTML = '';
    dom.plateRow.innerHTML = '';
    renderInitialPlates();
    renderTempPlates();
    buildBrothBubbles();
    buildItems();

    dom.addPlateBtn.disabled = false;
    dom.addPlateBtn.classList.remove('is-disabled');
    dom.addPlateBtn.setAttribute('aria-label', '加一只碟子，多出一道订单');
    const addLabel = dom.addPlateBtn.querySelector('.tool-label');
    if (addLabel) addLabel.textContent = '加碟子';
    const badge = dom.addPlateBtn.querySelector('.tool-badge');
    if (badge) badge.hidden = false;

    [dom.hintBtn, dom.shuffleBtn, dom.shakeBtn].forEach((button) => {
      button.disabled = false;
      button.classList.remove('is-cooling');
    });

    updateHud();
    dom.toastStack.innerHTML = '';
    dom.announcer.textContent = '';
    updateMuteUi();
    resizePot();
  }

  function startRoundFromIntro() {
    if (state.started) return;
    state.started = true;
    state.running = true;
    buildRound();
    dom.game.classList.add('is-started');
    dom.startScreen.classList.add('is-closing');
    Soundscape.init();
    Soundscape.setMuted(Soundscape.muted);
    if (!Soundscape.muted) {
      Soundscape.startMusic();
      Soundscape.playStart();
    }
    startClock();

    window.setTimeout(() => {
      dom.startScreen.hidden = true;
      dom.startScreen.classList.remove('is-closing');
      setGamePanelsInert(false);
    }, 560);

    later(() => {
      const count = highlightItems(activeTypes(), 2600);
      if (count) {
        state.lastHintToastAt = performance.now();
        showToast('看订单，点锅里同款 · 发光的可以先捞', '', 3000);
        announce('游戏开始。发光的是订单需要的食材，每次需要三份。');
      }
    }, 760);
  }

  function pauseGame(auto = false) {
    if (!state.started || state.paused || state.ended || !state.running) return;
    state.paused = true;
    freezeClock();
    clearHint();
    updatePauseStats();
    dom.pauseScreen.hidden = false;
    setGamePanelsInert(true);
    Soundscape.pauseMusic();
    if (!auto) Soundscape.playSoftClick();
    window.setTimeout(() => {
      dom.resumeBtn.focus({ preventScroll: true });
    }, 60);
    announce('游戏已暂停，锅还温着。');
  }

  function updatePauseStats() {
    dom.pauseRemaining.textContent = String(state.remaining);
    dom.pauseServed.textContent = String(state.served);
    dom.pauseScore.textContent = String(state.score);
  }

  function resumeGame() {
    if (!state.paused) return;
    state.paused = false;
    dom.pauseScreen.hidden = true;
    setGamePanelsInert(false);
    startClock();
    sweepTempDeliveries();
    if (!Soundscape.muted) Soundscape.resumeMusic();
    Soundscape.playSoftClick();
    dom.pauseBtn.focus({ preventScroll: true });
    announce('继续捞。');
    if (state.remaining === 0 && state.finishPending && !state.ended) {
      later(() => finishGame(), 450);
    }
  }

  function restartRound() {
    if (!state.started) return;
    clearPendingTimers();
    clearCooldownTimers();
    state.ended = false;
    state.paused = false;
    state.running = true;
    state.finishPending = false;
    dom.pauseScreen.hidden = true;
    dom.finishScreen.hidden = true;
    setGamePanelsInert(false);
    buildRound();
    dom.game.classList.add('is-started');
    startClock();
    if (!Soundscape.muted) {
      Soundscape.resumeMusic();
    }
    later(() => {
      showToast('新的一锅，慢慢来', '', 2200);
    }, 450);
    announce('重开一锅。');
  }

  function finishGame() {
    if (state.ended) return;
    if (state.paused) {
      state.finishPending = true;
      return;
    }
    state.ended = true;
    state.running = false;
    state.finishPending = false;
    freezeClock();
    clearHint();
    Soundscape.playWin();

    const elapsed = state.elapsed;
    const previousBest = readBestTime();
    const isNewBest = previousBest === null || elapsed < previousBest;
    if (isNewBest) writeStorage(STORAGE_BEST, String(Math.round(elapsed)));

    dom.finishTime.textContent = formatTime(elapsed);
    dom.finishPlates.textContent = String(state.served);
    dom.finishScore.textContent = String(state.score);
    const best = isNewBest ? elapsed : previousBest;
    dom.bestLine.hidden = false;
    dom.bestLine.innerHTML = isNewBest
      ? `新的最快清锅纪录 · <b>${formatTime(best)}</b>`
      : `最快清锅纪录 · <b>${formatTime(best)}</b>`;

    dom.finishScreen.hidden = false;
    setGamePanelsInert(true);
    window.setTimeout(() => {
      dom.againBtn.focus({ preventScroll: true });
    }, 300);
    announce(`全部食材已经捞完。用时${formatTime(elapsed)}，上桌${state.served}碟，解压值${state.score}。`);

    dom.hintBtn.disabled = true;
    dom.shuffleBtn.disabled = true;
    dom.shakeBtn.disabled = true;
    dom.addPlateBtn.disabled = true;
  }

  /* =======================================================
     音频开关
     ======================================================= */
  function updateMuteUi() {
    const muted = Soundscape.muted;
    dom.muteBtn.classList.toggle('is-muted', muted);
    dom.muteBtn.setAttribute('aria-label', muted ? '打开背景音乐' : '关闭背景音乐');
    dom.muteBtn.setAttribute('title', muted ? '打开背景音乐' : '关闭背景音乐');
    dom.pauseMuteBtn.textContent = `背景音乐：${muted ? '关' : '开'}`;
    dom.pauseMuteBtn.setAttribute('aria-pressed', muted ? 'false' : 'true');
    if (dom.introMuteBtn) {
      dom.introMuteBtn.classList.toggle('is-muted', muted);
      dom.introMuteBtn.setAttribute('aria-pressed', muted ? 'false' : 'true');
      dom.introMuteBtn.setAttribute('aria-label', muted ? '打开背景音乐' : '关闭背景音乐');
    }
    if (dom.introAudioText) {
      dom.introAudioText.textContent = muted
        ? '背景音乐已关闭 · 点此打开'
        : '轻柔锅物小调 · 点此静音';
    }
  }

  function toggleMute(force) {
    const next = typeof force === 'boolean' ? force : !Soundscape.muted;
    Soundscape.setMuted(next);
    updateMuteUi();
    if (!next) {
      if (state.started && state.running && !state.paused && !state.ended) {
        Soundscape.startMusic();
      }
    }
    if (state.running && !state.paused) {
      Soundscape.playSoftClick();
    }
    announce(next ? '背景音乐已关闭。' : '背景音乐已打开。');
  }

  /* =======================================================
     工具与界面事件
     ======================================================= */
  function handlePlateRowClick(event) {
    const card = event.target.closest('.order-plate');
    if (!card || !state.running || state.paused || state.ended) return;

    if (card.dataset.locked === 'true') {
      unlockPlate();
      return;
    }
    const slot = Number(card.dataset.slot);
    const target = state.activeTargets.find((entry) => entry.slot === slot);
    if (!target) return;
    if (target.completed) {
      showToast('这一碟已经上齐啦，下一道在等你', '', 1600);
      return;
    }
    Soundscape.playSoftClick();
    hintTargetType(target.typeId);
  }

  function resizePot() {
    if (!dom.potStage) return;
    const style = window.getComputedStyle(dom.potStage);
    const horizontalPadding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const verticalPadding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const width = dom.potStage.clientWidth - horizontalPadding;
    const height = dom.potStage.clientHeight - verticalPadding;
    const caption = dom.potStage.querySelector('.pot-caption');
    const captionHeight = caption && window.getComputedStyle(caption).display !== 'none'
      ? caption.getBoundingClientRect().height + 12
      : 0;
    const availableWidth = width - 12;
    const availableHeight = height - captionHeight - 8;
    let size = Math.min(Math.max(availableWidth + 26, availableWidth * 1.085), availableHeight, 548);
    if (!Number.isFinite(size) || size < 120) size = Math.min(window.innerWidth * 0.94, 340);
    size = Math.max(190, size);
    dom.potWrap.style.setProperty('--pot-size', `${Math.round(size)}px`);
    if (physics.layers.length) {
      window.requestAnimationFrame(() => {
        physics.world = dom.itemsLayer.clientWidth || physics.world;
        renderPhysics();
      });
    }
  }

  function attachEvents() {
    document.addEventListener('error', (event) => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement) || !image.classList.contains('food-img')) return;
      if (image.dataset.foodRetry === '1') return;
      image.dataset.foodRetry = '1';
      const source = image.getAttribute('src');
      if (!source) return;
      window.setTimeout(() => {
        image.src = `${source.split('?')[0]}?retry=${Date.now()}`;
      }, 180);
    }, true);

    // 鼠标只在点击时结算：按光标实际位置和视觉层级找食材；
    // 悬停不再放大、置顶或触发动画。键盘/脚本点击仍走按钮本身。
    dom.itemsLayer.addEventListener('click', (event) => {
      if (event.detail === 0) return;
      if (!state.running || state.paused || state.ended) return;
      const picked = findItemAtPointer(event.clientX, event.clientY);
      event.preventDefault();
      event.stopPropagation();
      if (picked) handleItemActivate(picked);
    }, true);
    dom.startBtn.addEventListener('click', startRoundFromIntro);
    dom.pauseBtn.addEventListener('click', () => pauseGame(false));
    dom.resumeBtn.addEventListener('click', resumeGame);
    dom.restartFromPause.addEventListener('click', restartRound);
    dom.againBtn.addEventListener('click', restartRound);
    dom.muteBtn.addEventListener('click', () => toggleMute());
    dom.pauseMuteBtn.addEventListener('click', () => toggleMute());
    dom.introMuteBtn.addEventListener('click', () => toggleMute());
    dom.hintBtn.addEventListener('click', hintCurrentTargets);
    dom.addPlateBtn.addEventListener('click', addPlate);
    dom.shuffleBtn.addEventListener('click', shufflePot);
    dom.shakeBtn.addEventListener('click', shakePot);
    dom.plateRow.addEventListener('click', handlePlateRowClick);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (!dom.pauseScreen.hidden) {
          resumeGame();
          event.preventDefault();
        } else if (state.running && !state.paused && !state.ended) {
          pauseGame(false);
          event.preventDefault();
        }
      } else if ((event.key === 'm' || event.key === 'M') && state.started) {
        toggleMute();
      } else if ((event.key === 'h' || event.key === 'H') && state.running && !state.paused && !state.ended) {
        hintCurrentTargets();
        event.preventDefault();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && state.started && state.running && !state.paused && !state.ended) {
        pauseGame(true);
      }
    });

    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(() => {
        resizePot();
      });
      observer.observe(dom.potStage);
      observer.observe(dom.game);
    }
    window.addEventListener('resize', resizePot, { passive: true });
    window.addEventListener('orientationchange', () => window.setTimeout(resizePot, 120), { passive: true });
  }

  function prepareIntroFoods() {
    $$('[data-intro-food]').forEach((element) => {
      const type = typeById.get(element.dataset.introFood);
      if (!type) return;
      element.innerHTML = makeArt(type);
    });
  }

  function initialize() {
    preloadFoodImages();
    prepareIntroFoods();
    buildTempPlates();
    renderTempPlates();
    window.setInterval(sweepTempDeliveries, 1500);
    attachEvents();
    setGamePanelsInert(true);
    updateMuteUi();
    updateHud();
    resizePot();
    // 自动开始仅用于截图与自动化测试；正常打开不会跳过开场。
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        window.setTimeout(() => {
          if (!state.started) startRoundFromIntro();
        }, 120);
      }
    } catch (error) {
      /* ignore */
    }
  }

  // 给调试留一只小窗口；正常游玩不会用到。
  window.__hotpot = {
    get state() {
      return state;
    },
    start: startRoundFromIntro,
    pause: pauseGame,
    resume: resumeGame,
    restart: restartRound,
    addPlate,
    hintTargetType,
    hintCurrentTargets,
    getAudio: () => Soundscape,
    get physics() {
      return physics;
    },
    pickAt: (clientX, clientY) => {
      const item = findItemAtPointer(clientX, clientY);
      return item ? { id: item.id, name: item.type.name, layer: item.layer } : null;
    },
    get alphaMaskCount() {
      return alphaMasks.size;
    },
  };

  initialize();
})();
