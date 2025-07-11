import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_KEY = 'MNOTES_NOTES';

export const getNotes = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(NOTES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Erreur lecture notes :', e);
    return [];
  }
};

export const saveNote = async (note) => {
  try {
    const notes = await getNotes();
    const newNotes = [note, ...notes];
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
  } catch (e) {
    console.error('Erreur sauvegarde note :', e);
  }
};
