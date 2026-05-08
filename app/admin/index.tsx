import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { getApprovalStats, type ApprovalStats } from '../api';
import { createDashboardStyles } from '@/src/styles/dashboardStyles';
import { DarkColors, LightColors } from '@/src/theme/colors';

const LAST_SEEN_PENDING_KEY = 'admin_last_seen_pending_created_at';

export default function AdminDashboard() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? DarkColors : LightColors;
  const styles = createDashboardStyles(colors);
  const [stats, setStats] = useState<ApprovalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasNewRequest, setHasNewRequest] = useState(false);

  const pendingCount = useMemo(
    () => (stats?.pendingTourists || 0) + (stats?.pendingAuthorities || 0),
    [stats]
  );

  const syncNotificationState = useCallback(async (nextStats: ApprovalStats) => {
    const latestPendingCreatedAt = nextStats.latestPendingCreatedAt;

    if (!latestPendingCreatedAt) {
      setHasNewRequest(false);
      return;
    }

    const lastSeen = await AsyncStorage.getItem(LAST_SEEN_PENDING_KEY);

    if (!lastSeen) {
      await AsyncStorage.setItem(LAST_SEEN_PENDING_KEY, latestPendingCreatedAt);
      setHasNewRequest(false);
      return;
    }

    setHasNewRequest(new Date(latestPendingCreatedAt) > new Date(lastSeen));
  }, []);

  const loadStats = useCallback(async () => {
    try {
      setLoading(current => (stats ? current : true));
      const nextStats = await getApprovalStats();
      setStats(nextStats);
      await syncNotificationState(nextStats);
    } finally {
      setLoading(false);
    }
  }, [stats, syncNotificationState]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      loadStats();
    }, 15000);

    return () => clearInterval(intervalId);
  }, [loadStats]);

  const openApprovals = useCallback(async () => {
    if (stats?.latestPendingCreatedAt) {
      await AsyncStorage.setItem(
        LAST_SEEN_PENDING_KEY,
        stats.latestPendingCreatedAt
      );
    }
    setHasNewRequest(false);
    router.push('/admin/users' as any);
  }, [router, stats]);

  if (loading && !stats) {
    return (
      <View
        style={[
          styles.container,
          {
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 20,
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>
          Loading admin dashboard...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text style={styles.header}>SafeTour Admin</Text>
      <Text style={styles.subHeader}>
        Manage pending accounts and keep platform access under review.
      </Text>

      {hasNewRequest && (
        <View
          style={[
            styles.infoCard,
            {
              marginTop: 12,
              marginBottom: 18,
              justifyContent: 'flex-start',
              paddingHorizontal: 18,
              borderWidth: 1,
              borderColor: colors.danger + '35',
            },
          ]}
        >
          <Ionicons name="notifications" size={18} color={colors.danger} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            New approval request received. Please review the pending accounts.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.sosCard}
        onPress={openApprovals}
        activeOpacity={0.9}
      >
        <Ionicons name="people-circle" size={38} color="#fff" />
        <Text style={styles.sosText}>Pending Approvals</Text>
        <Text style={styles.sosSub}>
          {pendingCount} request{pendingCount === 1 ? '' : 's'} waiting for review
        </Text>
        {hasNewRequest && (
          <View
            style={{
              marginTop: 12,
              backgroundColor: '#fff',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 999,
            }}
          >
            <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 12 }}>
              NEW REQUEST
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={openApprovals}>
          <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
          <Text
            style={{
              marginTop: 8,
              fontSize: 24,
              fontWeight: '700',
              color: colors.text,
            }}
          >
            {pendingCount}
          </Text>
          <Text style={styles.cardText}>Pending Users</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/admin/profile' as any)}
        >
          <Ionicons name="person-circle" size={28} color={colors.primary} />
          <Text style={styles.cardText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
