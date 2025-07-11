import React, { useState, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const audioRecorderPlayer = new AudioRecorderPlayer();

const AudioRecorderModal = ({ visible, onClose, onSave }) => {
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [recordTime, setRecordTime] = useState('00:00');
  const [audioPath, setAudioPath] = useState(null);
  const recordSub = useRef(null);

  // Remise à zéro du minuteur quand le modal s'ouvre ou se ferme
  React.useEffect(() => {
    // Si on ferme le modal pendant un enregistrement, on stoppe tout
    if (!visible && recording) {
      audioRecorderPlayer.stopRecorder();
      if (recordSub.current) recordSub.current.remove();
      setRecording(false);
    }
    if (!visible && !recording) {
      setRecordSecs(0);
      setRecordTime('00:00');
      setAudioPath(null);
      if (recordSub.current) recordSub.current.remove();
    }
  }, [visible, recording]);

  const startRecording = async () => {
    if (recording) return; // Empêche double appel
    setAudioPath(null);
    try {
      // Demander la permission micro sur Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Permission micro',
            message: 'L\'application a besoin d\'accéder au micro pour enregistrer de l\'audio.',
            buttonNeutral: 'Plus tard',
            buttonNegative: 'Refuser',
            buttonPositive: 'Autoriser',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission micro refusée',
            'Impossible d\'enregistrer sans accès au micro.\nVous pouvez l\'autoriser dans les paramètres de l\'application.',
            [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Paramètres', onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }
      }
      const result = await audioRecorderPlayer.startRecorder();
      setRecording(true);
      recordSub.current = audioRecorderPlayer.addRecordBackListener((e) => {
        // Utilise Math.floor(e.current_position/1000)*1000 pour éviter les glitches
        setRecordSecs(e.current_position);
        // Correction : toujours afficher mm:ss (pas NaN:NaN)
        const ms = typeof e.current_position === 'number' && !isNaN(e.current_position) ? e.current_position : 0;
        setRecordTime(audioRecorderPlayer.mmssss(Math.floor(ms)));
      });
    } catch (err) {
      Alert.alert('Erreur', "Impossible de démarrer l'enregistrement audio.\n" + err?.message);
      setRecording(false);
    }
  };


  const stopRecording = async () => {
    const result = await audioRecorderPlayer.stopRecorder();
    if (recordSub.current) recordSub.current.remove();
    setRecording(false);
    setAudioPath(result);
    setRecordSecs(0);
    setRecordTime('00:00');
  };

  const handleSave = () => {
    if (audioPath) {
      onSave(audioPath);
      setAudioPath(null);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Enregistrement audio</Text>
          <Text style={styles.timer}>{recordTime}</Text>
          {recording ? (
            <TouchableOpacity style={styles.button} onPress={stopRecording}>
              <Text style={styles.buttonText}>Arrêter</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={startRecording} disabled={recording}>
              <Text style={[styles.buttonText, recording && { opacity: 0.5 }]}>Enregistrer</Text>
            </TouchableOpacity>
          )}
          {audioPath && !recording && (
            <TouchableOpacity style={[styles.button, { backgroundColor: '#007bff' }]} onPress={handleSave}>
              <Text style={styles.buttonText}>Sauvegarder</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={{ fontSize: 18, color: '#888' }}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 300,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timer: {
    fontSize: 32,
    marginBottom: 20,
    color: '#007bff',
  },
  button: {
    backgroundColor: '#28a745',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeBtn: {
    marginTop: 12,
  },
});

export default AudioRecorderModal;
