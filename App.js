import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import PowerBatteryDAQ from './components/PowerBatteryDAQ';
import SpeedWidget from './components/SpeedWidget';
import MapWidget from './components/MapWidget';

const App = () => {
  const [websocket, setWebsocket] = useState(null);
  const [readings, setReadings] = useState({});
  const [connectionAttempts, setConnectionAttempts] = useState(0); // New state for tracking connection attempts

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
    if (connectionAttempts >= 25) { // Check if maximum attempts have been reached
      console.log("Max connection attempts reached. Not trying to reconnect.");
      return;
    }

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
    const postData = {
      speed: null,
      voltage: null,
      safety: null,
      left_rpm: data["LEFT RPM"] ? parseFloat(data["LEFT RPM"]) : null,
      right_rpm: data["RIGHT RPM"] ? parseFloat(data["RIGHT RPM"]) : null,
    };

    fetch('http://live-timing-dash.herokuapp.com/sept_test_table', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
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
      <PowerBatteryDAQ readings={readings}></PowerBatteryDAQ>
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
