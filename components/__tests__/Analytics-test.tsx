import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import AnalyticsScreen from '../../app/(tabs)/Analytics';
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

describe('AnalyticsScreen Tests', () => {
  it('displays the analytics data', async () => {
    const { getByText } = renderWithNavigation(<AnalyticsScreen />);

    await waitFor(() => {
      expect(getByText('Notes Analytics')).toBeTruthy();
    });
  });

  it('displays error when analytics data is missing', async () => {
    const { getByText } = renderWithNavigation(<AnalyticsScreen />);

    await waitFor(() => {
      expect(getByText('No analytics data available')).toBeTruthy();
    });
  });

  it('matches snapshot', async () => {
    const tree = renderWithNavigation(<AnalyticsScreen />).toJSON();

    await waitFor(() => {
      expect(tree).toMatchSnapshot();
    });
  });
});
