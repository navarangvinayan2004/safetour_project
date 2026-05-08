import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  RefreshControl
} from 'react-native';

import API from '../api';
import { createChatListStyles } from '@/src/styles/chatstyles';
import { DarkColors, LightColors } from '@/src/theme/colors';

export default function NearbyUsers() {

  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? DarkColors : LightColors;
  const styles = createChatListStyles(colors);

  const [users, setUsers] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();

  //--------------------------------------------------
  // LOAD NEARBY USERS
  //--------------------------------------------------

  const loadNearby = async () => {

    try {

      // 1️⃣ Get logged in user
      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) return;

      const me = JSON.parse(storedUser);

      // 2️⃣ Get location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});

      // 3️⃣ Fetch nearby users
      const res = await API.get('/api/users/nearby', {
        params: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        },
      });

      // 4️⃣ Remove current user
      const filteredUsers = res.data.filter(
        (u: any) => u._id !== me.id
      );

      setUsers(filteredUsers);

    } catch {

      console.log("Failed to load nearby users");

    }

  };

  //--------------------------------------------------
  // FIRST LOAD
  //--------------------------------------------------

  useEffect(() => {
    loadNearby();
  }, []);

  //--------------------------------------------------
  // PULL TO REFRESH
  //--------------------------------------------------

  const onRefresh = async () => {

    setRefreshing(true);

    await loadNearby();

    setRefreshing(false);

  };

  //--------------------------------------------------
  // UI
  //--------------------------------------------------

  return (
    <View style={styles.container}>

      <Text style={styles.header}>💬 Nearby Travelers</Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}

        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }

        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/chatscreen',
                params: { userId: item._id },
              })
            }
          >

            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={20}
                color="#fff"
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.name}>
                {item.name}
              </Text>

              <Text style={styles.subtitle}>
                Tap to start chatting
              </Text>
            </View>

          </TouchableOpacity>
        )}

        ListEmptyComponent={
          <Text style={styles.empty}>
            No nearby tourists found
          </Text>
        }

      />

    </View>
  );
}
