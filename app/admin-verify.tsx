import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
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

export default function AdminVerify() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? DarkColors : LightColors;
  const styles = createSignupStyles(colors);
  const router = useRouter();

  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const verifyCode = async () => {
    try {
      const res = await API.post('/api/verify-admin-code', { code });
      if (res.data.valid) {
        setVerified(true);
      } else {
        alert('Invalid code. Please check and try again.');
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        (error?.message === 'Network Error'
          ? 'Network error. Check that the backend is running on port 5000 and that your phone/emulator can reach 192.168.1.3.'
          : error?.message);
      alert('Verification failed: ' + message);
    }
  };

  const signup = async () => {
    try {
      const res = await API.post('/api/signup', {
        name,
        age: Number(age),
        email,
        password,
        phoneNumber,
        role: 'admin',
        code,
      });
      alert(res.data.message || 'Admin account created');
      router.replace('/login');
    } catch (error: any) {
      alert('Signup failed: ' + (error?.response?.data?.error || error.message));
    }
  };

  if (!verified) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>SafeTour</Text>
          <Text style={styles.subtitle}>Admin Verification</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.field}>
            <Text style={styles.label}>Admin Code</Text>
            <TextInput
              placeholder="Enter admin code"
              placeholderTextColor={colors.textSecondary + '80'}
              value={code}
              onChangeText={setCode}
              style={styles.input}
              secureTextEntry
            />
          </View>

          <View style={styles.buttonBox}>
            <Button title="Verify Code" color="#1d4ed8" onPress={verifyCode} />
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>SafeTour</Text>
        <Text style={styles.subtitle}>Admin Signup</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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

        <View style={styles.buttonBox}>
          <Button title="Signup as Admin" color="#1d4ed8" onPress={signup} />
        </View>

        <TouchableOpacity onPress={() => setVerified(false)}>
          <Text style={styles.loginText}>
            Back to <Text style={styles.loginLink}>Verification</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
