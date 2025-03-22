import { View, Text, StyleSheet, Dimensions, ProgressBar, TextInput, TouchableOpacity, TouchableHighlight } from "react-native"
const { width, height } = Dimensions.get("window");
import Svg, { Path } from 'react-native-svg';
import React, {useState, useEffect} from 'react';
import { Stopwatch } from 'react-native-stopwatch-timer'

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

const PI = 3.1415926536;
const wheelDiameter = 22.42; // inches

export default function SpeedWidget(speedData) {
  // speedometer 
  const [speed, setSpeed] = useState("0"); // initial value
  const [speedBarWidth, setSpeedBarWidth] = useState('0%');
  const [speedBarColor, setSpeedBarColor] = useState(startColor);

  const [time, setTime] = useState(0);

  useEffect(() => {
    // const calcSpeed = (leftRPM, rightRPM, diameter) => {
    //   let avgRPM = (parseFloat(leftRPM) + parseFloat(rightRPM)) / 2;
    //   let inchesPerMin = diameter * PI * avgRPM;
    //   let milesPerHour = inchesPerMin * (60.0 / 63360.0);
    //   return milesPerHour;
    // };
  
    if (speedData) {
      //let calculatedSpeed = calcSpeed(readings['LEFT RPM'], readings['RIGHT RPM'], wheelDiameter);
      // Check for NaN and use 0 instead
      calculatedSpeed = isNaN(speedData["speedData"]) ? 0 : speedData["speedData"] * 2.237; // Convert to MPH
      
      setSpeed(calculatedSpeed.toString()); // Convert to string for the TextInput value
      
      const newWidth = `${(Math.max(0, Math.min(calculatedSpeed, maxSpeed)) / maxSpeed) * 98}%`;
      const newColor = interpolateColor(calculatedSpeed, 0, maxSpeed, startColor, endColor);
      setSpeedBarWidth(newWidth);
      setSpeedBarColor(newColor);
    }



  }, [speedData]);

  const [isRunning, setIsRunning] = useState(false); // state for whether stopwatch is running
  const [startTime, setStartTime] = useState(0); // state for stopwatch's starting time
  const [totalTime, setTotalTime] = useState(0); // state for stopwatch's total running time
  const [prevTime, setPrevTime] = useState(0); // state for the stopped total running time
  const [prevLap, setPrevLap] = useState(0); // state for time for previous lap
  const [lapCount, setLapCount] = useState(0); // state for lap count index
  const [lapData, setLapData] = useState([]) // array of lap times

  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => { // setInterval executes a certain action every specified ms; requires a function
        setTotalTime(Date.now() - startTime + prevTime)
      }, 10); 
    } 
    else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStartStop = () => {
    if (!isRunning) {
      console.log(lapData);
      setStartTime(Date.now());
      setIsRunning(true);
    }
    else {
      setPrevTime(totalTime);
      setIsRunning(false);
    }
  }

  const handleLap = () => {
    if (isRunning) {
      console.log("Lap " + lapCount);
      console.log(lapData);

      let lapInterval = totalTime - prevLap
      setLapData(prevLapData => [...prevLapData, lapInterval]);

      setLapCount(prevCount => prevCount + 1);
      setPrevLap(totalTime);
    }
  }
  
  const handleReset = () => {
    setIsRunning(false);
    sendData(0, lapData, totalTime);
    console.log(lapData);
    setTotalTime(0);
    setStartTime(0);
    setPrevTime(0);
    setPrevLap(0);
    setLapCount(0);
    setLapData([]);
  }

  const handleLapPress = () => {
    // Save the lap time and reset the stopwatch
    if (isStopwatchStart) {
      setLapTime(lapTime + totalTime);
      console.log("lapData " + lapData);
      console.log("total: " + totalTime);
      
      const totalTimeInMs = convertTimeToMilliseconds(totalTime);
      const lastTimeTemp = lapData.length > 0 ? convertTimeToMilliseconds(lapData[lapData.length - 1]) : 0;
      const lapDuration = totalTimeInMs -  lastTimeTemp;
      const formattedLapDuration = convertMillisecondsToTime(lapDuration);

      setLapData((prevLapData) => [...prevLapData, lapTime + totalTime]);
      setLapDataB((prevLapDataB) => [...prevLapDataB, formattedLapDuration]);

      setLapTime(0);
      setLapCount((prevLapCount) => prevLapCount + 1);
    }
  };

  const convertTimeToMilliseconds = (timeString) => {
    const [hours, minutes, seconds, milliseconds] = timeString.split(':').map(Number);
    return hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
  };
  
  const convertMillisecondsToTime = (milliseconds) => {
    const pad = (num) => (num < 10 ? `0${num}` : num.toString());
    const seconds = Math.floor((milliseconds / 1000) % 60);
    const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(milliseconds % 1000)}`;
    return formattedTime;
  };

  const handleTotalTimePress = () => {
    if (totalTime !== 0) { //  data if there is anySend
      sendData(1, lapData, totalTime); 
    }

    if (isStopwatchStart) {
      // If stopwatch is stopping, reset should be true
      setResetStopwatch(true);
      setLapCount(0);
      setTimeData((prevTotal) => [...prevTotal, totalTime]);
      setTotalTime(0);
      setLapData([]);
    } else {
      // If stopwatch is starting, reset should be false
      setResetStopwatch(false);
    }

    setIsStopwatchStart(!isStopwatchStart);
  };

  const onPress = () => null;

  function sendData(lap_ids, lap_times, total_time) {
    const postData = {
      lap_ids: parseFloat(lap_ids),
      lap_times: lap_times.map(num => parseFloat(num)),
      total_time: parseFloat(total_time)
    };
    console.log(JSON.stringify(postData));
  
    fetch('http://live-timing-dash.herokuapp.com/api/v1/timing', { // Test connection to endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData),
    })
    .then(response => {
      if (!response.ok) {
        // Handle non-200 HTTP status codes
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text(); // Change to .text() to capture the response as a string
    })
    .then(data => {
      console.log('Response:', data);
      try {
        const jsonData = JSON.parse(data);
        console.log('Successfully sent timer data to Live-Timing Dash:', jsonData);
      } catch (e) {
        console.error('Error parsing JSON response:', e);
      }
    })
    .catch((error) => {
      console.error('Error in sending timer data to Live-Timing Dash:', error);
    });
  }

  return (
    <View style={styles.speed}>
      
      {/* For speedometer */}
      <View style={styles.speedCircle}>
        <Text style={styles.speedText}>{Math.round(speed)}</Text>
        <Text style={styles.speedUnitText}>mph</Text>
        <Text style={{bottom: 15}}>opt: 7.0</Text>
      </View>

      {/* For stopwatch time display */}
      <View style={styles.timeDisplayContainer}>
        <Text>{convertMillisecondsToTime(totalTime)}</Text>
      </View>

      {/* For stopwatch controls */}
      <TouchableOpacity onPress={handleLap} style={styles.lapCircle}>
        <Text>Lap {lapCount}</Text>
        <Text>{lapCount != 0 ? convertMillisecondsToTime(lapData[lapCount-1]) : '---'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleReset} style={styles.resetCircle}>
        <Text>Reset!</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleStartStop} style={styles.startstopCircle}>
        <Text>Start/Stop!</Text>
      </TouchableOpacity>
    </View>
  );
}

const options = {
  container: {
    backgroundColor: 'transparent',
    padding: 5,
    borderRadius: 5,
    width: 220,
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
    color: 'black',
    marginLeft: 7,
  }
};

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
  timeDisplayContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 130,
    height: 50, 
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    transform: [{ rotate: '90deg' }],
    borderRadius: 5,
    borderColor: 'black',
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
  lapCircle: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 120,
    height: 120,
    borderRadius: 120 / 2,
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
    activeOpacity: 0.7,
  },
  resetCircle: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 80,
    height: 80,
    borderRadius: 80 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    transform: [{ rotate: '90deg' }],
    borderWidth: 5,
    borderColor: '#ff6666',
    bottom: 10,
    left: 140,
    shadowColor: "#000",
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
    activeOpacity: 0.7,
  },
  startstopCircle: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 120,
    height: 120,
    borderRadius: 120 / 2,
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
    underlayColor: '#DDDDDD',
    activeOpacity: 0.7,
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
    fontSize: 20,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  speedUnitText: {
    fontSize: 30,
    bottom: 10,
  },
  unitText: {
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 20,
    includeFontPadding: false
  },
})