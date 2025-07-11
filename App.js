import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import CreateNoteScreen from './screens/CreateNoteScreen';
import NoteDetailScreen from './screens/NoteDetailScreen';
import TasksScreen from './screens/TasksScreen';
import { NotesProvider } from './context/NotesContext';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NotesProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Notes">
          <Stack.Screen name="Notes" component={HomeScreen} />
          <Stack.Screen name="Créer une note" component={CreateNoteScreen} />
          <Stack.Screen name="Modifier la note" component={NoteDetailScreen} />
          <Stack.Screen name="Tâches" component={TasksScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </NotesProvider>
  );
};

<Stack.Navigator initialRouteName="Accueil">
  <Stack.Screen name="Accueil" component={HomeScreen} />
  <Stack.Screen name="Créer une note" component={CreateNoteScreen} />
</Stack.Navigator>

export default App;
