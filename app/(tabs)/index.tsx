import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, FlatList, View, Button, Alert, TouchableOpacity, Text } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNavigation, useFocusEffect } from 'expo-router';

const db = SQLite.openDatabaseSync("Note-It");

export default function HomeScreen() {
  const [notes, setNotes] = useState([]);
  const [headerImage, setHeaderImage] = useState(null);
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
          image TEXT
        );

        CREATE TABLE IF NOT EXISTS notes_images_mapping (
          id INTEGER PRIMARY KEY NOT NULL,
          notes_id INTEGER,
          images_id INTEGER,
          FOREIGN KEY (notes_id) REFERENCES notes(id) ON DELETE CASCADE,
          FOREIGN KEY (images_id) REFERENCES images(id) ON DELETE CASCADE
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

  const pickImage = async () => {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
        Alert.alert('Permissions to access camera and media library are required!');
        return;
      }

      Alert.alert(
        'Select Image Source',
        'Choose an option to add an image:',
        [
          { text: 'Take Photo', onPress: captureImage },
          { text: 'Pick from Gallery', onPress: selectImageFromGallery },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const captureImage = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        const base64Image = `data:image/jpg;base64,${result.assets[0].base64}`;
        setHeaderImage(base64Image);
        saveImageToDB(base64Image);
      }
    } catch (error) {
      console.error("Error capturing image:", error);
    }
  };

  const selectImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        const base64Image = `data:image/jpg;base64,${result.assets[0].base64}`;
        setHeaderImage(base64Image);
        saveImageToDB(base64Image);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
    }
  };

  const saveImageToDB = (base64Image) => {
    try {
      db.runSync(`INSERT INTO images (image) VALUES (?);`, [base64Image]);
      console.log('Image saved');
    } catch (error) {
      console.error("Error inserting image:", error);
    }
  };

  const renderItem = ({ item }) => (
    <ThemedView style={styles.noteContainer}>
      <ThemedText type="title">{item.title || "Untitled Note"}</ThemedText>
      <ThemedText type="subtitle">Created on: {new Date(item.creation_date).toLocaleDateString()}</ThemedText>
      <View style={styles.buttonsContainer}>
        <Button title="Delete" onPress={() => deleteNote(item.id)} />
      </View>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('noteScreen')}  // Navigate to noteScreen
      >
        <Text style={styles.addButtonText}>Add Note</Text>
      </TouchableOpacity>
      {headerImage && (
        <Image
          source={{ uri: headerImage }}
          style={styles.headerImage}
        />
      )}
      <Button title="Add Image" onPress={pickImage} />
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
  headerImage: {
    width: '100%',
    height: 200,
    marginBottom: 20,
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
});
