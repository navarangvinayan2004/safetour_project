import { StyleSheet } from "react-native";

export const createDashboardStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
    },

    header: {
      marginTop: 50,
      fontSize: 40,
      fontWeight: "700",
      color: colors.text,
    },

    subHeader: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 6,
      marginBottom: 25,
    },

    /* 🔴 BIG SOS PANEL */
    sosCard: {
      backgroundColor: colors.danger,
      paddingVertical: 28,
      borderRadius: 24,
      alignItems: "center",
      marginTop:30,
      marginBottom: 25,
      elevation: 6,
    },

    sosText: {
      fontSize: 20,
      fontWeight: "700",
      color: "#fff",
      marginTop: 8,
    },

    sosSub: {
      fontSize: 13,
      color: "#fff",
      marginTop: 4,
      opacity: 0.9,
    },

    /* GRID */
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 20,
    },

    card: {
      width: "48%",
      backgroundColor: colors.card,
      paddingVertical: 24,
      borderRadius: 20,
      alignItems: "center",
      marginBottom: 16,
      elevation: 4,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 4 },
    },

    cardText: {
      marginTop: 8,
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },

    /* INFO FULL WIDTH */
    infoCard: {
      backgroundColor: colors.card,
      paddingVertical: 22,
      borderRadius: 20,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      elevation: 4,
    },

    infoText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
  });
