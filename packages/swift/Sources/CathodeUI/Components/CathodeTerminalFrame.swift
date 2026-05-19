import SwiftUI

/// Bordered box with a tiny all-caps title clipped into the top edge —
/// the "┌─ PEERS ─" terminal look. Framework-mirror of React's
/// `<TerminalFrame>` and Vue's `<TerminalFrame>`.
///
/// Implementation: a `RoundedRectangle` border draws the chrome; the
/// title overlays its top edge using SwiftUI's `.overlay(alignment:)`
/// API so the border subtly notches around the label.
public struct CathodeTerminalFrame<Content: View>: View {
    public enum Accent: String, Sendable, Hashable {
        case neutral, info, success, warning, danger
    }

    private let title: String?
    private let accent: Accent
    @ViewBuilder private let content: () -> Content

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(
        title: String? = nil,
        accent: Accent = .neutral,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.title = title
        self.accent = accent
        self.content = content
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        let borderColor = resolve(accentKey)

        content()
            .padding(CathodeTokens.Spacing.framePad)
            .frame(maxWidth: .infinity, alignment: .topLeading)
            .overlay(
                RoundedRectangle(cornerRadius: CathodeTokens.Size.tileCorner)
                    .stroke(borderColor, lineWidth: CathodeTokens.Size.borderWidth)
            )
            .overlay(alignment: .topLeading) {
                if let title {
                    titleLabel(title, color: resolve(.textDim), bg: resolve(.bg))
                        .offset(x: 14, y: -7)
                }
            }
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

    private func titleLabel(_ text: String, color: Color, bg: Color) -> some View {
        Text(text.uppercased())
            .font(.system(size: 10, weight: .bold, design: .monospaced))
            .tracking(CathodeTokens.Tracking.label)
            .foregroundColor(color)
            .padding(.horizontal, 6)
            .background(bg)
    }
}
