import { StyleSheet } from 'react-native';

export const createCommunityStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingTop: 30,
    },
    header: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 20,
    },
    createCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      marginBottom: 20,
      elevation: 4,
    },
    input: {
      color: colors.text,
      fontSize: 14,
      minHeight: 60,
    },
    preview: {
      width: '100%',
      height: 200,
      borderRadius: 14,
      marginTop: 10,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      gap: 12,
    },
    actionGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      flex: 1,
    },
    postButton: {
      backgroundColor: colors.primary,
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 20,
    },
    postText: {
      color: '#fff',
      fontWeight: '600',
    },
    secondaryButton: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      backgroundColor: colors.background,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: '600',
    },
    postCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      marginBottom: 18,
      elevation: 3,
    },
    postHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      marginBottom: 6,
    },
    postActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    user: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    editAction: {
      color: colors.primary,
      fontWeight: '700',
      fontSize: 13,
    },
    deleteAction: {
      color: colors.danger,
      fontWeight: '700',
      fontSize: 13,
    },
    message: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    postMedia: {
      width: '100%',
      height: 220,
      borderRadius: 14,
      marginTop: 12,
    },
    time: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 10,
      opacity: 0.7,
    },
  });
