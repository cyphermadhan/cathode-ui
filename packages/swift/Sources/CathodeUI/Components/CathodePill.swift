import SwiftUI

/// Icon + text navigation / action button. One component covers both
/// nav-tab usage (with `isActive`) and header/action usage. Mirror of
/// React + Vue `<Pill>`.
///
/// Session 1 ports the title-only variant. The optional leading icon
/// slot lands in session 2 (Swift adopts the same SwiftUI ViewBuilder
/// content slot pattern as `CathodeStack`).
public struct CathodePill: View {
    public enum Accent: String, Sendable, Hashable {
        case info, success, warning, danger, accent
        case amber, pink, purple, teal, grey
    }

    private let title: String
    private let accent: Accent
    private let isActive: Bool
    private let isDisabled: Bool
    private let action: () -> Void

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme
    @State private var pressed = false

    public init(
        _ title: String,
        accent: Accent = .info,
        isActive: Bool = false,
        isDisabled: Bool = false,
        action: @escaping () -> Void = {}
    ) {
        self.title = title
        self.accent = accent
        self.isActive = isActive
        self.isDisabled = isDisabled
        self.action = action
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        let accentColor = resolve(accentKey)
        let textColor = isActive ? resolve(.bg) : accentColor
        let bg = isActive ? accentColor : resolve(.panel)

        Button(action: tap) {
            Text(title.uppercased())
                .font(.system(size: 11, weight: .bold, design: .monospaced))
                .tracking(CathodeTokens.Tracking.label)
                .foregroundColor(textColor)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(bg)
                .overlay(Rectangle().stroke(accentColor, lineWidth: CathodeTokens.Size.borderWidth))
        }
        .buttonStyle(.plain)
        .disabled(isActive || isDisabled)
        .opacity(isDisabled ? 0.5 : 1.0)
        .scaleEffect(pressed ? pressedScale : 1.0)
        .animation(settings.motion == .none ? nil : .easeOut(duration: CathodeTokens.MotionDuration.instant), value: pressed)
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in pressed = true }
                .onEnded   { _ in pressed = false }
        )
        .accessibilityAddTraits(isActive ? .isSelected : [])
    }

    private var accentKey: ColorKey {
        switch accent {
        case .info:    return .info
        case .success: return .success
        case .warning: return .warning
        case .danger:  return .danger
        case .accent:  return .accent
        case .amber:   return .amber
        case .pink:    return .pink
        case .purple:  return .purple
        case .teal:    return .teal
        case .grey:    return .grey
        }
    }

    private var pressedScale: CGFloat {
        switch settings.motion {
        case .none:   return 1.0
        case .subtle: return 0.99
        case .strong: return CathodeTokens.MotionScale.press
        }
    }

    private func tap() {
        guard !isActive, !isDisabled else { return }
        if settings.haptic {
            CathodeFeedback.haptic(for: .default)
        }
        if settings.sound {
            CathodeSound.play(.click, enabled: true)
        }
        action()
    }
}
