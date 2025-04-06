import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Button, LogBox, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import PowerBatteryDAQ from './components/PowerBatteryDAQ';
import SpeedWidget from './components/SpeedWidget';
import MapWidget from './components/MapWidget';

const MAX_LINES_PER_FILE = 2000;
const BUFFER_THRESHOLD = 100;
const BATCH_LINES_PER_FLUSH = 500;

const App = () => {
  const [websocket, setWebsocket] = useState(null);
  const [readings, setReadings] = useState({});
  const [location, setLocation] = useState(null);

  const startupID = Math.random().toString(36).substring(2, 12);

  const sendBufferRef = useRef([]);
  const dataBufferRef = useRef([]);

  const logChunkRef = useRef(0);
  const dataChunkRef = useRef(0);
  const dataLineCountRef = useRef(0);

  const batchedLineBufferRef = useRef('');
  const batchedLineCountRef = useRef(0);  


  useEffect(() => {
    logToFile(`✅ Release build loaded with startupID: ${startupID}`);
  }, []);

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
        }
      );
    })();

    return () => {
      if (websocket) websocket.close();
      if (locationSubscription) locationSubscription.remove();
    };
  }, [websocket]);

  const getCurrentLogFilename = () => `${startupID}-${logChunkRef.current}-log.txt`;
  const getCurrentDataFilename = () => `${startupID}-${dataChunkRef.current}-data.jsonl`;

  const flushDataBuffer = async () => {
    if (dataBufferRef.current.length === 0) return;
  
    const linesToFlush = dataBufferRef.current.splice(0, BATCH_LINES_PER_FLUSH);
    const batch = linesToFlush.join('\n') + '\n';
  
    batchedLineBufferRef.current += batch;
    batchedLineCountRef.current += linesToFlush.length;
  
    // 👉 PREEMPTIVELY ROTATE if the next flush will exceed the limit
    if (dataLineCountRef.current + batchedLineCountRef.current >= MAX_LINES_PER_FILE) {
      dataChunkRef.current += 1;
      dataLineCountRef.current = 0;
    }
  
    const fileUri = FileSystem.documentDirectory + getCurrentData
    try {
      let existingContent = '';
      try {
        existingContent = await FileSystem.readAsStringAsync(fileUri);
      } catch (err) {
        // File might not exist yet — that’s fine
      }
  
      const fullContent = existingContent + batchedLineBufferRef.current;
  
      await FileSystem.writeAsStringAsync(fileUri, fullContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
  
      dataLineCountRef.current += batchedLineCountRef.current;
  
      batchedLineBufferRef.current = '';
      batchedLineCountRef.current = 0;
    } catch (err) {
      console.error('❌ Failed to safely write data buffer:', err);
    }
  };
  
  


  const logToFile = async (message) => {
    console.log(message);
    const line = `${new Date().toISOString()} ${typeof message === 'string' ? message : JSON.stringify(message)}\n`;
    const fileUri = FileSystem.documentDirectory + getCurrentLogFilename();

    try {
      let existingContent = '';
      try {
        existingContent = await FileSystem.readAsStringAsync(fileUri);
      } catch (err) {
        // File might not exist yet — that's fine
      }

      const fullContent = existingContent + line;
      await FileSystem.writeAsStringAsync(fileUri, fullContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch (err) {
      console.error('❌ Failed to write log to file:', err);
    }
  };

  const saveDataLocally = (data) => {
    const line = JSON.stringify(data);
    dataBufferRef.current.push(line);
    if (dataBufferRef.current.length >= BUFFER_THRESHOLD) {
      flushDataBuffer();
    }
  };

  const exportAllLogs = async () => {
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
    const relevantFiles = files.filter(f =>
      (f.startsWith(startupID))
    );

    for (const file of relevantFiles) {
      const fileUri = FileSystem.documentDirectory + file;
      try {
        await Sharing.shareAsync(fileUri);
      } catch (err) {
        console.error(`❌ Failed to share ${file}:`, err);
      }
    }
  };

  const getReadings = () => {
    if (websocket) {
      websocket.send("getReadings");
    }
  };

  const initWebSocket = () => {
    if (websocket) {
      logToFile("WebSocket is already connected.");
      return;
    }

    const wsScheme = "ws";
    const host = "192.168.1.242";
    const gateway = `${wsScheme}://${host}/ws`;

    logToFile('Trying to open a WebSocket connection…');
    const ws = new WebSocket(gateway);

    ws.onopen = () => {
      logToFile('Connection opened');
      setWebsocket(ws);
      getReadings();
    };

    ws.onclose = (event) => {
      logToFile(`Connection closed. Code: ${event.code}, Reason: ${event.reason}`);
      setWebsocket(null);
    };

    ws.onmessage = (event) => {
      requestAnimationFrame(() => {
        try {
          const parsed = JSON.parse(event.data);

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

          //logToFile('Received WebSocket data batch.');

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
            if (sendBufferRef.current.length >= BUFFER_THRESHOLD) {
              sendBatchToServer(sendBufferRef.current[sendBufferRef.current.length - 1]);
              sendBufferRef.current = [];
            }

            saveDataLocally(entry);
          });

        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      });
    };
  };

  const sendBatchToServer = (batch) => {
    //logToFile(batch);

    fetch('http://live-timing-dash.herokuapp.com/api/insert/uc24', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    })
      .then(response => {
        if (!response.ok) {
          logToFile(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        //logToFile('Successfully sent batch to Live-Timing Dash.');
      })
      .catch((error) => {
        logToFile(`Error in sending batch to Live-Timing Dash: ${error}`);
      });
  };

  return (
    <View style={[styles.container, { flexDirection: 'column' }]}>
      <SpeedWidget speedData={typeof readings.left_rpm === 'number' ? readings.left_rpm * 0.00090506 : null} />
      <PowerBatteryDAQ readings={readings} onConnect={initWebSocket} />
      <MapWidget />
      <Button title="Export All Logs" onPress={exportAllLogs} />
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