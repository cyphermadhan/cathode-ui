import SwiftUI

/// Root provider for Cathode UI. Wrap your app's tree to make the
/// Cathode settings (theme / motion / haptic / sound) available via
/// `@Environment(\.cathodeSettings)` to every descendant.
///
/// Mirrors the `<CathodeProvider>` from `@cathode-ui/react` and
/// `@cathode-ui/vue` — same prop names, same defaults. `theme: .auto`
/// follows the system; `.dark` / `.light` pin via SwiftUI's
/// `preferredColorScheme`.
///
/// Usage:
///     @main
///     struct MyApp: App {
///         var body: some Scene {
///             WindowGroup {
///                 CathodeProvider(theme: .dark, motion: .strong) {
///                     ContentView()
///                 }
///             }
///         }
///     }
public struct CathodeProvider<Content: View>: View {
    private let settings: CathodeSettings
    private let ai: (any CathodeAIProvider)?
    @ViewBuilder private let content: () -> Content

    public init(
        theme: CathodeTheme = .auto,
        motion: CathodeMotion = .strong,
        haptic: Bool = true,
        sound: Bool = false,
        ai: (any CathodeAIProvider)? = nil,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.settings = CathodeSettings(
            theme: theme,
            motion: motion,
            haptic: haptic,
            sound: sound
        )
        self.ai = ai
        self.content = content
    }

    public var body: some View {
        content()
            .environment(\.cathodeSettings, settings)
            .environment(\.cathodeAI, ai)
            .preferredColorScheme(preferredScheme)
    }

    private var preferredScheme: ColorScheme? {
        switch settings.theme {
        case .auto:  return nil
        case .dark:  return .dark
        case .light: return .light
        }
    }
}

// MARK: - Color resolution

/// Resolve a Cathode token color for the current theme. `auto` reads
/// the SwiftUI color scheme via `@Environment(\.colorScheme)` so the
/// helper picks the matching palette automatically.
///
/// `Color` literals from `CathodeTokens` are not main-actor isolated,
/// and neither this function nor its inputs touch UI state directly —
/// keep it nonisolated so `ResolvedColor.callAsFunction` (used inside
/// View bodies that may or may not be MainActor-typed) compiles.
@inline(__always)
internal func resolveColor(
    _ keyPath: ColorKey,
    theme: CathodeTheme,
    systemScheme: ColorScheme
) -> Color {
    let useDark: Bool = {
        switch theme {
        case .auto:  return systemScheme == .dark
        case .dark:  return true
        case .light: return false
        }
    }()
    return useDark ? keyPath.dark : keyPath.light
}

/// Strongly-typed handle to a Cathode color slot. Each case projects a
/// `dark` and `light` value from the generated `CathodeTokens.Color`
/// namespace. Adding a new color here is a one-line change.
public enum ColorKey: Sendable, Hashable {
    case bg
    case panel
    case border
    case text
    case textDim
    case textFaint
    case danger, dangerDeep, warning, success, info, accent
    case amber, pink, purple, teal, grey

    var dark: Color {
        switch self {
        case .bg:         return CathodeTokens.Palette.Dark.bg
        case .panel:      return CathodeTokens.Palette.Dark.panel
        case .border:     return CathodeTokens.Palette.Dark.border
        case .text:       return CathodeTokens.Palette.Dark.text
        case .textDim:    return CathodeTokens.Palette.Dark.textDim
        case .textFaint:  return CathodeTokens.Palette.Dark.textFaint
        case .danger:     return CathodeTokens.Palette.Dark.danger
        case .dangerDeep: return CathodeTokens.Palette.Dark.dangerDeep
        case .warning:    return CathodeTokens.Palette.Dark.warning
        case .success:    return CathodeTokens.Palette.Dark.success
        case .info:       return CathodeTokens.Palette.Dark.info
        case .accent:     return CathodeTokens.Palette.Dark.accent
        case .amber:      return CathodeTokens.Palette.Dark.amber
        case .pink:       return CathodeTokens.Palette.Dark.pink
        case .purple:     return CathodeTokens.Palette.Dark.purple
        case .teal:       return CathodeTokens.Palette.Dark.teal
        case .grey:       return CathodeTokens.Palette.Dark.grey
        }
    }
    var light: Color {
        switch self {
        case .bg:         return CathodeTokens.Palette.Light.bg
        case .panel:      return CathodeTokens.Palette.Light.panel
        case .border:     return CathodeTokens.Palette.Light.border
        case .text:       return CathodeTokens.Palette.Light.text
        case .textDim:    return CathodeTokens.Palette.Light.textDim
        case .textFaint:  return CathodeTokens.Palette.Light.textFaint
        case .danger:     return CathodeTokens.Palette.Light.danger
        case .dangerDeep: return CathodeTokens.Palette.Light.dangerDeep
        case .warning:    return CathodeTokens.Palette.Light.warning
        case .success:    return CathodeTokens.Palette.Light.success
        case .info:       return CathodeTokens.Palette.Light.info
        case .accent:     return CathodeTokens.Palette.Light.accent
        case .amber:      return CathodeTokens.Palette.Light.amber
        case .pink:       return CathodeTokens.Palette.Light.pink
        case .purple:     return CathodeTokens.Palette.Light.purple
        case .teal:       return CathodeTokens.Palette.Light.teal
        case .grey:       return CathodeTokens.Palette.Light.grey
        }
    }
}

/// Convenience for components: read the appropriate theme variant of
/// a Cathode color slot from inside a `View`.
public struct CathodeColor: View {
    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme
    private let key: ColorKey

    public init(_ key: ColorKey) { self.key = key }

    public var body: some View {
        Rectangle().fill(resolveColor(key, theme: settings.theme, systemScheme: systemScheme))
    }
}

/// Internal helper: components that need the resolved Color (rather
/// than a View) read the environment values directly. Keep public-API
/// surface small.
internal struct ResolvedColor {
    let theme: CathodeTheme
    let systemScheme: ColorScheme
    func callAsFunction(_ key: ColorKey) -> Color {
        resolveColor(key, theme: theme, systemScheme: systemScheme)
    }
}
