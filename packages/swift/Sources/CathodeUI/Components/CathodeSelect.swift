import SwiftUI

/// Single-select from a finite list. Wraps SwiftUI's `Menu` with
/// Cathode chrome (square border, monospace label, chevron).
/// Generic over Hashable Value so apps bind any identity type.
public struct CathodeSelect<Value: Hashable>: View {
    public struct Option: Hashable {
        public let value: Value
        public let label: String
        public let isDisabled: Bool
        public init(value: Value, label: String, isDisabled: Bool = false) {
            self.value = value; self.label = label; self.isDisabled = isDisabled
        }
    }

    private let options: [Option]
    private let placeholder: String?
    private let isDisabled: Bool
    @Binding private var value: Value

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(
        value: Binding<Value>,
        options: [Option],
        placeholder: String? = nil,
        isDisabled: Bool = false
    ) {
        self._value = value
        self.options = options
        self.placeholder = placeholder
        self.isDisabled = isDisabled
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        let label = options.first(where: { $0.value == value })?.label ?? placeholder ?? ""

        Menu {
            ForEach(options, id: \.self) { opt in
                Button(action: { pick(opt) }) {
                    if opt.value == value {
                        Label(opt.label.uppercased(), systemImage: "checkmark")
                    } else {
                        Text(opt.label.uppercased())
                    }
                }
                .disabled(opt.isDisabled)
            }
        } label: {
            HStack(spacing: 8) {
                Text(label.uppercased())
                    .font(.system(size: 12, weight: .bold, design: .monospaced))
                    .tracking(CathodeTokens.Tracking.label)
                    .foregroundColor(resolve(.text))
                Spacer(minLength: 0)
                Text("▾")
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundColor(resolve(.textDim))
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 7)
            .frame(minHeight: CathodeTokens.Size.touchTargetMin / 1.5)
            .background(resolve(.panel))
            .overlay(Rectangle().stroke(resolve(.border), lineWidth: 1))
        }
        .menuStyle(.borderlessButton)
        .disabled(isDisabled)
        .opacity(isDisabled ? 0.5 : 1.0)
    }

    private func pick(_ opt: Option) {
        guard !opt.isDisabled else { return }
        if settings.haptic { CathodeFeedback.haptic(for: .default) }
        if settings.sound  { CathodeSound.play(.tick, enabled: true) }
        value = opt.value
    }
}
