import SwiftUI
#if canImport(UIKit)
import UIKit
#endif
#if canImport(AppKit)
import AppKit
#endif

/// Multi-line code display with optional language label and copy
/// button. Use for standalone code samples; inline code goes in
/// regular `Text` with monospaced font.
///
/// No syntax highlighting baked in — Cathode stays small and
/// provider-agnostic. Pass already-attributed text via the
/// `attributed` initializer if you've pre-rendered it.
public struct CathodeCodeBlock: View {
    private let code: String
    private let attributedCode: AttributedString?
    private let language: String?
    private let showCopy: Bool
    private let maxHeight: CGFloat?

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme
    @State private var copied = false

    public init(
        code: String,
        language: String? = nil,
        showCopy: Bool = true,
        maxHeight: CGFloat? = nil
    ) {
        self.code = code
        self.attributedCode = nil
        self.language = language
        self.showCopy = showCopy
        self.maxHeight = maxHeight
    }

    /// Pre-attributed (highlighted) variant — pair with a Swift
    /// highlighter (Splash, Highlightr) outside the package.
    public init(
        attributed: AttributedString,
        language: String? = nil,
        showCopy: Bool = true,
        maxHeight: CGFloat? = nil
    ) {
        self.code = String(attributed.characters)
        self.attributedCode = attributed
        self.language = language
        self.showCopy = showCopy
        self.maxHeight = maxHeight
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)

        VStack(alignment: .leading, spacing: 0) {
            if language != nil || showCopy {
                HStack {
                    if let language {
                        Text(language.uppercased())
                            .font(.system(size: 10, weight: .bold, design: .monospaced))
                            .tracking(CathodeTokens.Tracking.label)
                            .foregroundColor(resolve(.textDim))
                    }
                    Spacer()
                    if showCopy {
                        Button(action: copy) {
                            Text(copied ? "COPIED" : "COPY")
                                .font(.system(size: 10, weight: .bold, design: .monospaced))
                                .tracking(CathodeTokens.Tracking.label)
                                .foregroundColor(copied ? resolve(.success) : resolve(.textDim))
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel(copied ? "Copied" : "Copy code")
                    }
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(resolve(.bg))
                .overlay(alignment: .bottom, content: { Rectangle().fill(resolve(.border)).frame(height: 1) })
            }

            ScrollView([.vertical, .horizontal]) {
                Group {
                    if let attributedCode {
                        Text(attributedCode)
                    } else {
                        Text(code)
                            .foregroundColor(resolve(.text))
                    }
                }
                .font(.system(size: 12, design: .monospaced))
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .textSelection(.enabled)
            }
            .frame(maxHeight: maxHeight)
        }
        .background(resolve(.panel))
        .overlay(Rectangle().stroke(resolve(.border), lineWidth: 1))
    }

    private func copy() {
        #if canImport(UIKit) && !os(watchOS)
        UIPasteboard.general.string = code
        #elseif canImport(AppKit)
        let pb = NSPasteboard.general
        pb.clearContents()
        pb.setString(code, forType: .string)
        #endif

        copied = true
        if settings.haptic { CathodeFeedback.haptic(for: .default) }
        if settings.sound  { CathodeSound.play(.tick, enabled: true) }

        // Reset the label after 1.5s so the user knows the next press
        // is a fresh action. Match React + Vue timing.
        Task { @MainActor in
            try? await Task.sleep(nanoseconds: 1_500_000_000)
            copied = false
        }
    }
}
