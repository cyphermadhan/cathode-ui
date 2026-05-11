import { useEffect, useMemo, useState } from 'react';
import {
  CathodeProvider,
  TerminalFrame,
  Card,
  Stack,
  DotLeader,
  PulsingDot,
  PixelBar,
  ActivityBar,
  Button,
  Dialog,
  HazardStripes,
  FormField,
  TextField,
  Toggle,
  Select,
  Counter,
  SearchBar,
  Tag,
  Table,
  Pagination,
  Loader,
  Skeleton,
  ProgressBar,
  Badge,
  Kbd,
} from '@cathode-ui/react';
import { IconSparkle, IconClose, IconCheck } from '@cathode-ui/react/icons';
import { DEFAULT_SETTINGS, readSettings, subscribe } from './cathodeSettings';
import type { SiteSettings } from './cathodeSettings';

/**
 * PatternsGallery — a single React island rendering four canonical
 * Cathode compositions. Each recipe is a real, working screen built
 * from the shipped primitives, so agents + humans can copy-paste
 * the code and get something that renders.
 *
 * Wraps everything in a CathodeProvider that reads the site-wide
 * theme/motion/haptic/sound controls so recipes reflect the visitor's
 * current preferences.
 */
export function PatternsGallery() {
  const [s, setS] = useState<SiteSettings>(DEFAULT_SETTINGS);
  useEffect(() => { setS(readSettings()); return subscribe(setS); }, []);

  return (
    <CathodeProvider theme={s.theme} motion={s.motion} haptic={s.haptic} sound={s.sound}>
      <div style={{ display: 'grid', gap: 48 }}>
        <DashboardReadout />
        <SettingsPanel />
        <DestructiveFlow />
        <LoadingStates />
      </div>
    </CathodeProvider>
  );
}

// ── Pattern 1 — dashboard readout ────────────────────────────────
// Composes: TerminalFrame + DotLeader + PulsingDot + PixelBar +
// ActivityBar. The canonical "telemetry at a glance" block.
function DashboardReadout() {
  const [seed, setSeed] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setSeed((x) => x + 1), 400);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <h3 style={{ margin: '0 0 12px' }}>Dashboard readout</h3>
      <p style={{ margin: '0 0 12px', color: 'var(--cathode-color-text-dim)' }}>
        TerminalFrame + DotLeader for labelled values · PulsingDot for live state · PixelBar + ActivityBar for rolling metrics.
      </p>
      <TerminalFrame title="TELEMETRY" accent="info">
        <Stack gap={6}>
          <Stack direction="row" gap={8} align="center">
            <PulsingDot color="var(--cathode-color-success)" />
            <span style={{ fontSize: 10, letterSpacing: 1.4, color: 'var(--cathode-color-success)' }}>LIVE</span>
          </Stack>
          <DotLeader label="LATENCY" value="42 MS" />
          <DotLeader label="LOSS"    value="0.2%" />
          <DotLeader label="STATE"   value="HEALTHY" valueColor="var(--cathode-color-success)" />
          <div style={{ height: 8 }} />
          <Stack direction="row" gap={10} align="center">
            <span style={{ fontSize: 10, letterSpacing: 1.4, color: 'var(--cathode-color-text-dim)', width: 64 }}>RX</span>
            <PixelBar level={0.68} cells={28} fill="var(--cathode-color-info)" aria-label="RX throughput" />
          </Stack>
          <Stack direction="row" gap={10} align="center">
            <span style={{ fontSize: 10, letterSpacing: 1.4, color: 'var(--cathode-color-text-dim)', width: 64 }}>ACTIVITY</span>
            <ActivityBar intensity={0.55} seed={seed} cells={28} fill="var(--cathode-color-info)" />
          </Stack>
        </Stack>
      </TerminalFrame>
    </div>
  );
}

// ── Pattern 2 — settings panel ───────────────────────────────────
// Composes: FormField + TextField + Counter + Select + Toggle +
// Button. The canonical "preferences screen".
function SettingsPanel() {
  const [callsign, setCallsign] = useState('KA4X');
  const [wpm, setWpm] = useState(12);
  const [theme, setTheme] = useState('auto');
  const [notify, setNotify] = useState(true);
  const [danger, setDanger] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <h3 style={{ margin: '0 0 12px' }}>Settings panel</h3>
      <p style={{ margin: '0 0 12px', color: 'var(--cathode-color-text-dim)' }}>
        FormField + TextField / Counter / Select / Toggle + Button primary. Each input stays controlled; FormField wires aria-labelledby automatically.
      </p>
      <Card surface="elevated" padding="lg" className="patterns-card">
        <Stack gap={16} fullWidth>
          <FormField label="CALLSIGN" hint="4 characters, alphanumeric." required>
            <TextField value={callsign} onChange={setCallsign} placeholder="KA4X" />
          </FormField>

          <FormField label="TRANSMIT SPEED" hint="Words per minute, 5–40.">
            <Counter value={wpm} onChange={setWpm} min={5} max={40} label="WPM" />
          </FormField>

          <FormField label="THEME">
            <Select
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'auto',  label: 'AUTO' },
                { value: 'dark',  label: 'DARK' },
                { value: 'light', label: 'LIGHT' },
              ]}
              aria-label="Theme"
            />
          </FormField>

          <Stack direction="row" gap={24} wrap>
            <Toggle value={notify} onChange={setNotify} label="NOTIFICATIONS" />
            <Toggle value={danger} onChange={setDanger} label="DANGER MODE" accent="danger" />
          </Stack>

          <Stack direction="row" gap={8}>
            <Button variant="primary" icon={<IconCheck weight="bold" size={14} />} onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1500); }}>
              SAVE
            </Button>
            {saved ? (
              <Stack direction="row" gap={6} align="center">
                <Badge kind="success">SAVED</Badge>
              </Stack>
            ) : null}
          </Stack>
        </Stack>
      </Card>
    </div>
  );
}

// ── Pattern 3 — destructive flow ─────────────────────────────────
// Composes: Button danger + HazardStripes + Dialog accent=danger +
// Button primary/danger confirmation.
function DestructiveFlow() {
  const [open, setOpen] = useState(false);
  const [armed, setArmed] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <div>
      <h3 style={{ margin: '0 0 12px' }}>Destructive flow</h3>
      <p style={{ margin: '0 0 12px', color: 'var(--cathode-color-text-dim)' }}>
        Button danger + Dialog accent=danger for irreversible actions. HazardStripes wraps a secondary "armed" confirmation zone for the nuclear option.
      </p>
      <Stack direction="row" gap={10} wrap>
        <Button variant="danger" onClick={() => setOpen(true)}>
          DELETE ACCOUNT
        </Button>
        {done ? <Badge kind="danger">DELETED</Badge> : null}
      </Stack>

      <Dialog open={open} onClose={() => { setOpen(false); setArmed(false); }} title="DELETE ACCOUNT?" accent="danger">
        <p style={{ margin: '0 0 16px' }}>
          This will permanently remove your callsign, history, and all
          saved presets. No undo.
        </p>

        <Toggle value={armed} onChange={setArmed} label="I UNDERSTAND" accent="danger" />

        <div style={{ height: 16 }} />

        {armed ? (
          <HazardStripes intensity={0.16}>
            <Stack direction="row" gap={8} justify="flex-end">
              <Button onClick={() => { setOpen(false); setArmed(false); }}>CANCEL</Button>
              <Button variant="danger" onClick={() => { setDone(true); setOpen(false); setArmed(false); }}>
                CONFIRM DELETE
              </Button>
            </Stack>
          </HazardStripes>
        ) : (
          <Stack direction="row" gap={8} justify="flex-end">
            <Button onClick={() => setOpen(false)}>CANCEL</Button>
            <Button variant="danger" disabled>CONFIRM DELETE</Button>
          </Stack>
        )}
      </Dialog>
    </div>
  );
}

// ── Pattern 4 — loading states ───────────────────────────────────
// Composes: Skeleton + Loader + ProgressBar. The canonical
// "there's a spectrum of 'waiting' and each tool fits differently"
// illustration.
function LoadingStates() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setPct((p) => p >= 1 ? 0 : Math.min(1, p + 0.12));
    }, 500);
    return () => clearInterval(t);
  }, []);

  return (
    <div>
      <h3 style={{ margin: '0 0 12px' }}>Loading states</h3>
      <p style={{ margin: '0 0 12px', color: 'var(--cathode-color-text-dim)' }}>
        Three flavours of "waiting" — Skeleton holds layout shape, Loader indicates unknown duration, ProgressBar shows determinate %.
      </p>
      <Stack direction="row" gap={16} wrap>
        <Card surface="elevated" padding="md">
          <Stack gap={8}>
            <span style={{ fontSize: 10, letterSpacing: 1.4, color: 'var(--cathode-color-text-dim)' }}>SKELETON · loading content</span>
            <Skeleton variant="text" width={180} />
            <Skeleton variant="text" width={140} />
            <Skeleton variant="block" height={60} />
          </Stack>
        </Card>

        <Card surface="elevated" padding="md">
          <Stack gap={8}>
            <span style={{ fontSize: 10, letterSpacing: 1.4, color: 'var(--cathode-color-text-dim)' }}>LOADER · unknown duration</span>
            <Stack direction="row" gap={10} align="center">
              <Loader size="md" />
              <span style={{ fontSize: 11, color: 'var(--cathode-color-text-dim)' }}>CONNECTING…</span>
            </Stack>
            <Stack direction="row" gap={10} align="center">
              <Loader size="sm" accent="warning" />
              <span style={{ fontSize: 11, color: 'var(--cathode-color-text-dim)' }}>RETRYING</span>
            </Stack>
          </Stack>
        </Card>

        <Card surface="elevated" padding="md">
          <Stack gap={8}>
            <span style={{ fontSize: 10, letterSpacing: 1.4, color: 'var(--cathode-color-text-dim)' }}>PROGRESS · known %</span>
            <ProgressBar value={pct} showValue />
            <span style={{ fontSize: 10, color: 'var(--cathode-color-text-dim)' }}>
              Upload · {(pct * 42).toFixed(1)} / 42 MB
            </span>
          </Stack>
        </Card>
      </Stack>
    </div>
  );
}
