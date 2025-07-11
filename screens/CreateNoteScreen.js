import React, { useState, useLayoutEffect } from 'react';
import { Share, Platform } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { View, TextInput, StyleSheet, Alert, TouchableOpacity, Text, ScrollView } from 'react-native';
import AudioRecorderModal from '../components/AudioRecorderModal';
import { saveNote } from '../utils/storage';
import { launchImageLibrary } from 'react-native-image-picker';


const CreateNoteScreen = ({ navigation }) => {
  const [audioModalVisible, setAudioModalVisible] = useState(false);
  const [audios, setAudios] = useState([]);

  const handleShare = async () => {
    // Génère HTML
    let html = `<h2>${title}</h2><p>${content.replace(/\n/g, '<br>')}</p>`;
    if (media.length > 0) {
      html += '<h4>Fichiers :</h4><ul>' + media.map(m => `<li>${m.fileName || m.uri}</li>`).join('') + '</ul>';
    }
    try {
      const pdf = await RNHTMLtoPDF.convert({
        html,
        fileName: `MNote_${Date.now()}`,
        base64: false,
      });
      await Share.share({
        url: Platform.OS === 'android' ? `file://${pdf.filePath}` : pdf.filePath,
        title: title || 'Note',
        message: `Voici la note « ${title} » en PDF.`
      });
    } catch (e) {
      // Si erreur, partage texte brut
      let shareContent = `Titre : ${title}\n\n${content}`;
      if (media.length > 0) {
        shareContent += '\n\nFichiers :\n' + media.map(m => m.fileName || m.uri).join('\n');
      }
      await Share.share({ message: shareContent });
    }
  };


  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState([]);

  const handlePickMedia = () => {
    launchImageLibrary({ mediaType: 'mixed', selectionLimit: 0 }, (response) => {
      if (response.didCancel || response.errorCode) return;
      if (response.assets) {
        setMedia(prev => [...prev, ...response.assets]);
      }
    });
  };

  const handleRemoveMedia = (uri) => {
    setMedia(prev => prev.filter(m => m.uri !== uri));
  };


  const handleSave = async () => {
    if (title.trim() === '' && content.trim() === '') {
      Alert.alert('Note vide', 'Veuillez entrer un titre ou un contenu');
      return;
    }

    const newNote = {
      id: Date.now().toString(),
      title,
      content,
      media,
      audios,
      createdAt: new Date().toISOString(),
    };

    await saveNote(newNote);
    navigation.goBack(); // Retour à l’accueil
  };


  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={handleShare} style={{ marginRight: 18 }}>
            <Text style={{ fontSize: 24, color: '#007bff' }}>📤</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={{ marginRight: 8 }}>
            <Text style={{ fontSize: 24, color: '#007bff' }}>✔️</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, title, content, media]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Titre"
        value={title}
        onChangeText={setTitle}
        style={styles.titleInput}
      />
      <TextInput
        placeholder="Contenu"
        value={content}
        onChangeText={setContent}
        multiline
        style={styles.contentInput}
      />
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity style={styles.importBtn} onPress={handlePickMedia}>
          <Text style={{ fontSize: 22 }}>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.importBtn} onPress={() => setAudioModalVisible(true)}>
          <Text style={{ fontSize: 22 }}>🎤</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={{ maxHeight: 120, marginTop: 8 }}>
        {media.map(item => (
          <View key={item.uri} style={styles.mediaRow}>
            {item.type && item.type.startsWith('image') ? (
              <Image source={{ uri: item.uri }} style={{ width: 40, height: 40, borderRadius: 4, marginRight: 8 }} />
            ) : (
              <View style={{ width: 40, height: 40, backgroundColor: '#ddd', borderRadius: 4, marginRight: 8, alignItems: 'center', justifyContent: 'center' }}>
                <Text>🎬</Text>
              </View>
            )}
            <Text style={{ flex: 1 }} numberOfLines={1}>{item.fileName || item.uri}</Text>
            <TouchableOpacity onPress={() => handleRemoveMedia(item.uri)} style={{ marginLeft: 10 }}>
              <Text style={{ color: '#d11a2a', fontSize: 18 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}
        {audios.map((audio, idx) => (
          <View key={audio} style={styles.mediaRow}>
            <Text style={{ marginRight: 8 }}>🔊</Text>
            <Text style={{ flex: 1 }} numberOfLines={1}>{audio.split('/').pop()}</Text>
            <TouchableOpacity onPress={() => setAudios(audios.filter(a => a !== audio))} style={{ marginLeft: 10 }}>
              <Text style={{ color: '#d11a2a', fontSize: 18 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <AudioRecorderModal
        visible={audioModalVisible}
        onClose={() => setAudioModalVisible(false)}
        onSave={path => {
          setAudios(prev => [...prev, path]);
          setAudioModalVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  titleInput: {
    fontSize: 20,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
  },
  importBtn: {
    marginTop: 10,
    marginBottom: 2,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#eaf0fb',
  },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
});

export default CreateNoteScreen;
