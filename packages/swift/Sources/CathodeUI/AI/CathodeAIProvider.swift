import Foundation
import SwiftUI

/// One conversational message in a `CathodeAIProvider.chat` exchange.
/// Mirrors `ChatMessage` from `@cathode-ui/react`.
public struct ChatMessage: Sendable, Hashable {
    public enum Role: String, Sendable, Hashable {
        case user, assistant, system
    }
    public let role: Role
    public let content: String

    public init(role: Role, content: String) {
        self.role = role
        self.content = content
    }
}

/// Pluggable AI provider that AI-aware Cathode primitives
/// (`CathodeTextField` suggest, `CathodeSearchBar` semantic,
/// `CathodeChat`, `CathodeButton` actions) route through. Mirrors
/// `CathodeAIProvider` from the React + Vue packages: same three
/// verbs, same streaming shape (Swift `AsyncThrowingStream<String,
/// Error>` replaces the JS async generator).
///
/// Apps supply their own implementation — Cathode stays
/// provider-agnostic so consumers can plug in OpenAI, Anthropic,
/// on-device CoreML, or a mock for tests. Reference adapters live
/// in separate packages (or app code), never inside CathodeUI.
public protocol CathodeAIProvider: Sendable {
    /// Stream tokens completing a prefix. Used for ghost-text suggest.
    func suggest(prefix: String) -> AsyncThrowingStream<String, Error>

    /// Stream a chat response given the conversation so far.
    func chat(messages: [ChatMessage]) -> AsyncThrowingStream<String, Error>

    /// One-shot intent → resolved string. Used for AI buttons +
    /// `CathodeSearchBar` semantic ranking.
    func act(intent: String, context: Any?) async throws -> String
}

private struct CathodeAIProviderKey: EnvironmentKey {
    static let defaultValue: (any CathodeAIProvider)? = nil
}

public extension EnvironmentValues {
    /// Active AI provider, if the consumer app set one via
    /// `CathodeProvider(ai: …)`. AI-aware components fall back to a
    /// no-op when nil — they don't crash.
    var cathodeAI: (any CathodeAIProvider)? {
        get { self[CathodeAIProviderKey.self] }
        set { self[CathodeAIProviderKey.self] = newValue }
    }
}
