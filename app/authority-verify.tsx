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

export default function AuthorityVerify() {

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

  //--------------------------------------------------
  // VERIFY CODE
  //--------------------------------------------------

  const verifyCode = async () => {
    try {
      const res = await API.post('/api/verify-authority-code', { code });
      if (res.data.valid) {
        setVerified(true);
      } else {
        alert('Invalid code. Please check and try again.');
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        (error?.message === 'Network Error'
          ? 'Network error. Check that the backend is running on port 5000 and that your device can reach it.'
          : error?.message);
      alert(
        'Verification failed: ' + message
      );
    }
  };

  //--------------------------------------------------
  // SIGNUP
  //--------------------------------------------------

  const signup = async () => {
    try {
      const res = await API.post('/api/signup', {
        name,
        age: Number(age),
        email,
        password,
        phoneNumber,
        role: 'authority',
        code,
      });
      alert(res.data.message || 'Account created');
      router.replace('/login');
    } catch (error: any) {
      alert(
        'Signup failed: ' +
        (error?.response?.data?.error || error.message)
      );
    }
  };

  //--------------------------------------------------
  // VERIFY PAGE
  //--------------------------------------------------

  if (!verified) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.title}>SafeTour</Text>
          <Text style={styles.subtitle}>Authority Verification</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.field}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              placeholder="Enter authority code"
              placeholderTextColor={colors.textSecondary + '80'}
              value={code}
              onChangeText={setCode}
              style={styles.input}
              secureTextEntry
            />
          </View>

          <View style={styles.buttonBox}>
            <Button
              title="Verify Code"
              color="red"
              onPress={verifyCode}
            />
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

  //--------------------------------------------------
  // AUTHORITY SIGNUP PAGE (no emergency/medical)
  //--------------------------------------------------

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>SafeTour</Text>
        <Text style={styles.subtitle}>Authority Signup</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Name ── */}
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

        {/* ── Age ── */}
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

        {/* ── Email ── */}
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

        {/* ── Password ── */}
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

        {/* ── Phone Number ── */}
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

        {/* ── Submit ── */}
        <View style={styles.buttonBox}>
          <Button
            title="Signup as Authority"
            color="red"
            onPress={signup}
          />
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
