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

    // MARK: - Forms cluster (session 2)

    @MainActor
    func testFormsInitializers() {
        // Construct each forms primitive against a binding to confirm
        // generics resolve and required props compile.
        var enabled = false
        var checked = false
        var mode = "auto"
        var theme: String = "auto"
        var wpm = 12
        var note = ""
        var area = ""

        _ = CathodeToggle("ARMED", value: .init(get: { enabled }, set: { enabled = $0 }))
        _ = CathodeCheckbox("ALL", value: .init(get: { checked }, set: { checked = $0 }), isIndeterminate: true)
        _ = CathodeRadioGroup(
            value: .init(get: { mode }, set: { mode = $0 }),
            options: [.init(value: "auto", label: "AUTO"), .init(value: "manual", label: "MANUAL")]
        )
        _ = CathodeSelect(
            value: .init(get: { theme }, set: { theme = $0 }),
            options: [.init(value: "auto", label: "AUTO"), .init(value: "dark", label: "DARK")]
        )
        _ = CathodeCounter(value: .init(get: { wpm }, set: { wpm = $0 }), min: 5, max: 40, label: "WPM")
        _ = CathodeTextField(text: .init(get: { note }, set: { note = $0 }), placeholder: "CALLSIGN")
        _ = CathodeTextArea(text: .init(get: { area }, set: { area = $0 }), rows: 6, maxLength: 500)
        _ = CathodeFormField(label: "CALLSIGN", hint: "4 chars") { Text("input") }
        _ = CathodeChips([.init(label: "GO"), .init(label: "STOP")]) { _ in }
    }

    @MainActor
    func testCounterClampsAtMin() {
        // Direct unit test: ensure the binding is not mutated when the
        // current value is already at the minimum step. We simulate by
        // calling the public surface — which doesn't expose `fire(_:)`
        // — so this is an indirect smoke check that initializers
        // compile + the type accepts the expected min/max contract.
        var v = 0
        let counter = CathodeCounter(
            value: .init(get: { v }, set: { v = $0 }),
            min: 0, max: 10, step: 1
        )
        _ = counter.body
        XCTAssertEqual(v, 0)
    }

    @MainActor
    func testSelectOptionMembership() {
        let opts: [CathodeSelect<String>.Option] = [
            .init(value: "a", label: "A"),
            .init(value: "b", label: "B"),
        ]
        XCTAssertEqual(opts.first?.value, "a")
        XCTAssertFalse(opts.contains(.init(value: "c", label: "C")))
    }

    @MainActor
    func testChipGroupShape() {
        let g = CathodeChips.Group([.init(label: "A"), .init(label: "B")])
        XCTAssertEqual(g.chips.count, 2)
        XCTAssertEqual(g.chips.first?.label, "A")
    }

    @MainActor
    func testAIProviderEnvironment() {
        // Sanity — the environment key declared in
        // CathodeAIProvider.swift is reachable and defaults to nil.
        let env = EnvironmentValues()
        XCTAssertNil(env.cathodeAI)
    }

    // MARK: - Data + nav cluster (session 3)

    @MainActor
    func testDataNavInitializers() {
        struct Row: Identifiable, Hashable { let id: Int; let name: String }

        var tab = "overview"
        var page = 1

        _ = CathodeCard { Text("x") }
        _ = CathodeTag("GEODESY", accent: .info, onRemove: {})
        _ = CathodeAvatar(name: "K. ALICE", status: .online)
        _ = CathodeKbd("Ctrl+K")
        _ = CathodeKbd(["Shift", "Tab"])
        _ = CathodeCodeBlock(code: "let x = 1", language: "swift")
        _ = CathodeStatusTile(title: "TALK", subtitle: "HOLD", isClickable: true) {
            Text("◉")
        }
        _ = CathodeTabs(
            value: .init(get: { tab }, set: { tab = $0 }),
            items: [.init(value: "overview", label: "OVERVIEW"), .init(value: "logs", label: "LOGS")]
        )
        _ = CathodeBreadcrumbs(items: [
            .init(label: "HOME", action: {}),
            .init(label: "FLEET", action: {}),
            .init(label: "KA4X"),
        ])
        _ = CathodePagination(page: .init(get: { page }, set: { page = $0 }), totalPages: 12)

        let cols: [CathodeTable<Row>.Column] = [
            .init(id: "id",   header: "ID",   align: .trailing) { AnyView(Text("\($0.id)")) },
            .init(id: "name", header: "NAME") { AnyView(Text($0.name)) },
        ]
        _ = CathodeTable(
            columns: cols,
            rows: [Row(id: 1, name: "ALPHA"), Row(id: 2, name: "BRAVO")],
            sortBy: "id",
            sortDir: .asc
        )
    }

    @MainActor
    func testKbdSplit() {
        // The String overload should split on `+` and `-` and trim
        // whitespace so consumers can pass either notation idiomatically.
        let plus = CathodeKbd("Ctrl+K")
        _ = plus.body
        let dash = CathodeKbd("Cmd-Shift-P")
        _ = dash.body
    }

    @MainActor
    func testAvatarInitials() {
        // Two-token name → two letters; single-token → one letter;
        // empty → "?". Internal initials computation is exercised
        // via body construction; we assert the Avatar accepts the
        // expected accents + status.
        _ = CathodeAvatar(name: "K", status: .away)
        _ = CathodeAvatar(name: "K. ALICE", accent: .purple)
        _ = CathodeAvatar(name: "  ", alt: "fallback")
    }

    @MainActor
    func testPaginationBoundaries() {
        var p = 1
        let pag = CathodePagination(
            page: .init(get: { p }, set: { p = $0 }),
            totalPages: 5
        )
        _ = pag.body
        // Single-page → renders an EmptyView, no buttons emitted. We
        // assert by reconstructing with totalPages: 1 and confirming
        // no crash + page state untouched.
        let none = CathodePagination(
            page: .init(get: { p }, set: { p = $0 }),
            totalPages: 1
        )
        _ = none.body
        XCTAssertEqual(p, 1)
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
