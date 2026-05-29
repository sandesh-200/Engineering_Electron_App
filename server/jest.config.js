/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",

  testEnvironment: "node",

  roots: ["<rootDir>/src/tests"],

  testMatch: ["**/*.test.ts"],

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  setupFiles: ["<rootDir>/src/tests/setup.ts"],

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "./tsconfig.test.json",
      },
    ],
  },

  collectCoverageFrom: [
    "src/utils/**/*.ts",
    "src/middleware/**/*.ts",
    "src/services/**/*.ts",
  ],

  verbose: true,

  clearMocks: true,
  restoreMocks: true,
};
