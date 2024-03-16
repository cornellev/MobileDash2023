
// center: {
//   latitude: 39.794869,
//   longitude: -86.234521,
// },

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import MapView from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get("window");

const mapStyle = [
  {
    featureType: "all",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
];

export default function App() {
  const [location, setLocation] = useState({
    latitude: 42.4440,
    longitude: -76.4820,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        ...location,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    })();
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        camera={{
          center: location,
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
