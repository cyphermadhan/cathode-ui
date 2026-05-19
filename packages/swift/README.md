# CathodeUI (Swift)

Retro-future **SwiftUI** design system. Sibling of [`@cathode-ui/react`](https://www.npmjs.com/package/@cathode-ui/react) and [`@cathode-ui/vue`](https://www.npmjs.com/package/@cathode-ui/vue) — same 45-primitive manifest, same tokens, same motion/haptic/sound philosophy. Targets iOS 16+ / macOS 13+ / visionOS 1+ / tvOS 16+.

By [Madhan Raj](https://www.linkedin.com/in/cyphermadhan/).

**[Docs →](https://cyphermadhan.github.io/cathode-ui/)** · **[React →](https://www.npmjs.com/package/@cathode-ui/react)** · **[Vue →](https://www.npmjs.com/package/@cathode-ui/vue)**

---

> ## ⚠️ Work in progress — Phase 3
>
> Sessions 1 + 2 ship **17 of 45 primitives** + the full foundation:
>
> - **Layout / display:** `CathodeTerminalFrame`, `CathodeStack`,
>   `CathodeDotLeader`, `CathodePulsingDot`, `CathodeBadge`
> - **Buttons:** `CathodeButton`, `CathodePill`
> - **Forms (10):** `CathodeToggle`, `CathodeCheckbox`,
>   `CathodeRadioGroup`, `CathodeSelect`, `CathodeCounter`,
>   `CathodeTextField` (with optional AI ghost-text suggest),
>   `CathodeTextArea`, `CathodeFormField`, `CathodeSearchBar` (with
>   optional semantic AI ranking), `CathodeChips`
> - **Foundation:** `CathodeProvider`, `CathodeSettings`,
>   `CathodeAIProvider` protocol + environment, `CathodeSound`
>   (AVAudioEngine on iOS/macOS), `CathodeFeedback`
>   (`UIImpactFeedbackGenerator`)
>
> The remaining 28 (data cluster, navigation, feedback, overlays,
> retro accents, `CathodeChat`) port session-by-session.
>
> AI agents querying [`@cathode-ui/mcp`](https://www.npmjs.com/package/@cathode-ui/mcp)
> with `framework: "swiftui"` get SwiftUI imports + snippets for the
> 17 shipped components and a clear "React fallback — SwiftUI port
> pending" note for the rest.

---

## Install

Swift Package Manager. Add to `Package.swift`:

```swift
.package(url: "https://github.com/cyphermadhan/cathode-ui.git", from: "0.1.0")
```

…and depend on the `CathodeUI` target. (The Swift package lives at the
monorepo subpath `packages/swift`; SPM resolves it via the root
`Package.swift` once that's added — see release notes.)

Or in Xcode: **File → Add Packages…** with the same Git URL.

## Setup

```swift
import SwiftUI
import CathodeUI

@main
struct MyApp: App {
    var body: some Scene {
        WindowGroup {
            CathodeProvider(theme: .dark, motion: .strong) {
                ContentView()
            }
        }
    }
}

struct ContentView: View {
    @State private var count = 0

    var body: some View {
        CathodeTerminalFrame(title: "TELEMETRY", accent: .info) {
            CathodeStack(gap: 8) {
                CathodeStack(direction: .row, gap: 8, alignment: .center) {
                    CathodePulsingDot()
                    Text("LIVE")
                }
                CathodeDotLeader(label: "LATENCY", value: "42 MS")
                CathodeButton("SAVE", variant: .primary) { count += 1 }
            }
        }
        .padding()
    }
}
```

`CathodeProvider` accepts `theme` (`.auto` / `.dark` / `.light`),
`motion` (`.none` / `.subtle` / `.strong`), `haptic: Bool`, and
`sound: Bool`. Theme `.auto` follows the system color scheme; `.dark`
/ `.light` pin via SwiftUI's `preferredColorScheme`.

## What's shipped today

| Component | Status |
|---|---|
| `CathodeProvider` + `CathodeSettings` | ✅ theme + motion + haptic + sound + ai |
| `CathodeAIProvider` (protocol) | ✅ async streaming + act |
| `CathodeSound` | ✅ AVAudioEngine click / tick / confirm / warn / error / destructive on iOS + macOS; no-op stub on tvOS / visionOS / watchOS |
| `CathodeTerminalFrame` | ✅ accent border + inset title |
| `CathodeStack` | ✅ row / column, gap, alignment, fullWidth |
| `CathodeDotLeader` | ✅ label + dots + value, valueColor override |
| `CathodePulsingDot` | ✅ animated, respects motion + reduce-motion |
| `CathodeBadge` | ✅ kind + variant (solid/outline) + size |
| `CathodeButton` | ✅ variants, press scale, iOS UIImpactFeedbackGenerator haptics, sound on tap |
| `CathodePill` | ✅ accent + active state, press scale |
| `CathodeToggle` | ✅ binding-driven, sliding knob, accent variants |
| `CathodeCheckbox` | ✅ tri-state (on / off / indeterminate) |
| `CathodeRadioGroup<Value>` | ✅ generic, horizontal/vertical, accent |
| `CathodeSelect<Value>` | ✅ wraps SwiftUI Menu with Cathode chrome |
| `CathodeCounter` | ✅ `[−]  LABEL VALUE  [+]` rocker with min/max/step |
| `CathodeTextField` | ✅ ghost-text AI suggest (Tab to accept on macOS 14+/iOS 17+) |
| `CathodeTextArea` | ✅ multi-line, optional max-length counter |
| `CathodeFormField<Content>` | ✅ label + hint + error + required-marker |
| `CathodeSearchBar<Item>` | ✅ substring + semantic-AI search modes |
| `CathodeChips` | ✅ groups, scrolling row, dividers |
| `CathodeTokens` | ✅ generated from `tokens.json` — Palette (dark + light), Spacing, Size, TypeScale, Tracking, MotionDuration, MotionScale, Haptic, Breakpoint |

## SwiftUI vs React/Vue API deltas

Same component intent, idiomatic SwiftUI surface:

- **Types prefixed `Cathode`** — avoids collision with SwiftUI's own `Button`, `Stack`, `Badge`, etc.
- **No `children` prop** — uses SwiftUI `@ViewBuilder` content slots.
- **No `onClick` prop** — last argument is an `action: () -> Void` closure (idiomatic SwiftUI).
- **Theme via environment, not provide/inject or context** — `@Environment(\.cathodeSettings)`.
- **Color tokens are `SwiftUI.Color` literals**, not CSS variables — read via `CathodeTokens.Palette.Dark.success` (or the theme-aware `ColorKey` enum).
- **Haptic firing is real** — uses `UIImpactFeedbackGenerator` on iOS where the web stack falls back to `navigator.vibrate` (which iOS Safari ignores).
- **Sound** — stub on Apple platforms in session 1; AVAudioEngine integration ports in session 2.

## Author

Built by **[Madhan Raj](https://www.linkedin.com/in/cyphermadhan/)**.

## License

MIT.
