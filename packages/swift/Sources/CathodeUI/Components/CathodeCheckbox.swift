import SwiftUI

/// Binary checkbox for multi-select form values. Distinct from
/// CathodeToggle (state switch). Indeterminate ("dash") rendering
/// mirrors React + Vue. Square box, monospace label.
public struct CathodeCheckbox: View {
    public enum Accent: String, Sendable, Hashable {
        case success, info, warning, danger, accent
    }

    private let label: String?
    private let accent: Accent
    private let isDisabled: Bool
    private let isIndeterminate: Bool
    @Binding private var value: Bool

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(
        _ label: String? = nil,
        value: Binding<Bool>,
        accent: Accent = .success,
        isDisabled: Bool = false,
        isIndeterminate: Bool = false
    ) {
        self.label = label
        self.accent = accent
        self.isDisabled = isDisabled
        self.isIndeterminate = isIndeterminate
        self._value = value
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        let on = resolve(accentKey)
        let off = resolve(.border)
        let mark = resolve(.bg)
        let on_ = value || isIndeterminate

        Button(action: tap) {
            HStack(spacing: 8) {
                ZStack {
                    Rectangle()
                        .fill(on_ ? on : Color.clear)
                        .frame(width: 14, height: 14)
                        .overlay(Rectangle().stroke(on_ ? on : off, lineWidth: 1))
                    if isIndeterminate {
                        Text("–")
                            .font(.system(size: 12, weight: .bold, design: .monospaced))
                            .foregroundColor(mark)
                    } else if value {
                        Text("✓")
                            .font(.system(size: 10, weight: .bold, design: .monospaced))
                            .foregroundColor(mark)
                    }
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
        .accessibilityAddTraits(value ? .isSelected : [])
    }

    private var accentKey: ColorKey {
        switch accent {
        case .success: return .success
        case .info:    return .info
        case .warning: return .warning
        case .danger:  return .danger
        case .accent:  return .accent
        }
    }

    private func tap() {
        guard !isDisabled else { return }
        if settings.haptic { CathodeFeedback.haptic(for: .default) }
        if settings.sound  { CathodeSound.play(.tick, enabled: true) }
        value.toggle()
    }
}
