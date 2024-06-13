module.exports = {
  rootDir: '.',
  transform: { '^.+\\.ts?$': ['ts-jest', { isolatedModules: true }] }, // isolatedModules:true speeds things up _a lot_
  testEnvironment: 'node',
  testRegex: '/tests/.*\\.(test|spec)?\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  silent: false,
  collectCoverage: true,
  testTimeout: 60000,
  detectOpenHandles: true,
  coverageDirectory: 'test_results/coverage/jest',
  coverageReporters: ['cobertura', 'text'],
  coveragePathIgnorePatterns: [
    "<rootDir>/src/types.ts",
    "<rootDir>/src/api/papi.ts"
  ],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test_results/junit/',
        outputName: 'jest-junit.xml',
        reportTestSuiteErrors: true,
      },
    ],
  ],
};
