import { createSosStyles } from '@/src/styles/sosStyles';
import { DarkColors, LightColors } from '@/src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';
import API from '../api';


  export default function SosScreen() {
    const scheme = useColorScheme();
    const colors = scheme === 'dark' ? DarkColors : LightColors;
    const styles = createSosStyles(colors);
    const [user, setUser] = useState<{ name: string; age: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<string | null>(null);
    useEffect(() => {
      const loadUser = async () => {
        const storedUser = await AsyncStorage.getItem('user');
        console.log('stored user',storedUser)
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      };
    
      loadUser();
    }, []);
    
    const sendSOS = async () => {
      if (!type) {
        Alert.alert('Select Emergency Type', 'Please choose an emergency type');
        return;
      }
  
      setLoading(true);
  
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Location permission is needed for SOS');
        setLoading(false);
        return;
      }
  
      try {
        const loc: Location.LocationObject =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        await API.post('/api/sos', {
          name: user?.name,
          age: user?.age,
          role: user?.role,
          email: user?.email,
          phoneNumber: user?.phoneNumber,
          emergencyPhone: user?.emergencyPhone,
          medicalInfo: user?.medicalInfo,
          emergencyType: type,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        Alert.alert(
          'SOS Sent',
          `Emergency Type: ${type}\nYour location has been shared`
        );
      } catch (error: any) {
        Alert.alert(
          'SOS failed',
          error?.response?.data?.error || 'Please try again'
        );
      } finally {
        setLoading(false);
      }
    };
    const types = [
      { label: 'Medical', icon: 'medkit' },
      { label: 'Accident', icon: 'car-sport' },
      { label: 'Crime', icon: 'shield' },
    ];
    return (
      <View style={styles.container}>
        <Text style={styles.header}>🚨 SOS Emergency</Text>
        <Text style={styles.subHeader}>
          Choose the type of emergency
        </Text>
  
        <View style={styles.typeContainer}>
          {types.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.typeCard,
                type === item.label && styles.activeCard,
              ]}
              onPress={() => setType(item.label)}
            >
              <Ionicons
                name={item.icon as any}
                size={26}
                color={
                  type === item.label
                    ? '#fff'
                    : colors.primary
                }
              />
              <Text
                style={[
                  styles.typeText,
                  type === item.label && { color: '#fff' },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
  
        {loading ? (
          <ActivityIndicator size="large" color={colors.danger} />
        ) : (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={sendSOS}
            activeOpacity={0.85}
          >
            <Text style={styles.sendText}>SEND SOS</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
  
