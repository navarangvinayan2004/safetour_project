import { StyleSheet } from "react-native";

export const createLoginStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 30,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 10,
    },
    subtitle: {
      color: colors.textSecondary,
      marginBottom: 25,
    },
    input: {
      width: "100%",
      borderWidth: 1,
      borderColor: colors.textSecondary,
      borderRadius: 10,
      padding: 14,
      marginBottom: 15,
      backgroundColor: colors.card,
      color: colors.text,
    },
    buttonContainer: {
      width: "100%",
      marginTop: 10,
    },
  });
