import SwiftUI

/// Theme override. `auto` follows the system color scheme; `dark` /
/// `light` pin via SwiftUI's `preferredColorScheme`. Mirrors the
/// React + Vue packages exactly so the manifest describes one API.
public enum CathodeTheme: String, Sendable, Hashable {
    case auto
    case dark
    case light
}

/// Global motion intensity dial. `subtle` minimizes transforms,
/// `strong` leans into them, `none` disables movement (also triggered
/// automatically by the system's "Reduce Motion" accessibility flag —
/// see `EnvironmentValues.accessibilityReduceMotion`).
public enum CathodeMotion: String, Sendable, Hashable {
    case none
    case subtle
    case strong
}

/// Runtime settings every Cathode component reads via the
/// `cathodeSettings` environment value. Mirrors the React + Vue
/// `CathodeSettings` shape so the manifest describes the same prop
/// surface across frameworks.
public struct CathodeSettings: Sendable, Hashable {
    /// `auto` follows system color scheme; `dark` / `light` pin.
    public var theme: CathodeTheme

    /// Global motion intensity dial.
    public var motion: CathodeMotion

    /// Whether haptic feedback is enabled. Default true.
    public var haptic: Bool

    /// Whether sound effects are enabled. Default false — unexpected
    /// audio is hostile.
    public var sound: Bool

    public init(
        theme: CathodeTheme = .auto,
        motion: CathodeMotion = .strong,
        haptic: Bool = true,
        sound: Bool = false
    ) {
        self.theme = theme
        self.motion = motion
        self.haptic = haptic
        self.sound = sound
    }

    public static let `default` = CathodeSettings()
}

private struct CathodeSettingsKey: EnvironmentKey {
    static let defaultValue: CathodeSettings = .default
}

public extension EnvironmentValues {
    /// Cathode-wide settings. Reads default values when no
    /// `CathodeProvider` is in the ancestor chain — mirrors the
    /// fall-back-gracefully behavior of the React `useCathode()` hook.
    var cathodeSettings: CathodeSettings {
        get { self[CathodeSettingsKey.self] }
        set { self[CathodeSettingsKey.self] = newValue }
    }
}
