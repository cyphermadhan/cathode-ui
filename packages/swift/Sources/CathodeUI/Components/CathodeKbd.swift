import SwiftUI

/// Keyboard shortcut indicator. Each key renders in its own
/// bordered box; keys are joined by a separator (default "+").
/// Pass either a string (split on "+" or "-") or a `[String]`.
public struct CathodeKbd: View {
    public enum Size: String, Sendable, Hashable {
        case sm, md
        var fontSize: CGFloat { self == .sm ? 9 : 10 }
        var hPad: CGFloat     { self == .sm ? 4 : 6 }
        var vPad: CGFloat     { self == .sm ? 1 : 2 }
    }

    private let parts: [String]
    private let separator: String
    private let size: Size

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(_ parts: [String], separator: String = "+", size: Size = .md) {
        self.parts = parts
        self.separator = separator
        self.size = size
    }
    /// String overload — splits on "+" / "-" / whitespace.
    public init(_ keys: String, separator: String = "+", size: Size = .md) {
        let split = keys
            .components(separatedBy: CharacterSet(charactersIn: "+-"))
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
        self.init(split, separator: separator, size: size)
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        HStack(spacing: 4) {
            ForEach(Array(parts.enumerated()), id: \.offset) { i, key in
                Text(key.uppercased())
                    .font(.system(size: size.fontSize, weight: .bold, design: .monospaced))
                    .foregroundColor(resolve(.text))
                    .padding(.horizontal, size.hPad)
                    .padding(.vertical, size.vPad)
                    .background(resolve(.panel))
                    .overlay(Rectangle().stroke(resolve(.border), lineWidth: 1))
                if i < parts.count - 1 {
                    Text(separator)
                        .font(.system(size: size.fontSize, design: .monospaced))
                        .foregroundColor(resolve(.textDim))
                        .accessibilityHidden(true)
                }
            }
        }
        .accessibilityElement(children: .combine)
    }
}
