import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { createDashboardStyles } from '@/src/styles/dashboardStyles';
import { DarkColors, LightColors } from '@/src/theme/colors';

export default function Dashboard() {
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
      <Text style={styles.header}>SafeTour</Text>
      <Text style={styles.subHeader}>
        Travel smart. Stay protected.
      </Text>

      {/* 🔴 BIG SOS PANEL */}
      <TouchableOpacity
        style={styles.sosCard}
        onPress={() => router.push('/(tabs)/sos')}
        activeOpacity={0.9}
      >
        <Ionicons name="alert-circle" size={38} color="#fff" />
        <Text style={styles.sosText}>Emergency SOS</Text>
        <Text style={styles.sosSub}>
          Instantly send your live location
        </Text>
      </TouchableOpacity>

      {/* 🔹 QUICK ACTION GRID */}
      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(tabs)/maps')}
        >
          <Ionicons name="map" size={28} color={colors.primary} />
          <Text style={styles.cardText}>Map</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(tabs)/alert')}
        >
          <Ionicons name="notifications" size={28} color={colors.primary} />
          <Text style={styles.cardText}>Alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(tabs)/chats')}
        >
          <Ionicons name="chatbubbles" size={28} color={colors.primary} />
          <Text style={styles.cardText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/(tabs)/community')}
        >
          <Ionicons name="people" size={28} color={colors.primary} />
          <Text style={styles.cardText}>Community</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 INFO CARD FULL WIDTH */}
      <TouchableOpacity
        style={styles.infoCard}
        onPress={() => router.push('/(tabs)/info')}
      >
        <Ionicons name="information-circle" size={28} color={colors.primary} />
        <Text style={styles.infoText}>Location Info & Travel Tips</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
