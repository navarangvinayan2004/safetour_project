import { StyleSheet } from "react-native";

export const createSignupStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 24,
      backgroundColor: colors.background,
    },

  header: {
  alignItems: "center",
  marginBottom: 30,
},

scrollContent: {
  paddingBottom: 40,
},

    field: {
  marginBottom: 16,
},

label: {
  fontSize: 14,
  fontWeight: "600",
  marginBottom: 6,
  color: colors.text,
},

    title: {
      fontSize: 30,
      fontWeight: "700",
      color: colors.primary,
      textAlign: "center",
      marginBottom: 8,
      letterSpacing: 0.5,
    },

    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 28,
    },

    input: {
      borderWidth: 1,
      borderColor: colors.textSecondary + "40",
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      marginBottom: 16,
      backgroundColor: colors.card,
      fontSize: 15,
      color: colors.text,
    },

    buttonBox: {
      marginVertical: 8,
      borderRadius: 12,
      overflow: "hidden",
    },

    loginText: {
      marginTop: 22,
      fontSize: 14,
      textAlign: "center",
      color: colors.textSecondary,
    },

    loginLink: {
      color: colors.primary,
      fontWeight: "600",
    },
  });
