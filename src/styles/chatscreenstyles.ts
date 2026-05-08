import { StyleSheet } from "react-native";

export const createChatScreenStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    messageBubble: {
      maxWidth: "75%",
      padding: 12,
      borderRadius: 18,
      marginBottom: 10,
    },

    myMessage: {
      alignSelf: "flex-end",
      backgroundColor: colors.primary,
    },

    otherMessage: {
      alignSelf: "flex-start",
      backgroundColor: colors.card,
    },

    messageText: {
      fontSize: 14,
      color: colors.text,
    },

    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      backgroundColor: colors.card,
    },

    input: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 8,
      color: colors.text,
      marginRight: 10,
    },

    sendButton: {
      backgroundColor: colors.primary,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
  });
