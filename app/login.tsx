import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { createLoginStyles } from '@/src/styles/loginstyle';
import { DarkColors, LightColors } from '@/src/theme/colors';
import API from './api';
import { signInFirebase } from '@/src/services/firebase';

export default function Login() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? DarkColors : LightColors;
  const styles = createLoginStyles(colors);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const navigateByRole = (role: string) => {
    if (role === 'admin') {
      router.replace('/admin' as any);
    } else if (role === 'authority') {
      router.replace('/authority');
    } else {
      router.replace('/(tabs)');
    }
  };

  const login = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Location is needed to continue');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const res = await API.post('/api/login', {
        email,
        password,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      await AsyncStorage.setItem(
        'user',
        JSON.stringify({
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          age: res.data.age,
          role: res.data.role,
          approvalStatus: res.data.approvalStatus,
          token: res.data.token,
          phoneNumber: res.data.phoneNumber,
          emergencyPhone: res.data.emergencyPhone,
          medicalInfo: res.data.medicalInfo,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        })
      );

      await signInFirebase();

      if (res.data.approvalAlertMessage) {
        Alert.alert('Account Approved', res.data.approvalAlertMessage, [
          {
            text: 'OK',
            onPress: () => navigateByRole(res.data.role),
          },
        ]);
        return;
      }

      navigateByRole(res.data.role);
    } catch (error: any) {
      Alert.alert(
        'Login failed',
        error?.response?.data?.error || 'Invalid email or password'
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SafeTour</Text>
      <Text style={styles.subtitle}>Login to continue</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <View style={styles.buttonContainer}>
        <Button title="Login" onPress={login} color={colors.primary} />
      </View>

      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text style={{ color: colors.textSecondary, marginTop: 20 }}>
          Don&apos;t have an account?{' '}
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
            Sign up
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
