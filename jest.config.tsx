module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|expo-router|@react-navigation)"
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '^app/(.*)$': '<rootDir>/app/$1', // Map 'app/' alias to the 'app' directory at the project root
    '^components/(.*)$': '<rootDir>/components/$1', // Optional: Map components path if needed
  },
};
