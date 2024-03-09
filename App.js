import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import PowerBatteryDAQ from './components/PowerBatteryDAQ';
import SpeedWidget from './components/SpeedWidget';
import MapWidget from './components/MapWidget';

const App = () => {
  const [websocket, setWebsocket] = useState(null);
  const [readings, setReadings] = useState({});

  useEffect(() => {
    initWebSocket();
    // Clean up WebSocket connection when the component unmounts
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
    const wsScheme = "ws"; // Change to "wss" for secure WebSocket connections
    const host = "172.20.10.9"; // Use your server's hostname or IP
    const gateway = `${wsScheme}://${host}/ws`;

    console.log('Trying to open a WebSocket connection…');
    const ws = new WebSocket(gateway);

    ws.onopen = () => {
      console.log('Connection opened');
      setWebsocket(ws);
      getReadings();
    };

    ws.onclose = (event) => {
      console.log('Connection closed');
      setWebsocket(null);
      setTimeout(initWebSocket, 2000); // Attempt to reconnect
    };

    ws.onmessage = (event) => {
      console.log(event.data);
      const myObj = JSON.parse(event.data);
      setReadings(myObj); // Update state with new readings
    };
  };

  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: 'column',
        },
      ]}>
      <SpeedWidget rpmReadings={readings}></SpeedWidget>
      <PowerBatteryDAQ></PowerBatteryDAQ>
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