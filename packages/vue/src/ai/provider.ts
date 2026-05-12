/**
 * `CathodeAIProvider` — the contract an app implements to wire any LLM
 * into Cathode's AI-enabled components. Cathode itself ships zero
 * provider implementations (keeps `@cathode-ui/react` free of SDK
 * bloat). Reference adapters live in separate packages.
 *
 * Three verbs cover every AI-enabled component:
 *
 *   - `suggest(prefix)` — stream a short inline completion for a
 *     TextField. Return value is the completion (sans the prefix).
 *
 *   - `chat(messages)` — stream assistant tokens for the Chat
 *     component. Yielded chunks are appended to the visible bubble.
 *
 *   - `act(intent, context)` — fire-and-return for Button AI actions.
 *     The component does not render the result; it hands it back so
 *     the app can decide how to react.
 *
 * All three are async-iterable where relevant so components can render
 * partial output. Providers that only return final strings can yield
 * the whole thing once.
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface CathodeAIProvider {
  /** Inline completion for a TextField. Yields the tail to append. */
  suggest(prefix: string, signal?: AbortSignal): AsyncIterable<string>;
  /** Streaming conversation for Chat. Yields assistant text chunks. */
  chat(messages: ChatMessage[], signal?: AbortSignal): AsyncIterable<string>;
  /** One-shot intent — used by Button AI actions + SearchBar semantic. */
  act(intent: string, context?: unknown, signal?: AbortSignal): Promise<string>;
}
