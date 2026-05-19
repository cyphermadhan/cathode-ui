import SwiftUI

/// Monospace search input with result rows beneath. Optional
/// AI semantic-search mode calls `provider.act("search", …)` and
/// reorders results from a JSON list of labels. Mirrors React + Vue
/// `<SearchBar>`.
public struct CathodeSearchBar<Item: Identifiable & Hashable>: View {
    public struct ResultLabel: Sendable {
        public let primary: String
        public let secondary: String?
        public init(primary: String, secondary: String? = nil) {
            self.primary = primary; self.secondary = secondary
        }
    }

    private let items: [Item]
    private let labelFor: (Item) -> ResultLabel
    private let placeholder: String
    private let limit: Int
    private let aiSemantic: Bool
    private let debounceMs: Int
    private let onSelect: (Item) -> Void

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme
    @Environment(\.cathodeAI) private var ai

    @State private var query: String = ""
    @State private var aiRanking: [String]? = nil
    @State private var debounceTask: Task<Void, Never>?

    public init(
        items: [Item],
        label: @escaping (Item) -> ResultLabel,
        placeholder: String = "SEARCH…",
        limit: Int = 8,
        aiSemantic: Bool = false,
        debounceMs: Int = 300,
        onSelect: @escaping (Item) -> Void
    ) {
        self.items = items
        self.labelFor = label
        self.placeholder = placeholder
        self.limit = limit
        self.aiSemantic = aiSemantic
        self.debounceMs = debounceMs
        self.onSelect = onSelect
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        let results = computeResults()

        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 8) {
                Text("⌕")
                    .font(.system(size: 14, design: .monospaced))
                    .foregroundColor(resolve(.textDim))
                TextField(placeholder, text: $query)
                    .textFieldStyle(.plain)
                    .font(.system(size: 13, design: .monospaced))
                    .foregroundColor(resolve(.text))
                    .autocorrectionDisabled(true)
                    #if os(iOS) || os(visionOS)
                    .textInputAutocapitalization(.never)
                    #endif
                    .onChange(of: query) { _, new in onQueryChanged(new) }
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
            .background(resolve(.panel))
            .overlay(Rectangle().stroke(resolve(.border), lineWidth: 1))

            if !results.isEmpty {
                VStack(alignment: .leading, spacing: 0) {
                    ForEach(results, id: \.self) { it in
                        let lbl = labelFor(it)
                        Button(action: { pick(it) }) {
                            HStack {
                                Text(lbl.primary)
                                    .font(.system(size: 12, design: .monospaced))
                                    .foregroundColor(resolve(.text))
                                Spacer(minLength: 8)
                                if let s = lbl.secondary {
                                    Text(s)
                                        .font(.system(size: 10, design: .monospaced))
                                        .foregroundColor(resolve(.textDim))
                                }
                            }
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                    }
                }
                .background(resolve(.panel))
                .overlay(Rectangle().stroke(resolve(.border), lineWidth: 1))
            }
        }
    }

    private func computeResults() -> [Item] {
        let q = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !q.isEmpty else { return [] }
        if let ranking = aiRanking {
            // AI ranking is a list of primary labels. Map back to items.
            let map = Dictionary(uniqueKeysWithValues: items.map { (labelFor($0).primary, $0) })
            return ranking.compactMap { map[$0] }.prefix(limit).map { $0 }
        }
        let lower = q.lowercased()
        return items
            .filter { item in
                let l = labelFor(item)
                if l.primary.lowercased().contains(lower) { return true }
                if let s = l.secondary, s.lowercased().contains(lower) { return true }
                return false
            }
            .prefix(limit)
            .map { $0 }
    }

    private func onQueryChanged(_ next: String) {
        aiRanking = nil
        guard aiSemantic, let provider = ai, !next.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return
        }
        debounceTask?.cancel()
        let snapshot = next
        let labels = items.map { labelFor($0).primary }
        let context: [String: Any] = ["query": snapshot, "items": labels]
        let delay = UInt64(max(0, debounceMs)) * 1_000_000
        debounceTask = Task {
            try? await Task.sleep(nanoseconds: delay)
            if Task.isCancelled { return }
            do {
                let raw = try await provider.act(intent: "search", context: context)
                if Task.isCancelled || query != snapshot { return }
                let parsed = parseList(raw)
                await MainActor.run { aiRanking = Array(parsed.prefix(limit)) }
            } catch {
                // silent fallback to substring search
            }
        }
    }

    private func pick(_ it: Item) {
        if settings.haptic { CathodeFeedback.haptic(for: .default) }
        if settings.sound  { CathodeSound.play(.click, enabled: true) }
        onSelect(it)
        query = ""
        aiRanking = nil
    }

    private func parseList(_ raw: String) -> [String] {
        let trimmed = raw.trimmingCharacters(in: .whitespaces)
        if trimmed.hasPrefix("[") {
            // Try JSON array first.
            if let data = trimmed.data(using: .utf8),
               let arr = try? JSONSerialization.jsonObject(with: data) as? [Any] {
                return arr.compactMap { $0 as? String }
            }
        }
        // Newline-delimited fallback.
        return trimmed.split(separator: "\n").map { $0.trimmingCharacters(in: .whitespaces) }.filter { !$0.isEmpty }
    }
}
