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
    flex: 5,
    borderRadius: 20,
    marginBottom: 10,
    marginTop: 10,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    position: 'absolute',
    backgroundColor: 'white',
    width: 250,
    height: 250,
    borderRadius: 250 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    transform: [{ rotate: '90deg' }],
    borderWidth: 10,
    borderColor: '#ff6666'
  },
  speedText: {
    fontSize: 70,
    fontWeight: 'bold',
  },
  unitText: {
    fontSize: 20,
  }

})