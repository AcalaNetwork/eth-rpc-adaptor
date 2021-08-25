module.exports = {
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/(tests|e2e)/**/*.test.(ts|js)'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testPathIgnorePatterns: ['/dist'],
  transformIgnorePatterns: ['/node_modules/(?!(@polkadot|@babel/runtime/helpers/esm/))'],
};
