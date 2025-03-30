import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Button, LogBox } from 'react-native';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import PowerBatteryDAQ from './components/PowerBatteryDAQ';
import SpeedWidget from './components/SpeedWidget';
import MapWidget from './components/MapWidget';

LogBox.ignoreAllLogs();

const App = () => {
  const [websocket, setWebsocket] = useState(null);
  const [readings, setReadings] = useState({});
  const [speed, setSpeed] = useState(null);
  const [location, setLocation] = useState(null);
  const [logFileName, setLogFileName] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setSpeed(location.coords.speed);

      // Create a unique log filename for this session
      const sessionId = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `readings_log_${sessionId}.jsonl`;
      setLogFileName(fileName);
      console.log("Log file initialized:", fileName);
    })();

    return () => {
      if (websocket) websocket.close();
    };
  }, []);

  const getReadings = () => {
    if (websocket) {
      websocket.send("getReadings");
    }
  };

  const initWebSocket = () => {
    if (websocket) {
      console.log("WebSocket is already connected.");
      return;
    }

    const wsScheme = "ws";
    const host = "192.168.1.242";
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
      setWebsocket(null);
    };

    ws.onmessage = (event) => {
      requestAnimationFrame(() => {
        try {
          const myObj = JSON.parse(event.data);
          setReadings(prev => ({ ...prev, ...myObj }));
          sendDataToServer(myObj);
          saveDataLocally(myObj);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      });
    };
  };

  const sendDataToServer = (data) => {
    setLocation(location);

    const postData = {
      x_accel: data["x_accel"] ? parseFloat(data["x_accel"]) : null,
      y_accel: data["y_accel"] ? parseFloat(data["y_accel"]) : null,
      z_accel: data["z_accel"] ? parseFloat(data["z_accel"]) : null,
      gps_lat: location?.coords?.latitude || null,
      gps_long: location?.coords?.longitude || null,
      speed: location?.coords?.speed || null,
      left_rpm: data["left_rpm"] ? parseFloat(data["left_rpm"]) : null,
      right_rpm: data["right_rpm"] ? parseFloat(data["right_rpm"]) : null,
      potent: data["potent"] ? parseFloat(data["potent"]) : null,
      temp: data["temperature"] ? parseFloat(data["temperature"]) : null,
    };

    fetch('http://live-timing-dash.herokuapp.com/api/insert/uc24', {
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

  const saveDataLocally = async (data) => {
    if (!logFileName) return;

    const timestamp = new Date().toISOString();
    const fileUri = FileSystem.documentDirectory + logFileName;
    const line = JSON.stringify({ timestamp, ...data }) + '\n';

    try {
      await FileSystem.writeAsStringAsync(fileUri, line, {
        encoding: FileSystem.EncodingType.UTF8,
        append: true,
      });
      console.log("Appended data locally:", line.trim());
    } catch (error) {
      console.error("Error writing to file:", error);
    }
  };

  const shareLogFile = async () => {
    if (!logFileName) {
      console.log("No log file available yet.");
      return;
    }

    const fileUri = FileSystem.documentDirectory + logFileName;

    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      console.log("File doesn't exist yet");
      return;
    }

    try {
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Error sharing file:", error);
    }
  };

  return (
    <View style={[styles.container, { flexDirection: 'column' }]}>
      <SpeedWidget speedData={speed} />
      <PowerBatteryDAQ readings={readings} onConnect={initWebSocket} />
      <MapWidget />
      <Button title="Share Logs" onPress={shareLogFile} />
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
