import SwiftUI

/// Path-style navigation row. The last item is treated as the current
/// location (rendered as static text + `accessibilityCurrent`).
/// Separator defaults to "›" — the terminal-aesthetic choice over "/".
public struct CathodeBreadcrumbs: View {
    public struct Item: Hashable {
        public let label: String
        public let action: (() -> Void)?
        public init(label: String, action: (() -> Void)? = nil) {
            self.label = label
            self.action = action
        }
        // Hash on label only — closures aren't Hashable.
        public func hash(into hasher: inout Hasher) { hasher.combine(label) }
        public static func == (lhs: Item, rhs: Item) -> Bool { lhs.label == rhs.label }
    }

    private let items: [Item]
    private let separator: String

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(items: [Item], separator: String = "›") {
        self.items = items
        self.separator = separator
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)

        HStack(spacing: 6) {
            ForEach(Array(items.enumerated()), id: \.offset) { i, item in
                let isLast = i == items.count - 1
                if let action = item.action, !isLast {
                    Button(action: action) {
                        Text(item.label.uppercased())
                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                            .tracking(CathodeTokens.Tracking.label)
                            .foregroundColor(resolve(.info))
                            .underline()
                    }
                    .buttonStyle(.plain)
                } else {
                    Text(item.label.uppercased())
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .tracking(CathodeTokens.Tracking.label)
                        .foregroundColor(isLast ? resolve(.text) : resolve(.textDim))
                        .accessibilityAddTraits(isLast ? .isHeader : [])
                }
                if !isLast {
                    Text(separator)
                        .font(.system(size: 12, design: .monospaced))
                        .foregroundColor(resolve(.textFaint))
                        .accessibilityHidden(true)
                }
            }
        }
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Breadcrumb")
    }
}
