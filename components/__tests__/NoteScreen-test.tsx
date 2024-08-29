import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import NoteScreen from '../../app/noteScreen';
import { SQLite } from 'expo-sqlite';

jest.mock('expo-sqlite');

// Helper function to wrap component with NavigationContainer
const renderWithNavigation = (component) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('NoteScreen Tests', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = renderWithNavigation(<NoteScreen />);
    expect(getByPlaceholderText('Enter note title')).toBeTruthy();
  });

  it('displays validation error when title is empty', () => {
    const { getByText, getByPlaceholderText } = renderWithNavigation(<NoteScreen />);
    fireEvent.changeText(getByPlaceholderText('Enter note title'), '');
    fireEvent.press(getByText('Save Note'));
    expect(getByText('Validation Error')).toBeTruthy();
  });

  it('matches snapshot', () => {
    const tree = renderWithNavigation(<NoteScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
