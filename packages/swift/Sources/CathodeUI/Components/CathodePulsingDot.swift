import SwiftUI

/// Small square that pulses in place to signal "something is
/// happening" without a full progress indicator. Uses SwiftUI's
/// `repeatForever` animation; respects the global motion intensity
/// (none → static dot, subtle/strong → animated).
public struct CathodePulsingDot: View {
    private let color: Color?
    private let size: CGFloat

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var pulsing = false

    public init(color: Color? = nil, size: CGFloat = 8) {
        self.color = color
        self.size = size
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        let fill = color ?? resolve(.text)
        let animateOK = !reduceMotion && settings.motion != .none

        Rectangle()
            .fill(fill)
            .frame(width: size, height: size)
            .opacity(animateOK ? (pulsing ? 0.4 : 1.0) : 1.0)
            .animation(
                animateOK
                    ? .easeInOut(duration: CathodeTokens.MotionDuration.settled).repeatForever(autoreverses: true)
                    : nil,
                value: pulsing
            )
            .onAppear { if animateOK { pulsing = true } }
            .accessibilityHidden(true)
    }
}
