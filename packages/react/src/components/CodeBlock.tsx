import { useState } from 'react';

/**
 * CodeBlock — multi-line code display with an optional language label
 * in the corner and a copy button. Distinct from inline `<code>` spans;
 * use this when the code is a standalone sample.
 *
 * No syntax highlighting baked in — Cathode keeps the package tiny
 * and provider-agnostic. If you need highlighting, pre-render to an
 * HTML string with Shiki/Highlight.js and pass via `html` instead of
 * `code`.
 */
export interface CodeBlockProps {
  /** Plain-text code. Ignored if `html` is passed. */
  code?: string;
  /** Pre-rendered highlighted HTML (e.g. from Shiki). Takes precedence over `code`. */
  html?: string;
  language?: string;
  /** Show a trailing copy-to-clipboard button. Default true. */
  showCopy?: boolean;
  /** Max height before vertical scroll kicks in. */
  maxHeight?: number;
  className?: string;
}

export function CodeBlock({
  code,
  html,
  language,
  showCopy = true,
  maxHeight,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const text = code ?? stripHtml(html ?? '');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — UI stays in idle state */
    }
  };

  return (
    <div className={['cathode-codeblock', className].filter(Boolean).join(' ')}>
      {(language || showCopy) ? (
        <div className="cathode-codeblock-bar">
          {language ? <span className="cathode-codeblock-lang">{language}</span> : <span />}
          {showCopy ? (
            <button
              type="button"
              className="cathode-codeblock-copy"
              onClick={onCopy}
              aria-label={copied ? 'Copied' : 'Copy code'}
            >
              {copied ? 'COPIED' : 'COPY'}
            </button>
          ) : null}
        </div>
      ) : null}
      <pre
        className="cathode-codeblock-pre"
        style={maxHeight ? { maxHeight, overflow: 'auto' } : undefined}
        tabIndex={0}
      >
        {html ? (
          <code dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <code>{code}</code>
        )}
      </pre>
    </div>
  );
}

function stripHtml(s: string): string {
  // Minimal — strip tags for the copy-to-clipboard fallback when
  // consumers only passed `html`.
  return s.replace(/<[^>]*>/g, '');
}
