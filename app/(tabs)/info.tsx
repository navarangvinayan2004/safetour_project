import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  useColorScheme
} from "react-native";

import { createInfoStyles } from "@/src/styles/infostyles";
import { DarkColors, LightColors } from "@/src/theme/colors";
import API from "../api";

export default function InfoScreen() {

  const scheme = useColorScheme();
  const colors = scheme === "dark"
    ? DarkColors
    : LightColors;

  const styles = createInfoStyles(colors);

  const [weather, setWeather] = useState<any>(null);
  const [city, setCity] = useState("");
  const [guidelines, setGuidelines] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //--------------------------------------------------
  // LOAD INFO
  //--------------------------------------------------

  useEffect(() => {

    const loadInfo = async () => {

      try {

        setLoading(true);

        let latitude: number;
        let longitude: number;

        //----------------------------------
        // CHECK STORED DESTINATION
        //----------------------------------

        const stored =
          await AsyncStorage.getItem("destination");

        if (stored) {

          try {

            const dest = JSON.parse(stored);

            latitude = parseFloat(dest.lat);
            longitude = parseFloat(dest.lng);

            if (
              isNaN(latitude) ||
              isNaN(longitude)
            ) {
              throw new Error("Invalid destination");
            }

            await AsyncStorage.removeItem("destination");

          } catch {

            setError("Invalid destination data");
            return;

          }

        }

        //----------------------------------
        // CURRENT LOCATION
        //----------------------------------

        else {

          const { status } =
            await Location.requestForegroundPermissionsAsync();

          if (status !== "granted") {

            setError("Location permission denied");
            return;

          }

          const loc =
            await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High
            });

          latitude = loc.coords.latitude;
          longitude = loc.coords.longitude;

        }

        //----------------------------------
        // WEATHER
        //----------------------------------

        try {

          const weatherRes =
            await API.get("/api/info/weather", {
              params: {
                latitude,
                longitude
              },
            });

          setWeather(weatherRes.data);

        } catch (err) {

          console.log("Weather Error:", err);

        }

        //----------------------------------
        // CITY NAME
        //----------------------------------

        let cityName = "";

        try {

          const cityRes =
            await API.get("/api/info/reverse", {
              params: {
                latitude,
                longitude
              },
            });

          cityName =
            cityRes.data?.city || "Unknown Place";

          setCity(cityName);

        } catch (err) {

          console.log("City Error:", err);
          setCity("Unknown Place");

        }

        //----------------------------------
        // AI GUIDELINES
        //----------------------------------

        try {

          const aiRes =
            await API.get("/api/info/ai-guidelines", {
              params: {
                city: cityName
              },
            });

          setGuidelines(
            aiRes.data?.guidelines || ""
          );

        } catch (err) {

          console.log("Guidelines Error:", err);
          setGuidelines("");

        }

      } catch (err) {

        console.log("Info load error", err);
        setError("Failed to load information");

      } finally {

        setLoading(false);

      }

    };

    loadInfo();

  }, []);

  //--------------------------------------------------
  // LOADING
  //--------------------------------------------------

  if (loading) {

    return (

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black"
        }}
      >

        <ActivityIndicator
          size="large"
          color="#00ffff"
        />

        <Text
          style={{
            color: "white",
            marginTop: 10
          }}
        >
          Loading location info...
        </Text>

      </View>

    );

  }

  //--------------------------------------------------
  // ERROR
  //--------------------------------------------------

  if (error) {

    return (

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
          padding: 20
        }}
      >

        <Text
          style={{
            color: "white",
            fontSize: 16,
            textAlign: "center"
          }}
        >
          {error}
        </Text>

      </View>

    );

  }

  //--------------------------------------------------
  // UI
  //--------------------------------------------------

  return (

    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 120
      }}
      showsVerticalScrollIndicator={false}
    >

      {/* CITY */}

      <Text style={styles.header}>
        📍 {city || "Unknown Place"}
      </Text>

      {/* WEATHER CARD */}

      {weather &&
        weather.main &&
        weather.weather && (

          <View style={styles.weatherCard}>

            <Ionicons
              name="partly-sunny"
              size={32}
              color="#fff"
            />

            <View>

              <Text style={styles.weatherTemp}>
                {Math.round(weather.main.temp)}°C
              </Text>

              <Text style={styles.weatherDesc}>
                {weather.weather[0]?.description}
              </Text>

            </View>

          </View>

        )}

      {/* KNOW ABOUT */}

      <Text style={styles.sectionTitle}>
        📍 Know About This Place
      </Text>

      {guidelines
        ?.split("\n")
        ?.filter((line) => line.trim() !== "")
        ?.map((line, i) => {

          const cleanText = line
            .replace(/###/g, "")
            .replace(/\*\*/g, "")
            .replace(/\*/g, "")
            .replace(/#/g, "")
            .replace(/^\d+\.\s*/, "")
            .trim();

          if (!cleanText) return null;

          const isHeading =
            cleanText.includes("Tourist Attractions") ||
            cleanText.includes("Famous For") ||
            cleanText.includes("Local Tips") ||
            cleanText.includes("Safety Tips") ||
            cleanText.includes("Tourist Guide");

          if (isHeading) {

            return (
              <Text key={i} style={styles.heading}>
                {cleanText}
              </Text>
            );

          }

          return (
            <Text key={i} style={styles.tipItem}>
              • {cleanText}
            </Text>
          );

        })}

    </ScrollView>

  );

}