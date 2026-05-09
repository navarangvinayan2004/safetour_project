import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";

import {
    ActivityIndicator,
    Alert,
    Button,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

import MapView, {
    Circle,
    MapPressEvent,
    Marker
} from "react-native-maps";

import API from "../api";

type Coordinate = {
  latitude: number;
  longitude: number;
};

type DangerZone = {
  _id: string;
  latitude: number;
  longitude: number;
  radius: number;
  severity: string;
  type: string;
  description?: string;
};

export default function ZoneManager() {

  const [loading, setLoading] = useState(true);

  const [point, setPoint] =
    useState<Coordinate | null>(null);

  const [type, setType] =
    useState("crime");

  const [severity, setSeverity] =
    useState("high");

  const [description, setDescription] =
    useState("");

  const [radius, setRadius] =
    useState(500);

  const [dangerZones, setDangerZones] =
    useState<DangerZone[]>([]);

  //--------------------------------------------------
  // LOAD ZONES
  //--------------------------------------------------

  const loadZones = async () => {

    try {

      setLoading(true);

      const res =
        await API.get("/api/zones");

      if (Array.isArray(res.data)) {

        const validZones =
          res.data.filter((zone: DangerZone) => {

            return (
              zone.latitude &&
              zone.longitude &&
              !isNaN(Number(zone.latitude)) &&
              !isNaN(Number(zone.longitude))
            );

          });

        setDangerZones(validZones);

      }

    } catch (err) {

      console.log("Failed to load zones", err);

      Alert.alert(
        "Error",
        "Failed to load danger zones"
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadZones();

  }, []);

  //--------------------------------------------------
  // SAVE ZONE
  //--------------------------------------------------

  const saveZone = async () => {

    if (!point) {

      Alert.alert(
        "Select Location",
        "Tap map to select location"
      );

      return;
    }

    try {

      await API.post("/api/zones", {
        latitude: point.latitude,
        longitude: point.longitude,
        radius,
        severity,
        type,
        description
      });

      Alert.alert(
        "Success",
        "Danger zone saved"
      );

      setPoint(null);
      setDescription("");

      loadZones();

    } catch (err) {

      console.log("Save Zone Error:", err);

      Alert.alert(
        "Error",
        "Failed to save zone"
      );

    }

  };

  //--------------------------------------------------
  // DELETE ZONE
  //--------------------------------------------------

  const deleteZone = async (
    zoneId: string
  ) => {

    try {

      await API.delete(
        `/api/zones/${zoneId}`
      );

      Alert.alert(
        "Deleted",
        "Zone deleted"
      );

      loadZones();

    } catch (err) {

      console.log("Delete Error:", err);

      Alert.alert(
        "Error",
        "Failed to delete zone"
      );

    }

  };

  //--------------------------------------------------
  // MAP PRESS
  //--------------------------------------------------

  const handleMapPress = (
    e: MapPressEvent
  ) => {

    try {

      const coord =
        e.nativeEvent.coordinate;

      setPoint({
        latitude: coord.latitude,
        longitude: coord.longitude
      });

    } catch (err) {

      console.log("Map Press Error:", err);

    }

  };

  //--------------------------------------------------
  // LOADING
  //--------------------------------------------------

  if (loading) {

    return (

      <View style={styles.center}>

        <ActivityIndicator
          size="large"
          color="#00ffff"
        />

        <Text style={styles.loadingText}>
          Loading danger zones...
        </Text>

      </View>

    );

  }

  //--------------------------------------------------
  // UI
  //--------------------------------------------------

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        ⚠ Mark Danger Zone
      </Text>

      <MapView
        style={styles.map}
        onPress={handleMapPress}
        initialRegion={{
          latitude: 11.8745,
          longitude: 75.3704,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2
        }}
      >

        {/* EXISTING ZONES */}

        {dangerZones?.map((zone, index) => {

          const latitude =
            Number(zone.latitude);

          const longitude =
            Number(zone.longitude);

          if (
            isNaN(latitude) ||
            isNaN(longitude)
          ) return null;

          return (

            <View
              key={zone._id || index}
            >

              <Circle
                center={{
                  latitude,
                  longitude
                }}
                radius={
                  Number(zone.radius) || 500
                }
                strokeColor="rgba(255,0,0,0.8)"
                fillColor="rgba(255,0,0,0.3)"
              />

              <Marker
                coordinate={{
                  latitude,
                  longitude
                }}
                pinColor="red"
                onPress={() =>

                  Alert.alert(
                    "Danger Zone",

                    `${zone.type}

Severity: ${zone.severity}

${zone.description || "No description"}`,

                    [
                      {
                        text: "Cancel"
                      },

                      {
                        text: "Delete",
                        style: "destructive",

                        onPress: () =>
                          deleteZone(zone._id)
                      }
                    ]
                  )

                }
              />

            </View>

          );

        })}

        {/* SELECTED POINT */}

        {point && (

          <>

            <Marker coordinate={point} />

            <Circle
              center={point}
              radius={radius}
              strokeColor="red"
              fillColor="rgba(255,0,0,0.3)"
            />

          </>

        )}

      </MapView>

      {/* CONTROL PANEL */}

      <View style={styles.bottomPanel}>

        <ScrollView>

          <Text>Danger Type</Text>

          <Picker
            selectedValue={type}
            onValueChange={setType}
          >

            <Picker.Item
              label="Crime"
              value="crime"
            />

            <Picker.Item
              label="Accident"
              value="accident"
            />

            <Picker.Item
              label="Weather"
              value="weather"
            />

          </Picker>

          <Text>Severity</Text>

          <Picker
            selectedValue={severity}
            onValueChange={setSeverity}
          >

            <Picker.Item
              label="Low"
              value="low"
            />

            <Picker.Item
              label="Medium"
              value="medium"
            />

            <Picker.Item
              label="High"
              value="high"
            />

          </Picker>

          <Text>Description</Text>

          <TextInput
            placeholder="Enter short description..."
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            multiline
          />

          <Text>
            Radius: {radius} m
          </Text>

          <Slider
            minimumValue={100}
            maximumValue={2000}
            step={100}
            value={radius}
            onValueChange={setRadius}
          />

          {point && (

            <Button
              title="Save Zone"
              onPress={saveZone}
            />

          )}

        </ScrollView>

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

  loadingText: {
    color: "white",
    marginTop: 10
  },

  title: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    color: "white",
    fontWeight: "bold"
  },

  map: {
    flex: 1
  },

  bottomPanel: {
    maxHeight: 300,
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#ddd"
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10
  }

});