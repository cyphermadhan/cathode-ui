import SwiftUI

/// Label + input + optional hint/error scaffold. SwiftUI's
/// accessibility model is per-element (no aria-labelledby cross-link),
/// so this view provides visual structure; the inner input still
/// carries its own accessibility label for VoiceOver. Mirrors the
/// React + Vue `<FormField>` API.
public struct CathodeFormField<Content: View>: View {
    private let label: String
    private let hint: String?
    private let error: String?
    private let isRequired: Bool
    @ViewBuilder private let content: () -> Content

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(
        label: String,
        hint: String? = nil,
        error: String? = nil,
        isRequired: Bool = false,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.label = label
        self.hint = hint
        self.error = error
        self.isRequired = isRequired
        self.content = content
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)

        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 0) {
                Text(label.uppercased())
                    .font(.system(size: 10, weight: .bold, design: .monospaced))
                    .tracking(CathodeTokens.Tracking.label)
                    .foregroundColor(error != nil ? resolve(.danger) : resolve(.textDim))
                if isRequired {
                    Text(" *")
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                        .foregroundColor(resolve(.danger))
                }
            }
            content()
            if let error {
                Text(error)
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundColor(resolve(.danger))
                    .accessibilityAddTraits(.isStaticText)
            } else if let hint {
                Text(hint)
                    .font(.system(size: 10, design: .monospaced))
                    .foregroundColor(resolve(.textDim))
            }
        }
        .accessibilityElement(children: .contain)
    }
}
