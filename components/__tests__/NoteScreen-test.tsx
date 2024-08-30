import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import NoteScreen from '../../app/noteScreen';
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

describe('NoteScreen Tests', () => {
  it('renders correctly', async () => {
    const { getByText } = renderWithNavigation(<NoteScreen />);

    await waitFor(() => {
      expect(getByText('Save')).toBeTruthy();
    });
  });

  it('displays validation error when title is empty', async () => {
    const { getByText, getByPlaceholderText } = renderWithNavigation(<NoteScreen />);

    fireEvent.changeText(getByPlaceholderText('Enter title'), '');
    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(getByText('Title is required')).toBeTruthy();
    });
  });

  it('saves a note with a title and content', async () => {
    const { getByText, getByPlaceholderText } = renderWithNavigation(<NoteScreen />);

    fireEvent.changeText(getByPlaceholderText('Enter title'), 'Test Note');
    fireEvent.changeText(getByPlaceholderText('Enter content'), 'This is a test note.');
    fireEvent.press(getByText('Save'));

    await waitFor(() => {
      expect(getByText('Note saved successfully')).toBeTruthy();
    });
  });

  it('matches snapshot', async () => {
    const tree = renderWithNavigation(<NoteScreen />).toJSON();

    await waitFor(() => {
      expect(tree).toMatchSnapshot();
    });
  });
});
