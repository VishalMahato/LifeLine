module.exports = {
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.mjs$': '$1',
  },
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.test.js'],
  testPathIgnorePatterns: ['<rootDir>/test/integration.test.js'],
  collectCoverageFrom: ['src/**/*.mjs', '!src/server.mjs'],
};
