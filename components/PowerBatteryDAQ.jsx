import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from "react-native"

const { width } = Dimensions.get("window");

export default function PowerBatteryDAQ({ readings, onConnect }) {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [temperature, setTemperature] = useState('N/A');

  useEffect(() => {
    if (readings && Object.keys(readings).length > 0) {
      setConnectionStatus('Connected');
      if (readings.temperature) {
        setTemperature(readings.temperature);
      }
    } else {
      setConnectionStatus('Disconnected');
    }
  }, [readings]);

  useEffect(() => {
    let interval;
  
    if (connectionStatus === 'Disconnected') {
      interval = setInterval(() => {
        console.log('Attempting reconnection...');
        setConnectionStatus('Connecting');
        onConnect();
      }, 5000);
    }
  
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionStatus]);  

  const handlePress = () => {
    if (connectionStatus === 'Disconnected') {
      setConnectionStatus('Connecting');
      onConnect();
      setConnectionStatus('Disconnected');
    }
  };

  return (
    <View style={styles.power}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.powersubdiv,
          connectionStatus === 'Connected' ? styles.daqConnected : (connectionStatus == 'Connecting' ? styles.daqConnecting : styles.daqDisconnected)
        ]}
      >
        <Text style={styles.daqtext}>DAQ</Text>
      </TouchableOpacity>

      {/* Battery (static) */}
      <View style={styles.powersubdiv}>
        <Text style={styles.batterytext}>75%</Text>
        <Text style={styles.unitText}>battery</Text>
      </View>

      {/* Temperature */}
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
    marginVertical: 15,
    marginHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '90deg' }],
    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },

  daqConnected: {
    backgroundColor: "#A3CFAD",
  },

  daqConnecting: {
    backgroundColor: "#fc9d03",
  },

  daqDisconnected: {
    backgroundColor: "#ff6666",
  },

  powertext: {
    fontSize: 30,
    textAlign: 'center',
    fontWeight: 'bold',
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
    color: "black", 
  },

  unitText: {
    fontSize: 12,
    textAlign: 'center',
  }
});
