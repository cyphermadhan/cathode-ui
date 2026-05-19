import SwiftUI

/// Outlined accent-colored marker for keywords, filters,
/// classifications. Pass an `onRemove` closure to render a trailing
/// × button — mirrors React's `onRemove` prop and Vue's
/// `removable` + `@remove` event.
public struct CathodeTag: View {
    public enum Accent: String, Sendable, Hashable {
        case neutral, info, success, warning, danger
        case amber, pink, purple, teal, grey
    }

    private let text: String
    private let accent: Accent
    private let onRemove: (() -> Void)?
    private let removeLabel: String

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(
        _ text: String,
        accent: Accent = .neutral,
        removeLabel: String = "Remove",
        onRemove: (() -> Void)? = nil
    ) {
        self.text = text
        self.accent = accent
        self.removeLabel = removeLabel
        self.onRemove = onRemove
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        let color = resolve(accentKey)

        HStack(spacing: 4) {
            Text(text.uppercased())
                .font(.system(size: 10, weight: .bold, design: .monospaced))
                .tracking(CathodeTokens.Tracking.label)
                .foregroundColor(color)
            if let onRemove {
                Button(action: { onRemove() }) {
                    Text("×")
                        .font(.system(size: 12, weight: .bold, design: .monospaced))
                        .foregroundColor(color)
                        .frame(width: 14, height: 14)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel(removeLabel)
            }
        }
        .padding(.horizontal, 6)
        .padding(.vertical, 2)
        .overlay(Rectangle().stroke(color, lineWidth: 1))
    }

    private var accentKey: ColorKey {
        switch accent {
        case .neutral: return .border
        case .info:    return .info
        case .success: return .success
        case .warning: return .warning
        case .danger:  return .danger
        case .amber:   return .amber
        case .pink:    return .pink
        case .purple:  return .purple
        case .teal:    return .teal
        case .grey:    return .grey
        }
    }
}
