// Web Audio API Synthesizer and Sound Effects Engine for Offshore Wind Masters (OWM)

class OWMAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentTheme: 'daylight' | 'deepops' = 'daylight';
  private waveGain: GainNode | null = null;
  private padGain: GainNode | null = null;
  private isBgmRunning: boolean = false;
  private bgmInterval: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('owm-audio-muted');
      this.isMuted = savedMute === 'true';
    }
  }

  private ensureContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('owm-audio-muted', String(muted));
    }
    if (muted) {
      this.stopBgm();
    } else {
      this.ensureContext();
      this.startBgm();
    }
  }

  public toggleMuted(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public setTheme(theme: 'daylight' | 'deepops'): void {
    this.currentTheme = theme;
  }

  // --- SFX SYNTHESIZERS ---
  public playSfx(type: 'click' | 'theme' | 'artpack' | 'ptw' | 'deploy' | 'round' | 'victory'): void {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    switch (type) {
      case 'click': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
      case 'theme': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'artpack': {
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const noteTime = now + idx * 0.08;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, noteTime);
          gain.gain.setValueAtTime(0.15, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.2);
        });
        break;
      }
      case 'ptw': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'deploy': {
        // Deep maritime horn sound
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(110, now);
        osc2.frequency.setValueAtTime(112, now);
        osc1.frequency.exponentialRampToValueAtTime(95, now + 0.8);
        osc2.frequency.exponentialRampToValueAtTime(97, now + 0.8);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.9);
        osc2.stop(now + 0.9);
        break;
      }
      case 'round': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'victory': {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const noteTime = now + idx * 0.1;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, noteTime);
          gain.gain.setValueAtTime(0.2, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.4);
        });
        break;
      }
    }
  }

  // --- AMBIENT BGM SYNTHESIS ---
  public startBgm(): void {
    if (this.isMuted || this.isBgmRunning) return;
    this.ensureContext();
    if (!this.ctx) return;

    this.isBgmRunning = true;
    const now = this.ctx.currentTime;

    // 1. Procedural Sea Wave / Wind Noise
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);

    // LFO to modulate sea wave frequency
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, now); // ~8 second wave cycle
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(200, now);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    this.waveGain = this.ctx.createGain();
    this.waveGain.gain.setValueAtTime(0.04, now);

    whiteNoise.connect(filter);
    filter.connect(this.waveGain);
    this.waveGain.connect(this.ctx.destination);

    whiteNoise.start(now);
    lfo.start(now);

    // 2. Ambient Harmony Chords
    this.padGain = this.ctx.createGain();
    this.padGain.gain.setValueAtTime(0.03, now);
    this.padGain.connect(this.ctx.destination);

    const playChordPad = () => {
      if (!this.ctx || !this.isBgmRunning || this.isMuted) return;
      const padNow = this.ctx.currentTime;
      const freqs = this.currentTheme === 'daylight'
        ? [220, 277.18, 329.63, 440] // A Major Pad
        : [110, 130.81, 164.81, 220]; // A Minor Deep Ops Drone

      freqs.forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, padNow);
        g.gain.setValueAtTime(0.001, padNow);
        g.gain.linearRampToValueAtTime(0.02, padNow + 2);
        g.gain.linearRampToValueAtTime(0.001, padNow + 6);

        osc.connect(g);
        if (this.padGain) g.connect(this.padGain);

        osc.start(padNow);
        osc.stop(padNow + 6.5);
      });
    };

    playChordPad();
    this.bgmInterval = window.setInterval(playChordPad, 7000);
  }

  public stopBgm(): void {
    this.isBgmRunning = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    if (this.waveGain && this.ctx) {
      this.waveGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
    }
  }
}

export const audioEngine = new OWMAudioEngine();
