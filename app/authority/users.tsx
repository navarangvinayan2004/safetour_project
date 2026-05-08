import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { DarkColors, LightColors } from '@/src/theme/colors';

export default function AuthorityUsersScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? DarkColors : LightColors;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      padding: 24,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
    },
    text: {
      marginTop: 12,
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    button: {
      marginTop: 18,
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 14,
    },
    buttonText: {
      color: '#fff',
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Approvals Moved</Text>
        <Text style={styles.text}>
          Account approval is now handled by the separate admin role, not authority.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/authority')}>
          <Text style={styles.buttonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
