import { createDashboardStyles } from '@/src/styles/dashboardStyles';
import { DarkColors, LightColors } from '@/src/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

export default function AuthorityDashboard() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? DarkColors : LightColors;
  const styles = createDashboardStyles(colors);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.header}>SafeTour Authority</Text>
      <Text style={styles.subHeader}>
        Respond to incidents, manage zones, and keep travelers informed.
      </Text>

      <TouchableOpacity
        style={styles.sosCard}
        onPress={() => router.push('/authority/sos')}
        activeOpacity={0.9}
      >
        <Ionicons name="shield-checkmark" size={38} color="#fff" />
        <Text style={styles.sosText}>Emergency Center</Text>
        <Text style={styles.sosSub}>
          Monitor SOS alerts and respond quickly
        </Text>
      </TouchableOpacity>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/authority/dangerzone')}
        >
          <Ionicons name="warning" size={28} color={colors.primary} />
          <Text style={styles.cardText}>Danger Zones</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/authority/broadcast')}
        >
          <Ionicons name="megaphone" size={28} color={colors.primary} />
          <Text style={styles.cardText}>Broadcast</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/authority/profile')}
        >
          <Ionicons name="person-circle" size={28} color={colors.primary} />
          <Text style={styles.cardText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
