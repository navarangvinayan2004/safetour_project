import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { createSignupStyles } from '@/src/styles/signupStyles';
import { DarkColors, LightColors } from '@/src/theme/colors';
import API from './api';

export default function TouristSignup() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? DarkColors : LightColors;
  const styles = createSignupStyles(colors);
  const router = useRouter();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [medicalInfo, setMedicalInfo] = useState('');

  const signup = async () => {
    try {
      const response = await API.post('/api/signup', {
        name,
        age: Number(age),
        email,
        password,
        phoneNumber,
        emergencyPhone,
        medicalInfo,
        role: 'tourist',
      });

      Alert.alert('Signup complete', response.data.message || 'Account created');
      router.replace('/login');
    } catch (error: any) {
      Alert.alert(
        'Signup failed',
        error?.response?.data?.error || 'Please try again'
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>SafeTour</Text>
        <Text style={styles.subtitle}>Tourist Signup</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            placeholder="e.g. John Doe"
            placeholderTextColor={colors.textSecondary + '80'}
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            placeholder="e.g. 30"
            placeholderTextColor={colors.textSecondary + '80'}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="you@example.com"
            placeholderTextColor={colors.textSecondary + '80'}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter password"
            placeholderTextColor={colors.textSecondary + '80'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            placeholder="e.g. +1234567890"
            placeholderTextColor={colors.textSecondary + '80'}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Emergency Phone</Text>
          <TextInput
            placeholder="e.g. +1234567890"
            placeholderTextColor={colors.textSecondary + '80'}
            value={emergencyPhone}
            onChangeText={setEmergencyPhone}
            keyboardType="phone-pad"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Medical Info</Text>
          <TextInput
            placeholder="Allergies, medications, conditions"
            placeholderTextColor={colors.textSecondary + '80'}
            value={medicalInfo}
            onChangeText={setMedicalInfo}
            multiline
            numberOfLines={3}
            style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
          />
        </View>

        <View style={styles.buttonBox}>
          <Button title="Signup as Tourist" onPress={signup} />
        </View>

        <TouchableOpacity onPress={() => router.replace('/signup')}>
          <Text style={styles.loginText}>
            Back to <Text style={styles.loginLink}>Role Selection</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
