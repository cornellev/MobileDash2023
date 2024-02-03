import React from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, View, Dimensions } from 'react-native';

const { width, height } = Dimensions.get("window");

export default function App() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        camera={{
          center: {
            latitude: 39.794869,
            longitude: -86.234721,
          },
          pitch: 0,
          heading: -91,
          zoom: 14.5,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: '#A3CFAD',
    borderWidth: 10,
    borderRadius: 20,
    marginTop: 10,
    marginBottom: 10,
    flex: 2,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});