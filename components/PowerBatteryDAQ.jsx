import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from "react-native"

const { width, height } = Dimensions.get("window");

export default function PowerBatteryDAQ() {

  return (
    <View style={styles.power}>

      {/*View for DAQ Connection Status*/}
      <View
        style={styles.powersubdiv}
      >
        <Text style={styles.daqtext}>DAQ Connected</Text>
      </View>

      {/*View for Battery Percentage*/}
      <View
        style={styles.powersubdiv}
      >
        <Text style={styles.batterytext}>75%</Text>
      </View>

      {/*View for Power*/}
      <View
        style={styles.powersubdiv}
      >
        <Text style={styles.powertext}>100</Text>
        <Text style={styles.unitText}>kW</Text>
      </View>
    </View>
  )

};

const styles = StyleSheet.create({
  power: {
    backgroundColor: "#c7e9ff",
    height: width - 10,
    flex: 2,
    borderRadius: 20,
    marginBottom: 10,
    flexDirection: 'row',
    columnGap: 10,
    alignItems: 'center',
  },

  powersubdiv: {
    flex: 1,
    borderColor: '#87b1de',
    borderWidth: 5,
    backgroundColor: "white",
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '90deg' }],
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
    fontSize: 15,
    textAlign: 'center',
  },

  unitText: {
    fontSize: 12,
    textAlign: 'center',
  }
})