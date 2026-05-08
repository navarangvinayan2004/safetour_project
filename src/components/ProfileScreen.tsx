import API from "@/app/api";
import styles from "@/src/styles/profileStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    age: '',
    phoneNumber: '',
    emergencyPhone: '',
    medicalInfo: ''
  });

  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem("user");
      if (data) {
        const userData = JSON.parse(data);
        console.log("Loaded user data:", userData);
        setUser(userData);
        setEditData({
          name: userData.name || '',
          age: userData.age?.toString() || '',
          phoneNumber: userData.phoneNumber || '',
          emergencyPhone: userData.role === 'tourist' ? (userData.emergencyPhone || '') : '',
          medicalInfo: userData.role === 'tourist' ? (userData.medicalInfo || '') : ''
        });
      } else {
        console.log("No user data found in AsyncStorage");
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace("/login");
  };

  const handleEdit = () => {
    if (!user) {
      Alert.alert("Error", "User data not loaded");
      return;
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      console.log("Starting save process...");
      console.log("User data:", user);

      // Basic validation
      if (!editData.name.trim()) {
        Alert.alert("Error", "Name is required");
        return;
      }

      if (!editData.phoneNumber.trim()) {
        Alert.alert("Error", "Phone number is required");
        return;
      }

      const token = user?.token || await AsyncStorage.getItem("token");
      console.log("Token found:", !!token);
      if (!token) {
        Alert.alert("Error", "Authentication token not found");
        return;
      }

      if (!user?.id) {
        Alert.alert("Error", "User ID not found");
        return;
      }

      API.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const updateData: any = {
        name: editData.name.trim(),
        age: editData.age ? parseInt(editData.age) : null,
        phoneNumber: editData.phoneNumber.trim(),
      };

      // Only include emergency contact and medical info for tourists
      if (user?.role === 'tourist') {
        updateData.emergencyPhone = editData.emergencyPhone.trim();
        updateData.medicalInfo = editData.medicalInfo.trim();
      }

      console.log("Sending update data:", updateData);
      const response = await API.put(`/api/users/profile/${user.id}`, updateData);
      console.log("Update response:", response.data);

      // Update local storage
      const updatedUser = { ...user, ...updateData };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      console.error("Profile update error:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage = error.response?.data?.error || "Failed to update profile";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleCancel = () => {
    // Reset edit data to current user data
    setEditData({
      name: user?.name || '',
      age: user?.age?.toString() || '',
      phoneNumber: user?.phoneNumber || '',
      emergencyPhone: user?.role === 'tourist' ? (user?.emergencyPhone || '') : '',
      medicalInfo: user?.role === 'tourist' ? (user?.medicalInfo || '') : ''
    });
    setIsEditing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PROFILE</Text>
        {user && (
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>EDIT</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Avatar + Name + Email */}
      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </Text>
        </View>

        <Text style={styles.name}>
          {user?.name?.toUpperCase() || "USER NAME"}
        </Text>

        <Text style={styles.email}>
          {user?.email || "No email found"}
        </Text>
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Role</Text>
          <Text style={styles.cardValue}>
            {user?.role?.toUpperCase() || "—"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Age</Text>
          <Text style={styles.cardValue}>
            {user?.age || "—"}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardRow}>
          <Text style={styles.cardLabel}>Phone</Text>
          <Text style={styles.cardValue}>
            {user?.phoneNumber || "—"}
          </Text>
        </View>

        {user?.role === 'tourist' && (
          <>
            <View style={styles.divider} />

            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Emergency Contact</Text>
              <Text style={styles.cardValue}>
                {user?.emergencyPhone || "—"}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Medical Info</Text>
              <Text style={styles.cardValue}>
                {user?.medicalInfo || "—"}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>LOGOUT</Text>
      </TouchableOpacity>

      {/* Edit Modal */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.name}
                  onChangeText={(text) => setEditData({...editData, name: text})}
                  placeholder="Enter your name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Age</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.age}
                  onChangeText={(text) => setEditData({...editData, age: text})}
                  placeholder="Enter your age"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={editData.phoneNumber}
                  onChangeText={(text) => setEditData({...editData, phoneNumber: text})}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>

              {user?.role === 'tourist' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Emergency Contact</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editData.emergencyPhone}
                      onChangeText={(text) => setEditData({...editData, emergencyPhone: text})}
                      placeholder="Enter emergency contact number"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Medical Information</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editData.medicalInfo}
                      onChangeText={(text) => setEditData({...editData, medicalInfo: text})}
                      placeholder="Enter medical information"
                      multiline={true}
                      numberOfLines={3}
                    />
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
