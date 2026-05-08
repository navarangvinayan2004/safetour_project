import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { DarkColors, LightColors } from '@/src/theme/colors';
import {
  getReviewAccounts,
  PendingAccount,
  updateAccountApproval,
} from '../api';

export default function AdminUsersScreen() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? DarkColors : LightColors;
  const [accounts, setAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState('');

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        content: {
          padding: 20,
          paddingBottom: 36,
        },
        title: {
          marginTop: 24,
          fontSize: 30,
          fontWeight: '700',
          color: colors.text,
        },
        subTitle: {
          marginTop: 8,
          color: colors.textSecondary,
          lineHeight: 20,
        },
        sectionTitle: {
          marginTop: 24,
          fontSize: 22,
          fontWeight: '700',
          color: colors.text,
        },
        sectionSubTitle: {
          marginTop: 6,
          color: colors.textSecondary,
        },
        summaryRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          marginTop: 18,
        },
        summaryCard: {
          width: '31%',
          backgroundColor: colors.card,
          borderRadius: 16,
          paddingVertical: 16,
          paddingHorizontal: 12,
          alignItems: 'center',
          borderWidth: 1,
        },
        pendingCard: {
          borderColor: colors.primary + '40',
          backgroundColor: colors.primary + '10',
        },
        approvedCard: {
          borderColor: '#16a34a40',
          backgroundColor: '#16a34a10',
        },
        rejectedCard: {
          borderColor: colors.danger + '40',
          backgroundColor: colors.danger + '10',
        },
        summaryValue: {
          fontSize: 24,
          fontWeight: '700',
          color: colors.text,
        },
        pendingValue: {
          color: colors.primary,
        },
        approvedValue: {
          color: '#15803d',
        },
        rejectedValue: {
          color: colors.danger,
        },
        summaryLabel: {
          marginTop: 6,
          fontSize: 13,
          fontWeight: '600',
          color: colors.textSecondary,
          textAlign: 'center',
        },
        card: {
          backgroundColor: colors.card,
          borderRadius: 18,
          padding: 16,
          marginTop: 16,
        },
        name: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.text,
        },
        meta: {
          marginTop: 6,
          color: colors.textSecondary,
          lineHeight: 20,
        },
        badge: {
          alignSelf: 'flex-start',
          marginTop: 12,
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: colors.background,
        },
        badgeText: {
          fontSize: 12,
          fontWeight: '700',
          color: colors.primary,
        },
        approvedBadgeText: {
          color: '#15803d',
        },
        rejectedBadgeText: {
          color: colors.danger,
        },
        row: {
          flexDirection: 'row',
          gap: 12,
          marginTop: 16,
        },
        button: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 12,
          borderRadius: 12,
        },
        approveButton: {
          backgroundColor: colors.primary,
        },
        rejectButton: {
          backgroundColor: colors.danger,
        },
        buttonText: {
          color: '#fff',
          fontWeight: '700',
        },
        emptyWrap: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        },
        emptyCard: {
          backgroundColor: colors.card,
          borderRadius: 18,
          padding: 20,
          marginTop: 16,
          alignItems: 'center',
        },
        emptyTitle: {
          fontSize: 20,
          fontWeight: '700',
          color: colors.text,
        },
        emptyText: {
          marginTop: 10,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 22,
        },
      }),
    [colors]
  );

  const loadAccounts = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getReviewAccounts({
        status: 'all',
        accountType: 'all',
        sort: 'newest',
        page: 1,
        limit: 200,
      });

      setAccounts(response.items);
    } catch (error: any) {
      Alert.alert(
        'Load failed',
        error?.response?.data?.error || 'Could not load approval accounts.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [loadAccounts])
  );

  const pendingAccounts = useMemo(
    () => accounts.filter(account => account.approvalStatus === 'pending'),
    [accounts]
  );
  const approvedAccounts = useMemo(
    () => accounts.filter(account => account.approvalStatus === 'approved'),
    [accounts]
  );
  const rejectedAccounts = useMemo(
    () => accounts.filter(account => account.approvalStatus === 'rejected'),
    [accounts]
  );

  const handleDecision = async (
    account: PendingAccount,
    status: 'approved' | 'rejected'
  ) => {
    try {
      setBusyId(account._id);
      await updateAccountApproval(account.accountType, account._id, status, {
        reason: status === 'rejected' ? 'Rejected by admin' : '',
      });
      await loadAccounts(true);
      Alert.alert('Success', `${account.name} has been ${status}.`);
    } catch (error: any) {
      Alert.alert(
        'Update failed',
        error?.response?.data?.error || 'Please try again.'
      );
    } finally {
      setBusyId('');
    }
  };

  const renderAccountCard = (account: PendingAccount, showActions: boolean) => {
    const isBusy = busyId === account._id;
    const badgeStyle =
      account.approvalStatus === 'approved'
        ? styles.approvedBadgeText
        : account.approvalStatus === 'rejected'
          ? styles.rejectedBadgeText
          : undefined;

    return (
      <View key={`${account.accountType}-${account._id}`} style={styles.card}>
        <Text style={styles.name}>{account.name}</Text>
        <Text style={styles.meta}>Email: {account.email}</Text>
        <Text style={styles.meta}>Age: {account.age ?? 'Not provided'}</Text>
        <Text style={styles.meta}>
          Phone: {account.phoneNumber || 'Not provided'}
        </Text>
        <Text style={styles.meta}>Role: {account.accountType.toUpperCase()}</Text>
        {account.approvalReviewedBy ? (
          <Text style={styles.meta}>Reviewed By: {account.approvalReviewedBy}</Text>
        ) : null}
        {account.rejectionReason ? (
          <Text style={styles.meta}>Reason: {account.rejectionReason}</Text>
        ) : null}

        <View style={styles.badge}>
          <Text style={[styles.badgeText, badgeStyle]}>
            {account.approvalStatus.toUpperCase()}
          </Text>
        </View>

        {showActions ? (
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, styles.approveButton]}
              onPress={() => handleDecision(account, 'approved')}
              disabled={isBusy}
            >
              <Text style={styles.buttonText}>
                {isBusy ? 'Saving...' : 'Approve'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.rejectButton]}
              onPress={() => handleDecision(account, 'rejected')}
              disabled={isBusy}
            >
              <Text style={styles.buttonText}>
                {isBusy ? 'Saving...' : 'Reject'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  const renderSection = (
    title: string,
    subtitle: string,
    sectionAccounts: PendingAccount[],
    showActions: boolean,
    emptyTitle: string
  ) => (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubTitle}>{subtitle}</Text>
      {sectionAccounts.length ? (
        sectionAccounts.map(account => renderAccountCard(account, showActions))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.emptyText}>Nothing to show in this section right now.</Text>
        </View>
      )}
    </>
  );

  if (loading) {
    return (
      <View style={styles.emptyWrap}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.emptyText}>Loading approval accounts...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadAccounts(true)}
          tintColor={colors.primary}
        />
      }
    >
      <Text style={styles.title}>Approval Accounts</Text>
      <Text style={styles.subTitle}>
        Review pending requests and see approved and rejected users separately.
      </Text>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.pendingCard]}>
          <Text style={[styles.summaryValue, styles.pendingValue]}>
            {pendingAccounts.length}
          </Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={[styles.summaryCard, styles.approvedCard]}>
          <Text style={[styles.summaryValue, styles.approvedValue]}>
            {approvedAccounts.length}
          </Text>
          <Text style={styles.summaryLabel}>Approved</Text>
        </View>
        <View style={[styles.summaryCard, styles.rejectedCard]}>
          <Text style={[styles.summaryValue, styles.rejectedValue]}>
            {rejectedAccounts.length}
          </Text>
          <Text style={styles.summaryLabel}>Rejected</Text>
        </View>
      </View>

      {renderSection(
        'Pending Users',
        'Approve or reject new tourist and authority registrations.',
        pendingAccounts,
        true,
        'No pending requests'
      )}

      {renderSection(
        'Approved Users',
        'Accounts that have already been approved by admin.',
        approvedAccounts,
        false,
        'No approved users'
      )}

      {renderSection(
        'Rejected Users',
        'Accounts that were rejected by admin.',
        rejectedAccounts,
        false,
        'No rejected users'
      )}
    </ScrollView>
  );
}
