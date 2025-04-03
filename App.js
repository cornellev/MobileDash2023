import React, { useEffect, useState, useRef } from 'react';
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

  const logBufferRef = useRef([]);
  const sendBufferRef = useRef([]);

  useEffect(() => {
    let locationSubscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => {
          setLocation(loc);
          setSpeed(loc.coords.speed);
        }
      );

      const oldFileUri = FileSystem.documentDirectory + 'Mobile-Dash-Log.jsonl';
      try {
        const info = await FileSystem.getInfoAsync(oldFileUri);
        if (info.exists) {
          await FileSystem.deleteAsync(oldFileUri);
          console.log("Old log file deleted.");
        }
      } catch (err) {
        console.log("Error checking or deleting old log file:", err);
      }

      setLogFileName(`Mobile-Dash-Log.jsonl`);
      console.log("Log file initialized:", logFileName);
    })();

    return () => {
      if (websocket) websocket.close();
      if (locationSubscription) locationSubscription.remove();
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

    ws.onclose = (event) => {
      console.log(`Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
      setWebsocket(null);
    };

    ws.onmessage = (event) => {
      requestAnimationFrame(() => {
        try {
          const parsed = JSON.parse(event.data);
          //console.log(parsed)

          const unpackColumnarData = (data) => {
            const keys = Object.keys(data);
            const length = data[keys[0]].length;
            const result = [];

            for (let i = 0; i < length; i++) {
              const obj = {};
              for (const key of keys) {
                obj[key] = data[key][i];
              }
              result.push(obj);
            }

            return result;
          };

          let packetArray;
          if (Array.isArray(parsed)) {
            packetArray = parsed;
          } else if (
            parsed &&
            typeof parsed === 'object' &&
            Object.values(parsed).every(val => Array.isArray(val)) &&
            parsed.timestamp &&
            Array.isArray(parsed.timestamp)
          ) {
            packetArray = unpackColumnarData(parsed);
          } else {
            packetArray = [parsed];
          }

          console.log(packetArray);

          const enrichedBatch = packetArray.map((packet) => ({
            ...packet,
            gps_lat: location?.coords?.latitude || null,
            gps_long: location?.coords?.longitude || null,
            speed: location?.coords?.speed || null,
          }));

          setReadings(prev => ({
            ...prev,
            ...enrichedBatch[enrichedBatch.length - 1]
          }));

          enrichedBatch.forEach((entry) => {
            const filtered = {
              x_accel: entry.x_accel ?? null,
              y_accel: entry.y_accel ?? null,
              z_accel: entry.z_accel ?? null,
              left_rpm: entry.left_rpm ?? null,
              right_rpm: entry.right_rpm ?? null,
              temp: entry.temp ?? null,
              gps_lat: entry.gps_lat ?? null,
              gps_long: entry.gps_long ?? null,
              speed: entry.speed ?? null
            };

            sendBufferRef.current.push(filtered);
            if (sendBufferRef.current.length >= 5) {
              sendBatchToServer(sendBufferRef.current);
              sendBufferRef.current = [];
            }

            saveDataLocally({ ...entry });
          });

        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      });
    };
  };

  const sendBatchToServer = (batch) => {
    fetch('http://live-timing-dash.herokuapp.com/api/insert/uc24', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Successfully sent batch to Live-Timing Dash.');
      })
      .catch((error) => {
        console.error('Error in sending batch to Live-Timing Dash:', error);
      });
  };  

  const saveDataLocally = (data) => {
    const line = JSON.stringify(data);
    logBufferRef.current.push(line);

    if (logBufferRef.current.length >= 1000) {
      flushBufferToDisk();
    }
  };

  const flushBufferToDisk = async () => {
    if (!logFileName || logBufferRef.current.length === 0) return;

    const fileUri = FileSystem.documentDirectory + logFileName;
    const newContent = logBufferRef.current.join('\n') + '\n';

    try {
      let existingContent = '';
      try {
        existingContent = await FileSystem.readAsStringAsync(fileUri);
      } catch (err) {
        console.log("File does not exist yet.")
      }

      const fullContent = existingContent + newContent;

      await FileSystem.writeAsStringAsync(fileUri, fullContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log(`Manually flushed ${logBufferRef.current.length} logs to disk.`);
      logBufferRef.current = [];
    } catch (error) {
      console.error("Error during manual flush:", error);
    }
  };

  const shareLogFile = async () => {
    if (!logFileName) {
      console.log("No log file available yet.");
      return;
    }

    await flushBufferToDisk();

    const fileUri = FileSystem.documentDirectory + logFileName;
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (!fileInfo.exists) {
      console.log("Tried to save but file doesn't exist yet...");
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
      <Button title="Export Data Logs" onPress={shareLogFile} />
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
