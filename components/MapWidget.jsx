import React from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, View, Dimensions } from 'react-native';

const { width, height } = Dimensions.get("window");

const mapStyle = [
  {
    featureType: "all",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
];

export default function App() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        camera={{
          center: {
            latitude: 39.794869,
            longitude: -86.234521,
          },
          pitch: 0,
          heading: -91,
          zoom: 14.4,
        }}
        showsUserLocation={true}
        showsCompass={false}
        scrollEnabled={false} 
        zoomEnabled={false} 
        rotateEnabled={false} 
        customMapStyle={mapStyle} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderColor: '#A3CFAD',
    borderWidth: 10,
    borderRadius: 20,
    marginTop: 15,
    marginBottom: 15,
    flex: 2,

    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
