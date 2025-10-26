import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { getStats } from "@/services/stats";
import {
  getCurrentUserId,
  getUserStorageKey,
  updateUser,
  getUserById,
  getAllUsers,
  switchUser,
  initializeDemoUsers,
  resetDemoUsers,
} from "@/services/userService";

interface UserData {
  name: string;
  avatar?: string;
}

const Profile = () => {
  const [userData, setUserData] = useState<UserData>({
    name: "Movie Lover",
    avatar: "👤",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserData>(userData);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [stats, setStats] = useState({
    favorites: 0,
    watched: 0,
    searches: 0,
  });

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    // Initialize demo users if needed
    await initializeDemoUsers();

    // Load current user
    const userId = await getCurrentUserId();
    setCurrentUserId(userId);

    // Load all users for selector
    const users = await getAllUsers();
    setAvailableUsers(users);

    if (userId) {
      await loadUserData(userId);
      await loadStats(userId);
    }
  };

  const loadUserData = async (userId: string) => {
    try {
      const user = await getUserById(userId);
      if (user) {
        setUserData({ name: user.name, avatar: user.avatar || "👤" });
        setEditedData({ name: user.name, avatar: user.avatar || "👤" });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const loadStats = async (userId: string) => {
    try {
      // Get user-specific favorites count
      const favoritesKey = getUserStorageKey(userId, "favorites");
      const favorites = await AsyncStorage.getItem(favoritesKey);
      const favCount = favorites ? JSON.parse(favorites).length : 0;

      // Get watched and search counts from stats service
      const statsData = await getStats();

      setStats({
        favorites: favCount,
        watched: statsData.watched,
        searches: statsData.searches,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // Reload stats when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (currentUserId) {
        loadStats(currentUserId);
      }
    }, [currentUserId])
  );

  const saveUserData = async () => {
    try {
      if (currentUserId) {
        await updateUser(currentUserId, { name: editedData.name });
        setUserData(editedData);
        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error saving user data:", error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleSwitchUser = async (userId: string) => {
    await switchUser(userId);
    setCurrentUserId(userId);
    await loadUserData(userId);
    await loadStats(userId);
    setShowUserSelector(false);
    Alert.alert(
      "User Switched",
      "You are now viewing a different user's profile"
    );
  };

  const handleResetDemoUsers = async () => {
    Alert.alert(
      "Reset Demo Users",
      "This will delete old users and create new demo users (Yug, Rohit, Rahul) with unique avatars. Continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await resetDemoUsers();
              // Reload everything
              await initializeUser();
              Alert.alert(
                "Success",
                "Demo users have been reset with unique avatars!"
              );
            } catch (error) {
              console.error("Error resetting demo users:", error);
              Alert.alert("Error", "Failed to reset demo users");
            }
          },
        },
      ]
    );
  };

  const StatCard = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: number;
    icon: any;
  }) => (
    <View className="bg-dark-100/50 rounded-2xl p-4 flex-1 items-center border border-gray-800/50">
      <View className="bg-secondary/20 rounded-full p-2.5 mb-3">
        <Image source={icon} className="size-6" tintColor="#E50914" />
      </View>
      <Text className="text-2xl font-bold text-white mb-1">{value}</Text>
      <Text className="text-gray-500 text-xs font-medium">{label}</Text>
    </View>
  );

  return (
    <SafeAreaView className="bg-primary flex-1">
      <Image
        source={images.bg}
        className="absolute w-full h-full z-0"
        resizeMode="cover"
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-3">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-3xl font-bold text-white mb-1">
                My Profile
              </Text>
              <Text className="text-gray-400 text-sm">
                Manage your account settings
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (isEditing) {
                  saveUserData();
                } else {
                  setIsEditing(true);
                }
              }}
              className={`px-6 py-3 rounded-full shadow-lg ${
                isEditing ? "bg-green-600" : "bg-secondary"
              }`}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-sm">
                {isEditing ? "Save" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* User Switcher for Demo */}
          {availableUsers.length > 1 && (
            <View className="mb-6">
              <TouchableOpacity
                onPress={() => setShowUserSelector(!showUserSelector)}
                className="bg-dark-100/50 rounded-2xl p-4 border border-secondary/30 flex-row items-center justify-between"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View className="bg-secondary/20 rounded-full size-12 items-center justify-center mr-3">
                    <Text className="text-2xl">{userData.avatar || "👤"}</Text>
                  </View>
                  <View>
                    <Text className="text-gray-400 text-xs mb-1">
                      Demo Mode - Switch User
                    </Text>
                    <Text className="text-white font-semibold">
                      {userData.name}
                    </Text>
                  </View>
                </View>
                <Text className="text-secondary text-xl">
                  {showUserSelector ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>

              {showUserSelector && (
                <View className="mt-3 bg-dark-100/70 rounded-2xl border border-gray-800/50 overflow-hidden">
                  {availableUsers.map((user) => (
                    <TouchableOpacity
                      key={user.id}
                      onPress={() => handleSwitchUser(user.id)}
                      className={`p-4 border-b border-gray-800/30 flex-row items-center ${
                        user.id === currentUserId ? "bg-secondary/10" : ""
                      }`}
                      activeOpacity={0.7}
                    >
                      <View className="bg-secondary/20 rounded-full size-12 items-center justify-center mr-3">
                        <Text className="text-2xl">{user.avatar || "👤"}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-semibold">
                          {user.name}
                        </Text>
                        {user.email && (
                          <Text className="text-gray-400 text-xs">
                            {user.email}
                          </Text>
                        )}
                      </View>
                      {user.id === currentUserId && (
                        <View className="bg-green-500 rounded-full size-6 items-center justify-center">
                          <Text className="text-white text-xs font-bold">
                            ✓
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Profile Avatar Card */}
          <View className="mb-6 bg-dark-100/50 rounded-3xl py-8 border border-gray-800/50">
            <View className="items-center">
              <View className="relative mb-5">
                <View className="bg-gradient-to-br from-secondary to-red-700 rounded-full size-28 items-center justify-center shadow-lg border-4 border-gray-900/50">
                  <Text className="text-6xl">{userData.avatar || "👤"}</Text>
                </View>
                {isEditing && (
                  <View className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-2.5 border-3 border-primary shadow-lg">
                    <Text className="text-white text-xs font-bold">✏️</Text>
                  </View>
                )}
              </View>

              {isEditing ? (
                <View className="w-full px-6">
                  <TextInput
                    value={editedData.name}
                    onChangeText={(text) =>
                      setEditedData({ ...editedData, name: text })
                    }
                    className="text-2xl font-bold text-white text-center bg-dark-100 px-6 py-3 rounded-2xl border-2 border-secondary mb-2"
                    placeholderTextColor="#666"
                    placeholder="Your Name"
                  />
                  <Text className="text-gray-500 text-xs text-center">
                    Edit your display name
                  </Text>
                </View>
              ) : (
                <View className="items-center">
                  <Text className="text-3xl font-bold text-white mb-3 tracking-tight">
                    {userData.name}
                  </Text>
                  <View className="flex-row items-center bg-purple-500/10 rounded-full px-5 py-2 border border-secondary/30">
                    <Text className="text-2xl mr-2">🎬</Text>
                    <Text className="text-white text-sm font-bold">
                      Movie Enthusiast
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Stats */}
          <View className="mb-6">
            <Text className="text-xl font-bold text-white mb-4">
              Your Activity
            </Text>
            <View className="flex-row gap-3">
              <StatCard
                label="Saved"
                value={stats.favorites}
                icon={icons.save}
              />
              <StatCard
                label="Watched"
                value={stats.watched}
                icon={icons.play}
              />
              <StatCard
                label="Searches"
                value={stats.searches}
                icon={icons.search}
              />
            </View>
          </View>

          {/* Developer & Copyright */}
          <View className="bg-dark-100/50 rounded-3xl p-6 border border-gray-800/50">
            <View className="items-center">
              {/* Developer Credit */}
              <Text className="text-gray-500 text-xs uppercase tracking-widest mb-2">
                Developed By
              </Text>
              <Text className="text-2xl font-bold text-white mb-1">Yug</Text>

              {/* Divider */}
              <View className="w-full h-px bg-gray-800 mb-6" />

              {/* Copyright */}
              <Text className="text-gray-500 text-sm mb-2">
                © 2025 Movie Explorer
              </Text>
              <Text className="text-gray-600 text-xs text-center mb-3">
                Powered by TMDB
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
