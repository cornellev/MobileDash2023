import { View, Text, StyleSheet, Dimensions } from "react-native"

const { width, height } = Dimensions.get("window");

export default function SpeedWidget() {

  return (
    <View style={styles.power}>
    </View>
  )

};

const styles = StyleSheet.create({
  power: {
    backgroundColor: "#fad0c3",
    height: width - 10,
    flex: 2,
    borderRadius: 20,
    marginBottom: 10,
  },
})