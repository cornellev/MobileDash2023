import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import PowerBatteryDAQ from './components/PowerBatteryDAQ';
import SpeedWidget from './components/SpeedWidget';
import MapWidget from './components/MapWidget';
import io from "socket.io-client";

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      socket: null,
    }
  }
  componentDidMount() { // method used for fetching data from server/third party libraries/
    console.log("APP RUN");
    const socket = io(`http://10.0.2.2:3000`); // Need to check if this works on actual device. This refers to localhost for the simulated device
    socket.on("connect", () => {
      console.log("Connected to the server!");
    });
  
    socket.on("disconnect", () => {
      console.log("Disconnected from the server!");
    });
  
    socket.on("error", (error) => {
      console.error("Connection error:", error);
    });
    this.setState({ socket });
    // Your socket connection logic goes here
  }
  render(){
    const{socket} = this.state;

  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: 'column',
        },
      ]}>
      <SpeedWidget></SpeedWidget>
      <PowerBatteryDAQ></PowerBatteryDAQ>
      <MapWidget></MapWidget>
    </View>
  );
};
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
});

export default App;