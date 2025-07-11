import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const NoteItem = ({ note, onPress, onDelete, onTogglePin }) => {
  return (
    <TouchableOpacity onPress={() => onPress(note)}>
      <View style={styles.card}>
        <Text style={styles.title}>{note.title || '(Sans titre)'}</Text>
        <Text numberOfLines={2} style={styles.content}>
          {note.content}
        </Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={e => { e.stopPropagation?.(); onDelete(note); }}>
            <Text style={styles.icon}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={e => { e.stopPropagation?.(); onTogglePin(note); }}>
            <Text style={styles.icon}>{note.pinned ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.date}>
          {new Date(note.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
    gap: 12,
  },
  icon: {
    fontSize: 18,
    marginHorizontal: 4,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    marginVertical: 6,
    color: '#555',
  },
  date: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
});

export default NoteItem;
