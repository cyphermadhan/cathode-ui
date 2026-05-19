import SwiftUI

/// Square (never round) identity marker. Renders an image when `src`
/// is set, falls back to the first 1–2 letters of `name` in the
/// Cathode monospace uppercase style. Optional `status` dot in the
/// bottom-right.
public struct CathodeAvatar: View {
    public enum Size: String, Sendable, Hashable {
        case sm, md, lg

        var dimension: CGFloat {
            switch self {
            case .sm: return 24
            case .md: return 32
            case .lg: return 48
            }
        }
        var fontSize: CGFloat {
            switch self {
            case .sm: return 10
            case .md: return 12
            case .lg: return 16
            }
        }
    }

    public enum Status: String, Sendable, Hashable {
        case online, away, busy, offline
    }

    public enum Accent: String, Sendable, Hashable {
        case neutral, info, success, warning, danger
        case amber, pink, purple, teal, grey
    }

    private let name: String?
    private let imageURL: URL?
    private let alt: String?
    private let size: Size
    private let status: Status?
    private let accent: Accent

    @Environment(\.cathodeSettings) private var settings
    @Environment(\.colorScheme) private var systemScheme

    public init(
        name: String? = nil,
        imageURL: URL? = nil,
        alt: String? = nil,
        size: Size = .md,
        status: Status? = nil,
        accent: Accent = .info
    ) {
        self.name = name
        self.imageURL = imageURL
        self.alt = alt
        self.size = size
        self.status = status
        self.accent = accent
    }

    public var body: some View {
        let resolve = ResolvedColor(theme: settings.theme, systemScheme: systemScheme)
        let bg = resolve(accentKey)
        let fg = resolve(.bg)

        ZStack(alignment: .bottomTrailing) {
            if let imageURL {
                AsyncImage(url: imageURL) { image in
                    image.resizable().aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle().fill(resolve(.panel))
                }
                .frame(width: size.dimension, height: size.dimension)
                .clipped()
                .accessibilityLabel(alt ?? name ?? "")
            } else {
                Rectangle()
                    .fill(bg)
                    .frame(width: size.dimension, height: size.dimension)
                    .overlay(
                        Text(initials)
                            .font(.system(size: size.fontSize, weight: .bold, design: .monospaced))
                            .foregroundColor(fg)
                    )
                    .accessibilityLabel(alt ?? name ?? "")
            }
            if let status {
                Rectangle()
                    .fill(statusColor(status, resolve: resolve))
                    .frame(width: 8, height: 8)
                    .overlay(Rectangle().stroke(resolve(.bg), lineWidth: 1))
                    .accessibilityLabel("Status: \(status.rawValue)")
            }
        }
    }

    private var initials: String {
        guard let name = name?.trimmingCharacters(in: .whitespacesAndNewlines), !name.isEmpty else { return "?" }
        let parts = name.split(separator: " ").prefix(2)
        return parts.compactMap { $0.first.map(String.init) }.joined().uppercased()
    }

    private var accentKey: ColorKey {
        switch accent {
        case .neutral: return .border
        case .info:    return .info
        case .success: return .success
        case .warning: return .warning
        case .danger:  return .danger
        case .amber:   return .amber
        case .pink:    return .pink
        case .purple:  return .purple
        case .teal:    return .teal
        case .grey:    return .grey
        }
    }

    private func statusColor(_ s: Status, resolve: ResolvedColor) -> Color {
        switch s {
        case .online:  return resolve(.success)
        case .away:    return resolve(.warning)
        case .busy:    return resolve(.danger)
        case .offline: return resolve(.textFaint)
        }
    }
}
