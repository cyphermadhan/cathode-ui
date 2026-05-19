import SwiftUI

/// Utility flex wrapper — direction + gap + alignment. No visual
/// chrome. Mirrors `<Stack>` from `@cathode-ui/react` and
/// `@cathode-ui/vue`.
///
/// SwiftUI already has `HStack` / `VStack`, but a single `CathodeStack`
/// keeps the cross-framework API consistent and lets components
/// switch direction via a prop instead of a different builder.
public struct CathodeStack<Content: View>: View {
    public enum Direction: String, Sendable, Hashable {
        case row, column
    }

    public enum AxisAlignment: String, Sendable, Hashable {
        case start, center, end, stretch
    }

    private let direction: Direction
    private let gap: CGFloat
    private let alignment: AxisAlignment
    private let fullWidth: Bool
    @ViewBuilder private let content: () -> Content

    public init(
        direction: Direction = .column,
        gap: CGFloat = 0,
        alignment: AxisAlignment = .start,
        fullWidth: Bool = false,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.direction = direction
        self.gap = gap
        self.alignment = alignment
        self.fullWidth = fullWidth
        self.content = content
    }

    public var body: some View {
        Group {
            switch direction {
            case .row:
                HStack(alignment: rowVAlignment, spacing: gap) { content() }
            case .column:
                VStack(alignment: colHAlignment, spacing: gap) { content() }
            }
        }
        .frame(maxWidth: fullWidth ? .infinity : nil, alignment: containerAlignment)
    }

    private var rowVAlignment: VerticalAlignment {
        switch alignment {
        case .start:   return .top
        case .center:  return .center
        case .end:     return .bottom
        case .stretch: return .center
        }
    }
    private var colHAlignment: HorizontalAlignment {
        switch alignment {
        case .start:   return .leading
        case .center:  return .center
        case .end:     return .trailing
        case .stretch: return .leading
        }
    }
    private var containerAlignment: Alignment {
        switch (direction, alignment) {
        case (.column, .start):  return .topLeading
        case (.column, .center): return .top
        case (.column, .end):    return .topTrailing
        case (.row,    .start):  return .leading
        case (.row,    .center): return .center
        case (.row,    .end):    return .trailing
        default:                 return .topLeading
        }
    }
}
