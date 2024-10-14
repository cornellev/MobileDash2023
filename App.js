import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, LogBox } from 'react-native';
import * as Location from 'expo-location';
import PowerBatteryDAQ from './components/PowerBatteryDAQ';
import SpeedWidget from './components/SpeedWidget';
import MapWidget from './components/MapWidget';

LogBox.ignoreAllLogs();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      websocket: null,
      readings: {},
      connectionAttempts: 0,
      location: null,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Handle prop changes here if necessary
    return null;
  }

  componentDidMount() {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      this.setState({ location });
    })();
  }

  componentWillUnmount() {
    if (this.state.websocket) {
      this.state.websocket.close();
    }
  }

  getReadings = () => {
    if (this.state.websocket) {
      this.state.websocket.send("getReadings");
    }
  };

  initWebSocket = () => {
    if (this.state.connectionAttempts >= 3) {
      console.log("Max connection attempts reached. Not trying to reconnect.");
      return;
    }

    const wsScheme = "ws"; // Change to "wss" for secure WebSocket connections
    const host = "192.168.1.242"; // Use your server's hostname or IP
    const gateway = `${wsScheme}://${host}/ws`;

    console.log('Trying to open a WebSocket connection…');
    this.setState(prevState => ({ connectionAttempts: prevState.connectionAttempts + 1 }));
    const ws = new WebSocket(gateway);

    ws.onopen = () => {
      console.log('Connection opened');
      this.setState({ websocket: ws });
      this.getReadings();
    };

    ws.onclose = (event) => {
      console.log('Connection closed');
      this.setState(prevState => ({ websocket: null, connectionAttempts: prevState.connectionAttempts + 1 }));
      setTimeout(this.initWebSocket, 2000); // Attempt to reconnect
    };

    ws.onmessage = (event) => {
      console.log(event.data);
      try {
        const myObj = JSON.parse(event.data);
        this.setState({ readings: myObj }); // Update state with new readings
        this.sendDataToServer(myObj); // Send RPM data to server
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    };
  };

  // Function to send data to server
  sendDataToServer = (data) => {
    const { location } = this.state;

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

  render() {
    const { readings } = this.state;
    return (
      <View
        style={[
          styles.container,
          {
            flexDirection: 'column',
          },
        ]}>
        <SpeedWidget readings={readings}></SpeedWidget>
        <PowerBatteryDAQ readings={readings} onConnect={this.initWebSocket}></PowerBatteryDAQ>
        <MapWidget></MapWidget>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
});

export default App;