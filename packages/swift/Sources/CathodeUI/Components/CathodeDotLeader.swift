import SwiftUI

/// `LABEL …………………… VALUE` row, the classic printer/terminal dot leader.
/// The dots fill the space between label and value via a clipped
/// middle text span. Framework-mirror of React + Vue `<DotLeader>`.
public struct CathodeDotLeader: View {
    private let label: String
    private let value: String
    private let valueColor: Color?

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(label: String, value: String, valueColor: Color? = nil) {
        self.label = label
        self.value = value
        self.valueColor = valueColor
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        HStack(alignment: .firstTextBaseline, spacing: 6) {
            Text(label.uppercased())
                .font(.system(size: 11, design: .monospaced))
                .tracking(CathodeTokens.Tracking.label)
                .foregroundColor(resolve(.textDim))
                .lineLimit(1)
            Text(String(repeating: ".", count: 200))
                .font(.system(size: 11, design: .monospaced))
                .tracking(2)
                .foregroundColor(resolve(.textFaint))
                .lineLimit(1)
                .truncationMode(.tail)
                .frame(maxWidth: .infinity, alignment: .leading)
                .clipped()
            Text(value)
                .font(.system(size: 11, weight: .semibold, design: .monospaced))
                .foregroundColor(valueColor ?? resolve(.text))
                .lineLimit(1)
        }
    }
}
