import { useLocalSearchParams } from 'expo-router';
import {
  Button,
  Linking,
  StyleSheet,
  Text,
  View
} from 'react-native';

import MapView, { Marker } from 'react-native-maps';

export default function SOSMap() {

  const { lat, lng, type } = useLocalSearchParams();

  //--------------------------------------------------
  // SAFE PARSING
  //--------------------------------------------------

  const latitude = Number(lat);
  const longitude = Number(lng);

  //--------------------------------------------------
  // INVALID COORDINATES
  //--------------------------------------------------

  if (
    !latitude ||
    !longitude ||
    isNaN(latitude) ||
    isNaN(longitude)
  ) {

    return (

      <View style={styles.center}>

        <Text style={styles.errorText}>
          Invalid SOS location
        </Text>

      </View>

    );

  }

  //--------------------------------------------------
  // OPEN GOOGLE MAPS
  //--------------------------------------------------

  const openDirections = () => {

    try {

      const url =
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

      Linking.openURL(url);

    } catch (err) {

      console.log("Navigation Error:", err);

    }

  };

  //--------------------------------------------------
  // UI
  //--------------------------------------------------

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        🚨 SOS: {type || "Emergency"}
      </Text>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >

        <Marker
          coordinate={{
            latitude,
            longitude
          }}
          pinColor="red"
        />

      </MapView>

      <View style={styles.buttonContainer}>

        <Button
          title="Get Directions"
          onPress={openDirections}
        />

      </View>

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "black"
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black"
  },

  errorText: {
    color: "white",
    fontSize: 16
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 12,
    color: "white"
  },

  map: {
    flex: 1
  },

  buttonContainer: {
    padding: 10,
    backgroundColor: "white"
  }

});