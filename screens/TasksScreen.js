import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';

const TasksScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([{ id: Date.now().toString(), text: input, done: false }, ...tasks]);
    setInput('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id) => {
    Alert.alert('Supprimer ?', 'Supprimer cette tâche ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => setTasks(tasks.filter(t => t.id !== id)) }
    ]);
  };

  // Trie les tâches : à faire en haut, terminées en bas
  const sortedTasks = [...tasks].sort((a, b) => a.done - b.done);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Ajouter une tâche..."
        value={input}
        onChangeText={setInput}
        onSubmitEditing={addTask}
        style={styles.input}
      />
      <FlatList
        data={sortedTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskRow}>
            <TouchableOpacity onPress={() => toggleTask(item.id)}>
              <Text style={styles.checkbox}>{item.done ? '☑️' : '☐'}</Text>
            </TouchableOpacity>
            <Text style={[styles.taskText, item.done && styles.done]}>{item.text}</Text>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteBtn}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#aaa', marginTop: 40 }}>Aucune tâche</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  checkbox: {
    fontSize: 22,
    marginRight: 12,
  },
  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  done: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  deleteBtn: {
    fontSize: 18,
    marginLeft: 10,
  },
});

export default TasksScreen;
