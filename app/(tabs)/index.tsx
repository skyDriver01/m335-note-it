import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, FlatList, View, Alert, TouchableOpacity, Text } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation, useFocusEffect } from 'expo-router';

const db = SQLite.openDatabaseSync("Note-It");

export default function HomeScreen() {
  const [notes, setNotes] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    setupDatabase();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchedNotes = getNotes();
      setNotes(fetchedNotes);
    }, [])
  );

  const setupDatabase = () => {
    try {
      db.execSync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY NOT NULL,
          title VARCHAR(50),
          content TEXT,
          type TEXT CHECK(type IN ('MISC', 'EVENT', 'WORK', 'REMINDER', 'STUDY', 'MEETING')) DEFAULT 'MISC',
          creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          modification_date DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS images (
          id INTEGER PRIMARY KEY NOT NULL,
          image TEXT,
          notes_id INTEGER,
          FOREIGN KEY (notes_id) REFERENCES notes(id) ON DELETE CASCADE
        );
      `);
    } catch (error) {
      console.error("Error setting up database:", error);
    }
  };

  const getNotes = () => {
    try {
      const result = db.getAllSync(`SELECT * FROM notes ORDER BY creation_date DESC;`);
      console.log("Fetched Notes:", result);
      return result || [];
    } catch (error) {
      console.error("Error fetching notes:", error);
      return [];
    }
  };

  const deleteNote = (id) => {
    try {
      db.runSync(`
        DELETE FROM notes WHERE id = ${id};
      `);
      const fetchedNotes = getNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteNote(id), style: 'destructive' },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const noteImages = db.getAllSync(`SELECT * FROM images WHERE notes_id = ?`, [item.id]);

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('noteScreen', { noteId: item.id })}
        onLongPress={() => confirmDelete(item.id)}
      >
        <ThemedView style={styles.noteContainer}>
          <ThemedText type="title">{item.title || "Untitled Note"}</ThemedText>
          <ThemedText type="subtitle">Created on: {new Date(item.creation_date).toLocaleDateString()}</ThemedText>
          <FlatList
            data={noteImages.map(img => img.image)}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.imageThumbnail} />
            )}
            keyExtractor={(image, index) => index.toString()}
            horizontal
            style={styles.imageList}
          />
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('noteScreen')}  // Navigate to noteScreen
      >
        <Text style={styles.addButtonText}>Add Note</Text>
      </TouchableOpacity>
      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.notesList}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#ffffff',
  },
  notesList: {
    paddingHorizontal: 16,
  },
  noteContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: '10%',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  imageList: {
    marginVertical: 10,
  },
  imageThumbnail: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
});
