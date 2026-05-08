import { useLocalSearchParams } from 'expo-router';
import { Button, Linking, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function SOSMap() {
  const { lat, lng, type } = useLocalSearchParams();

  const latitude = Number(lat);
  const longitude = Number(lng);

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOS: {type}</Text>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={{ latitude, longitude }} />
      </MapView>

      <Button title="Get Directions" onPress={openDirections} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', padding: 10 },
  map: { flex: 1 },
});
