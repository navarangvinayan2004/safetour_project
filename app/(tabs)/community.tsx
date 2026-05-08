import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import API, { BASE_URL } from '../api';
import { createCommunityStyles } from '@/src/styles/communitystyles';
import { DarkColors, LightColors } from '@/src/theme/colors';

type Post = {
  _id: string;
  user: string;
  userId?: string;
  message: string;
  media?: string | null;
  createdAt?: string;
};

type CurrentUser = {
  id: string;
  name: string;
};

const normalizeMediaUrl = (media?: string | null) => {
  if (!media) return null;

  const uploadsIndex = media.indexOf('/uploads/');
  if (uploadsIndex >= 0) {
    return `${BASE_URL}${media.slice(uploadsIndex)}`;
  }

  return media;
};

const uploadImage = async (uri: string) => {
  const formData = new FormData();

  formData.append('image', {
    uri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as any);

  const res = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Image upload failed');
  }

  const data = await res.json();
  if (!data.imageUrl) {
    throw new Error('Image upload failed');
  }

  return data.imageUrl;
};

export default function CommunityScreen() {
  const scheme = useColorScheme();
  const colors = scheme === 'dark' ? DarkColors : LightColors;
  const styles = createCommunityStyles(colors);

  const [description, setDescription] = useState('');
  const [media, setMedia] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser({
          id: user.id,
          name: user.name,
        });
      }
    };

    loadUser();
  }, []);

  const resetComposer = () => {
    setDescription('');
    setMedia(null);
    setEditingPostId(null);
  };

  const pickMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
      });

      if (!result.canceled) {
        const localUri = result.assets[0].uri;
        const uploadedUrl = await uploadImage(localUri);
        setMedia(uploadedUrl);
      }
    } catch (error: any) {
      Alert.alert('Upload failed', error?.message || 'Please try again');
    }
  };

  const loadPosts = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') return;

      const loc = await Location.getCurrentPositionAsync({});

      const res = await API.get('/api/posts', {
        params: {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        },
      });

      setPosts(res.data);
    } catch {
      console.log('Failed to load posts');
    }
  };

  const submitPost = async () => {
    if (!description && !media) return;
    if (!currentUser) return;

    try {
      if (editingPostId) {
        await API.patch(`/api/posts/${editingPostId}`, {
          userId: currentUser.id,
          message: description || 'Shared a media update',
          media,
        });
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') return;

        const loc = await Location.getCurrentPositionAsync({});

        await API.post('/api/posts', {
          user: currentUser.name,
          userId: currentUser.id,
          message: description || 'Shared a media update',
          media,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
      }

      resetComposer();
      loadPosts();
    } catch (error: any) {
      Alert.alert(
        editingPostId ? 'Update failed' : 'Post failed',
        error?.response?.data?.error || 'Please try again'
      );
    }
  };

  const startEdit = (post: Post) => {
    setEditingPostId(post._id);
    setDescription(post.message);
    setMedia(post.media || null);
  };

  const deletePost = (postId: string) => {
    if (!currentUser) return;

    Alert.alert('Delete post', 'Do you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await API.delete(`/api/posts/${postId}`, {
              data: { userId: currentUser.id },
            });

            if (editingPostId === postId) {
              resetComposer();
            }

            setPosts(currentPosts => currentPosts.filter(post => post._id !== postId));
          } catch (error: any) {
            Alert.alert(
              'Delete failed',
              error?.response?.data?.error || 'Please try again'
            );
          }
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Community</Text>

      <View style={styles.createCard}>
        <TextInput
          placeholder="Share a safety update..."
          placeholderTextColor={colors.textSecondary}
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          multiline
        />

        {media && <Image source={{ uri: normalizeMediaUrl(media)! }} style={styles.preview} />}

        <View style={styles.actions}>
          <TouchableOpacity onPress={pickMedia}>
            <Ionicons name="image" size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.actionGroup}>
            {(media || editingPostId) && (
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setMedia(null)}>
                <Text style={styles.secondaryButtonText}>Remove Media</Text>
              </TouchableOpacity>
            )}

            {editingPostId && (
              <TouchableOpacity style={styles.secondaryButton} onPress={resetComposer}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.postButton} onPress={submitPost}>
              <Text style={styles.postText}>{editingPostId ? 'Update' : 'Post'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const canManage = !!currentUser && item.userId === currentUser.id;

          return (
            <View style={styles.postCard}>
              <View style={styles.postHeaderRow}>
                <Text style={styles.user}>{item.user}</Text>

                {canManage && (
                  <View style={styles.postActions}>
                    <TouchableOpacity onPress={() => startEdit(item)}>
                      <Text style={styles.editAction}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => deletePost(item._id)}>
                      <Text style={styles.deleteAction}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Text style={styles.message}>{item.message}</Text>

              {item.media && (
                <Image
                  source={{ uri: normalizeMediaUrl(item.media)! }}
                  style={styles.postMedia}
                />
              )}

              {item.createdAt && (
                <Text style={styles.time}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}
