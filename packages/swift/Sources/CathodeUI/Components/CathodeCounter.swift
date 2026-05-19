import SwiftUI

/// Numeric rocker — `[−]  LABEL VALUE  [+]`. Ideal for values the
/// user nudges frequently (volume, speed, count). Replaces the
/// generic `Stepper` for a more visible, terminal-styled control.
public struct CathodeCounter: View {
    private let minValue: Int
    private let maxValue: Int
    private let step: Int
    private let label: String?
    private let format: ((Int) -> String)?
    private let isDisabled: Bool
    @Binding private var value: Int

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(
        value: Binding<Int>,
        min: Int = 0,
        max: Int = 100,
        step: Int = 1,
        label: String? = nil,
        format: ((Int) -> String)? = nil,
        isDisabled: Bool = false
    ) {
        self._value = value
        self.minValue = min
        self.maxValue = max
        self.step = step
        self.label = label
        self.format = format
        self.isDisabled = isDisabled
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        let canDec = !isDisabled && value - step >= minValue
        let canInc = !isDisabled && value + step <= maxValue
        let shown = format?(value) ?? String(value)

        HStack(spacing: 0) {
            stepperButton("−", enabled: canDec) { fire(-1) }
                .background(resolve(.panel))
                .overlay(Rectangle().stroke(resolve(.border), lineWidth: 1))

            HStack(spacing: 6) {
                if let label {
                    Text(label.uppercased())
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                        .tracking(CathodeTokens.Tracking.label)
                        .foregroundColor(resolve(.textDim))
                }
                Text(shown)
                    .font(.system(size: 14, weight: .bold, design: .monospaced))
                    .foregroundColor(resolve(.text))
            }
            .frame(minWidth: 80, minHeight: 32)
            .background(resolve(.panel))
            .overlay(Rectangle().stroke(resolve(.border), lineWidth: 1))

            stepperButton("+", enabled: canInc) { fire(1) }
                .background(resolve(.panel))
                .overlay(Rectangle().stroke(resolve(.border), lineWidth: 1))
        }
        .opacity(isDisabled ? 0.5 : 1.0)
    }

    private func stepperButton(_ glyph: String, enabled: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(glyph)
                .font(.system(size: 16, weight: .bold, design: .monospaced))
                .frame(width: 32, height: 32)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .disabled(!enabled)
        .opacity(enabled ? 1.0 : 0.4)
    }

    private func fire(_ direction: Int) {
        let next = value + direction * step
        guard next >= minValue, next <= maxValue else { return }
        if settings.haptic { CathodeFeedback.haptic(for: .default) }
        if settings.sound  { CathodeSound.play(.tick, enabled: true) }
        value = next
    }
}
