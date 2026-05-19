import SwiftUI

/// Single-select from 2+ options. Uses Cathode-styled radio dots,
/// not the system `Picker(.radioGroup)` style — keeps the look
/// consistent with web siblings. `Value` is generic so any
/// Hashable identity works.
public struct CathodeRadioGroup<Value: Hashable>: View {
    public enum Orientation: String, Sendable, Hashable { case horizontal, vertical }
    public enum Accent: String, Sendable, Hashable {
        case success, info, warning, danger, accent
    }

    public struct Option: Hashable {
        public let value: Value
        public let label: String
        public let isDisabled: Bool
        public init(value: Value, label: String, isDisabled: Bool = false) {
            self.value = value; self.label = label; self.isDisabled = isDisabled
        }
    }

    private let options: [Option]
    private let orientation: Orientation
    private let accent: Accent
    private let isDisabled: Bool
    @Binding private var value: Value

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(
        value: Binding<Value>,
        options: [Option],
        orientation: Orientation = .horizontal,
        accent: Accent = .info,
        isDisabled: Bool = false
    ) {
        self._value = value
        self.options = options
        self.orientation = orientation
        self.accent = accent
        self.isDisabled = isDisabled
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        let on = resolve(accentKey)
        let off = resolve(.border)
        let text = resolve(.text)

        Group {
            switch orientation {
            case .horizontal:
                HStack(spacing: 16) { rows(on: on, off: off, text: text) }
            case .vertical:
                VStack(alignment: .leading, spacing: 8) { rows(on: on, off: off, text: text) }
            }
        }
        .accessibilityElement(children: .contain)
    }

    @ViewBuilder
    private func rows(on: Color, off: Color, text: Color) -> some View {
        ForEach(options, id: \.self) { opt in
            let optDisabled = isDisabled || opt.isDisabled
            let isOn = opt.value == value
            Button(action: { choose(opt.value, optDisabled: optDisabled) }) {
                HStack(spacing: 6) {
                    ZStack {
                        Rectangle().stroke(isOn ? on : off, lineWidth: 1).frame(width: 14, height: 14)
                        if isOn { Rectangle().fill(on).frame(width: 6, height: 6) }
                    }
                    Text(opt.label.uppercased())
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .tracking(CathodeTokens.Tracking.label)
                        .foregroundColor(text)
                }
            }
            .buttonStyle(.plain)
            .disabled(optDisabled)
            .opacity(optDisabled ? 0.5 : 1.0)
            .accessibilityAddTraits(isOn ? .isSelected : [])
        }
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

    private func choose(_ v: Value, optDisabled: Bool) {
        guard !optDisabled else { return }
        if settings.haptic { CathodeFeedback.haptic(for: .default) }
        if settings.sound  { CathodeSound.play(.tick, enabled: true) }
        value = v
    }
}
