import {
    addDoc,
    collection,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
  
  export const listenMessages = (chatId: string, callback: any) => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );
  
    return onSnapshot(q, snapshot => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(msgs);
    });
  };
  
  export const sendMessage = async (
    chatId: string,
    text: string,
    senderId: string
  ) => {
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text,
      senderId,
      createdAt: serverTimestamp(),
    });
  };
  