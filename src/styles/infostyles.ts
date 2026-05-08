import { StyleSheet } from "react-native";

export const createInfoStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      paddingTop: 30,
    },

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    header: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 20,
    },

    weatherCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      padding: 18,
      borderRadius: 20,
      marginBottom: 25,
      gap: 15,
    },

    weatherTemp: {
      fontSize: 22,
      fontWeight: "700",
      color: "#fff",
    },

    weatherDesc: {
      fontSize: 14,
      color: "#fff",
      opacity: 0.9,
    },

    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginTop: 15,
      marginBottom: 8,
    },

    heading:{
 fontSize:18,
 fontWeight:"bold",
 marginTop:15,
 marginBottom:5,
 color:"#2c3e50"
},

    listItem: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 6,
    },

    tipItem: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
      lineHeight: 20,
    },
  });
