import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, useColorScheme, View, } from 'react-native';
import { db } from '@/src/services/firebase';
import { createChatScreenStyles } from '@/src/styles/chatscreenstyles';
import { DarkColors, LightColors } from '@/src/theme/colors';
import { getChatId } from '@/src/utils/chatid';

export default function ChatScreen() {
  const { userId } = useLocalSearchParams();
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? DarkColors : LightColors;
  const styles = createChatScreenStyles(colors);

  const [me, setMe] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');

  // Load logged-in user
  useEffect(() => {
    AsyncStorage.getItem('user').then(u => {
      if (u) setMe(JSON.parse(u));
    });
  }, []);

  // Listen to messages
  useEffect(() => {
    if (!me || !userId) return;

    const chatId = getChatId(me.id, userId as string);

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt')
    );

    const unsub = onSnapshot(q, snap => {
      setMessages(
        snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return unsub;
  }, [me, userId]);

  const send = async () => {
    if (!text || !me || !userId) return;

    const chatId = getChatId(me.id, userId as string);

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text,
      senderId: me.id,          // 🔥 NOW VALID
      createdAt: serverTimestamp(),
    });

    setText('');
  };

  if (!me) {
    return <Text>Loading user...</Text>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => {
          const isMe = item.senderId === me?.id;

          return (
            <View
              style={[
                styles.messageBubble,
                isMe
                  ? styles.myMessage
                  : styles.otherMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isMe && { color: '#fff' },
                ]}
              >
                {item.text}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={send}
        >
          <Ionicons
            name="send"
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
