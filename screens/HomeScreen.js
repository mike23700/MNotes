import React, { useEffect, useState, useLayoutEffect } from 'react';
import AudioRecorderModal from '../components/AudioRecorderModal';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Share, Platform } from 'react-native';
import SearchBar from '../components/SearchBar';

import { getNotes } from '../utils/storage';
import NoteItem from '../components/NoteItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const isFocused = useIsFocused(); // Recharger quand on revient à l'écran
  const [audioModal, setAudioModal] = useState(false);
  const [audios, setAudios] = useState([]);
  const audioRecorderPlayer = React.useRef(new AudioRecorderPlayer()).current;
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    if (isFocused) {
      loadNotes();
      loadAudios();
    }
  }, [isFocused]);

  const loadAudios = async () => {
    const saved = await AsyncStorage.getItem('MNOTES_AUDIOS');
    setAudios(saved ? JSON.parse(saved) : []);
  };

  const saveAudio = async (audioPath) => {
    const newAudio = { id: Date.now().toString(), path: audioPath, date: new Date().toISOString() };
    const updated = [newAudio, ...audios];
    setAudios(updated);
    await AsyncStorage.setItem('MNOTES_AUDIOS', JSON.stringify(updated));
  };

  const playAudio = async (audio) => {
    try {
      setPlayingId(audio.id);
      await audioRecorderPlayer.startPlayer(audio.path);
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.current_position >= e.duration) {
          stopAudio();
        }
      });
    } catch (e) {
      Alert.alert('Erreur', "Impossible de lire l'audio");
      setPlayingId(null);
    }
  };

  const stopAudio = async () => {
    setPlayingId(null);
    await audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
  };

  const shareAudio = async (audio) => {
    try {
      const url = Platform.OS === 'android' ? `file://${audio.path}` : audio.path;
      await Share.share({
        url,
        title: audio.path.split('/').pop()
      });
    } catch (e) {
      Alert.alert('Erreur', "Impossible de partager l'audio");
    }
  };



  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Tâches')} style={{ marginRight: 16 }}>
          <Text style={{ fontSize: 24 }}>📋</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const loadNotes = async () => {
    const storedNotes = await getNotes();
    setNotes(storedNotes);
  };

  // Filtrage des notes selon la recherche
  // Trie les notes épinglées en haut
  const sortedNotes = [...notes].sort((a, b) => (b.pinned === true) - (a.pinned === true));
  const filteredNotes = sortedNotes.filter(note =>
    note.title?.toLowerCase().includes(search.toLowerCase()) ||
    note.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <SearchBar value={search} onChange={setSearch} placeholder="Rechercher une note..." />

      {/* Liste des audios enregistrés */}
      {audios.length > 0 && (
        <View style={styles.audioList}>
          <Text style={styles.audioTitle}>Audios enregistrés :</Text>
          {audios.map(audio => (
            <View key={audio.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <TouchableOpacity
                style={[styles.audioItem, { flex: 1 }]}
                onPress={() => playingId === audio.id ? stopAudio() : playAudio(audio)}
              >
                <Text style={{ color: playingId === audio.id ? '#28a745' : '#333', fontWeight: playingId === audio.id ? 'bold' : 'normal', fontSize: 16 }}>
                  {playingId === audio.id ? '⏸️ ' : '▶️ '}Audio du {new Date(audio.date).toLocaleString()}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => shareAudio(audio)}
                style={{ marginLeft: 8 }}
              >
                <Text style={{ fontSize: 20, color: '#007bff' }}>📤</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Supprimer ?', 'Supprimer cet audio ?', [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'Supprimer', style: 'destructive', onPress: async () => {
                      const updated = audios.filter(a => a.id !== audio.id);
                      setAudios(updated);
                      await AsyncStorage.setItem('MNOTES_AUDIOS', JSON.stringify(updated));
                      if (playingId === audio.id) stopAudio();
                    }}
                  ]);
                }}
                style={{ marginLeft: 8 }}
              >
                <Text style={{ fontSize: 20, color: '#d11a2a' }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {filteredNotes.length === 0 ? (
        <Text style={styles.emptyText}>Aucune note trouvée</Text>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NoteItem
              note={item}
              onPress={() => navigation.navigate('Modifier la note', { noteId: item.id })}
              onDelete={(note) => {
                // Confirmation avant suppression
                Alert.alert(
                  'Supprimer cette note ?',
                  'Cette action est irréversible.',
                  [
                    { text: 'Annuler', style: 'cancel' },
                    {
                      text: 'Supprimer', style: 'destructive',
                      onPress: async () => {
                        const updatedNotes = notes.filter(n => n.id !== note.id);
                        await AsyncStorage.setItem('MNOTES_NOTES', JSON.stringify(updatedNotes));
                        setNotes(updatedNotes);
                      }
                    }
                  ]
                );
              }}
              onTogglePin={async (note) => {
                const updatedNotes = notes.map(n => n.id === note.id ? { ...n, pinned: !n.pinned } : n);
                await AsyncStorage.setItem('MNOTES_NOTES', JSON.stringify(updatedNotes));
                setNotes(updatedNotes);
              }}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: 110, backgroundColor: '#28a745' }]}
        onPress={() => setAudioModal(true)}
      >
        <Text style={styles.plus}>🎤</Text>
      </TouchableOpacity>

      <AudioRecorderModal
        visible={audioModal}
        onClose={() => setAudioModal(false)}
        onSave={async (audioPath) => {
          setAudioModal(false);
          await saveAudio(audioPath);
          Alert.alert('Audio enregistré', `Fichier sauvegardé :\n${audioPath}`);
        }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Créer une note')}
      >
        <Text style={styles.plus}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
    fontSize: 16,
  },
  list: {
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
  },
  plus: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -2,
  },
});

export default HomeScreen;
