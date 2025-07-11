import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const FilePickerRow = ({ file, onRemove }) => (
  <View style={styles.row}>
    <Text style={styles.name} numberOfLines={1}>{file.name || file.uri}</Text>
    <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
      <Text style={{ color: '#d11a2a', fontSize: 18 }}>🗑️</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  name: { flex: 1, fontSize: 15, color: '#333' },
  removeBtn: { marginLeft: 10 },
});

export default FilePickerRow;
