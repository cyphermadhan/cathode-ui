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
  TerminalFrame,
  PixelBar,
  PulsingDot,
  DotLeader,
  Pill,
  Button,
  TextField,
  StatusTile,
  Toast,
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
  const [sound, setSound] = useState(false);
  const [haptic, setHaptic] = useState(true);
  const [motion, setMotion] = useState<'subtle' | 'strong' | 'none'>('strong');
  const [text, setText] = useState('Hello');
  const [level, setLevel] = useState(0.4);
  const [toast, setToast] = useState(false);
  const [actionResult, setActionResult] = useState<string>('');

  const providerProps = useMemo(
    () => ({ theme, sound, haptic, motion, ai: mockAI }),
    [theme, sound, haptic, motion]
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
          sound={sound}
          setSound={setSound}
          haptic={haptic}
          setHaptic={setHaptic}
          motion={motion}
          setMotion={setMotion}
        />

        <Section title="NAV PILLS">
          <Row>
            <Pill title="TALK" accent="navTalk" active icon={<IconBroadcast size={12} weight="bold" />} />
            <Pill title="CHAT" accent="navChat" icon={<IconChat size={12} weight="bold" />} onClick={() => setToast(true)} />
            <Pill title="LISTEN" accent="navListen" icon={<IconEar size={12} weight="bold" />} />
            <Pill title="SETTINGS" accent="navSettings" icon={<IconSettings size={12} weight="bold" />} />
          </Row>
        </Section>

        <Section title="STATUS TILES">
          <Row>
            <StatusTile
              title="LINK"
              subtitle="LIVE · TAP TO STOP"
              icon={<IconBroadcast size={24} weight="bold" />}
              accent="ok"
              active
              onClick={() => setToast(true)}
            />
            <StatusTile
              title="PAIR"
              subtitle="FPRINT · 4A2B-9C1D"
              icon={<IconCheck size={24} weight="bold" />}
              accent="ok"
              active
            />
            <StatusTile
              title="PEER"
              subtitle="NO PEERS · TAP TO RESCAN"
              icon={<IconSignal size={24} weight="bold" />}
              accent="sys"
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
            <PixelBar level={level} cells={30} fill="var(--cathode-color-tx)" />
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
            <PulsingDot color="var(--cathode-color-ok)" />
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
