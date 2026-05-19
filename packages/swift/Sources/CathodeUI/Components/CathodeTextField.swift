import SwiftUI

/// Monospace text input. Optional ghost-text AI suggest streams
/// from the active `CathodeAIProvider` after a debounce. Pressing
/// Tab accepts the suggestion (mirrors the React + Vue Tab gesture).
public struct CathodeTextField: View {
    private let placeholder: String
    private let isDisabled: Bool
    private let aiSuggest: Bool
    private let debounceMs: Int
    @Binding private var text: String

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme
    @Environment(\.cathodeAI) private var ai

    @State private var suggestion: String = ""
    @State private var debounceTask: Task<Void, Never>?

    public init(
        text: Binding<String>,
        placeholder: String = "",
        isDisabled: Bool = false,
        aiSuggest: Bool = false,
        debounceMs: Int = 200
    ) {
        self._text = text
        self.placeholder = placeholder
        self.isDisabled = isDisabled
        self.aiSuggest = aiSuggest
        self.debounceMs = debounceMs
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)

        ZStack(alignment: .leading) {
            // Ghost suggestion behind the live text. Use the same
            // monospace font + size so the visible-text width lines up;
            // the prefix is rendered with opacity 0 to push the
            // suggestion to the right edge of the typed prefix.
            if !suggestion.isEmpty {
                HStack(spacing: 0) {
                    Text(text).opacity(0)
                    Text(suggestion)
                        .foregroundColor(resolve(.textFaint))
                }
                .font(.system(size: 13, design: .monospaced))
            }

            TextField(placeholder, text: $text)
                .textFieldStyle(.plain)
                .font(.system(size: 13, weight: .regular, design: .monospaced))
                .foregroundColor(resolve(.text))
                .disabled(isDisabled)
                .autocorrectionDisabled(true)
                #if os(iOS) || os(visionOS)
                .textInputAutocapitalization(.never)
                #endif
                .onChange(of: text) { _, new in
                    onTextChanged(new)
                }
                // Tab-to-accept on macOS 14+ / iOS 17+ via the
                // SwiftUI keyPress modifier. Older OS versions leave
                // the suggestion to be accepted via a long-press or
                // explicit confirm gesture in a later session.
                .modifier(TabAcceptModifier(suggestion: $suggestion, text: $text))
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background(resolve(.panel))
        .overlay(Rectangle().stroke(resolve(.border), lineWidth: 1))
    }

}

/// Tab-to-accept modifier. `onKeyPress(.tab)` is macOS 14+ / iOS 17+,
/// so we conditionally apply it via availability gates instead of
/// raising the package's deployment target. On older platforms this
/// is a passthrough.
private struct TabAcceptModifier: ViewModifier {
    @Binding var suggestion: String
    @Binding var text: String

    func body(content: Content) -> some View {
        if #available(macOS 14.0, iOS 17.0, visionOS 1.0, tvOS 17.0, *) {
            content.onKeyPress(.tab) {
                if !suggestion.isEmpty {
                    text += suggestion
                    suggestion = ""
                    return .handled
                }
                return .ignored
            }
        } else {
            content
        }
    }
}

extension CathodeTextField {
    private func onTextChanged(_ next: String) {
        guard aiSuggest, let provider = ai else {
            suggestion = ""
            return
        }
        debounceTask?.cancel()
        let snapshot = next
        suggestion = ""
        guard !snapshot.isEmpty else { return }
        let delay = UInt64(max(0, debounceMs)) * 1_000_000
        debounceTask = Task {
            try? await Task.sleep(nanoseconds: delay)
            if Task.isCancelled { return }
            do {
                var acc = ""
                for try await chunk in provider.suggest(prefix: snapshot) {
                    if Task.isCancelled { return }
                    if text != snapshot { return } // user typed more; stale
                    acc += chunk
                    await MainActor.run { suggestion = acc }
                }
            } catch {
                // suggestion is non-critical — silent failure
            }
        }
    }
}
