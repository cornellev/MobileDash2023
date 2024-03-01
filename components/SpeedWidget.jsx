import { View, Text, StyleSheet, Dimensions, ProgressBar, TextInput } from "react-native"
const { width, height } = Dimensions.get("window");
import Svg, { Path } from 'react-native-svg';
import React, {useState, useEffect} from 'react';



const interpolateColor = (speed, minSpeed, maxSpeed, startColor, endColor) => {
  // Calculate ratio of current speed within speed range
  const ratio = (speed - minSpeed) / (maxSpeed - minSpeed);
  // Interpolate the red and green components of the color
  const red = startColor[0] + ratio * (endColor[0] - startColor[0]);
  const green = startColor[1] + ratio * (endColor[1] - startColor[1]);
  return `rgb(${Math.round(red)}, ${Math.round(green)}, ${startColor[2]})`;
};

// Define start (red) and end (green) colors in RGB
const startColor = [150, 0, 50]; // Red
const endColor = [0, 150, 50]; // Green

const maxSpeed = 20;
const speed = 20; // Need to get this value
const speedBarWidth = `0%`; // Need to be updating this value on speed value change
const speedBarColor = interpolateColor(speed, 0, maxSpeed, startColor, endColor);

export default function SpeedWidget({socket}) {
  const [speed, setSpeed] = useState("0"); // initial value
  const [speedBarWidth, setSpeedBarWidth] = useState('0%');
  const [speedBarColor, setSpeedBarColor] = useState(startColor);

  useEffect(() => { // Update speedBarWidth and speedBarColor
    const newWidth = `${(Math.max(0, Math.min(speed, maxSpeed)) / maxSpeed) * 98}%`;
    const newColor = interpolateColor(speed, 0, maxSpeed, startColor, endColor);
    
    setSpeedBarWidth(newWidth);
    setSpeedBarColor(newColor);
  }, [speed]); 

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
  };
  const updateSpeed=()=> { // for updating speed on client side & emitting to server
    const serverSpeed = speed; // replace w/ server value got from API call or HTTP request
    setSpeed(serverSpeed);
    if (socket) {
      socket.emit("updateSpeed", {speed: serverSpeed}) // submit event to server
    }
  };
   
  

  return (
    <View style={styles.speed}>
      <View style={styles.speedCircle}>
      <TextInput
         style={styles.speedText}
         value = {speed}
         onSubmitEditing = {() => updateSpeed()}
         onChangeText = {speed => {
          handleSpeedChange({speed})
         }}
         
         keyboardType = "numeric"/>
        {/* <Text style={styles.speedText}>{Math.floor(speed)}</Text>  */}
        <Text style={styles.speedUnitText}>mph</Text>
      </View>
      <View style={styles.lapMinCircle}>
        <Text style={styles.smallText}>10:40</Text> 
        <Text style={styles.unitText}>mins/lap</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: speedBarWidth }, { backgroundColor: speedBarColor }]} />
      </View>
      <View style={styles.totalTimeCircle}>
        <Text style={styles.smallText}>12:55</Text> 
        <Text style={styles.unitText}>total mins</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  speed: {
    backgroundColor: "#fad0c3",
    height: width - 10,
    flex: 5,
    borderRadius: 20,
    marginBottom: 15,
    marginTop: 15,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: "#000",
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  progressBarContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 110,
    height: 10, 
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    transform: [{ rotate: '90deg' }],
    borderRadius: 20,

    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  progressBar: {
    height: '85%',
    borderRadius: 5, 
    justifyContent: 'center',

    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  speedCircle: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 230,
    height: 230,
    borderRadius: 250 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    transform: [{ rotate: '90deg' }],
    borderWidth: 5,
    borderColor: '#ff6666',
    right: 10,

    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  lapMinCircle: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    transform: [{ rotate: '90deg' }],
    borderWidth: 5,
    borderColor: '#ff6666',
    top: 10, 
    left: 10,

    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  totalTimeCircle: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    transform: [{ rotate: '90deg' }],
    borderWidth: 5,
    borderColor: '#ff6666',
    bottom: 10, 
    left: 10,

    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  speedText: {
    fontSize: 120,
    fontWeight: 'bold',
    marginBottom: 0,
  },

  smallText: {
    fontSize: 30,
    marginBottom: 5,
    fontWeight: 'bold',
  },

  speedUnitText: {
    fontSize: 30,
    bottom: 10,
  },

  unitText: {
    fontSize: 10,
    bottom: 10,
  },

})