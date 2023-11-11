import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Text, Image, View, SafeAreaView } from 'react-native';

export default function App() {

  const handlePress = () => console.log('Text Pressed');

  return (
    <SafeAreaView style={[styles.container, { flexDirection: 'row' }]} o>
      <Text onPress={handlePress}>She do shit.</Text>
      <TouchableOpacity onPress={() => { console.log('image tapped') }}>
        <Image
          source={{ width: 200, height: 300, uri: 'https://picsum.photos/200/300' }}
        />
      </TouchableOpacity>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
