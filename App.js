import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button, LogBox } from 'react-native';
import * as Location from 'expo-location';
import PowerBatteryDAQ from './components/PowerBatteryDAQ';
import SpeedWidget from './components/SpeedWidget';
import MapWidget from './components/MapWidget';

LogBox.ignoreAllLogs();

const App = () => {
  const [websocket, setWebsocket] = useState(null);
  const [readings, setReadings] = useState({});
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Request location permission
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []); // Empty dependency array means this effect runs once on mount

  const getReadings = () => {
    if (websocket) {
      websocket.send("getReadings");
    }
  };

  const initWebSocket = () => {
    if (websocket) {
      console.log("WebSocket is already connected.");
      return; // Exit if WebSocket is already connected
    }

    const wsScheme = "ws"; // Change to "wss" for secure WebSocket connections
    const host = "192.168.1.242"; // Use your server's hostname or IP
    const gateway = `${wsScheme}://${host}/ws`;

    console.log('Trying to open a WebSocket connection…');
    const ws = new WebSocket(gateway);

    ws.onopen = () => {
      console.log('Connection opened');
      setWebsocket(ws);
      getReadings();
    };

    ws.onclose = () => {
      console.log('Connection closed');
      setWebsocket(null); // Clear WebSocket on close
    };

    ws.onmessage = (event) => {
      requestAnimationFrame(() => { // Avoids UI lag by batching updates
        try {
          const myObj = JSON.parse(event.data);
          setReadings(prev => ({ ...prev, ...myObj })); // Avoids unnecessary state updates
          sendDataToServer(myObj);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      });
    };    
  };

  // Function to send data to server
  const sendDataToServer = (data) => {
    setLocation(location);

    const postData = {
      x_accel: data["x_accel"] ? parseFloat(data["x_accel"]) : null,
      y_accel: data["y_accel"] ? parseFloat(data["y_accel"]) : null,
      z_accel: data["z_accel"] ? parseFloat(data["z_accel"]) : null,
      gps_lat: location?.coords?.latitude || null,
      gps_long: location?.coords?.longitude || null,
      left_rpm: data["left_rpm"] ? parseFloat(data["left_rpm"]) : null,
      right_rpm: data["right_rpm"] ? parseFloat(data["right_rpm"]) : null,
      potent: null, // Assuming this is intentionally null
      temp: data["temperature"] ? parseFloat(data["temperature"]) : null,
    };


    fetch('http://live-timing-dash.herokuapp.com/insert/uc24', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Successfully sent data to Live-Timing Dash');
    })
    .catch((error) => {
      console.error('Error in sending to Live-Timing Dash:', error);
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: 'column',
        },
      ]}>
      <SpeedWidget readings={readings}></SpeedWidget>
      <PowerBatteryDAQ readings={readings} onConnect={initWebSocket}></PowerBatteryDAQ>
      <MapWidget></MapWidget>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
});

export default App;
