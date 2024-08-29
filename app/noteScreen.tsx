import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert, Image, FlatList, TouchableOpacity, Modal } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

const db = SQLite.openDatabaseSync("Note-It");

export default function NoteScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [noteType, setNoteType] = useState('MISC'); // Default type is 'MISC'
  const [images, setImages] = useState([]); // Array to hold selected images
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigation = useNavigation();
  const { noteId } = useLocalSearchParams(); // Get noteId from the navigation parameters

  useEffect(() => {
    if (noteId) {
      loadNoteData(noteId);
    }
  }, [noteId]);

  const loadNoteData = (id) => {
    try {
      const note = db.getAllSync(`SELECT * FROM notes WHERE id = ?`, [id])[0];
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setNoteType(note.type);

        const noteImages = db.getAllSync(`SELECT * FROM images WHERE notes_id = ?`, [id]);
        setImages(noteImages.map(img => img.image));
      }
    } catch (error) {
      console.error("Error loading note:", error);
    }
  };

  const saveNote = () => {
    try {
      const currentTimestamp = new Date().toISOString(); // Current timestamp

      if (title.trim() === '') {
        Alert.alert('Validation Error', 'Please enter a title for the note.');
        return;
      }

      if (noteId) {
        // Update existing note
        db.runSync(
          `UPDATE notes SET title = ?, content = ?, type = ?, modification_date = ? WHERE id = ?`,
          [title, content, noteType, currentTimestamp, noteId]
        );
        // Delete existing images to avoid duplicates
        db.runSync(`DELETE FROM images WHERE notes_id = ?`, [noteId]);
      } else {
        // Insert new note
        db.runSync(
          `INSERT INTO notes (title, content, type, creation_date, modification_date) VALUES (?, ?, ?, ?, ?);`,
          [title, content, noteType, currentTimestamp, currentTimestamp]
        );
      }

      const noteIdToUse = noteId || db.getAllSync(`SELECT last_insert_rowid() as id`)[0].id;

      // Save the associated images in the database
      images.forEach(image => {
        db.runSync(
          `INSERT INTO images (image, notes_id) VALUES (?, ?);`,
          [image, noteIdToUse]
        );
      });

      console.log("Note and images saved successfully.");

      // Navigate back to HomeScreen and indicate that a note was saved
      navigation.navigate('index', { refresh: true });
    } catch (error) {
      console.error("Error saving note:", error);
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
        setImages([...images, base64Image]);
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
        setImages([...images, base64Image]);
      }
    } catch (error) {
      console.error("Error selecting image:", error);
    }
  };

  const renderImageItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => viewImage(item)} onLongPress={() => deleteImage(index)}>
      <Image source={{ uri: item }} style={styles.imageThumbnail} />
    </TouchableOpacity>
  );

  const viewImage = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const deleteImage = (index) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => setImages(images.filter((_, i) => i !== index)) },
      ]
    );
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
      <Button title="Add Image" onPress={pickImage} />
      <FlatList
        data={images}
        renderItem={renderImageItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        style={styles.imageList}
      />
      <Button title="Save Note" onPress={saveNote} />

      {/* Modal for viewing selected image */}
      <Modal visible={modalVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <Image source={{ uri: selectedImage }} style={styles.fullImage} />
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
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
  imageList: {
    marginVertical: 10,
  },
  imageThumbnail: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  fullImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
  },
});
