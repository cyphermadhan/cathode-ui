import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useCathode } from '../CathodeProvider';
import type { CathodeAIProvider } from '../ai/provider';

/**
 * Monospace search input with an optional AI semantic-search mode.
 *
 * Two modes:
 *
 *   **Plain** (`ai` prop omitted). Case-insensitive substring match
 *   against each item's label. Fast, predictable, zero network.
 *
 *   **Semantic** (`ai={{ semantic: true }}`). Calls
 *   `provider.act('search', { query, items })` and expects a JSON
 *   array of item-labels in ranked order. Apps bring their own
 *   provider; Cathode doesn't ship one. Useful when the user's
 *   query is intent-ish ("things about accessibility") rather than
 *   literal ("accessibility").
 *
 * Results render as a terminal-style stack of rows under the input.
 * Clicking a row fires `onSelect(item)` and clears the query.
 */
export interface SearchBarAIConfig {
  semantic: boolean;
  provider?: CathodeAIProvider;
  debounceMs?: number;
}

export interface SearchItem {
  id: string;
  label: string;
  subtitle?: string;
}

export interface SearchBarProps {
  items: SearchItem[];
  onSelect: (item: SearchItem) => void;
  placeholder?: string;
  ai?: SearchBarAIConfig;
  /** Max results shown in the dropdown. Default 8. */
  limit?: number;
  /**
   * Leading icon inside the input. Pass `false` to hide, `true` (the
   * default) to show a built-in monospace "⌕" glyph, or a ReactNode
   * (e.g. `<IconSearch weight="bold" />`) to supply your own.
   */
  icon?: boolean | ReactNode;
  className?: string;
}

export function SearchBar({
  items,
  onSelect,
  placeholder = 'SEARCH…',
  ai,
  limit = 8,
  icon = true,
  className,
}: SearchBarProps) {
  const { ai: globalAI } = useCathode();
  const provider = ai?.provider ?? globalAI;
  const [query, setQuery] = useState('');
  const [aiRanking, setAiRanking] = useState<string[] | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Plain-search result is pure derivation from `query`. The semantic
  // version overwrites `aiRanking` via an async effect below.
  const results = useMemo<SearchItem[]>(() => {
    if (!query.trim()) return [];
    if (aiRanking) {
      // Order items according to the provider's ranked list.
      const map = new Map(items.map((it) => [it.label, it]));
      return aiRanking.map((label) => map.get(label)).filter(Boolean) as SearchItem[];
    }
    const q = query.toLowerCase();
    return items
      .filter((it) => it.label.toLowerCase().includes(q) ||
                     (it.subtitle && it.subtitle.toLowerCase().includes(q)))
      .slice(0, limit);
  }, [query, items, aiRanking, limit]);

  useEffect(() => {
    // Plain mode — nothing to do. Semantic mode — debounce the query
    // and call the provider. Cancel in-flight on new keystrokes.
    setAiRanking(null);
    if (!ai?.semantic || !provider || !query.trim()) return;

    abortRef.current?.abort();
    const handle = setTimeout(async () => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        const raw = await provider.act('search', { query, items: items.map((i) => i.label) }, ctrl.signal);
        if (ctrl.signal.aborted) return;
        // Parse the provider's response. Accept a JSON array of
        // strings, or a newline-delimited list. Tolerant on purpose
        // — different providers return different shapes.
        const parsed = safeParseList(raw).slice(0, limit);
        setAiRanking(parsed);
      } catch {
        // silent — fall back to plain substring search
      }
    }, ai.debounceMs ?? 300);

    return () => clearTimeout(handle);
  }, [query, ai?.semantic, ai?.debounceMs, provider, items, limit]);

  const pick = (it: SearchItem) => {
    onSelect(it);
    setQuery('');
    setAiRanking(null);
  };

  const iconNode = icon === false
    ? null
    : icon === true
      ? <span className="cathode-searchbar-glyph" aria-hidden>⌕</span>
      : <span className="cathode-searchbar-iconslot" aria-hidden>{icon}</span>;

  return (
    <div className={['cathode-searchbar', className].filter(Boolean).join(' ')} data-has-icon={icon ? 'true' : 'false'}>
      {iconNode}
      <input
        type="text"
        className="cathode-searchbar-input"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        aria-label="Search"
      />
      {results.length > 0 ? (
        <ul className="cathode-searchbar-results">
          {results.map((it) => (
            <li key={it.id}>
              <button
                type="button"
                className="cathode-searchbar-row"
                onClick={() => pick(it)}
              >
                <span>{it.label}</span>
                {it.subtitle ? <span className="cathode-searchbar-sub">{it.subtitle}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function safeParseList(raw: string): string[] {
  const trimmed = raw.trim();
  // JSON array first.
  if (trimmed.startsWith('[')) {
    try {
      const arr = JSON.parse(trimmed);
      if (Array.isArray(arr)) return arr.filter((v) => typeof v === 'string');
    } catch { /* fall through */ }
  }
  // Newline-delimited.
  return trimmed.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}
