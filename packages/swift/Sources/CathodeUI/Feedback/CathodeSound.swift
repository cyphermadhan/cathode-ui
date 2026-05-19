import Foundation
#if canImport(AVFoundation)
@preconcurrency import AVFoundation
#endif

/// Cathode sound palette names. Mirrors the keys in `tokens.json
/// → sound`. Each pattern is a sequence of oscillator notes; the
/// React + Vue packages play them via Web Audio, Apple platforms
/// play them via AVAudioEngine + a single source node that fills
/// PCM buffers with summed sine/square/sawtooth/triangle waves.
public enum CathodeSoundPattern: String, Sendable, Hashable {
    case click, tick, confirm, warn, error, destructive
}

/// Shared engine wrapper. Created lazily on the first `play(_:)`
/// call so an app that never enables sound pays nothing.
@MainActor
public enum CathodeSound {
    public static func play(_ pattern: CathodeSoundPattern, enabled: Bool = true) {
        guard enabled else { return }
        #if canImport(AVFoundation) && (os(iOS) || os(macOS))
        SoundEngine.shared.play(pattern)
        #endif
        // visionOS / tvOS / watchOS: no-op stub. Real implementations
        // can land alongside platform-specific audio entitlements.
    }
}

#if canImport(AVFoundation) && (os(iOS) || os(macOS))

/// Internal engine. Synthesizes oscillator notes per pattern from
/// `tokens.json → sound`. Kept off the public API so apps don't
/// accidentally couple to Cathode's audio implementation.
@MainActor
private final class SoundEngine {
    static let shared = SoundEngine()
    private let engine = AVAudioEngine()
    private let sampleRate: Double = 44100

    private init() {}

    fileprivate func play(_ pattern: CathodeSoundPattern) {
        let notes = SoundPalette.notes(for: pattern)
        guard !notes.isEmpty else { return }

        if !engine.isRunning {
            // Start lazily; stop on app teardown handled by the OS.
            do { try engine.start() } catch { return }
        }

        var offsetMs: Double = 0
        for note in notes {
            let delayMs = offsetMs + (note.delayMs ?? 0)
            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(Int(delayMs))) { [weak self] in
                self?.scheduleNote(note)
            }
            offsetMs += Double(note.durationMs)
        }
    }

    private func scheduleNote(_ note: SoundNote) {
        let player = AVAudioPlayerNode()
        let format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1)!
        engine.attach(player)
        engine.connect(player, to: engine.mainMixerNode, format: format)

        let frameCount = AVAudioFrameCount(sampleRate * Double(note.durationMs) / 1000.0)
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else { return }
        buffer.frameLength = frameCount
        guard let channel = buffer.floatChannelData?[0] else { return }

        // Generate the wave + apply a 5ms attack/release envelope so
        // each note doesn't click in/out abruptly.
        let twoPi = Float.pi * 2
        let phaseStep = twoPi * Float(note.frequency) / Float(sampleRate)
        let attackFrames = min(Int(sampleRate * 0.005), Int(frameCount) / 4)
        let releaseFrames = attackFrames

        var phase: Float = 0
        for i in 0..<Int(frameCount) {
            let envelope: Float = {
                if i < attackFrames {
                    return Float(i) / Float(attackFrames)
                } else if i > Int(frameCount) - releaseFrames {
                    return Float(Int(frameCount) - i) / Float(releaseFrames)
                } else {
                    return 1.0
                }
            }()
            channel[i] = note.wave.sample(at: phase) * Float(note.gain) * envelope
            phase += phaseStep
            if phase > twoPi { phase -= twoPi }
        }

        // The completion closure runs on a render-thread; bounce back
        // to main and detach so the mixer doesn't accumulate stale
        // nodes. Use an unsafe-Sendable capture for the player ref —
        // AVAudioPlayerNode predates Swift concurrency and isn't
        // Sendable-annotated. Safe in practice: we only touch it
        // through main-actor code on either side.
        nonisolated(unsafe) let detachable = player
        player.scheduleBuffer(buffer, at: nil, options: []) { [weak self] in
            DispatchQueue.main.async {
                self?.engine.detach(detachable)
            }
        }
        player.play()
    }
}

/// Mirror of `tokens.json → sound`. Kept as code (not generated)
/// because the palette rarely changes and the unit conversions
/// (cents → frequency, etc.) live here. If the palette grows we
/// can add a `gen-sound.js` step; today this stays in sync by
/// hand against the JSON.
private enum SoundPalette {
    static func notes(for pattern: CathodeSoundPattern) -> [SoundNote] {
        switch pattern {
        case .click:       return [SoundNote(frequency: 1200, durationMs: 30, wave: .square,   gain: 0.05)]
        case .tick:        return [SoundNote(frequency: 1600, durationMs: 15, wave: .square,   gain: 0.03)]
        case .confirm:     return [
            SoundNote(frequency: 880,  durationMs: 60,  wave: .sine, gain: 0.06),
            SoundNote(frequency: 1175, durationMs: 80,  wave: .sine, gain: 0.06, delayMs: 50),
        ]
        case .warn:        return [SoundNote(frequency: 600, durationMs: 140, wave: .triangle, gain: 0.07)]
        case .error:       return [
            SoundNote(frequency: 440, durationMs: 70,  wave: .sawtooth, gain: 0.08),
            SoundNote(frequency: 330, durationMs: 120, wave: .sawtooth, gain: 0.08, delayMs: 40),
        ]
        case .destructive: return [SoundNote(frequency: 180, durationMs: 100, wave: .sawtooth, gain: 0.08)]
        }
    }
}

private struct SoundNote {
    let frequency: Double
    let durationMs: Int
    let wave: Wave
    let gain: Double
    let delayMs: Double?

    init(frequency: Double, durationMs: Int, wave: Wave, gain: Double, delayMs: Double? = nil) {
        self.frequency = frequency
        self.durationMs = durationMs
        self.wave = wave
        self.gain = gain
        self.delayMs = delayMs
    }

    enum Wave {
        case sine, square, sawtooth, triangle

        @inline(__always)
        func sample(at phase: Float) -> Float {
            let twoPi = Float.pi * 2
            switch self {
            case .sine:     return sin(phase)
            case .square:   return phase.truncatingRemainder(dividingBy: twoPi) < .pi ? 1 : -1
            case .sawtooth: return (phase.truncatingRemainder(dividingBy: twoPi) / .pi) - 1
            case .triangle:
                let p = phase.truncatingRemainder(dividingBy: twoPi)
                return p < .pi ? (2 * p / .pi - 1) : (3 - 2 * p / .pi)
            }
        }
    }
}

#endif
