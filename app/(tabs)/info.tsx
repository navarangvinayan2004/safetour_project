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
 const colors = scheme === "dark" ? DarkColors : LightColors;
 const styles = createInfoStyles(colors);

 const [weather,setWeather] = useState<any>(null);
 const [city,setCity] = useState("");
 const [guidelines,setGuidelines] = useState("");
 const [loading,setLoading] = useState(true);

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
      // 1️⃣ CHECK STORED DESTINATION
      //    (set by SearchScreen on select)
      //----------------------------------

      const stored = await AsyncStorage.getItem("destination");

      if (stored) {

        const dest = JSON.parse(stored);
        latitude  = parseFloat(dest.lat);
        longitude = parseFloat(dest.lng);

        // Clear AFTER reading so next open uses GPS
        await AsyncStorage.removeItem("destination");

      }

      //----------------------------------
      // 2️⃣ NO DESTINATION = CURRENT LOC
      //----------------------------------

      else {

        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") return;

        const loc =
          await Location.getCurrentPositionAsync({});

        latitude  = loc.coords.latitude;
        longitude = loc.coords.longitude;

      }

      //----------------------------------
      // WEATHER
      //----------------------------------

      const weatherRes = await API.get("/api/info/weather", {
        params: { latitude, longitude },
      });

      setWeather(weatherRes.data);

      //----------------------------------
      // CITY NAME
      //----------------------------------

      const cityRes = await API.get("/api/info/reverse", {
        params: { latitude, longitude },
      });

      setCity(cityRes.data.city);

      //----------------------------------
      // AI GUIDELINES
      //----------------------------------

      const aiRes = await API.get("/api/info/ai-guidelines", {
        params: { city: cityRes.data.city },
      }).catch(() => ({ data: { guidelines: "" } }));

      setGuidelines(aiRes.data?.guidelines || "");

    } catch (err) {

      console.log("Info load error", err);

    } finally {

      setLoading(false);

    }

  };

  loadInfo();

}, []); // 👈 empty deps — runs once on mount

 //--------------------------------------------------
 // LOADING
 //--------------------------------------------------

 if(loading){

  return(
   <ActivityIndicator
    size="large"
    style={{marginTop:100}}
   />
  );

 }

 //--------------------------------------------------
 // UI
 //--------------------------------------------------

 return(

  <ScrollView
   style={styles.container}
   contentContainerStyle={{paddingBottom:120}}
   showsVerticalScrollIndicator={false}
  >

   {/* CITY */}

   <Text style={styles.header}>
    📍 {city}
   </Text>

   {/* WEATHER CARD */}

   {weather && weather.main && weather.weather &&(

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
       {weather.weather[0].description}
      </Text>

     </View>

    </View>

   )}

   {/* KNOW ABOUT */}

   <Text style={styles.sectionTitle}>
    📍 Know About This Place
   </Text>

   {guidelines
    .split("\n")
    .filter((line)=>line.trim()!=="")
    .map((line,i)=>{

     const cleanText = line
      .replace(/###/g,"")
      .replace(/\*\*/g,"")
      .replace(/\*/g,"")
      .replace(/#/g,"")
      .replace(/^\d+\.\s*/,"")
      .trim();

     if(!cleanText) return null;

     const isHeading =
      cleanText.includes("Tourist Attractions") ||
      cleanText.includes("Famous For") ||
      cleanText.includes("Local Tips") ||
      cleanText.includes("Safety Tips") ||
      cleanText.includes("Tourist Guide");

     if(isHeading){

      return(
       <Text key={i} style={styles.heading}>
        {cleanText}
       </Text>
      );

     }

     return(
      <Text key={i} style={styles.tipItem}>
       • {cleanText}
      </Text>
     );

    })}

  </ScrollView>

 );

}