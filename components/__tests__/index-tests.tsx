import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../../app/(tabs)/index';
import SQLite from 'expo-sqlite';

// Mock SQLite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    transaction: jest.fn((callback) => {
      callback({
        executeSql: jest.fn((sql, params, successCallback) => {
          successCallback({ rows: { length: 0, _array: [] } });
        }),
      });
    }),
  })),
}));

const renderWithNavigation = (component) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('HomeScreen Tests', () => {
  it('renders the list of notes', async () => {
    const { getByText } = renderWithNavigation(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('Add Note')).toBeTruthy();
    });
  });

  it('displays error when there are no notes', async () => {
    const { getByText } = renderWithNavigation(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('No notes available')).toBeTruthy();
    });
  });

  it('matches snapshot', async () => {
    const tree = renderWithNavigation(<HomeScreen />).toJSON();

    await waitFor(() => {
      expect(tree).toMatchSnapshot();
    });
  });
});
