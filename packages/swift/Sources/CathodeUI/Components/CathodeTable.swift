import SwiftUI

/// Terminal-style tabular display. Uppercase headers, monospace
/// values, subtle row dividers. Generic over Identifiable rows;
/// columns describe each visible field plus an optional cell
/// renderer for non-string content.
///
/// Sorting is controlled — pass `sortBy` + `sortDir` and react to
/// `onSortChange`. Cathode keeps the sort logic on the consumer side
/// so the table is decoupled from data semantics.
public struct CathodeTable<Row: Identifiable & Hashable>: View {
    public enum SortDirection: String, Sendable, Hashable { case asc, desc }
    public enum Align: String, Sendable, Hashable { case leading, center, trailing }

    public struct Column: Identifiable, Hashable {
        public let id: String
        public let header: String
        public let align: Align
        public let isSortable: Bool
        public let render: (Row) -> AnyView

        public init(
            id: String,
            header: String,
            align: Align = .leading,
            isSortable: Bool = false,
            render: @escaping (Row) -> AnyView
        ) {
            self.id = id; self.header = header
            self.align = align; self.isSortable = isSortable
            self.render = render
        }

        // Hash on id only so closure presence doesn't matter.
        public func hash(into hasher: inout Hasher) { hasher.combine(id) }
        public static func == (lhs: Column, rhs: Column) -> Bool { lhs.id == rhs.id }
    }

    private let columns: [Column]
    private let rows: [Row]
    private let sortBy: String?
    private let sortDir: SortDirection
    private let emptyText: String
    private let onSortChange: (String, SortDirection) -> Void
    private let onRowSelect: ((Row) -> Void)?

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(
        columns: [Column],
        rows: [Row],
        sortBy: String? = nil,
        sortDir: SortDirection = .asc,
        emptyText: String = "NO DATA",
        onSortChange: @escaping (String, SortDirection) -> Void = { _, _ in },
        onRowSelect: ((Row) -> Void)? = nil
    ) {
        self.columns = columns
        self.rows = rows
        self.sortBy = sortBy
        self.sortDir = sortDir
        self.emptyText = emptyText
        self.onSortChange = onSortChange
        self.onRowSelect = onRowSelect
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)

        VStack(alignment: .leading, spacing: 0) {
            // Header row
            HStack(spacing: 0) {
                ForEach(columns) { col in
                    headerCell(col, resolve: resolve)
                }
            }
            .padding(.vertical, 8)
            .background(resolve(.panel))
            .overlay(alignment: .bottom) {
                Rectangle().fill(resolve(.border)).frame(height: 1)
            }

            if rows.isEmpty {
                Text(emptyText.uppercased())
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundColor(resolve(.textDim))
                    .padding(20)
                    .frame(maxWidth: .infinity)
            } else {
                ForEach(rows) { row in
                    rowView(row, resolve: resolve)
                }
            }
        }
        .overlay(Rectangle().stroke(resolve(.border), lineWidth: 1))
    }

    @ViewBuilder
    private func headerCell(_ col: Column, resolve: ResolvedColor) -> some View {
        let content = HStack(spacing: 4) {
            Text(col.header.uppercased())
                .font(.system(size: 10, weight: .bold, design: .monospaced))
                .tracking(CathodeTokens.Tracking.label)
                .foregroundColor(resolve(.textDim))
            if col.isSortable, sortBy == col.id {
                Text(sortDir == .asc ? "▴" : "▾")
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundColor(resolve(.text))
            }
        }
        .padding(.horizontal, 10)
        .frame(maxWidth: .infinity, alignment: alignmentFor(col.align))

        if col.isSortable {
            Button(action: { toggleSort(col) }) {
                content.contentShape(Rectangle())
            }
            .buttonStyle(.plain)
        } else {
            content
        }
    }

    @ViewBuilder
    private func rowView(_ row: Row, resolve: ResolvedColor) -> some View {
        let content = HStack(spacing: 0) {
            ForEach(columns) { col in
                col.render(row)
                    .font(.system(size: 12, design: .monospaced))
                    .foregroundColor(resolve(.text))
                    .padding(.horizontal, 10)
                    .frame(maxWidth: .infinity, alignment: alignmentFor(col.align))
            }
        }
        .padding(.vertical, 6)
        .overlay(alignment: .bottom) {
            Rectangle().fill(resolve(.border).opacity(0.5)).frame(height: 1)
        }

        if let onRowSelect {
            Button(action: { onRowSelect(row) }) {
                content.contentShape(Rectangle())
            }
            .buttonStyle(.plain)
        } else {
            content
        }
    }

    private func alignmentFor(_ a: Align) -> Alignment {
        switch a {
        case .leading:  return .leading
        case .center:   return .center
        case .trailing: return .trailing
        }
    }

    private func toggleSort(_ col: Column) {
        let next: SortDirection = (sortBy == col.id && sortDir == .asc) ? .desc : .asc
        onSortChange(col.id, next)
    }
}
