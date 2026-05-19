import SwiftUI

/// Horizontally scrolling row of tappable preset chips. Pure
/// triggers — state lives in the parent. Mirrors React + Vue
/// `<Chips>`. Pass either a flat list (`groups: [.flat([...])]`)
/// or actual groups (`[.flat([...]), .flat([...])]`); a thin
/// vertical divider renders between groups.
public struct CathodeChips: View {
    public struct Chip: Hashable {
        public let label: String
        public let value: String?
        public let isDisabled: Bool
        public init(label: String, value: String? = nil, isDisabled: Bool = false) {
            self.label = label; self.value = value; self.isDisabled = isDisabled
        }
    }

    public struct Group: Hashable {
        public let chips: [Chip]
        public init(_ chips: [Chip]) { self.chips = chips }
    }

    private let groups: [Group]
    private let onSelect: (Chip) -> Void

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(_ chips: [Chip], onSelect: @escaping (Chip) -> Void) {
        self.groups = [Group(chips)]
        self.onSelect = onSelect
    }
    public init(groups: [Group], onSelect: @escaping (Chip) -> Void) {
        self.groups = groups
        self.onSelect = onSelect
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)

        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(Array(groups.enumerated()), id: \.offset) { gi, group in
                    ForEach(group.chips, id: \.self) { chip in
                        Button(action: { tap(chip) }) {
                            Text(chip.label.uppercased())
                                .font(.system(size: 11, weight: .bold, design: .monospaced))
                                .tracking(CathodeTokens.Tracking.label)
                                .foregroundColor(resolve(.text))
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(resolve(.panel))
                                .overlay(Rectangle().stroke(resolve(.border), lineWidth: 1))
                        }
                        .buttonStyle(.plain)
                        .disabled(chip.isDisabled)
                        .opacity(chip.isDisabled ? 0.5 : 1.0)
                    }
                    if gi < groups.count - 1 {
                        Rectangle()
                            .fill(resolve(.border))
                            .frame(width: 1, height: 20)
                            .padding(.horizontal, 4)
                    }
                }
            }
            .padding(.vertical, 2)
        }
    }

    private func tap(_ chip: Chip) {
        guard !chip.isDisabled else { return }
        if settings.haptic { CathodeFeedback.haptic(for: .default) }
        if settings.sound  { CathodeSound.play(.click, enabled: true) }
        onSelect(chip)
    }
}
