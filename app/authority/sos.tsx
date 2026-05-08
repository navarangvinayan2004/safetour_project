import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import API, { setAuthToken } from '../api';

type SOS = {
  _id: string;
  name: string;
  age: number;
  role?: string;
  email?: string;
  phoneNumber?: string;
  emergencyPhone?: string;
  medicalInfo?: string;
  emergencyType: string;
  latitude: number;
  longitude: number;
  createdAt?: string;
};

export default function AuthoritySOS() {
  const [sosList, setSosList] = useState<SOS[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadSOS();
  }, []);

  const loadSOS = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.token) {
          setAuthToken(user.token);
        }
      }
      const res = await API.get('/api/sos');
      setSosList(res.data);
    } catch (error) {
      console.error('Failed to load SOS:', error);
    }
  };

  const deleteSOS = async (id: string) => {
    try {
      await API.delete(`/api/sos/${id}`);
      setSosList(current => current.filter(item => item._id !== id));
    } catch (error) {
      console.error('Failed to delete SOS:', error);
    }
  };

  const confirmDeleteSOS = (id: string) => {
    Alert.alert('Delete SOS', 'Remove this SOS after it has been resolved?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSOS(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SOS Alerts</Text>

      <FlatList
        data={sosList}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/authority/map',
                  params: {
                    lat: item.latitude,
                    lng: item.longitude,
                    type: item.emergencyType,
                  },
                })
              }
            >
              <Text style={styles.type}>{item.emergencyType}</Text>
              <Text style={styles.name}>{item.name}, Age: {item.age}</Text>
              {item.createdAt && (
                <Text style={styles.timestamp}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              )}
              {item.role && <Text style={styles.detail}>Role: {item.role}</Text>}
              {item.email && <Text style={styles.detail}>Email: {item.email}</Text>}
              {item.phoneNumber && <Text style={styles.detail}>Phone: {item.phoneNumber}</Text>}
              {item.emergencyPhone && <Text style={styles.detail}>Emergency: {item.emergencyPhone}</Text>}
              {item.medicalInfo && <Text style={styles.detail}>Medical: {item.medicalInfo}</Text>}
              <Text style={styles.location}>Tap to view location</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => confirmDeleteSOS(item._id)}
            >
              <Text style={styles.deleteText}>Delete SOS</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  type: { fontWeight: 'bold', fontSize: 16, color: '#d32f2f' },
  name: { fontSize: 14, fontWeight: '600', marginTop: 5 },
  timestamp: { fontSize: 12, color: '#555', marginTop: 4 },
  detail: { fontSize: 12, color: '#666', marginTop: 2 },
  location: { fontSize: 12, color: '#007bff', marginTop: 5, fontStyle: 'italic' },
  deleteButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#d32f2f',
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontWeight: '700',
  },
});