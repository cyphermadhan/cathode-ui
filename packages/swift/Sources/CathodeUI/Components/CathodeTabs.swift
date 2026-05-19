import SwiftUI

/// Horizontal row of tabs where exactly one is active. Controlled
/// via `@Binding<Value>`; `Value` is generic over Hashable.
public struct CathodeTabs<Value: Hashable>: View {
    public enum Accent: String, Sendable, Hashable {
        case info, success, warning, danger, accent
    }

    public struct Item: Hashable {
        public let value: Value
        public let label: String
        public let isDisabled: Bool
        public init(value: Value, label: String, isDisabled: Bool = false) {
            self.value = value; self.label = label; self.isDisabled = isDisabled
        }
    }

    private let items: [Item]
    private let accent: Accent
    @Binding private var value: Value

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(value: Binding<Value>, items: [Item], accent: Accent = .info) {
        self._value = value
        self.items = items
        self.accent = accent
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        let activeColor = resolve(accentKey)

        HStack(spacing: 0) {
            ForEach(items, id: \.self) { it in
                let isOn = it.value == value
                Button(action: { pick(it) }) {
                    Text(it.label.uppercased())
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .tracking(CathodeTokens.Tracking.label)
                        .foregroundColor(isOn ? activeColor : resolve(.textDim))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 8)
                        .frame(maxWidth: .infinity)
                        .overlay(alignment: .bottom) {
                            Rectangle()
                                .fill(isOn ? activeColor : Color.clear)
                                .frame(height: 2)
                        }
                }
                .buttonStyle(.plain)
                .disabled(it.isDisabled)
                .opacity(it.isDisabled ? 0.5 : 1.0)
                .accessibilityAddTraits(isOn ? .isSelected : [])
            }
        }
        .overlay(alignment: .bottom) {
            Rectangle().fill(resolve(.border)).frame(height: 1)
        }
        .accessibilityElement(children: .contain)
    }

    private var accentKey: ColorKey {
        switch accent {
        case .info:    return .info
        case .success: return .success
        case .warning: return .warning
        case .danger:  return .danger
        case .accent:  return .accent
        }
    }

    private func pick(_ it: Item) {
        guard !it.isDisabled, it.value != value else { return }
        if settings.haptic { CathodeFeedback.haptic(for: .default) }
        if settings.sound  { CathodeSound.play(.click, enabled: true) }
        value = it.value
    }
}
