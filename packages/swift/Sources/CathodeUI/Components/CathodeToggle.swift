import SwiftUI

/// Binary on/off switch in the Cathode terminal language. Square
/// track + sliding knob, no rounded corners. Mirror of React + Vue
/// `<Toggle>`. Tap fires haptic + optional sound (`tick` pattern).
public struct CathodeToggle: View {
    public enum Accent: String, Sendable, Hashable {
        case success, info, warning, danger, accent
        case amber, pink, purple, teal
    }

    private let label: String?
    private let accent: Accent
    private let isDisabled: Bool
    @Binding private var value: Bool

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(
        _ label: String? = nil,
        value: Binding<Bool>,
        accent: Accent = .success,
        isDisabled: Bool = false
    ) {
        self.label = label
        self.accent = accent
        self.isDisabled = isDisabled
        self._value = value
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        let on = resolve(accentKey)
        let off = resolve(.border)
        let knob = resolve(.bg)

        Button(action: tap) {
            HStack(spacing: 8) {
                ZStack(alignment: value ? .trailing : .leading) {
                    Rectangle()
                        .fill(value ? on : Color.clear)
                        .frame(width: 36, height: 18)
                        .overlay(Rectangle().stroke(value ? on : off, lineWidth: 1))
                    Rectangle()
                        .fill(value ? knob : off)
                        .frame(width: 14, height: 14)
                        .padding(2)
                        .animation(
                            settings.motion == .none ? nil : .easeOut(duration: CathodeTokens.MotionDuration.quick),
                            value: value
                        )
                }
                if let label {
                    Text(label.uppercased())
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .tracking(CathodeTokens.Tracking.label)
                        .foregroundColor(resolve(.text))
                }
            }
        }
        .buttonStyle(.plain)
        .disabled(isDisabled)
        .opacity(isDisabled ? 0.5 : 1.0)
        .accessibilityRepresentation { Toggle(label ?? "", isOn: $value) }
    }

    private var accentKey: ColorKey {
        switch accent {
        case .success: return .success
        case .info:    return .info
        case .warning: return .warning
        case .danger:  return .danger
        case .accent:  return .accent
        case .amber:   return .amber
        case .pink:    return .pink
        case .purple:  return .purple
        case .teal:    return .teal
        }
    }

    private func tap() {
        guard !isDisabled else { return }
        if settings.haptic { CathodeFeedback.haptic(for: .default) }
        if settings.sound  { CathodeSound.play(.tick, enabled: true) }
        value.toggle()
    }
}
