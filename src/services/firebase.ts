import { initializeApp } from 'firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initializeAuth,
  onAuthStateChanged,
  type Persistence,
  signInAnonymously,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase's React Native persistence helper exists in the RN bundle but is not exposed
// by the package typings used by this project, so we load it from the RN entry directly.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getReactNativePersistence } = require('@firebase/auth/dist/rn/index.js') as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
};

const firebaseConfig = {
  apiKey: "AIzaSyC2fZR-0B3NZapXs3yc7wcpAKz_rQBXrxk",
  authDomain: "safetour-b4b7b.firebaseapp.com",
  projectId: "safetour-b4b7b",
  storageBucket: "safetour-b4b7b.firebasestorage.app",
  messagingSenderId: "408916253056",
  appId: "1:408916253056:web:a66f94d8d25df627d6c965",
  measurementId: "G-ZB098VQ2W0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);

export const signInFirebase = async () => {
  try {
    await signInAnonymously(auth);

    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log("Firebase authenticated:", user.uid);
          resolve(true);
        }
      });
    });

  } catch (error) {
    console.log("Firebase auth error:", error);
  }
};
