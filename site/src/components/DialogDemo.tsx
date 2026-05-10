import { useEffect, useState } from 'react';
import { CathodeProvider, Button, Dialog } from '@cathode-ui/react';
import { DEFAULT_SETTINGS, readSettings, subscribe } from './cathodeSettings';
import type { SiteSettings } from './cathodeSettings';

/** Live Dialog island for the docs. */
export function DialogDemo() {
  const [confirm, setConfirm] = useState(false);
  const [info, setInfo] = useState(false);
  const [s, setS] = useState<SiteSettings>(DEFAULT_SETTINGS);
  useEffect(() => { setS(readSettings()); return subscribe(setS); }, []);

  return (
    <CathodeProvider theme={s.theme} motion={s.motion} haptic={s.haptic} sound={s.sound}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Button onClick={() => setInfo(true)}>OPEN INFO DIALOG</Button>
        <Button variant="danger" onClick={() => setConfirm(true)}>OPEN DANGER DIALOG</Button>
      </div>

      <Dialog open={info} onClose={() => setInfo(false)} title="INFORMATION" accent="info">
        <p style={{ margin: 0 }}>
          Dialog uses a TerminalFrame for chrome and a portal for layer
          ordering. Click outside or press ESC to close.
        </p>
      </Dialog>

      <Dialog open={confirm} onClose={() => setConfirm(false)} title="DELETE EVERYTHING?" accent="danger">
        <p style={{ margin: '0 0 16px 0' }}>
          This will permanently delete all session recordings. There is no undo.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => setConfirm(false)}>CANCEL</Button>
          <Button variant="danger" onClick={() => setConfirm(false)}>CONFIRM DELETE</Button>
        </div>
      </Dialog>
    </CathodeProvider>
  );
}
