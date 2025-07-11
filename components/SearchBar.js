import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

const SearchBar = ({ value, onChange, placeholder = 'Rechercher...' }) => (
  <View style={styles.container}>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      value={value}
      onChangeText={onChange}
      autoCorrect={false}
      autoCapitalize="none"
      clearButtonMode="while-editing"
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    backgroundColor: '#f1f3f6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  input: {
    fontSize: 16,
    padding: 8,
  },
});

export default SearchBar;
