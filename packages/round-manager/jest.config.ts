const esModules = [
  "@rainbow-me",
  "@spruceid",
  "github\\.com\\+gitcoinco\\+allo\\-indexer\\-client",
  "wagmi",
  "@wagmi",
  "@gitcoinco",
];

module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "jsdom",
  // extensionsToTreatAsEsm: [".ts"],
  transformIgnorePatterns: [`/node_modules/.pnpm/(?!(${esModules.join("|")}))`],
  moduleNameMapper: {
    "^.+.(css|styl|less|sass|scss|png|jpg|svg|ttf|woff|woff2)$":
      "jest-transform-stub",
  },
  setupFilesAfterEnv: ["./src/setupTests.ts"],
};
