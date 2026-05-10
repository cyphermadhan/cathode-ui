/**
 * Sound feedback controller.
 *
 * Synthesizes short retro-terminal blips via the Web Audio API — no
 * audio files, no asset loading, stays tiny. Matches the hardware-synth
 * aesthetic of the design system.
 *
 * Patterns are sequences of notes (see tokens/tokens.json → sound).
 * Each note has its own freq/wave/gain/duration, and an optional
 * `delay` that shifts its start relative to the previous note's end.
 * This gives us room for character:
 *
 *   - `click`      — single short square pulse (button tap)
 *   - `tick`       — very short, low gain (slider / stepper tick)
 *   - `confirm`    — sine two-note rising (success)
 *   - `warn`       — triangle single mid-low note (heads-up)
 *   - `error`      — sawtooth descending two-note buzz (system error)
 *   - `destructive`— sawtooth single low note (pre-action warning)
 *
 * The `error` pattern is intentionally modeled after the classic
 * system-error "ding-dong" descent — unmistakable, can't be confused
 * with a regular `click`.
 *
 * Opt-in only. The controller is off by default at the provider level;
 * unexpected audio is hostile. Respects `prefers-reduced-motion` as a
 * proxy for "any sensory noise" — if the user asked for reduced motion,
 * we also mute sound.
 *
 * A single AudioContext is lazily created and reused. Browsers rate-
 * limit AudioContext creation, so churning one per blip would leak.
 */
export type SoundPattern = 'click' | 'tick' | 'confirm' | 'warn' | 'error' | 'destructive';

interface Note {
  freq: number;
  ms: number;
  wave: OscillatorType;
  gain: number;
  /** Start offset after the previous note ends (ms). Default 0. */
  delay?: number;
}

const PATTERNS: Record<SoundPattern, Note[]> = {
  click:       [{ freq: 1200, ms: 30,  wave: 'square',   gain: 0.05 }],
  tick:        [{ freq: 1600, ms: 15,  wave: 'square',   gain: 0.03 }],
  confirm: [
    { freq: 880,  ms: 60,  wave: 'sine',     gain: 0.06 },
    { freq: 1175, ms: 80,  wave: 'sine',     gain: 0.06, delay: 50 },
  ],
  warn:        [{ freq: 600,  ms: 140, wave: 'triangle', gain: 0.07 }],
  error: [
    { freq: 440,  ms: 70,  wave: 'sawtooth', gain: 0.08 },
    { freq: 330,  ms: 120, wave: 'sawtooth', gain: 0.08, delay: 40 },
  ],
  destructive: [{ freq: 180,  ms: 100, wave: 'sawtooth', gain: 0.08 }],
};

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const C = window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  return ctx;
}

/** True iff the runtime has a working AudioContext. SSR returns false. */
export function soundAvailable(): boolean {
  return typeof window !== 'undefined' &&
    typeof (window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) === 'function';
}

/** Fire a named pattern. No-op if disabled or unsupported. */
export function sound(pattern: SoundPattern, { enabled = false } = {}): void {
  if (!enabled) return;

  // Respect `prefers-reduced-motion` as a "mute all sensory noise" signal.
  if (typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const context = getCtx();
  if (!context) return;

  // Chrome/Safari suspend AudioContext until the first user gesture.
  // resume() rejects silently if we're still pre-interaction; in that
  // case the sound just doesn't play and we move on.
  if (context.state === 'suspended') {
    context.resume().catch(() => {});
  }

  const notes = PATTERNS[pattern];
  // Cursor for scheduling — each note starts after the previous note's
  // natural end plus its own optional `delay`. That lets `confirm`'s
  // second note lead into the first's tail for a musical rise, and
  // `error`'s second note sit in a deliberate gap after the first
  // cuts out for the classic ding-dong feel.
  let cursor = context.currentTime + 0.01; // tiny lead to avoid clicks
  for (const note of notes) {
    playNote(context, note, cursor);
    cursor += note.ms / 1000 + (note.delay ?? 0) / 1000;
  }
}

function playNote(context: AudioContext, note: Note, startAt: number): void {
  const osc = context.createOscillator();
  osc.type = note.wave;
  osc.frequency.setValueAtTime(note.freq, startAt);

  // Short raised envelope so blips don't click at their edges. 5 ms
  // attack is inaudible but crucial to avoid the "pop" a bare square
  // wave produces at start/stop.
  const gain = context.createGain();
  const dur = note.ms / 1000;
  const attack = Math.min(0.005, dur / 4);
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(note.gain, startAt + attack);
  gain.gain.linearRampToValueAtTime(0, startAt + dur);

  osc.connect(gain).connect(context.destination);
  osc.start(startAt);
  osc.stop(startAt + dur + 0.02);
}
