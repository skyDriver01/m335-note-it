import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as SQLite from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';

const db = SQLite.openDatabaseSync("Note-It");

export default function AnalyticsScreen() {
  const [todayNotesCount, setTodayNotesCount] = useState(0);
  const [totalNotesCount, setTotalNotesCount] = useState(0);
  const [notesByType, setNotesByType] = useState({});
  const [updatedNotesCount, setUpdatedNotesCount] = useState(0);
  const [totalImagesCount, setTotalImagesCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      fetchAnalytics();
    }, [])
  );

  const fetchAnalytics = () => {
    try {
      const todayDate = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

      // 1. Notes created today
      const todayNotes = db.getAllSync(
        `SELECT COUNT(*) as count FROM notes WHERE DATE(creation_date) = ?`,
        [todayDate]
      )[0].count;
      setTodayNotesCount(todayNotes);

      // 2. Total notes count
      const totalNotes = db.getAllSync(`SELECT COUNT(*) as count FROM notes`)[0].count;
      setTotalNotesCount(totalNotes);

      // 3. Notes by type
      const types = db.getAllSync(
        `SELECT type, COUNT(*) as count FROM notes GROUP BY type`
      );
      const typeCount = types.reduce((acc, type) => {
        acc[type.type] = type.count;
        return acc;
      }, {});
      setNotesByType(typeCount);

      // 4. Notes updated at least once
      const updatedNotes = db.getAllSync(
        `SELECT COUNT(*) as count FROM notes WHERE creation_date != modification_date`
      )[0].count;
      setUpdatedNotesCount(updatedNotes);

      // 5. Total images count
      const totalImages = db.getAllSync(`SELECT COUNT(*) as count FROM images`)[0].count;
      setTotalImagesCount(totalImages);

    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.section}>
        <ThemedText type="title">Analytics</ThemedText>
      </ThemedView>
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Notes Created Today</ThemedText>
        <ThemedText>{todayNotesCount}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Total Notes</ThemedText>
        <ThemedText>{totalNotesCount}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Notes by Type</ThemedText>
        {Object.keys(notesByType).map((type) => (
          <View key={type} style={styles.typeRow}>
            <ThemedText>{type}:</ThemedText>
            <ThemedText>{notesByType[type]}</ThemedText>
          </View>
        ))}
      </ThemedView>
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Notes Updated At Least Once</ThemedText>
        <ThemedText>{updatedNotesCount}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Total Images</ThemedText>
        <ThemedText>{totalImagesCount}</ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
});
