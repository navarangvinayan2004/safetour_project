import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
import API from '../api';

export default function Broadcast() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const sendAlert = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Missing details', 'Please add both a title and message.');
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Location access is needed to send alerts.');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});

      await API.post('/api/alerts', {
        title: title.trim(),
        message: message.trim(),
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        createdBy: 'Authority',
      });

      Alert.alert('Success', 'Alert sent within the configured radius.');
      setTitle('');
      setMessage('');
    } catch (error: any) {
      Alert.alert(
        'Alert failed',
        error?.response?.data?.error || 'Please try again'
      );
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>Broadcast Alert</Text>

      <TextInput placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput
        placeholder="Message"
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <Button title="Send Alert (20 km)" onPress={sendAlert} />
    </View>
  );
}
