import { StyleSheet } from "react-native";

export const createAlertStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingTop: 28,
    },

    header: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 10,
    },

    subHeader: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 20,
      lineHeight: 20,
    },

    emptyContainer: {
      marginTop: 40,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
    },

    emptyText: {
      marginTop: 16,
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },

    alertCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 18,
      marginBottom: 16,
      shadowColor: colors.shadow || "#000",
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },

    alertTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },

    alertMessage: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 10,
    },

    alertTime: {
      fontSize: 12,
      color: colors.textSecondary,
      opacity: 0.8,
    },
  });
