// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "CathodeUI",
    platforms: [
        .iOS(.v16),
        .macOS(.v13),
        .visionOS(.v1),
        .tvOS(.v16),
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
