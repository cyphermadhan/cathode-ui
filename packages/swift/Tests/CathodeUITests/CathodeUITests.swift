import XCTest
import SwiftUI
@testable import CathodeUI

/// Session-1 smoke tests. The CLI build can't render SwiftUI views,
/// so these tests focus on:
///   - Component initializers don't crash
///   - Settings default + custom propagation
///   - Token shape sanity (regenerated values are usable, not nil)
///   - ColorKey resolves to distinct light vs dark variants
///
/// Visual / interaction coverage lands in Xcode previews + UI tests
/// in a later session, once Cathode UI hits an iOS app target.
final class CathodeUITests: XCTestCase {

    func testSettingsDefaults() {
        let s = CathodeSettings.default
        XCTAssertEqual(s.theme, .auto)
        XCTAssertEqual(s.motion, .strong)
        XCTAssertTrue(s.haptic)
        XCTAssertFalse(s.sound)
    }

    func testSettingsCustom() {
        let s = CathodeSettings(theme: .dark, motion: .none, haptic: false, sound: true)
        XCTAssertEqual(s.theme, .dark)
        XCTAssertEqual(s.motion, .none)
        XCTAssertFalse(s.haptic)
        XCTAssertTrue(s.sound)
    }

    func testColorKeysResolveDistinctly() {
        // Dark vs light should differ for at least the foreground text.
        XCTAssertNotEqual(ColorKey.text.dark.description, ColorKey.text.light.description)
    }

    func testTokensSpacingShape() {
        XCTAssertEqual(CathodeTokens.Spacing.md, 12)
        XCTAssertEqual(CathodeTokens.Spacing.framePad, 12)
        XCTAssertEqual(CathodeTokens.Size.touchTargetMin, 44)
    }

    func testTokensMotionDuration() {
        // Generator converts ms → seconds; 80ms = 0.080.
        XCTAssertEqual(CathodeTokens.MotionDuration.instant, 0.080, accuracy: 0.0001)
    }

    func testComponentInitializers() {
        // Just verify nothing throws during construction. Bodies aren't
        // exercised here — they need a SwiftUI host.
        _ = CathodeStack { Text("x") }
        _ = CathodeTerminalFrame(title: "PEERS") { Text("x") }
        _ = CathodeDotLeader(label: "LATENCY", value: "42 MS")
        _ = CathodePulsingDot()
        _ = CathodeBadge("LIVE", kind: .success)
        _ = CathodeButton("SAVE", variant: .primary) {}
        _ = CathodePill("LOGS", accent: .info, isActive: true) {}
    }

    func testProviderConstruction() {
        // Tree-walk builders run synchronously; just instantiate the
        // outer view to confirm the generic content-builder shape works.
        _ = CathodeProvider(theme: .dark) {
            CathodeStack {
                CathodeBadge("OK", kind: .success)
                CathodeButton("GO") {}
            }
        }
    }
}
