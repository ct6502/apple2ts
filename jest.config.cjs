/** @type {import('ts-jest').JestConfigWithTsJest} */
// eslint-disable-next-line no-undef
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["/node_modules/", "/tools/"],
  moduleNameMapper: {
    "\\.(css)$": "<rootDir>/src/test/stylemock.cjs",
  },
}
