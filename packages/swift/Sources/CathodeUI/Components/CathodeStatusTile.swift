import SwiftUI

/// MPC-style status tile: centered icon, bold label, tiny subtitle.
/// Pass `clickable: true` to render as a button with feedback.
public struct CathodeStatusTile<Icon: View>: View {
    public typealias Accent = CathodePill.Accent

    private let title: String
    private let subtitle: String
    private let accent: Accent
    private let isActive: Bool
    private let isClickable: Bool
    private let action: () -> Void
    @ViewBuilder private let icon: () -> Icon

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(
        title: String,
        subtitle: String,
        accent: Accent = .info,
        isActive: Bool = false,
        isClickable: Bool = false,
        action: @escaping () -> Void = {},
        @ViewBuilder icon: @escaping () -> Icon
    ) {
        self.title = title
        self.subtitle = subtitle
        self.accent = accent
        self.isActive = isActive
        self.isClickable = isClickable
        self.action = action
        self.icon = icon
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        let accentColor = accentColor(resolve)
        let bg = isActive ? accentColor : resolve(.panel)
        let titleColor = isActive ? resolve(.bg) : resolve(.text)
        let subtitleColor = isActive ? resolve(.bg).opacity(0.7) : resolve(.textDim)

        Group {
            if isClickable {
                Button(action: tap) {
                    inner(bg: bg, titleColor: titleColor, subtitleColor: subtitleColor, border: accentColor)
                }
                .buttonStyle(.plain)
            } else {
                inner(bg: bg, titleColor: titleColor, subtitleColor: subtitleColor, border: accentColor)
            }
        }
    }

    @ViewBuilder
    private func inner(bg: Color, titleColor: Color, subtitleColor: Color, border: Color) -> some View {
        VStack(spacing: 6) {
            icon()
                .frame(maxWidth: .infinity)
            Text(title.uppercased())
                .font(.system(size: 12, weight: .bold, design: .monospaced))
                .tracking(CathodeTokens.Tracking.label)
                .foregroundColor(titleColor)
            Text(subtitle.uppercased())
                .font(.system(size: 9, design: .monospaced))
                .tracking(CathodeTokens.Tracking.caption)
                .foregroundColor(subtitleColor)
        }
        .padding(12)
        .frame(maxWidth: .infinity)
        .background(bg)
        .overlay(Rectangle().stroke(border, lineWidth: CathodeTokens.Size.borderWidth))
    }

    private func accentColor(_ resolve: ResolvedColor) -> Color {
        // Mirror CathodePill's accent → ColorKey mapping.
        switch accent {
        case .info:    return resolve(.info)
        case .success: return resolve(.success)
        case .warning: return resolve(.warning)
        case .danger:  return resolve(.danger)
        case .accent:  return resolve(.accent)
        case .amber:   return resolve(.amber)
        case .pink:    return resolve(.pink)
        case .purple:  return resolve(.purple)
        case .teal:    return resolve(.teal)
        case .grey:    return resolve(.grey)
        }
    }

    private func tap() {
        if settings.haptic { CathodeFeedback.haptic(for: .default) }
        if settings.sound  { CathodeSound.play(.click, enabled: true) }
        action()
    }
}
