import React from 'react';
import { StyleSheet, View } from 'react-native';
import PowerBatteryDAQ from './components/PowerBatteryDAQ';
import SpeedWidget from './components/SpeedWidget';

const App = () => {
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
      <PowerBatteryDAQ></PowerBatteryDAQ>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default App;