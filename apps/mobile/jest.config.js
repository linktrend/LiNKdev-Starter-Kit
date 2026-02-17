module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
    '^@starter/ui/native$': '<rootDir>/../../packages/ui/src/native-index',
  },
  testMatch: ['**/test/**/*.test.{ts,tsx}'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@testing-library|@starter)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testEnvironment: 'node',
};
