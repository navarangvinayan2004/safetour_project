import { createSignupStyles } from '@/src/styles/signupStyles';
import { DarkColors, LightColors } from '@/src/theme/colors';
import { useRouter } from 'expo-router';
import {
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

export default function AuthoritySignup() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? DarkColors : LightColors;
  const styles = createSignupStyles(colors);
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>SafeTour</Text>
        <Text style={styles.subtitle}>Authority Registration</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.field}>
          <Text style={styles.label}>Verification Required</Text>
          <Text style={[styles.input, { paddingTop: 16, paddingBottom: 16 }]}>
            Authority accounts must be verified with the authority code before signup.
          </Text>
        </View>

        <View style={styles.buttonBox}>
          <Button
            title="Continue to Verification"
            color="#d32f2f"
            onPress={() => router.replace('/authority-verify')}
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
