import { useState, useEffect } from 'react';
import { Image, StyleSheet, Platform, FlatList, View, Button } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as SQLite from 'expo-sqlite';

export default function HomeScreen() {
  // Open the database synchronously using your custom method
  const db = SQLite.openDatabaseSync("Note-It");

  // State to store notes
  const [notes, setNotes] = useState([]);

  // Function to fetch notes from the database
  const getNotes = () => {
    return db.getAllSync(`
      SELECT * FROM notes;
    `) as { id: number, title: string, content: string, type: string, creation_date: string, modification_date: string }[];
  };

  // Function to update a note
  const updateNote = (id: number) => {
    db.execSync(`
      UPDATE notes
      SET title = title, content = content, type = type
      WHERE id = ${id};
    `);
    // Fetch notes and update state after the update
    const fetchedNotes = getNotes();
    setNotes(fetchedNotes);
    console.log(fetchedNotes)
  };

  useEffect(() => {
    // Initialize the database tables and fetch data
    db.execSync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS notes (
          id INTEGER PRIMARY KEY NOT NULL,
          title VARCHAR(50),
          content VARCHAR(255),
          type TEXT CHECK(type IN ('MISC', 'EVENT', 'WORK', 'REMINDER', 'STUDY', 'MEETING')) DEFAULT 'MISC',
          creation_date DATE DEFAULT (datetime('now', 'localtime')),
          modification_date DATE DEFAULT (datetime('now', 'localtime'))
      );

      CREATE TRIGGER IF NOT EXISTS update_modification_date
      AFTER UPDATE ON notes
      FOR EACH ROW
      BEGIN
          UPDATE notes
          SET modification_date = datetime('now', 'localtime')
          WHERE id = OLD.id;
      END;

      CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY NOT NULL,
        image BLOB
      );

      CREATE TABLE IF NOT EXISTS notes_images_mapping (
        id INTEGER PRIMARY KEY NOT NULL,
        notes_id INTEGER,
        images_id INTEGER,
        FOREIGN KEY (notes_id) REFERENCES notes(id) ON DELETE CASCADE,
        FOREIGN KEY (images_id) REFERENCES images(id) ON DELETE CASCADE
      );

      INSERT INTO notes (title) VALUES ('test1');
      INSERT INTO notes (title) VALUES ('test2');
      INSERT INTO notes (title) VALUES ('test3');
    `);

    // Fetch notes and update state
    const fetchedNotes = getNotes();
    setNotes(fetchedNotes);
  }, []);

  // Render function for each note item
  const renderItem = ({ item }) => (
    <View style={styles.noteContainer}>
      <ThemedText type="title">{item.title}</ThemedText>
      <ThemedText>{item.content}</ThemedText>
      <ThemedText>Type: {item.type}</ThemedText>
      <ThemedText>Created on: {item.creation_date}</ThemedText>
      <ThemedText>Modified on: {item.modification_date}</ThemedText>
      <Button title="Update" onPress={() => updateNote(item.id)} />
    </View>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome! </ThemedText>
        <HelloWave />
      </ThemedView>
      <FlatList
        data={notes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.notesList}
      />
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({ ios: 'cmd + d', android: 'cmd + m' })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this starter app.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{' '}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
        <ThemedText type="subtitle">Type shii yurr</ThemedText>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  notesList: {
    padding: 16,
  },
  noteContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
