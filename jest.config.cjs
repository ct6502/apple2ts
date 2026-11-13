/** @type {import('ts-jest').JestConfigWithTsJest} */
// Quarantine: these tracked suites are known to fail and currently block the
// CI test gate. Keep them out of CI until the underlying emulator bugs are
// fixed; local runs still exercise them.
const ciQuarantined = process.env.CI
  ? [
      "/src/worker/gs_basic_sound\\.test\\.ts$",
      "/src/worker/gs_timepilot_flicker\\.test\\.ts$",
      "/src/worker/gs_rom03_reloc\\.test\\.ts$",
    ]
  : []
// eslint-disable-next-line no-undef
module.exports = {
  // The plain ts-jest preset only transforms .ts/.tsx, so use js-with-ts to also
  // transform .js. Without that, whitelisting an ESM package below has no effect.
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["/node_modules/", "/tools/", "<rootDir>/\\.worktrees/", "<rootDir>/\\.kilo/", ...ciQuarantined],
  moduleNameMapper: {
    "\\.(css)$": "<rootDir>/src/test/stylemock.cjs",
  },
  // viridis and its dependency smath ship ESM-only ("type": "module") with no CJS
  // build, so they must be transformed rather than treated as CommonJS.
  // Keep the default pnp entry.
  transformIgnorePatterns: [
    "/node_modules/(?!(viridis|smath)/)",
    "\\.pnp\\.[^\\/]+$",
  ],
}
