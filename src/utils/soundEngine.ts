/**
 * Constructivist Acoustic Engine using HTML5 Audio API (HTMLAudioElement)
 * with procedurally generated PCM WAV buffers so no external audio files can fail to load.
 */

export type SoundEffectType = 'click' | 'hover' | 'expand' | 'signal';

interface SoundSettings {
  masterEnabled: boolean;
  ambientEnabled: boolean;
  sfxEnabled: boolean;
  volume: number; // 0 to 1
}

const STORAGE_KEY = 'constructivism_audio_settings_v1';

/**
 * Encodes mono float32 audio samples (-1..1) into a valid WAV Blob URL
 * for use with standard HTML5 Audio API (`new Audio(url)`).
 */
function createWavBlobUrl(samples: Float32Array, sampleRate = 22050): string {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const intSample = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

/**
 * Generates a short mechanical typewriter / relay click WAV
 */
function generateClickWav(): string {
  const sampleRate = 22050;
  const duration = 0.055;
  const length = Math.floor(sampleRate * duration);
  const samples = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 95);
    const metallic =
      Math.sin(2 * Math.PI * 320 * t) * 0.45 +
      Math.sin(2 * Math.PI * 880 * t) * 0.3 +
      (Math.random() * 2 - 1) * 0.25;
    samples[i] = metallic * env * 0.7;
  }
  return createWavBlobUrl(samples, sampleRate);
}

/**
 * Generates a subtle gear tick WAV for hover feedback
 */
function generateHoverWav(): string {
  const sampleRate = 22050;
  const duration = 0.028;
  const length = Math.floor(sampleRate * duration);
  const samples = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * 150);
    const tone =
      Math.sin(2 * Math.PI * 540 * t) * 0.5 +
      Math.sin(2 * Math.PI * 1080 * t) * 0.2;
    samples[i] = tone * env * 0.35;
  }
  return createWavBlobUrl(samples, sampleRate);
}

/**
 * Generates a two-step mechanical lever / blueprint shutter WAV for expanding cards
 */
function generateExpandWav(): string {
  const sampleRate = 22050;
  const duration = 0.16;
  const length = Math.floor(sampleRate * duration);
  const samples = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const isSecondStep = t > 0.065;
    const localT = isSecondStep ? t - 0.065 : t;
    const freq = isSecondStep ? 330 : 220;
    const env = Math.exp(-localT * 38);
    const wave =
      Math.sin(2 * Math.PI * freq * t) * 0.5 +
      Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.3 +
      (Math.random() * 2 - 1) * 0.12 * Math.exp(-localT * 90);
    samples[i] = wave * env * 0.65;
  }
  return createWavBlobUrl(samples, sampleRate);
}

/**
 * Generates a Shukhov radio-tower telegraph signal WAV
 */
function generateSignalWav(): string {
  const sampleRate = 22050;
  const duration = 0.22;
  const length = Math.floor(sampleRate * duration);
  const samples = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    // Morse-like double pulse ("dot-dash")
    const pulse = t < 0.06 || (t > 0.09 && t < 0.20) ? 1 : 0;
    const env = pulse * Math.min(1, (0.22 - t) * 20);
    const carrier =
      Math.sin(2 * Math.PI * 660 * t) * 0.45 +
      Math.sin(2 * Math.PI * 990 * t) * 0.2;
    samples[i] = carrier * env * 0.5;
  }
  return createWavBlobUrl(samples, sampleRate);
}

/**
 * Generates a seamless 6-second industrial ambient loop WAV:
 * - Low turbine dynamo hum (55 Hz + 110 Hz + 165 Hz)
 * - Rhythmic mechanical loom / printing press pulse (120 BPM = 2 Hz)
 * - Subtle high radio-mast harmonic
 */
function generateIndustrialLoopWav(): string {
  const sampleRate = 22050;
  const duration = 6.0; // exact integer period for seamless loop
  const length = Math.floor(sampleRate * duration);
  const samples = new Float32Array(length);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;

    // 1. Deep factory turbine drone (exact integer cycles in 6s)
    const drone =
      Math.sin(2 * Math.PI * 55 * t) * 0.22 +
      Math.sin(2 * Math.PI * 110 * t) * 0.14 +
      Math.sin(2 * Math.PI * 82.5 * t) * 0.08;

    // 2. Rhythmic mechanical printing press / piston chug (2 beats per second)
    const beatPhase = (t * 2) % 1;
    const pistonEnv = Math.exp(-beatPhase * 12);
    const pistonNoise =
      (Math.sin(2 * Math.PI * 145 * t) * 0.4 +
        Math.sin(2 * Math.PI * 290 * t) * 0.25 +
        (Math.sin(i * 12.9898) * 43758.5453 - Math.floor(Math.sin(i * 12.9898) * 43758.5453) - 0.5) * 0.35) *
      pistonEnv *
      0.18;

    // 3. Distant Shukhov radio mast harmonic swell
    const lfo = 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 6.0);
    const radioHarmonic = Math.sin(2 * Math.PI * 440 * t) * 0.025 * lfo;

    // Smooth cross-fade at loop boundaries
    let edgeFade = 1;
    if (t < 0.05) edgeFade = t / 0.05;
    if (t > duration - 0.05) edgeFade = (duration - t) / 0.05;

    samples[i] = (drone + pistonNoise + radioHarmonic) * edgeFade * 0.75;
  }

  return createWavBlobUrl(samples, sampleRate);
}

class ConstructivistSoundManager {
  private settings: SoundSettings = {
    masterEnabled: true,
    ambientEnabled: false,
    sfxEnabled: true,
    volume: 0.65,
  };

  private initialized = false;
  private sfxAudioMap: Record<SoundEffectType, HTMLAudioElement | null> = {
    click: null,
    hover: null,
    expand: null,
    signal: null,
  };
  private ambientAudio: HTMLAudioElement | null = null;
  private lastHoverTime = 0;
  private listeners: Array<(settings: SoundSettings) => void> = [];

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.settings = {
          masterEnabled: Boolean(parsed.masterEnabled ?? true),
          ambientEnabled: Boolean(parsed.ambientEnabled ?? false),
          sfxEnabled: Boolean(parsed.sfxEnabled ?? true),
          volume: typeof parsed.volume === 'number' ? Math.max(0, Math.min(1, parsed.volume)) : 0.65,
        };
      }
    } catch {
      // ignore storage errors
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // ignore storage errors
    }
    this.notifyListeners();
  }

  public subscribe(listener: (settings: SoundSettings) => void): () => void {
    this.listeners.push(listener);
    listener(this.settings);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      listener({ ...this.settings });
    }
  }

  private ensureAudioElements() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    // Create HTML5 Audio elements for each SFX
    this.sfxAudioMap.click = new Audio(generateClickWav());
    this.sfxAudioMap.hover = new Audio(generateHoverWav());
    this.sfxAudioMap.expand = new Audio(generateExpandWav());
    this.sfxAudioMap.signal = new Audio(generateSignalWav());

    // Create HTML5 Audio element for industrial ambient loop
    this.ambientAudio = new Audio(generateIndustrialLoopWav());
    this.ambientAudio.loop = true;
    this.ambientAudio.preload = 'auto';
    this.syncVolumes();
  }

  private syncVolumes() {
    const effectiveVolume = this.settings.masterEnabled ? this.settings.volume : 0;
    if (this.ambientAudio) {
      this.ambientAudio.volume = Math.max(0, Math.min(1, effectiveVolume * 0.45));
    }
    (Object.keys(this.sfxAudioMap) as SoundEffectType[]).forEach((key) => {
      const el = this.sfxAudioMap[key];
      if (el) {
        el.volume = Math.max(0, Math.min(1, effectiveVolume));
      }
    });
  }

  public getSettings(): SoundSettings {
    return { ...this.settings };
  }

  public setMasterEnabled(enabled: boolean) {
    this.ensureAudioElements();
    this.settings.masterEnabled = enabled;
    this.syncVolumes();

    if (!enabled && this.ambientAudio) {
      this.ambientAudio.pause();
    } else if (enabled && this.settings.ambientEnabled && this.ambientAudio) {
      this.ambientAudio.play().catch(() => {});
    }
    if (enabled && this.settings.sfxEnabled) {
      this.playSfx('signal');
    }
    this.saveSettings();
  }

  public setAmbientEnabled(enabled: boolean) {
    this.ensureAudioElements();
    this.settings.ambientEnabled = enabled;
    if (enabled && !this.settings.masterEnabled) {
      this.settings.masterEnabled = true;
    }
    this.syncVolumes();

    if (this.ambientAudio) {
      if (enabled && this.settings.masterEnabled) {
        this.ambientAudio.play().catch(() => {});
      } else {
        this.ambientAudio.pause();
      }
    }
    this.saveSettings();
  }

  public setSfxEnabled(enabled: boolean) {
    this.ensureAudioElements();
    this.settings.sfxEnabled = enabled;
    if (enabled && !this.settings.masterEnabled) {
      this.settings.masterEnabled = true;
    }
    this.syncVolumes();
    if (enabled) {
      this.playSfx('click');
    }
    this.saveSettings();
  }

  public setVolume(volume: number) {
    this.ensureAudioElements();
    this.settings.volume = Math.max(0, Math.min(1, volume));
    this.syncVolumes();
    this.saveSettings();
  }

  public playSfx(type: SoundEffectType) {
    if (!this.settings.masterEnabled || !this.settings.sfxEnabled) return;
    this.ensureAudioElements();

    if (type === 'hover') {
      const now = performance.now();
      if (now - this.lastHoverTime < 90) return;
      this.lastHoverTime = now;
    }

    const baseAudio = this.sfxAudioMap[type];
    if (!baseAudio) return;

    try {
      // Clone node or reset currentTime so rapid clicks overlap cleanly via HTML5 Audio API
      const clone = baseAudio.cloneNode(true) as HTMLAudioElement;
      clone.volume = baseAudio.volume;
      clone.play().catch(() => {});
    } catch {
      // Ignore autoplay errors prior to first gesture
    }
  }
}

export const soundEngine = new ConstructivistSoundManager();
