// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "CathodeUI",
    platforms: [
        // iOS 17 / macOS 14 floor — Cathode primitives use the
        // two-parameter `onChange(of:_:)` and `.onKeyPress` modifiers
        // shipped in SwiftUI 5 (2023). For a 2026-era package, this is
        // the lowest cost / highest expressiveness boundary.
        .iOS(.v17),
        .macOS(.v14),
        .visionOS(.v1),
        .tvOS(.v17),
    ],
    products: [
        .library(name: "CathodeUI", targets: ["CathodeUI"]),
    ],
    targets: [
        .target(
            name: "CathodeUI",
            path: "Sources/CathodeUI"
        ),
        .testTarget(
            name: "CathodeUITests",
            dependencies: ["CathodeUI"],
            path: "Tests/CathodeUITests"
        ),
    ]
)
