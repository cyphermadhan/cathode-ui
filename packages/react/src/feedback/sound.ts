/**
 * Sound feedback controller.
 *
 * Synthesizes short retro-terminal blips via the Web Audio API — no
 * audio files required. Keeps @cathode-ui/react tiny and matches the
 * hardware-synth aesthetic of the design system.
 *
 * Patterns come from the design tokens (see tokens/tokens.json → sound):
 *   - `click`   — 1200 Hz square, 30 ms  — button/pill taps
 *   - `confirm` —  800 Hz sine,   80 ms  — success / accept
 *   - `error`   —  200 Hz saw,   120 ms  — validation fail
 *   - `tick`    — 1600 Hz square, 15 ms  — value changes (slider, stepper)
 *
 * Disabled by default. Unexpected audio is hostile; the consumer app
 * must opt in via `<CathodeProvider sound={true}>` or a per-component
 * `sound` prop.
 *
 * A single AudioContext is lazily created and reused — browsers limit
 * the number of simultaneous contexts, so creating one per blip would
 * leak quickly.
 */
export type SoundPattern = 'click' | 'confirm' | 'error' | 'tick';

interface PatternSpec {
  freq: number;       // Hz
  ms: number;         // duration
  wave: OscillatorType;
  gain: number;       // peak volume (0–1)
}

const PATTERNS: Record<SoundPattern, PatternSpec> = {
  click:   { freq: 1200, ms: 30,  wave: 'square',   gain: 0.05 },
  confirm: { freq: 800,  ms: 80,  wave: 'sine',     gain: 0.06 },
  error:   { freq: 200,  ms: 120, wave: 'sawtooth', gain: 0.05 },
  tick:    { freq: 1600, ms: 15,  wave: 'square',   gain: 0.03 },
};

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  return ctx;
}

/** True iff the runtime has a working AudioContext. SSR returns false. */
export function soundAvailable(): boolean {
  return typeof window !== 'undefined' &&
    typeof (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) === 'function';
}

/** Fire a named sound. No-op if disabled or unsupported. */
export function sound(pattern: SoundPattern, { enabled = false } = {}): void {
  if (!enabled) return;
  const context = getCtx();
  if (!context) return;

  // Resume AudioContext if the browser suspended it pending user
  // interaction (common on desktop Safari / Chrome). If the user
  // hasn't interacted at all yet, `resume` rejects silently — we
  // swallow and skip the sound.
  if (context.state === 'suspended') {
    context.resume().catch(() => {});
  }

  const spec = PATTERNS[pattern];
  const now = context.currentTime;
  const dur = spec.ms / 1000;

  const osc = context.createOscillator();
  osc.type = spec.wave;
  osc.frequency.setValueAtTime(spec.freq, now);

  // Quick attack + decay envelope. A flat gain would produce a
  // pronounced click at start and end — the ramp makes blips land
  // cleanly.
  const gain = context.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(spec.gain, now + 0.005);
  gain.gain.linearRampToValueAtTime(0, now + dur);

  osc.connect(gain).connect(context.destination);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}
