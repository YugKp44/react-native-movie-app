import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Linking,
} from "react-native";
import { getWatchProviders } from "@/services/streaming";
import { incrementWatchedCount } from "@/services/stats";

type Props = {
  visible: boolean;
  movieId?: string | number | null;
  movieTitle: string;
  onClose: () => void;
};

const StreamingModal = ({ visible, movieId, movieTitle, onClose }: Props) => {
  const [loading, setLoading] = useState(false);
  const [providerInfo, setProviderInfo] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchProviders = async () => {
      if (!visible) return;
      setLoading(true);
      setProviderInfo(null);
      try {
        if (movieId) {
          const info = await getWatchProviders(String(movieId), movieTitle);
          if (mounted) setProviderInfo(info);
        }
      } catch (e) {
        console.error("Error fetching providers in modal:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProviders();
    return () => {
      mounted = false;
    };
  }, [visible, movieId, movieTitle]);

  const handleOpen = async (url: string) => {
    try {
      // Increment watched count before opening the link
      await incrementWatchedCount();

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // fallback to browser open
        await Linking.openURL(url);
      }
      onClose();
    } catch (e) {
      console.error("Error opening provider url:", e);
      onClose();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-primary rounded-t-3xl p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white text-lg font-bold">Where to watch</Text>
            <TouchableOpacity onPress={onClose} className="px-3 py-1">
              <Text className="text-gray-400">Close</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-gray-300 mb-3">Results for "{movieTitle}"</Text>

          {loading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#E50914" />
              <Text className="text-gray-400 mt-3">
                Searching for streaming providers...
              </Text>
            </View>
          ) : providerInfo ? (
            <View className="mb-4">
              <View className="bg-dark-100 rounded-lg p-3 mb-3 flex-row items-center justify-between">
                <View>
                  <Text className="text-white font-semibold">
                    {providerInfo.providerName}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    Region: {providerInfo.region}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleOpen(providerInfo.url)}
                  className="bg-purple-500 px-3 py-2 rounded-full"
                >
                  <Text className="text-white font-bold">Open</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-gray-400 text-sm">
                If the app doesn't open, we'll open the provider's website.
              </Text>
            </View>
          ) : (
            <View className="mb-4">
              <Text className="text-gray-400 mb-3">
                We couldn't find a direct streaming provider for this title.
              </Text>
              <TouchableOpacity
                onPress={() =>
                  handleOpen(
                    `https://www.google.com/search?q=${encodeURIComponent(
                      movieTitle + " watch online"
                    )}`
                  )
                }
                className="bg-purple-500 px-4 py-3 rounded-full items-center"
              >
                <Text className="text-white  font-bold">Search Online</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default StreamingModal;
