module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test/jest'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  setupFiles: ["dotenv/config"]
};
