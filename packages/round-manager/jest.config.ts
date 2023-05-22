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
  moduleNameMapper: {
    "^.+.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$":
      "jest-transform-stub",
    "^.+.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/src/tests/fileTransform.ts",
  },
  transformIgnorePatterns: [`/node_modules/.pnpm/(?!(${esModules.join("|")}))`],
  setupFilesAfterEnv: ["./src/setupTests.ts"],
};
