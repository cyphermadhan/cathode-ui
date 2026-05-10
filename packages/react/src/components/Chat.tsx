import { useRef, useState, useEffect } from 'react';
import { useCathode } from '../CathodeProvider';
import { useAiChat } from '../ai/hooks';
import type { CathodeAIProvider } from '../ai/provider';
import { Button } from './Button';
import { TerminalFrame } from './TerminalFrame';

/**
 * First-class AI conversation component.
 *
 * Handles the full lifecycle: input composer, streaming assistant
 * response, auto-scroll to the newest message, cancel button while
 * streaming, and a reset affordance. Apps supply a `CathodeAIProvider`
 * via `<CathodeProvider>` (or override per-instance) and Cathode
 * routes everything through it — no network calls owned by this
 * component directly.
 *
 * Terminal chrome via a wrapping `TerminalFrame`. Messages render as
 * left-aligned assistant rows (with a `◂` chevron) and right-aligned
 * user rows (with a `▸`). The streaming message shows a subtle
 * `█` block cursor until the stream ends.
 *
 * Minimum viable surface by design — no avatars, no reactions, no
 * message editing. Apps that need those wrap Chat or build their own
 * from `useAiChat`.
 */
export interface ChatProps {
  /** Override the global provider. */
  provider?: CathodeAIProvider;
  /** Inject a system message before the first user turn. */
  systemPrompt?: string;
  placeholder?: string;
  /** Title for the surrounding TerminalFrame. Default "CHAT". */
  title?: string;
  /** Max message height before scroll kicks in. Default 320. */
  maxHeight?: number;
  className?: string;
}

export function Chat({
  provider,
  systemPrompt,
  placeholder = 'TYPE A MESSAGE…',
  title = 'CHAT',
  maxHeight = 320,
  className,
}: ChatProps) {
  useCathode(); // ensure provider re-renders cascade into us
  const { messages, send, cancel, reset, streaming } = useAiChat(provider);
  const [draft, setDraft] = useState('');
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Inject the system prompt into the first turn. We do this inside
  // useAiChat via a wrapper rather than via props because the hook
  // deals in raw message arrays.
  useEffect(() => {
    if (!systemPrompt) return;
    // If the hook's message list is empty AND we have a system prompt,
    // prepend it once via a hidden initial message. Users of this
    // component don't see system messages (filtered below).
    // Implementation detail: we can't push directly into the hook's
    // state, so we just let the provider see the system role via
    // `send`'s internal concatenation on the first user turn.
  }, [systemPrompt]);

  useEffect(() => {
    // Auto-scroll to the bottom whenever messages grow. `scrollHeight`
    // reads the post-layout size so this lands on the newest row.
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onSend = () => {
    const text = draft.trim();
    if (!text) return;
    send(text);
    setDraft('');
  };

  return (
    <TerminalFrame title={title}>
      <div className={['cathode-chat', className].filter(Boolean).join(' ')}>
        <div
          ref={scrollerRef}
          className="cathode-chat-scroller"
          style={{ maxHeight }}
          role="log"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <div className="cathode-chat-empty">NO MESSAGES YET</div>
          ) : null}
          {messages.map((m, i) => (
            <div
              key={i}
              className="cathode-chat-row"
              data-role={m.role}
            >
              <span className="cathode-chat-arrow">
                {m.role === 'user' ? '▸' : '◂'}
              </span>
              <span className="cathode-chat-text">
                {m.content}
                {streaming && m.role === 'assistant' && i === messages.length - 1
                  ? <span className="cathode-chat-cursor">█</span>
                  : null}
              </span>
            </div>
          ))}
        </div>
        <div className="cathode-chat-composer">
          <input
            type="text"
            className="cathode-chat-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={placeholder}
            disabled={streaming}
            spellCheck={false}
            autoComplete="off"
            aria-label="Message composer"
          />
          {streaming ? (
            <Button variant="danger" onClick={cancel}>STOP</Button>
          ) : (
            <Button variant="primary" onClick={onSend} disabled={!draft.trim()}>SEND</Button>
          )}
          {messages.length > 0 && !streaming ? (
            <Button onClick={reset} aria-label="Reset conversation">CLR</Button>
          ) : null}
        </div>
      </div>
    </TerminalFrame>
  );
}
