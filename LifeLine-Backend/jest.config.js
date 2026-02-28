module.exports = {
  preset: null,
  extensionsToTreatAsEsm: ['.mjs'],
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleNameMapping: {
    '^(\\.{1,2}/.*)\\.mjs$': '$1',
  },
  transform: {},
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/test/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/**/*.mjs',
    '!src/server.mjs'
  ]
};