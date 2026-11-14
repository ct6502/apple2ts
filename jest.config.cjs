/** @type {import('ts-jest').JestConfigWithTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
  // The plain ts-jest preset only transforms .ts/.tsx, so use js-with-ts to also
  // transform .js. Without that, whitelisting an ESM package below has no effect.
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["/node_modules/", "/tools/", "<rootDir>/\\.worktrees/"],
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
