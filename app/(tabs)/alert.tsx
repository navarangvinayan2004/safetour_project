import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    Text,
    useColorScheme,
    View,
} from 'react-native';

import { createAlertStyles } from '@/src/styles/alertstyles';
import { DarkColors, LightColors } from '@/src/theme/colors';
import API, { removeAuthToken } from '../api';

type AlertItem = {
  _id: string;
  title: string;
  message: string;
  createdAt?: string;
};

export default function Alerts() {

  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? DarkColors : LightColors;
  const styles = createAlertStyles(colors);

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  //--------------------------------------------------
  // LOAD ALERTS
  //--------------------------------------------------

  const loadAlerts = async () => {
    try {
      // Remove auth token to ensure tourist view
      removeAuthToken();

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});

      const res = await API.get('/api/alerts', {
        params: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        },
      });

      setAlerts(res.data);

    } catch {
      console.log("Failed to load alerts");
    }
  };

  //--------------------------------------------------
  // FIRST LOAD
  //--------------------------------------------------

  useEffect(() => {
    loadAlerts();
  }, []);

  //--------------------------------------------------
  // PULL TO REFRESH
  //--------------------------------------------------

  const onRefresh = async () => {

    setRefreshing(true);

    await loadAlerts();

    setRefreshing(false);

  };

  //--------------------------------------------------
  // UI
  //--------------------------------------------------

  return (

    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      showsVerticalScrollIndicator={false}
    >

      <Text style={styles.header}>🚨 Safety Alerts</Text>

      {alerts.length === 0 && (
        <Text style={styles.empty}>
          No alerts in your area
        </Text>
      )}

      {alerts.map((item) => (

        <View key={item._id} style={styles.card}>

          <View style={styles.iconContainer}>
            <Ionicons
              name="warning"
              size={20}
              color={colors.danger}
            />
          </View>

          <View style={{ flex: 1 }}>

            <Text style={styles.title}>
              {item.title}
            </Text>

            <Text style={styles.message}>
              {item.message}
            </Text>

            {item.createdAt && (
              <Text style={styles.time}>
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            )}

          </View>

        </View>

      ))}

    </ScrollView>

  );
}
