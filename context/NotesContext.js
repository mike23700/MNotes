import React, { createContext, useContext, useEffect, useState } from 'react';
import { getNotes as storageGetNotes, saveNote as storageSaveNote } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    const notes = await storageGetNotes();
    setNotes(notes);
    setLoading(false);
  };

  const addNote = async (note) => {
    await storageSaveNote(note);
    await loadNotes();
  };

  const updateNote = async (updatedNote) => {
    const updatedNotes = notes.map(n => n.id === updatedNote.id ? updatedNote : n);
    await AsyncStorage.setItem('MNOTES_NOTES', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const deleteNote = async (id) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    await AsyncStorage.setItem('MNOTES_NOTES', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  return (
    <NotesContext.Provider value={{ notes, loading, addNote, updateNote, deleteNote, loadNotes }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);
