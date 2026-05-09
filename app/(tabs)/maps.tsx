import { ORS_API_KEY } from "@/src/config/ors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Linking,
  StyleSheet,
  Text,
  View
} from "react-native";

import MapView, {
  Circle,
  Marker,
  Polyline
} from "react-native-maps";

import API from "../api";

export default function MapScreen() {

  const router = useRouter();
  const { lat, lng } = useLocalSearchParams();

  const mapRef = useRef<MapView>(null);

  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState<any>(null);
  const [destination, setDestination] = useState<any>(null);

  const [dangerZones, setDangerZones] = useState<any[]>([]);

  const [routeInfo, setRouteInfo] = useState<any>(null);

  const [safeCoords, setSafeCoords] = useState<any[]>([]);
  const [dangerCoords, setDangerCoords] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);

  //--------------------------------------------------
  // DISTANCE FUNCTION
  //--------------------------------------------------

  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {

    const R = 6371e3;

    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;

    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  //--------------------------------------------------
  // GET USER LOCATION
  //--------------------------------------------------

  useEffect(() => {

    (async () => {

      try {

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setError("Location permission denied");
          setLoading(false);
          return;
        }

        const loc =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High
          });

        setLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        });

      } catch (err) {

        console.log("Location Error:", err);
        setError("Failed to fetch location");

      } finally {

        setLoading(false);

      }

    })();

  }, []);

  //--------------------------------------------------
  // LOAD DANGER ZONES
  //--------------------------------------------------

  useEffect(() => {

    const loadZones = async () => {

      try {

        const res =
          await API.get("/api/zones");

        if (Array.isArray(res.data)) {
          setDangerZones(res.data);
        }

      } catch (err) {

        console.log("Failed to load zones", err);

      }

    };

    loadZones();

  }, []);

  //--------------------------------------------------
  // RECEIVE DESTINATION
  //--------------------------------------------------

  useEffect(() => {

    if (lat && lng) {

      const parsedLat = parseFloat(lat as string);
      const parsedLng = parseFloat(lng as string);

      if (isNaN(parsedLat) || isNaN(parsedLng)) {
        return;
      }

      const dest = {
        lat: parsedLat,
        lng: parsedLng
      };

      AsyncStorage.setItem(
        "destination",
        JSON.stringify(dest)
      );

      setDestination({
        latitude: parsedLat,
        longitude: parsedLng
      });

    }

  }, [lat, lng]);

  //--------------------------------------------------
  // GET ROUTE
  //--------------------------------------------------

  useEffect(() => {

    if (!destination || !location) return;

    const getRoute = async () => {

      try {

        const res = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${location.longitude},${location.latitude}&end=${destination.longitude},${destination.latitude}`
        );

        const data = await res.json();

        if (
          !data.features ||
          !data.features[0]
        ) {
          console.log("No route found");
          return;
        }

        const coords =
          data.features[0].geometry.coordinates.map((c: any) => ({
            latitude: c[1],
            longitude: c[0]
          }));

        let safeSegments: any[] = [];
        let dangerSegments: any[] = [];
        let foundDanger = false;

        for (let i = 0; i < coords.length - 1; i++) {

          const p1 = coords[i];
          const p2 = coords[i + 1];

          let isDanger = false;

          dangerZones?.forEach(zone => {

            if (
              !zone.latitude ||
              !zone.longitude
            ) return;

            const d = getDistance(
              p1.latitude,
              p1.longitude,
              Number(zone.latitude),
              Number(zone.longitude)
            );

            if (d < zone.radius) {
              isDanger = true;
              foundDanger = true;
            }

          });

          if (isDanger) {
            dangerSegments.push([p1, p2]);
          } else {
            safeSegments.push([p1, p2]);
          }

        }

        setSafeCoords(safeSegments.flat());
        setDangerCoords(dangerSegments.flat());

        if (foundDanger) {

          Alert.alert(
            "⚠ Danger Route Warning",
            "This route passes through danger zones"
          );

        }

        setRouteInfo({
          distance:
            data.features[0].properties.summary.distance / 1000,
          duration:
            data.features[0].properties.summary.duration / 60
        });

        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: {
            top: 100,
            right: 100,
            bottom: 300,
            left: 100
          },
          animated: true
        });

      } catch (err) {

        console.log("Route error", err);

      }

    };

    getRoute();

  }, [destination, location, dangerZones]);

  //--------------------------------------------------
  // START GOOGLE NAVIGATION
  //--------------------------------------------------

  const startNavigation = () => {

    if (!destination) return;

    const url =
      `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=driving`;

    Linking.openURL(url);

  };

  //--------------------------------------------------
  // LOADING
  //--------------------------------------------------

  if (loading) {

    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00ffff" />
        <Text style={{ color: "white", marginTop: 10 }}>
          Loading map...
        </Text>
      </View>
    );

  }

  if (error) {

    return (
      <View style={styles.center}>
        <Text style={{ color: "white" }}>
          {error}
        </Text>
      </View>
    );

  }

  if (!location) return null;

  //--------------------------------------------------
  // UI
  //--------------------------------------------------

  return (

    <View style={{ flex: 1 }}>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={location}
        showsUserLocation
      >

        {/* DANGER ZONE CIRCLES */}

        {dangerZones?.map((zone, index) => (

          <Circle
            key={`circle-${zone._id || index}`}
            center={{
              latitude: Number(zone.latitude),
              longitude: Number(zone.longitude),
            }}
            radius={Number(zone.radius) || 100}
            strokeColor="rgba(255,0,0,0.8)"
            fillColor="rgba(255,0,0,0.3)"
          />

        ))}

        {/* DANGER ZONE MARKERS */}

        {dangerZones?.map((zone, index) => (

          <Marker
            key={`marker-${zone._id || index}`}
            coordinate={{
              latitude: Number(zone.latitude),
              longitude: Number(zone.longitude),
            }}
            pinColor="red"
            onPress={() =>
              Alert.alert(
                "⚠ Danger Zone",
                `${zone.type || "Unknown"} | Severity ${zone.severity || "N/A"}\n\n${zone.description || ""
                }`
              )
            }
          />

        ))}

        {/* DESTINATION */}

        {destination?.latitude &&
          destination?.longitude && (

            <Marker coordinate={destination} />

          )}

        {/* SAFE ROUTE */}

        {safeCoords.length > 0 && (

          <Polyline
            coordinates={safeCoords}
            strokeWidth={4}
            strokeColor="blue"
          />

        )}

        {/* DANGER ROUTE */}

        {dangerCoords.length > 0 && (

          <Polyline
            coordinates={dangerCoords}
            strokeWidth={5}
            strokeColor="red"
          />

        )}

      </MapView>

      {/* SEARCH BAR */}

      <View style={styles.searchContainer}>

        <Text
          style={styles.searchInput}
          onPress={() => router.push("/search")}
        >
          Search destination
        </Text>

      </View>

      {/* ROUTE INFO PANEL */}

      {routeInfo && (

        <View style={styles.routePanel}>

          <Text style={{
            fontSize: 18,
            fontWeight: "bold"
          }}>
            {routeInfo.duration.toFixed(0)} min
            ({routeInfo.distance.toFixed(1)} km)
          </Text>

          <Text>
            Best route based on distance
          </Text>

          <Button
            title="Start Navigation"
            onPress={startNavigation}
          />

        </View>

      )}

    </View>

  );

}

const styles = StyleSheet.create({

  map: {
    flex: 1
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black"
  },

  searchContainer: {
    position: "absolute",
    top: 50,
    width: "90%",
    alignSelf: "center"
  },

  searchInput: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10
  },

  routePanel: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: 20
  }

});