import SwiftUI

/// Multi-line monospace text input. Wraps SwiftUI's `TextEditor`
/// with Cathode chrome and an optional character counter.
public struct CathodeTextArea: View {
    private let placeholder: String
    private let isDisabled: Bool
    private let rows: Int
    private let maxLength: Int?
    @Binding private var text: String

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(
        text: Binding<String>,
        placeholder: String = "",
        rows: Int = 4,
        maxLength: Int? = nil,
        isDisabled: Bool = false
    ) {
        self._text = text
        self.placeholder = placeholder
        self.rows = rows
        self.maxLength = maxLength
        self.isDisabled = isDisabled
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        let lineH: CGFloat = 18

        VStack(alignment: .trailing, spacing: 4) {
            ZStack(alignment: .topLeading) {
                if text.isEmpty, !placeholder.isEmpty {
                    Text(placeholder)
                        .font(.system(size: 13, design: .monospaced))
                        .foregroundColor(resolve(.textFaint))
                        .padding(.horizontal, 10)
                        .padding(.vertical, 8)
                }
                TextEditor(text: $text)
                    .font(.system(size: 13, design: .monospaced))
                    .foregroundColor(resolve(.text))
                    .scrollContentBackground(.hidden)
                    .background(resolve(.panel))
                    .frame(minHeight: lineH * CGFloat(rows) + 16)
                    .disabled(isDisabled)
                    .onChange(of: text) { _, new in
                        if let maxLength, new.count > maxLength {
                            text = String(new.prefix(maxLength))
                        }
                    }
            }
            .background(resolve(.panel))
            .overlay(Rectangle().stroke(resolve(.border), lineWidth: 1))

            if let maxLength {
                Text("\(text.count) / \(maxLength)")
                    .font(.system(size: 9, design: .monospaced))
                    .foregroundColor(resolve(.textDim))
            }
        }
        .opacity(isDisabled ? 0.5 : 1.0)
    }
}
