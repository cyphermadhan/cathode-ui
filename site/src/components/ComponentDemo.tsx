import { useEffect, useMemo, useState } from 'react';
import { DEFAULT_SETTINGS, readSettings, subscribe } from './cathodeSettings';
import type { SiteSettings } from './cathodeSettings';
import {
  CathodeProvider,
  TerminalFrame,
  Card,
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
  Counter,
  Chips,
  SearchBar,
  HazardStripes,
  Checkbox,
  RadioGroup,
  Select,
  TextArea,
  FormField,
  Badge,
  Tag,
  Avatar,
  Kbd,
  CodeBlock,
  Table,
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
  IconSearch,
} from '@cathode-ui/react/icons';

/**
 * One React island that renders a live demo for whichever primitive
 * the docs page asks for. Keeping this as a single switch avoids
 * spinning up 17 separate per-component demo modules. Each case is
 * deliberately short — pages link here, not the other way around.
 */
export function ComponentDemo({ name }: { name: string }) {
  const settings = useSiteSettings();
  return (
    <CathodeProvider theme={settings.theme} motion={settings.motion} haptic={settings.haptic} sound={settings.sound}>
      <Demos name={name} />
    </CathodeProvider>
  );
}

// Pulls the current Cathode preferences from shared storage and
// re-renders when the header control dispatches a change.
function useSiteSettings(): SiteSettings {
  const [s, setS] = useState<SiteSettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    setS(readSettings());
    return subscribe(setS);
  }, []);
  return s;
}

function Demos({ name }: { name: string }) {
  // All case blocks render their own interactive state where it helps;
  // display-only primitives (DotLeader, PulsingDot, ...) render inline.
  switch (name) {
    case 'TerminalFrame':   return <TerminalFrameDemo />;
    case 'Card':            return <CardDemo />;
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
    case 'Counter':         return <CounterDemo />;
    case 'Chips':           return <ChipsDemo />;
    case 'SearchBar':       return <SearchBarDemo />;
    case 'HazardStripes':   return <HazardStripesDemo />;
    case 'Checkbox':        return <CheckboxDemo />;
    case 'RadioGroup':      return <RadioGroupDemo />;
    case 'Select':          return <SelectDemo />;
    case 'TextArea':        return <TextAreaDemo />;
    case 'FormField':       return <FormFieldDemo />;
    case 'Badge':           return <BadgeDemo />;
    case 'Tag':             return <TagDemo />;
    case 'Avatar':          return <AvatarDemo />;
    case 'Kbd':             return <KbdDemo />;
    case 'CodeBlock':       return <CodeBlockDemo />;
    case 'Table':           return <TableDemo />;
    default:
      return <div style={{ color: 'var(--cathode-color-text-dim)' }}>
        No live demo for <code>{name}</code> yet.
      </div>;
  }
}

// ---------- per-primitive demos ----------

function TerminalFrameDemo() {
  return (
    <div style={{
      display: 'grid',
      gap: 12,
      gridTemplateColumns: '1fr 1fr',
      alignItems: 'start',  /* grid items default to stretch — force each frame to its own content height */
      width: '100%',
    }}>
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

function CardDemo() {
  const [pressCount, setPressCount] = useState(0);
  return (
    <div style={{
      display: 'grid', gap: 12,
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      alignItems: 'start',
      width: '100%',
    }}>
      <Card surface="elevated">
        <DotLeader label="LATENCY" value="42 MS" />
        <DotLeader label="LOSS" value="0.2%" />
        <DotLeader label="STATE" value="LIVE" valueColor="var(--cathode-color-success)" />
      </Card>
      <Card surface="elevated" accent="info">
        <div style={{ fontSize: 10, color: 'var(--cathode-color-text-dim)', letterSpacing: 1.4, marginBottom: 6 }}>INFO</div>
        <div style={{ fontSize: 13, lineHeight: 1.5 }}>
          Card is TerminalFrame without the label. Same border, same radius.
        </div>
      </Card>
      <Card surface="elevated" accent="danger">
        <div style={{ fontSize: 10, color: 'var(--cathode-color-danger)', letterSpacing: 1.4, marginBottom: 6 }}>DANGER</div>
        <div style={{ fontSize: 12, color: 'var(--cathode-color-text-dim)', lineHeight: 1.5 }}>
          Use `accent` to highlight caution or error zones.
        </div>
      </Card>
      <Card onClick={() => setPressCount((n) => n + 1)} aria-label="Clickable card" surface="elevated">
        <div style={{ fontSize: 10, color: 'var(--cathode-color-text-dim)', letterSpacing: 1.4, marginBottom: 6 }}>CLICKABLE</div>
        <div style={{ fontSize: 12 }}>TAP ME · pressed {pressCount}×</div>
      </Card>
    </div>
  );
}

function PixelBarDemo() {
  const [level, setLevel] = useState(0.6);
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <PixelBar level={level} cells={30} fill="var(--cathode-color-danger)" aria-label="Signal level" />
      <input type="range" min={0} max={1} step={0.01}
             aria-label="Adjust signal level"
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
      <div style={{ fontSize: 10, color: 'var(--cathode-color-text-dim)' }}>
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

function CounterDemo() {
  const [wpm, setWpm] = useState(12);
  const [count, setCount] = useState(3);
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Counter value={wpm} onChange={setWpm} min={5} max={40} label="WPM" />
      <Counter value={count} onChange={setCount} min={0} max={10} label="COUNT" />
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
    <div style={{ display: 'grid', gap: 12, width: '100%', maxWidth: 420 }}>
      <div style={{ fontSize: 10, color: 'var(--cathode-color-text-dim)', letterSpacing: 1.4 }}>DEFAULT (glyph icon)</div>
      <SearchBar items={items} onSelect={(it) => setPicked(it.label)} placeholder="SEARCH COMMANDS…" />
      <div style={{ fontSize: 10, color: 'var(--cathode-color-text-dim)', letterSpacing: 1.4 }}>PHOSPHOR ICON</div>
      <SearchBar items={items} onSelect={(it) => setPicked(it.label)} placeholder="SEARCH COMMANDS…" icon={<IconSearch size={14} weight="bold" />} />
      <div style={{ fontSize: 10, color: 'var(--cathode-color-text-dim)', letterSpacing: 1.4 }}>NO ICON</div>
      <SearchBar items={items} onSelect={(it) => setPicked(it.label)} placeholder="SEARCH COMMANDS…" icon={false} />
      {picked ? (
        <div style={{ fontSize: 11, color: 'var(--cathode-color-text-dim)' }}>
          PICKED: <code>{picked}</code>
        </div>
      ) : null}
    </div>
  );
}

function CheckboxDemo() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
      <Checkbox value={a} onChange={setA} label="NOTIFY ME" />
      <Checkbox value={b} onChange={setB} label="DANGER MODE" accent="danger" />
      <Checkbox value={false} onChange={() => {}} label="INDETERMINATE" indeterminate />
      <Checkbox value={true} onChange={() => {}} label="DISABLED" disabled />
    </div>
  );
}

function RadioGroupDemo() {
  const [mode, setMode] = useState<'alpha' | 'beta' | 'gamma'>('alpha');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <RadioGroup
        value={mode}
        onChange={setMode}
        aria-label="Mode"
        options={[
          { value: 'alpha', label: 'ALPHA' },
          { value: 'beta',  label: 'BETA' },
          { value: 'gamma', label: 'GAMMA', disabled: true },
        ]}
      />
      <div style={{ fontSize: 11, color: 'var(--cathode-color-text-dim)' }}>
        PICKED: <code>{mode}</code>
      </div>
    </div>
  );
}

function SelectDemo() {
  const [theme, setTheme] = useState('auto');
  const [region, setRegion] = useState('');
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Select
        value={theme}
        onChange={setTheme}
        aria-label="Theme"
        options={[
          { value: 'auto',  label: 'AUTO' },
          { value: 'dark',  label: 'DARK' },
          { value: 'light', label: 'LIGHT' },
        ]}
      />
      <Select
        value={region}
        onChange={setRegion}
        placeholder="CHOOSE REGION…"
        aria-label="Region"
        options={[
          { value: 'us', label: 'UNITED STATES' },
          { value: 'eu', label: 'EUROPE' },
          { value: 'ap', label: 'ASIA-PACIFIC' },
        ]}
      />
      <div style={{ fontSize: 11, color: 'var(--cathode-color-text-dim)' }}>
        THEME: <code>{theme}</code> · REGION: <code>{region || 'none'}</code>
      </div>
    </div>
  );
}

function TextAreaDemo() {
  const [notes, setNotes] = useState('Pattern locked.\nAcquisition in 3.');
  const [bio, setBio] = useState('');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <TextArea value={notes} onChange={setNotes} placeholder="ADD NOTES…" aria-label="Notes" />
      <TextArea
        value={bio}
        onChange={setBio}
        placeholder="SHORT BIO (max 160)…"
        aria-label="Bio"
        maxLength={160}
        rows={3}
      />
    </div>
  );
}

function FormFieldDemo() {
  const [callsign, setCallsign] = useState('KA4');
  const [email, setEmail] = useState('not-an-email');
  const [notes, setNotes] = useState('');
  const emailErr = email.includes('@') ? undefined : 'Must contain an @.';
  return (
    <div style={{ display: 'grid', gap: 14, maxWidth: 420 }}>
      <FormField label="CALLSIGN" hint="4 characters, alphanumeric." required>
        <TextField value={callsign} onChange={setCallsign} placeholder="KA4X" />
      </FormField>
      <FormField label="EMAIL" error={emailErr}>
        <TextField value={email} onChange={setEmail} placeholder="you@example.com" />
      </FormField>
      <FormField label="NOTES" hint="Freeform. Max 200 chars.">
        <TextArea value={notes} onChange={setNotes} maxLength={200} rows={3} />
      </FormField>
    </div>
  );
}

function BadgeDemo() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ fontSize: 10, color: 'var(--cathode-color-text-dim)', letterSpacing: 1.4 }}>SOLID</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <Badge>NEUTRAL</Badge>
        <Badge kind="info">INFO</Badge>
        <Badge kind="success">NEW</Badge>
        <Badge kind="warning">BETA</Badge>
        <Badge kind="danger">DEPRECATED</Badge>
      </div>
      <div style={{ fontSize: 10, color: 'var(--cathode-color-text-dim)', letterSpacing: 1.4 }}>OUTLINE</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <Badge variant="outline">v0.3.0</Badge>
        <Badge variant="outline" kind="info">PRO</Badge>
        <Badge variant="outline" kind="success" size="sm">SM</Badge>
      </div>
    </div>
  );
}

function TagDemo() {
  const [tags, setTags] = useState(['ENGINEERING', 'DESIGN', 'LATE']);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <Tag accent="info">ENGINEERING</Tag>
        <Tag accent="success">APPROVED</Tag>
        <Tag accent="warning">BLOCKED</Tag>
        <Tag accent="danger">REJECTED</Tag>
        <Tag accent="teal">QA</Tag>
        <Tag accent="pink">UX</Tag>
        <Tag accent="amber">OPS</Tag>
        <Tag accent="purple">SEC</Tag>
      </div>
      <div style={{ fontSize: 10, color: 'var(--cathode-color-text-dim)', letterSpacing: 1.4 }}>REMOVABLE</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {tags.map((t) => (
          <Tag key={t} accent="info" onRemove={() => setTags((all) => all.filter((x) => x !== t))}>
            {t}
          </Tag>
        ))}
        {tags.length === 0 ? (
          <span style={{ fontSize: 10, color: 'var(--cathode-color-text-dim)' }}>ALL CLEARED</span>
        ) : null}
      </div>
    </div>
  );
}

function AvatarDemo() {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar name="Madhan Raj" accent="teal" />
        <Avatar name="Ada Lovelace" accent="pink" />
        <Avatar name="KA" accent="amber" />
        <Avatar accent="info"><IconSparkle size={16} weight="bold" /></Avatar>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar name="Small" size="sm" accent="purple" />
        <Avatar name="Medium" size="md" accent="purple" />
        <Avatar name="Large" size="lg" accent="purple" />
      </div>
      <div style={{ fontSize: 10, color: 'var(--cathode-color-text-dim)', letterSpacing: 1.4 }}>WITH STATUS</div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar name="Online" status="online" accent="teal" />
        <Avatar name="Away" status="away" accent="amber" />
        <Avatar name="Busy" status="busy" accent="danger" />
        <Avatar name="Offline" status="offline" accent="grey" />
      </div>
    </div>
  );
}

function KbdDemo() {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--cathode-color-text-dim)' }}>COMMAND PALETTE</span>
        <Kbd keys="Cmd+K" />
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--cathode-color-text-dim)' }}>SAVE</span>
        <Kbd keys={['Ctrl', 'Shift', 'S']} />
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--cathode-color-text-dim)' }}>SEARCH (SM)</span>
        <Kbd keys="/" size="sm" />
      </div>
    </div>
  );
}

function CodeBlockDemo() {
  return (
    <div style={{ display: 'grid', gap: 16, width: '100%' }}>
      <CodeBlock
        language="tsx"
        code={`import { Button, Pill } from '@cathode-ui/react';

<Pill title="LIVE" accent="success" active />
<Button variant="primary">SUBMIT</Button>`}
      />
      <CodeBlock
        language="bash"
        code={`npm install @cathode-ui/react`}
        showCopy={false}
      />
    </div>
  );
}

function TableDemo() {
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const rawRows = useMemo(() => [
    { id: '001', name: 'PKT.GATEWAY', status: 'ONLINE',  latency: 28  },
    { id: '002', name: 'PKT.EDGE-01', status: 'ONLINE',  latency: 46  },
    { id: '003', name: 'PKT.EDGE-02', status: 'OFFLINE', latency: 999 },
    { id: '004', name: 'PKT.CACHE',   status: 'DEGRADED', latency: 132 },
  ], []);

  const rows = useMemo(() => {
    const sign = sortDir === 'asc' ? 1 : -1;
    return [...rawRows].sort((a, b) => {
      const av = a[sortBy as keyof typeof a];
      const bv = b[sortBy as keyof typeof b];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sign;
      return String(av).localeCompare(String(bv)) * sign;
    });
  }, [rawRows, sortBy, sortDir]);

  return (
    <div style={{ width: '100%' }}>
      <Table
        caption="Peer nodes"
        columns={[
          { key: 'id',      header: 'ID',      width: '80px' },
          { key: 'name',    header: 'NAME',    sortable: true },
          { key: 'status',  header: 'STATUS',  sortable: true, render: (r) => (
            <Badge variant="outline" kind={
              r.status === 'ONLINE' ? 'success' : r.status === 'OFFLINE' ? 'danger' : 'warning'
            }>{r.status}</Badge>
          ) },
          { key: 'latency', header: 'LATENCY', align: 'right', sortable: true, render: (r) => `${r.latency} ms` },
        ]}
        rows={rows}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={(k, d) => { setSortBy(k); setSortDir(d); }}
        onRowClick={(row) => alert(`Clicked ${row.name}`)}
      />
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
