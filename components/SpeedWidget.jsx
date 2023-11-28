import { View, Text, StyleSheet, Dimensions } from "react-native"
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get("window");

export default function SpeedWidget() {

  return (
    <View style={styles.speed}>
      <View style={styles.circle}>
        <Text style={styles.speedText}>10</Text>
        <Text style={styles.unitText}>mph</Text>
    
      </View>
      
    </View>
  )

};

const styles = StyleSheet.create({
  speed: {
    backgroundColor: "#fad0c3",
    height: width - 10,
    flex: 2,
    borderRadius: 20,
    marginBottom: 10,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center', 
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 200,
    height: 200,
    borderRadius: 200 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    transform: [{ rotate: '90deg' }],
  },
  speedText: {
    fontSize: 60,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: 20,
  }

})