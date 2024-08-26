import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useNavigation } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

const db = SQLite.openDatabaseSync("Note-It");

export default function NoteScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState('MISC'); // Default type is 'MISC'
  const navigation = useNavigation();

  const saveNote = () => {
    try {
      const creationDate = new Date().toISOString(); // Save the current timestamp

      if (title.trim() === '') {
        Alert.alert('Validation Error', 'Please enter a title for the note.');
        return;
      }

      console.log("Attempting to Insert Note with the following values:");
      console.log("Title:", title);
      console.log("Content:", content);
      console.log("Type:", noteType);
      console.log("Creation Date:", creationDate);

      // Use runSync for the INSERT operation
      db.runSync(
        `INSERT INTO notes (title, content, type, creation_date) VALUES (?, ?, ?, ?);`,
        [title, content, noteType, creationDate]
      );

      console.log("Note inserted successfully.");

      // Navigate back to HomeScreen and indicate that a new note was added
      navigation.navigate('index', { refresh: true });
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter note title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.contentInput]}
        placeholder="Enter note content"
        value={content}
        onChangeText={setContent}
        multiline
      />
      <Text>Note Type:</Text>
      <Picker
        selectedValue={noteType}
        style={styles.picker}
        onValueChange={(itemValue) => setNoteType(itemValue)}
      >
        <Picker.Item label="MISC" value="MISC" />
        <Picker.Item label="EVENT" value="EVENT" />
        <Picker.Item label="WORK" value="WORK" />
        <Picker.Item label="REMINDER" value="REMINDER" />
        <Picker.Item label="STUDY" value="STUDY" />
        <Picker.Item label="MEETING" value="MEETING" />
      </Picker>
      <Button title="Save Note" onPress={saveNote} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  contentInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
});
