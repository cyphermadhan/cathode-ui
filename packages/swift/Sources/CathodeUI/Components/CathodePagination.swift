import SwiftUI

/// Page-jumping control. Renders prev/next arrows + a windowed set
/// of page buttons around the current page. 1-based.
public struct CathodePagination: View {
    private let totalPages: Int
    @Binding private var page: Int

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(page: Binding<Int>, totalPages: Int) {
        self._page = page
        self.totalPages = totalPages
    }

    private enum Token: Hashable { case page(Int), gap(Int) }

    private var tokens: [Token] {
        guard totalPages > 1 else { return [] }
        var out: [Token] = [.page(1)]
        let start = max(2, page - 1)
        let end = min(totalPages - 1, page + 1)
        if start > 2 { out.append(.gap(0)) }
        for p in start...end where p > 0 && p <= totalPages { out.append(.page(p)) }
        if end < totalPages - 1 { out.append(.gap(1)) }
        if totalPages > 1 { out.append(.page(totalPages)) }
        return out
    }

    public var body: some View {
        if totalPages <= 1 { EmptyView() } else { paginationBody }
    }

    private var paginationBody: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        return HStack(spacing: 4) {
            arrow("‹", enabled: page > 1, label: "Previous page") { go(page - 1) }

            ForEach(Array(tokens.enumerated()), id: \.offset) { _, token in
                switch token {
                case .page(let p):
                    Button(action: { go(p) }) {
                        Text("\(p)")
                            .font(.system(size: 11, weight: .bold, design: .monospaced))
                            .foregroundColor(p == page ? resolve(.bg) : resolve(.text))
                            .frame(minWidth: 28, minHeight: 28)
                            .background(p == page ? resolve(.info) : resolve(.panel))
                            .overlay(Rectangle().stroke(p == page ? resolve(.info) : resolve(.border), lineWidth: 1))
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Page \(p)")
                    .accessibilityAddTraits(p == page ? .isSelected : [])

                case .gap:
                    Text("…")
                        .font(.system(size: 12, design: .monospaced))
                        .foregroundColor(resolve(.textFaint))
                        .frame(minWidth: 16)
                        .accessibilityHidden(true)
                }
            }

            arrow("›", enabled: page < totalPages, label: "Next page") { go(page + 1) }
        }
        .accessibilityLabel("Pagination")
    }

    private func arrow(_ glyph: String, enabled: Bool, label: String, action: @escaping () -> Void) -> some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        return Button(action: action) {
            Text(glyph)
                .font(.system(size: 14, weight: .bold, design: .monospaced))
                .foregroundColor(resolve(.text))
                .frame(minWidth: 28, minHeight: 28)
                .background(resolve(.panel))
                .overlay(Rectangle().stroke(resolve(.border), lineWidth: 1))
        }
        .buttonStyle(.plain)
        .disabled(!enabled)
        .opacity(enabled ? 1.0 : 0.4)
        .accessibilityLabel(label)
    }

    private func go(_ n: Int) {
        let clamped = max(1, min(totalPages, n))
        guard clamped != page else { return }
        if settings.haptic { CathodeFeedback.haptic(for: .default) }
        if settings.sound  { CathodeSound.play(.tick, enabled: true) }
        page = clamped
    }
}
