import { StyleSheet } from "react-native";

export const createChatListStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingTop: 30,
    },

    header: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 20,
      marginTop:30,
    },

    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 18,
      marginBottom: 14,
      elevation: 3,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 3 },
    },

    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },

    textContainer: {
      flex: 1,
    },

    name: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },

    subtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },

    empty: {
      textAlign: "center",
      marginTop: 40,
      color: colors.textSecondary,
    },
  });
