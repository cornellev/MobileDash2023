import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, LogBox } from 'react-native';
import * as Location from 'expo-location';
import PowerBatteryDAQ from './components/PowerBatteryDAQ';
import SpeedWidget from './components/SpeedWidget';
import MapWidget from './components/MapWidget';

LogBox.ignoreAllLogs();

const App = () => {
  const [websocket, setWebsocket] = useState(null);
  const [readings, setReadings] = useState({});
  const [connectionAttempts, setConnectionAttempts] = useState(0); // New state for tracking connection attempts
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Clean up WebSocket connection when the component unmounts
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
    if (connectionAttempts >= 3) { // Check if maximum attempts have been reached
      console.log("Max connection attempts reached. Not trying to reconnect.");
      return;
    }

    const wsScheme = "ws"; // Change to "wss" for secure WebSocket connections
    const host = "192.168.1.242"; // Use your server's hostname or IP
    const gateway = `${wsScheme}://${host}/ws`;

    console.log('Trying to open a WebSocket connection…');
    setConnectionAttempts(connectionAttempts + 1);
    const ws = new WebSocket(gateway);

    ws.onopen = () => {
      console.log('Connection opened');
      setWebsocket(ws);
      getReadings();
    };

    ws.onclose = (event) => {
      console.log('Connection closed');
      setWebsocket(null);
      setConnectionAttempts(prevAttempts => prevAttempts + 1); // Increment connection attempts
      setTimeout(initWebSocket, 2000); // Attempt to reconnect
    };


    ws.onmessage = (event) => {
      console.log(event.data);
      try {
        const myObj = JSON.parse(event.data);
        setReadings(myObj); // Update state with new readings
        sendDataToServer(myObj); // Send RPM data to server
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };
  };

  // Function to send data to server
  const sendDataToServer = (data) => {
    setLocation(location);

    const postData = {
      x_accel: data["x_accel"] ? parseFloat(data["x_accel RM"]) : null,
      y_accel: data["y_accel"] ? parseFloat(data["y_accel RM"]) : null,
      z_accel: data["z_accel"] ? parseFloat(data["z_accel RM"]) : null,
      gps_lat: location?.coords?.latitude,
      gps_long: location?.coords?.longitude,
      left_rpm: data["LEFT RPM"] ? parseFloat(data["LEFT RPM"]) : null,
      right_rpm: data["RIGHT RPM"] ? parseFloat(data["RIGHT RPM"]) : null,
      potent: null,
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
