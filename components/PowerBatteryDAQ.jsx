import { View, Text, StyleSheet, Dimensions } from "react-native"

const { width, height } = Dimensions.get("window");

export default function PowerBatteryDAQ() {

  return (
    <View style={styles.power}>
    </View>
  )

};

const styles = StyleSheet.create({
  power: {
    backgroundColor: "#c7e9ff",
    height: width - 10,
    flex: 1,
    borderRadius: 20,
    marginBottom: 10,
  },
})