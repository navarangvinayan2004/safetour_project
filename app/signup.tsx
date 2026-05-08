import { useRouter } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { DarkColors, LightColors } from '@/src/theme/colors';

export default function SignupRoleSelection() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? DarkColors : LightColors;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: 24,
      paddingBottom: 32,
    },
    header: {
      alignItems: 'center',
      marginBottom: 28,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.primary,
    },
    subtitle: {
      marginTop: 8,
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: 280,
    },
    group: {
      gap: 14,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.textSecondary + '20',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    badge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: colors.background,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    cardText: {
      marginTop: 6,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    buttonBase: {
      marginTop: 14,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: 'center',
    },
    touristButton: {
      backgroundColor: colors.primary,
    },
    authorityButton: {
      backgroundColor: colors.danger,
    },
    adminButton: {
      backgroundColor: '#1d4ed8',
    },
    buttonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 15,
    },
    loginText: {
      marginTop: 18,
      fontSize: 14,
      textAlign: 'center',
      color: colors.textSecondary,
    },
    loginLink: {
      color: colors.primary,
      fontWeight: '600',
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>SafeTour</Text>
          <Text style={styles.subtitle}>
            Choose your account type to start signup
          </Text>
        </View>

        <View style={styles.group}>
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>Tourist</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Traveler</Text>
              </View>
            </View>
            <Text style={styles.cardText}>
              Create a traveler account with emergency and medical details.
            </Text>
            <TouchableOpacity
              style={[styles.buttonBase, styles.touristButton]}
              onPress={() => router.push('/tourist-signup')}
            >
              <Text style={styles.buttonText}>Signup as Tourist</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>Authority</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Verified</Text>
              </View>
            </View>
            <Text style={styles.cardText}>
              Create an authority account after verification with the authority code.
            </Text>
            <TouchableOpacity
              style={[styles.buttonBase, styles.authorityButton]}
              onPress={() => router.push('/authority-signup')}
            >
              <Text style={styles.buttonText}>Signup as Authority</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>Admin</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Secure</Text>
              </View>
            </View>
            <Text style={styles.cardText}>
              Create an admin account after verification with the admin code.
            </Text>
            <TouchableOpacity
              style={[styles.buttonBase, styles.adminButton]}
              onPress={() => router.push('/admin-signup' as any)}
            >
              <Text style={styles.buttonText}>Signup as Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={() => router.replace('/login')}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLink}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
