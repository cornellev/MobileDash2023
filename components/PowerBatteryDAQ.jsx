import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from "react-native"

const { width, height } = Dimensions.get("window");

export default function PowerBatteryDAQ({ readings }) {
  // State to manage DAQ connection status and temperature
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [temperature, setTemperature] = useState('N/A');

  useEffect(() => {
    // Update connection status based on WebSocket connection
    if (readings && Object.keys(readings).length > 0) {
      setConnectionStatus('Connected');
      // Assuming the JSON object has a key 'temperature' for temperature data
      if (readings.temperature) {
        setTemperature(readings.temperature);
      }
    } else {
      setConnectionStatus('Disconnected');
    }
  }, [readings]);

  return (
    <View style={styles.power}>
      {/*View for DAQ Connection Status*/}
      <View style={styles.powersubdiv}>
        <Text style={styles.daqtext}>DAQ</Text>
        <Text style={styles.unitText}>{connectionStatus}</Text>
      </View>

      {/*View for Battery Percentage (Static for now)*/}
      <View style={styles.powersubdiv}>
        <Text style={styles.batterytext}>75%</Text>
        <Text style={styles.unitText}>battery</Text>
      </View>

      {/*View for Temperature*/}
      <View style={styles.powersubdiv}>
        <Text style={styles.powertext}>{temperature}</Text>
        <Text style={styles.unitText}>ºC</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  power: {
    backgroundColor: "#c7e9ff",
    height: width - 10,
    flex: 2,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },

  powersubdiv: {
    borderColor: '#87b1de',
    borderWidth: 5,
    backgroundColor: "white",
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '90deg' }],

    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },

  powertext: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
    shadowColor: "#000",
  },

  batterytext: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  daqtext: {
    fontSize: 26,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  unitText: {
    fontSize: 12,
    textAlign: 'center',
  }
})