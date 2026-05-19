import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

/// General-purpose Cathode button. Variants:
///   - `default`  — panel fill, border text (conservative option)
///   - `primary`  — success-green fill, inverted text (go, submit)
///   - `danger`   — danger-red fill, inverted text (destructive)
///
/// Press scale honors the global `motion` setting; haptic feedback
/// (`UIImpactFeedbackGenerator` on iOS) fires on tap when
/// `settings.haptic` is true. Sound is a no-op stub on Apple
/// platforms in session 1 — the AVAudioEngine integration ports in
/// session 2.
public struct CathodeButton: View {
    public enum Variant: String, Sendable, Hashable {
        case `default`, primary, danger
    }

    private let title: String
    private let variant: Variant
    private let isDisabled: Bool
    private let action: () -> Void

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme
    @State private var pressed = false

    public init(
        _ title: String,
        variant: Variant = .default,
        isDisabled: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.variant = variant
        self.isDisabled = isDisabled
        self.action = action
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        let fg: Color = {
            switch variant {
            case .default: return resolve(.text)
            case .primary: return resolve(.bg)
            case .danger:  return resolve(.bg)
            }
        }()
        let bg: Color = {
            switch variant {
            case .default: return resolve(.panel)
            case .primary: return resolve(.success)
            case .danger:  return resolve(.danger)
            }
        }()
        let border: Color = {
            switch variant {
            case .default: return resolve(.border)
            case .primary: return resolve(.success)
            case .danger:  return resolve(.danger)
            }
        }()
        let scale: CGFloat = pressed ? pressedScale : 1.0

        Button(action: tapped) {
            Text(title.uppercased())
                .font(.system(size: 12, weight: .bold, design: .monospaced))
                .tracking(CathodeTokens.Tracking.label)
                .foregroundColor(fg)
                .padding(.horizontal, 12)
                .padding(.vertical, 7)
                .frame(minHeight: CathodeTokens.Size.touchTargetMin / 1.5)
                .background(bg)
                .overlay(Rectangle().stroke(border, lineWidth: CathodeTokens.Size.borderWidth))
        }
        .buttonStyle(.plain)
        .disabled(isDisabled)
        .opacity(isDisabled ? 0.5 : 1.0)
        .scaleEffect(scale)
        .animation(
            settings.motion == .none
                ? nil
                : .easeOut(duration: CathodeTokens.MotionDuration.instant),
            value: pressed
        )
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in pressed = true }
                .onEnded   { _ in pressed = false }
        )
    }

    private var pressedScale: CGFloat {
        switch settings.motion {
        case .none:   return 1.0
        case .subtle: return 0.99
        case .strong: return CathodeTokens.MotionScale.press
        }
    }

    private func tapped() {
        guard !isDisabled else { return }
        if settings.haptic {
            CathodeFeedback.haptic(for: variant)
        }
        if settings.sound {
            // Variant → sound pattern, matching the React/Vue mapping:
            // primary → confirm (rising two-tone), danger →
            // destructive (single low harsh note), default → click.
            let pattern: CathodeSoundPattern = {
                switch variant {
                case .primary: return .confirm
                case .danger:  return .destructive
                case .default: return .click
                }
            }()
            CathodeSound.play(pattern, enabled: true)
        }
        action()
    }
}

/// Internal feedback helpers. iOS uses `UIImpactFeedbackGenerator`;
/// other platforms (macOS / visionOS / tvOS) no-op gracefully.
internal enum CathodeFeedback {
    static func haptic(for variant: CathodeButton.Variant) {
        #if canImport(UIKit) && !os(watchOS)
        // Map Cathode variants to UIKit impact styles. Same intent
        // mapping as the React/Vue feedback controllers, just via
        // platform-native APIs instead of `navigator.vibrate`.
        let style: UIImpactFeedbackGenerator.FeedbackStyle = {
            switch variant {
            case .primary: return .medium
            case .danger:  return .heavy
            case .default: return .light
            }
        }()
        DispatchQueue.main.async {
            let g = UIImpactFeedbackGenerator(style: style)
            g.prepare()
            g.impactOccurred()
        }
        #endif
    }
}
