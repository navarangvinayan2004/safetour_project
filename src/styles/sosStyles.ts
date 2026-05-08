import { StyleSheet } from "react-native";

export const createSosStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingTop: 40,
    },

    header: {
      fontSize: 26,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
      marginTop:30,
    },

    subHeader: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 30,
    },

    typeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 40,
    },

    typeCard: {
      width: "30%",
      backgroundColor: colors.card,
      paddingVertical: 22,
      borderRadius: 18,
      alignItems: "center",
      elevation: 4,
    },

    activeCard: {
      backgroundColor: colors.danger,
    },

    typeText: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: "600",
      color: colors.text,
    },

    sendButton: {
      backgroundColor: colors.danger,
      paddingVertical: 20,
      borderRadius: 25,
      alignItems: "center",
      marginTop: 20,
      elevation: 6,
    },

    sendText: {
      color: "#fff",
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: 1,
    },
  });
