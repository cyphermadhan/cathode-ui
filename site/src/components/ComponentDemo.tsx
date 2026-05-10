import { useMemo, useState } from 'react';
import {
  CathodeProvider,
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
  HazardStripes,
  sound,
} from '@cathode-ui/react';
import {
  IconBroadcast,
  IconChat,
  IconEar,
  IconSettings,
  IconSignal,
  IconCheck,
  IconSparkle,
  IconClose,
} from '@cathode-ui/react/icons';

/**
 * One React island that renders a live demo for whichever primitive
 * the docs page asks for. Keeping this as a single switch avoids
 * spinning up 17 separate per-component demo modules. Each case is
 * deliberately short — pages link here, not the other way around.
 */
export function ComponentDemo({ name }: { name: string }) {
  return (
    <CathodeProvider>
      <Demos name={name} />
    </CathodeProvider>
  );
}

function Demos({ name }: { name: string }) {
  // All case blocks render their own interactive state where it helps;
  // display-only primitives (DotLeader, PulsingDot, ...) render inline.
  switch (name) {
    case 'TerminalFrame':   return <TerminalFrameDemo />;
    case 'PixelBar':        return <PixelBarDemo />;
    case 'ActivityBar':     return <ActivityBarDemo />;
    case 'PulsingDot':      return <PulsingDotDemo />;
    case 'DotLeader':       return <DotLeaderDemo />;
    case 'Pill':            return <PillDemo />;
    case 'Button':          return <ButtonDemo />;
    case 'TextField':       return <TextFieldDemo />;
    case 'StatusTile':      return <StatusTileDemo />;
    case 'Toast':           return <ToastDemo />;
    case 'Toggle':          return <ToggleDemo />;
    case 'Stepper':         return <StepperDemo />;
    case 'Chips':           return <ChipsDemo />;
    case 'SearchBar':       return <SearchBarDemo />;
    case 'HazardStripes':   return <HazardStripesDemo />;
    default:
      return <div style={{ color: 'var(--cathode-color-text-dim)' }}>
        No live demo for <code>{name}</code> yet.
      </div>;
  }
}

// ---------- per-primitive demos ----------

function TerminalFrameDemo() {
  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
      <TerminalFrame title="TELEMETRY">
        <DotLeader label="LATENCY" value="42 MS" />
        <DotLeader label="STATE" value="LIVE" valueColor="var(--cathode-color-success)" />
      </TerminalFrame>
      <TerminalFrame title="DANGER" accent="danger">
        <DotLeader label="LINK" value="DOWN" valueColor="var(--cathode-color-danger)" />
      </TerminalFrame>
    </div>
  );
}

function PixelBarDemo() {
  const [level, setLevel] = useState(0.6);
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <PixelBar level={level} cells={30} fill="var(--cathode-color-danger)" />
      <input type="range" min={0} max={1} step={0.01}
             value={level} onChange={(e) => setLevel(parseFloat(e.target.value))} />
      <span style={{ fontSize: 11, color: 'var(--cathode-color-text-dim)' }}>
        {Math.round(level * 100)}%
      </span>
    </div>
  );
}

function ActivityBarDemo() {
  const [seed, setSeed] = useState(1);
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <ActivityBar intensity={0.6} seed={seed} cells={30} fill="var(--cathode-color-danger)" />
      <Button onClick={() => setSeed((s) => s + 1)}>STEP SEED</Button>
    </div>
  );
}

function PulsingDotDemo() {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
      <PulsingDot color="var(--cathode-color-success)" />
      <span style={{ fontSize: 11, color: 'var(--cathode-color-text-dim)' }}>SCANNING</span>
      <PulsingDot color="var(--cathode-color-warning)" />
      <span style={{ fontSize: 11, color: 'var(--cathode-color-text-dim)' }}>STANDBY</span>
      <PulsingDot color="var(--cathode-color-danger)" />
      <span style={{ fontSize: 11, color: 'var(--cathode-color-text-dim)' }}>OFFLINE</span>
    </div>
  );
}

function DotLeaderDemo() {
  return (
    <TerminalFrame title="READOUT">
      <DotLeader label="LATENCY" value="42 MS" />
      <DotLeader label="LOSS" value="0.2%" />
      <DotLeader label="STATE" value="LIVE" valueColor="var(--cathode-color-success)" />
      <DotLeader label="LINK" value="DOWN" valueColor="var(--cathode-color-danger)" />
    </TerminalFrame>
  );
}

function PillDemo() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ fontSize: 10, color: 'var(--cathode-color-text-dim)', letterSpacing: 1.4 }}>PALETTE</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Pill title="AMBER"  accent="amber"  active icon={<IconBroadcast size={12} weight="bold" />} />
        <Pill title="PINK"   accent="pink"   icon={<IconChat size={12} weight="bold" />} />
        <Pill title="PURPLE" accent="purple" icon={<IconEar size={12} weight="bold" />} />
        <Pill title="TEAL"   accent="teal"   icon={<IconSparkle size={12} weight="bold" />} />
        <Pill title="GREY"   accent="grey"   icon={<IconSettings size={12} weight="bold" />} />
      </div>
      <div style={{ fontSize: 10, color: 'var(--cathode-color-text-dim)', letterSpacing: 1.4 }}>SEMANTIC</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Pill title="INFO"    accent="info"    icon={<IconSignal size={12} weight="bold" />} />
        <Pill title="SUCCESS" accent="success" icon={<IconCheck size={12} weight="bold" />} />
        <Pill title="WARNING" accent="warning" icon={<IconSparkle size={12} weight="bold" />} />
        <Pill title="DANGER"  accent="danger"  icon={<IconClose size={12} weight="bold" />} />
        <Pill title="ACCENT"  accent="accent"  icon={<IconSparkle size={12} weight="bold" />} />
      </div>
    </div>
  );
}

function ButtonDemo() {
  const [result, setResult] = useState('');
  const mockAct = async () => {
    sound('confirm', { enabled: true });
    await new Promise((r) => setTimeout(r, 300));
    setResult('mock result: action completed');
  };
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button>DEFAULT</Button>
        <Button variant="primary" icon={<IconCheck size={14} weight="bold" />}>SUBMIT</Button>
        <Button variant="danger" icon={<IconClose size={14} weight="bold" />}>DELETE</Button>
        <Button icon={<IconSparkle size={14} weight="bold" />} onClick={mockAct}>AI ACTION</Button>
      </div>
      {result ? (
        <div style={{ fontSize: 11, color: 'var(--cathode-color-text-dim)' }}>→ {result}</div>
      ) : null}
    </div>
  );
}

function TextFieldDemo() {
  const [text, setText] = useState('Hello');
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <TextField value={text} onChange={setText} placeholder="TYPE HERE" aria-label="demo" />
      <div style={{ fontSize: 10, color: 'var(--cathode-color-text-faint)' }}>
        PASS <code>ai=&#123;&#123; suggest: true &#125;&#125;</code> WITH A PROVIDER FOR INLINE AI COMPLETIONS.
      </div>
    </div>
  );
}

function StatusTileDemo() {
  const [on, setOn] = useState(true);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
      <StatusTile
        title="ACTIVE" subtitle="SYSTEMS GO"
        icon={<IconBroadcast size={24} weight="bold" />}
        accent="success" active={on} onClick={() => setOn((v) => !v)}
      />
      <StatusTile
        title="READY" subtitle="FPRINT · 4A2B-9C1D"
        icon={<IconCheck size={24} weight="bold" />}
        accent="success" active
      />
      <StatusTile
        title="IDLE" subtitle="WAITING FOR INPUT"
        icon={<IconSignal size={24} weight="bold" />}
        accent="grey"
      />
    </div>
  );
}

function ToastDemo() {
  const [show, setShow] = useState(true);
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <Button onClick={() => setShow((v) => !v)}>TOGGLE TOAST</Button>
      <div>
        <Toast visible={show} kind="info">
          SESSION RESUMED
        </Toast>
      </div>
    </div>
  );
}

function ToggleDemo() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
      <Toggle value={a} onChange={setA} label="NOTIFICATIONS" />
      <Toggle value={b} onChange={setB} label="DANGER" accent="danger" />
      <Toggle value={a} onChange={setA} label="DISABLED" disabled />
    </div>
  );
}

function StepperDemo() {
  const [wpm, setWpm] = useState(12);
  const [count, setCount] = useState(3);
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Stepper value={wpm} onChange={setWpm} min={5} max={40} label="WPM" />
      <Stepper value={count} onChange={setCount} min={0} max={10} label="COUNT" />
    </div>
  );
}

function ChipsDemo() {
  const [picked, setPicked] = useState<string>('');
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <Chips
        groups={[
          [{ label: 'SOS' }, { label: 'MAYDAY' }, { label: 'HELP' }],
          [{ label: 'OK' }, { label: 'YES' }, { label: 'NO' }],
          [{ label: 'ON MY WAY' }, { label: 'READY' }, { label: 'DONE' }],
        ]}
        onSelect={(c) => setPicked(c.label)}
      />
      <div style={{ fontSize: 11, color: 'var(--cathode-color-text-dim)' }}>
        {picked ? <>LAST PICK: <code>{picked}</code></> : 'TAP A CHIP'}
      </div>
    </div>
  );
}

function SearchBarDemo() {
  const [picked, setPicked] = useState<string>('');
  const items = useMemo(() => [
    { id: '1', label: 'START RECORDING', subtitle: 'Cmd+R' },
    { id: '2', label: 'PAIR NEW DEVICE', subtitle: 'Cmd+P' },
    { id: '3', label: 'CLEAR BUFFER',    subtitle: 'Cmd+K' },
    { id: '4', label: 'EXPORT SESSION',  subtitle: 'Cmd+E' },
    { id: '5', label: 'TOGGLE DIAGNOSTICS' },
  ], []);
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <SearchBar items={items} onSelect={(it) => setPicked(it.label)} placeholder="SEARCH COMMANDS…" />
      {picked ? (
        <div style={{ fontSize: 11, color: 'var(--cathode-color-text-dim)' }}>
          PICKED: <code>{picked}</code>
        </div>
      ) : null}
    </div>
  );
}

function HazardStripesDemo() {
  return (
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
  );
}
