/**
 * Local dev preview — not part of the published bundle.
 * Run `npm run dev` at the repo root (or inside packages/react/) and
 * Vite serves this at http://localhost:5173. Every primitive renders
 * in both themes with working motion / haptic / sound / AI controls.
 */
import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CathodeProvider,
  sound,
  TerminalFrame,
  PixelBar,
  ActivityBar,
  PulsingDot,
  DotLeader,
  Pill,
  Button,
  TextField,
  StatusTile,
  Toast,
  Toggle,
  Stepper,
  Chips,
  SearchBar,
  Dialog,
  Chat,
  HazardStripes,
} from './index';
import {
  IconBroadcast,
  IconChat,
  IconEar,
  IconSettings,
  IconSignal,
  IconCheck,
  IconCamera,
  IconSparkle,
  IconClose,
} from './icons';
import type { CathodeAIProvider, ChatMessage } from './ai/provider';
import './tokens.css';
import './fonts.css';

/** Stub provider so AI-enabled components have something to stream from. */
const mockAI: CathodeAIProvider = {
  async *suggest(prefix) {
    const parts = [' to the meeting', ' after lunch', ' — need more data'];
    const pick = parts[prefix.length % parts.length];
    for (const ch of pick) {
      await new Promise((r) => setTimeout(r, 25));
      yield ch;
    }
  },
  async *chat(_messages: ChatMessage[]) {
    const reply = 'Cathode UI echo: received your message.';
    for (const ch of reply) {
      await new Promise((r) => setTimeout(r, 20));
      yield ch;
    }
  },
  async act(intent) {
    await new Promise((r) => setTimeout(r, 400));
    return `Mock AI result for intent: ${intent}`;
  },
};

function App() {
  const [theme, setTheme] = useState<'auto' | 'dark' | 'light'>('dark');
  // Named with an `On` suffix so they don't shadow the imported
  // `sound` / `haptic` functions we call directly in the audition row.
  const [soundOn, setSoundOn] = useState(false);
  const [hapticOn, setHapticOn] = useState(true);
  const [motion, setMotion] = useState<'subtle' | 'strong' | 'none'>('strong');
  const [text, setText] = useState('Hello');
  const [level, setLevel] = useState(0.4);
  const [toast, setToast] = useState(false);
  const [actionResult, setActionResult] = useState<string>('');
  const [wpm, setWpm] = useState(12);
  const [notify, setNotify] = useState(true);
  const [activityTick, setActivityTick] = useState(0);
  const [dialog, setDialog] = useState(false);
  const searchItems = useMemo(
    () => [
      { id: '1', label: 'START RECORDING', subtitle: 'Cmd+R' },
      { id: '2', label: 'PAIR NEW DEVICE', subtitle: 'Cmd+P' },
      { id: '3', label: 'CLEAR BUFFER', subtitle: 'Cmd+K' },
      { id: '4', label: 'EXPORT SESSION', subtitle: 'Cmd+E' },
      { id: '5', label: 'TOGGLE DIAGNOSTICS' },
    ],
    []
  );

  const providerProps = useMemo(
    () => ({ theme, sound: soundOn, haptic: hapticOn, motion, ai: mockAI }),
    [theme, soundOn, hapticOn, motion]
  );

  return (
    <CathodeProvider {...providerProps}>
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--cathode-color-bg)',
          color: 'var(--cathode-color-text)',
          padding: 24,
          fontFamily: 'var(--cathode-type-font-stack)',
        }}
      >
        <header style={{ display: 'flex', gap: 16, alignItems: 'baseline', marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: 3, margin: 0 }}>
            CATHODE · UI · PREVIEW
          </h1>
          <span style={{ color: 'var(--cathode-color-text-dim)', fontSize: 11, letterSpacing: 1.4 }}>
            v0.1.0 · {theme.toUpperCase()}
          </span>
        </header>

        <Controls
          theme={theme}
          setTheme={setTheme}
          sound={soundOn}
          setSound={setSoundOn}
          haptic={hapticOn}
          setHaptic={setHapticOn}
          motion={motion}
          setMotion={setMotion}
        />

        <Section title="PILLS — PALETTE">
          <Row>
            <Pill title="AMBER" accent="amber" active icon={<IconBroadcast size={12} weight="bold" />} />
            <Pill title="PINK" accent="pink" icon={<IconChat size={12} weight="bold" />} onClick={() => setToast(true)} />
            <Pill title="PURPLE" accent="purple" icon={<IconEar size={12} weight="bold" />} />
            <Pill title="TEAL" accent="teal" icon={<IconSparkle size={12} weight="bold" />} />
            <Pill title="GREY" accent="grey" icon={<IconSettings size={12} weight="bold" />} />
          </Row>
        </Section>

        <Section title="PILLS — SEMANTIC">
          <Row>
            <Pill title="INFO" accent="info" icon={<IconSignal size={12} weight="bold" />} />
            <Pill title="SUCCESS" accent="success" icon={<IconCheck size={12} weight="bold" />} />
            <Pill title="WARNING" accent="warning" icon={<IconSparkle size={12} weight="bold" />} />
            <Pill title="DANGER" accent="danger" icon={<IconClose size={12} weight="bold" />} />
            <Pill title="ACCENT" accent="accent" icon={<IconSparkle size={12} weight="bold" />} />
          </Row>
        </Section>

        <Section title="STATUS TILES">
          <Row>
            <StatusTile
              title="ACTIVE"
              subtitle="ALL SYSTEMS GO"
              icon={<IconBroadcast size={24} weight="bold" />}
              accent="success"
              active
              onClick={() => setToast(true)}
            />
            <StatusTile
              title="READY"
              subtitle="FPRINT · 4A2B-9C1D"
              icon={<IconCheck size={24} weight="bold" />}
              accent="success"
              active
            />
            <StatusTile
              title="IDLE"
              subtitle="WAITING FOR INPUT"
              icon={<IconSignal size={24} weight="bold" />}
              accent="grey"
            />
          </Row>
        </Section>

        <Section title="TERMINAL FRAME + DOT LEADER">
          <TerminalFrame title="TELEMETRY">
            <DotLeader label="LATENCY" value="42 MS" />
            <DotLeader label="LOSS" value="0.2%" />
            <DotLeader label="STATE" value="LIVE" valueColor="var(--cathode-color-ok)" />
            <DotLeader label="LINK" value="DOWN" valueColor="var(--cathode-color-tx)" />
          </TerminalFrame>
        </Section>

        <Section title="PIXEL BAR">
          <Row align="center">
            <PixelBar level={level} cells={30} fill="var(--cathode-color-danger)" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={level}
              onChange={(e) => setLevel(parseFloat(e.target.value))}
            />
            <span style={{ fontSize: 11, color: 'var(--cathode-color-text-dim)' }}>
              LEVEL {Math.round(level * 100)}
            </span>
          </Row>
        </Section>

        <Section title="PULSING DOT">
          <Row align="center">
            <PulsingDot color="var(--cathode-color-success)" />
            <span style={{ fontSize: 11, color: 'var(--cathode-color-text-dim)' }}>SCANNING</span>
          </Row>
        </Section>

        <Section title="BUTTONS">
          <Row>
            <Button>DEFAULT</Button>
            <Button variant="primary" icon={<IconCheck size={14} weight="bold" />}>
              SUBMIT
            </Button>
            <Button variant="danger" icon={<IconClose size={14} weight="bold" />}>
              DELETE
            </Button>
            <Button
              icon={<IconSparkle size={14} weight="bold" />}
              ai={{ action: 'summarize', context: { level } }}
              onActionResult={setActionResult}
            >
              AI ACTION
            </Button>
          </Row>
          {actionResult && (
            <div style={{ fontSize: 11, color: 'var(--cathode-color-text-dim)', marginTop: 8 }}>
              → {actionResult}
            </div>
          )}
        </Section>

        <Section title="TEXT FIELD (plain + AI suggest)">
          <TextField value={text} onChange={setText} placeholder="TYPE HERE" aria-label="demo input" />
          <div style={{ height: 10 }} />
          <TextField
            value={text}
            onChange={setText}
            ai={{ suggest: true }}
            aria-label="demo input with AI suggest"
          />
          <div style={{ fontSize: 10, color: 'var(--cathode-color-text-faint)', marginTop: 6 }}>
            TAB TO ACCEPT SUGGESTION
          </div>
        </Section>

        <Section title="TOAST">
          <Row>
            <Button onClick={() => setToast((v) => !v)}>TOGGLE TOAST</Button>
            <Button
              variant="danger"
              onClick={() => {
                setToast(true);
                setTimeout(() => setToast(false), 2000);
              }}
            >
              FLASH ERROR (2s)
            </Button>
          </Row>
          <div style={{ marginTop: 12 }}>
            <Toast visible={toast} kind="info">
              <IconCamera size={12} weight="bold" /> SOMETHING HAPPENED
            </Toast>
          </div>
        </Section>

        <Section title="TOGGLE + STEPPER">
          <Row align="center">
            <Toggle value={notify} onChange={setNotify} label="NOTIFICATIONS" />
            <Stepper value={wpm} onChange={setWpm} min={5} max={40} label="WPM" />
            <Toggle value={!notify} onChange={(v) => setNotify(!v)} label="DANGER" accent="danger" />
          </Row>
        </Section>

        <Section title="CHIPS">
          <Chips
            groups={[
              [
                { label: 'SOS' },
                { label: 'MAYDAY' },
                { label: 'HELP' },
              ],
              [
                { label: 'OK' },
                { label: 'YES' },
                { label: 'NO' },
                { label: 'BYE' },
              ],
              [
                { label: 'ON MY WAY' },
                { label: 'WAIT' },
                { label: 'READY' },
              ],
            ]}
            onSelect={(c) => setText((v) => (v ? `${v} ${c.label}` : c.label))}
          />
          <div style={{ fontSize: 10, color: 'var(--cathode-color-text-faint)', marginTop: 6 }}>
            TAPPING A CHIP APPENDS TO THE TEXT FIELD ABOVE.
          </div>
        </Section>

        <Section title="SEARCH BAR">
          <SearchBar
            items={searchItems}
            onSelect={(it) => { setText(it.label); setToast(true); }}
            placeholder="SEARCH COMMANDS…"
          />
        </Section>

        <Section title="ACTIVITY BAR">
          <Row align="center">
            <ActivityBar
              intensity={0.6}
              seed={activityTick}
              cells={30}
              fill="var(--cathode-color-danger)"
            />
            <Button onClick={() => setActivityTick((t) => t + 1)}>STEP SEED</Button>
          </Row>
        </Section>

        <Section title="HAZARD STRIPES">
          <HazardStripes intensity={0.18}>
            <div style={{
              padding: 24,
              background: 'var(--cathode-color-danger)',
              color: 'white',
              fontWeight: 800,
              letterSpacing: 3,
              textAlign: 'center',
            }}>
              ARMED · HOLD TO FIRE
            </div>
          </HazardStripes>
        </Section>

        <Section title="DIALOG">
          <Row>
            <Button onClick={() => setDialog(true)}>OPEN DIALOG</Button>
            <Button variant="danger" onClick={() => setDialog(true)}>OPEN DANGER DIALOG</Button>
          </Row>
          <Dialog
            open={dialog}
            onClose={() => setDialog(false)}
            title="CONFIRM ACTION"
            accent="danger"
          >
            <div style={{ marginBottom: 16 }}>
              This will delete every session recorded after midnight. There is no undo.
            </div>
            <Row>
              <Button onClick={() => setDialog(false)}>CANCEL</Button>
              <Button variant="danger" onClick={() => setDialog(false)}>DELETE</Button>
            </Row>
          </Dialog>
        </Section>

        <Section title="CHAT (streaming AI via mock provider)">
          <Chat title="MOCK CHAT" maxHeight={280} />
        </Section>

        <Section title="SOUND PALETTE">
          <Row>
            <Button onClick={() => { sound('click', { enabled: true }); }}>
              CLICK
            </Button>
            <Button onClick={() => { sound('tick', { enabled: true }); }}>
              TICK
            </Button>
            <Button onClick={() => { sound('confirm', { enabled: true }); }}>
              CONFIRM
            </Button>
            <Button onClick={() => { sound('warn', { enabled: true }); }}>
              WARN
            </Button>
            <Button onClick={() => { sound('error', { enabled: true }); }}>
              ERROR
            </Button>
            <Button onClick={() => { sound('destructive', { enabled: true }); }}>
              DESTRUCTIVE
            </Button>
          </Row>
          <div style={{ fontSize: 10, color: 'var(--cathode-color-text-faint)', marginTop: 8 }}>
            THESE BYPASS THE GLOBAL SOUND TOGGLE — TAP TO AUDITION EACH PATTERN.
          </div>
        </Section>
      </div>
    </CathodeProvider>
  );
}

function Controls(props: {
  theme: 'auto' | 'dark' | 'light';
  setTheme: (t: 'auto' | 'dark' | 'light') => void;
  sound: boolean;
  setSound: (v: boolean) => void;
  haptic: boolean;
  setHaptic: (v: boolean) => void;
  motion: 'subtle' | 'strong' | 'none';
  setMotion: (m: 'subtle' | 'strong' | 'none') => void;
}) {
  const { theme, setTheme, sound, setSound, haptic, setHaptic, motion, setMotion } = props;
  return (
    <TerminalFrame title="PREVIEW CONTROLS">
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <ChoiceGroup label="THEME" value={theme} options={['auto', 'dark', 'light']} onChange={setTheme} />
        <ChoiceGroup label="MOTION" value={motion} options={['none', 'subtle', 'strong']} onChange={setMotion} />
        <Check label="HAPTIC" value={haptic} onChange={setHaptic} />
        <Check label="SOUND" value={sound} onChange={setSound} />
      </div>
    </TerminalFrame>
  );
}

function ChoiceGroup<T extends string>(props: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <span style={{ fontSize: 10, color: 'var(--cathode-color-text-dim)', letterSpacing: 1.4 }}>
        {props.label}
      </span>
      {props.options.map((opt) => (
        <Pill
          key={opt}
          title={opt.toUpperCase()}
          active={props.value === opt}
          accent="info"
          feedback={false}
          onClick={() => props.onChange(opt)}
        />
      ))}
    </div>
  );
}

function Check(props: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, cursor: 'pointer' }}>
      <input
        type="checkbox"
        checked={props.value}
        onChange={(e) => props.onChange(e.target.checked)}
      />
      <span style={{ letterSpacing: 1.4, color: 'var(--cathode-color-text)' }}>{props.label}</span>
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ margin: '24px 0' }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: 1.4,
          color: 'var(--cathode-color-text-dim)',
          marginBottom: 10,
          fontWeight: 700,
        }}
      >
        — {title}
      </div>
      {children}
    </section>
  );
}

function Row({ children, align = 'start' }: { children: React.ReactNode; align?: 'start' | 'center' }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: align, flexWrap: 'wrap' }}>{children}</div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
