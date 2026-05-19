import SwiftUI

/// Generic bordered container — same chrome as `CathodeTerminalFrame`
/// without the inset title. Use when the content speaks for itself.
/// Set `clickable: true` to render as a button (the SwiftUI analogue
/// of React's onClick-presence trick).
public struct CathodeCard<Content: View>: View {
    public enum Accent: String, Sendable, Hashable {
        case neutral, info, success, warning, danger
    }
    public enum Surface: String, Sendable, Hashable {
        case flat, elevated
    }
    public enum Padding: String, Sendable, Hashable {
        case none, sm, md, lg

        var value: CGFloat {
            switch self {
            case .none: return 0
            case .sm:   return 8
            case .md:   return 12
            case .lg:   return 16
            }
        }
    }

    private let accent: Accent
    private let surface: Surface
    private let padding: Padding
    private let isClickable: Bool
    private let action: () -> Void
    @ViewBuilder private let content: () -> Content

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(
        accent: Accent = .neutral,
        surface: Surface = .flat,
        padding: Padding = .md,
        isClickable: Bool = false,
        action: @escaping () -> Void = {},
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.accent = accent
        self.surface = surface
        self.padding = padding
        self.isClickable = isClickable
        self.action = action
        self.content = content
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        let bg = surface == .elevated ? resolve(.panel) : Color.clear
        let border = resolve(accentKey)

        Group {
            if isClickable {
                Button(action: tap) {
                    inner(bg: bg, border: border)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            } else {
                inner(bg: bg, border: border)
            }
        }
    }

    @ViewBuilder
    private func inner(bg: Color, border: Color) -> some View {
        content()
            .padding(padding.value)
            .frame(maxWidth: .infinity, alignment: .topLeading)
            .background(bg)
            .overlay(Rectangle().stroke(border, lineWidth: CathodeTokens.Size.borderWidth))
    }

    private func tap() {
        if settings.haptic { CathodeFeedback.haptic(for: .default) }
        if settings.sound  { CathodeSound.play(.click, enabled: true) }
        action()
    }

    private var accentKey: ColorKey {
        switch accent {
        case .neutral: return .border
        case .info:    return .info
        case .success: return .success
        case .warning: return .warning
        case .danger:  return .danger
        }
    }
}
