import SwiftUI

/// Small inline status marker — "NEW", "BETA", "v2.1", etc.
/// Display-only. Distinct from `CathodePill` (tappable) and
/// `CathodeTag` (removable/filterable, lands in a later session).
public struct CathodeBadge: View {
    public enum Kind: String, Sendable, Hashable {
        case neutral, info, success, warning, danger
    }
    public enum Variant: String, Sendable, Hashable {
        case solid, outline
    }
    public enum Size: String, Sendable, Hashable {
        case sm, md
    }

    private let text: String
    private let kind: Kind
    private let variant: Variant
    private let size: Size

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(
        _ text: String,
        kind: Kind = .neutral,
        variant: Variant = .solid,
        size: Size = .md
    ) {
        self.text = text
        self.kind = kind
        self.variant = variant
        self.size = size
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        let accent = resolve(accentKey)
        let inverted = resolve(.bg)
        Text(text.uppercased())
            .font(.system(size: textSize, weight: .bold, design: .monospaced))
            .tracking(CathodeTokens.Tracking.label)
            .foregroundColor(variant == .solid ? inverted : accent)
            .padding(.horizontal, hPad)
            .padding(.vertical, vPad)
            .background(variant == .solid ? accent : Color.clear)
            .overlay(
                Rectangle().stroke(accent, lineWidth: variant == .outline ? 1 : 0)
            )
    }

    private var accentKey: ColorKey {
        switch kind {
        case .neutral: return .border
        case .info:    return .info
        case .success: return .success
        case .warning: return .warning
        case .danger:  return .danger
        }
    }

    private var textSize: CGFloat { size == .sm ? 9 : 10 }
    private var hPad:     CGFloat { size == .sm ? 5 : 7 }
    private var vPad:     CGFloat { size == .sm ? 1 : 2 }
}
