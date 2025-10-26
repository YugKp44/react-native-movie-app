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

const USER_DATA_KEY = "@movie_app_user";

interface UserData {
  name: string;
}

const Profile = () => {
  const [userData, setUserData] = useState<UserData>({
    name: "Movie Lover",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<UserData>(userData);
  const [stats, setStats] = useState({
    favorites: 0,
    watched: 0,
    searches: 0,
  });

  useEffect(() => {
    loadUserData();
    loadStats();
  }, []);

  const loadUserData = async () => {
    try {
      const savedData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setUserData(parsed);
        setEditedData(parsed);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const loadStats = async () => {
    try {
      // Get favorites count
      const favorites = await AsyncStorage.getItem("@movie_app_favorites");
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
      loadStats();
    }, [])
  );

  const saveUserData = async () => {
    try {
      await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(editedData));
      setUserData(editedData);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving user data:", error);
      Alert.alert("Error", "Failed to update profile");
    }
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
          <View className="flex-row items-center justify-between mb-8">
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

          {/* Profile Avatar Card */}
          <View className="mb-6 bg-dark-100/50 rounded-3xl py-8 border border-gray-800/50">
            <View className="items-center">
              <View className="relative mb-5">
                <View className="bg-gradient-to-br from-secondary to-red-700 rounded-full size-28 items-center justify-center shadow-lg border-4 border-gray-900/50">
                  <Image
                    source={icons.person}
                    className="size-14"
                    tintColor="#fff"
                  />
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
