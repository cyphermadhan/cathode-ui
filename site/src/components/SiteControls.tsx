import { useEffect, useState } from 'react';
import {
  DEFAULT_SETTINGS,
  applyThemeToDocument,
  readSettings,
  writeSettings,
  subscribe,
  type SiteSettings,
  type SiteMotion,
  type SiteTheme,
} from './cathodeSettings';

/**
 * Small header island that exposes the Cathode settings every
 * component demo on the site respects. Theme, motion, haptic, sound —
 * all live here so designers/devs can audit the components under each
 * configuration without opening devtools.
 *
 * Changes persist via localStorage (see cathodeSettings.ts) and
 * broadcast to every mounted ComponentDemo instance on the page.
 */
export function SiteControls() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  // Hydrate from localStorage on mount and push the theme to <html>
  // so the page chrome matches the demos. Also subscribe so a change
  // made by a teammate tab or elsewhere stays in sync.
  useEffect(() => {
    const s = readSettings();
    setSettings(s);
    applyThemeToDocument(s.theme);
    return subscribe(setSettings);
  }, []);

  const update = (patch: Partial<SiteSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    writeSettings(next);
  };

  return (
    <div className="site-controls" aria-label="Site preferences">
      <Group label="THEME">
        <Segmented
          value={settings.theme}
          onChange={(v) => update({ theme: v as SiteTheme })}
          options={[
            { value: 'auto',  label: 'AUTO' },
            { value: 'dark',  label: 'DARK' },
            { value: 'light', label: 'LIGHT' },
          ]}
        />
      </Group>
      <Group label="MOTION">
        <Segmented
          value={settings.motion}
          onChange={(v) => update({ motion: v as SiteMotion })}
          options={[
            { value: 'none',   label: 'NONE' },
            { value: 'subtle', label: 'SUBTLE' },
            { value: 'strong', label: 'STRONG' },
          ]}
        />
      </Group>
      <Group label="HAPTIC">
        <SmallToggle
          value={settings.haptic}
          onChange={(v) => update({ haptic: v })}
          ariaLabel="Haptic feedback"
        />
      </Group>
      <Group label="SOUND">
        <SmallToggle
          value={settings.sound}
          onChange={(v) => update({ sound: v })}
          ariaLabel="Sound feedback"
        />
      </Group>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="site-controls-group">
      <div className="site-controls-label">{label}</div>
      {children}
    </div>
  );
}

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="site-controls-segmented" role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className="site-controls-segment"
          data-on={value === o.value ? 'true' : 'false'}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function SmallToggle({
  value,
  onChange,
  ariaLabel,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      className="site-controls-toggle"
      data-on={value ? 'true' : 'false'}
      onClick={() => onChange(!value)}
    >
      {value ? 'ON' : 'OFF'}
    </button>
  );
}
