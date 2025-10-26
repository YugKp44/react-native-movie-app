import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import MovieCard from "@/components/MovieCard";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
import StreamingModal from "@/components/StreamingModal";
import { getCurrentUserId, getUserStorageKey } from "@/services/userService";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 40) / 2; // 2 columns with padding
const CARD_HEIGHT = CARD_WIDTH * 1.5;

const Save = () => {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMovieId, setModalMovieId] = useState<string | null>(null);
  const [modalMovieTitle, setModalMovieTitle] = useState<string>("");

  const loadFavorites = async () => {
    try {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);

      if (userId) {
        const favoritesKey = getUserStorageKey(userId, "favorites");
        const savedFavorites = await AsyncStorage.getItem(favoritesKey);
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        } else {
          setFavorites([]);
        }
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reload favorites when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const removeFavorite = async (movieId: number, movieTitle: string) => {
    Alert.alert(
      "Remove from Watchlist",
      `Remove "${movieTitle}" from your watchlist?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              if (!currentUserId) return;

              const updatedFavorites = favorites.filter(
                (movie) => movie.id !== movieId
              );

              const favoritesKey = getUserStorageKey(
                currentUserId,
                "favorites"
              );
              await AsyncStorage.setItem(
                favoritesKey,
                JSON.stringify(updatedFavorites)
              );
              setFavorites(updatedFavorites);
            } catch (error) {
              console.error("Error removing favorite:", error);
              Alert.alert("Error", "Failed to remove movie from watchlist");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="bg-primary flex-1">
      <Image
        source={images.bg}
        className="absolute w-full h-full z-0"
        resizeMode="cover"
      />

      <View className="flex-1">
        {/* Header */}
        <View className="px-5 pt-3 pb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-bold text-white mb-1">
                My Watchlist
              </Text>
              <Text className="text-secondary text-sm font-medium">
                {loading
                  ? "Loading..."
                  : `${favorites.length} ${
                      favorites.length === 1 ? "movie" : "movies"
                    } saved`}
              </Text>
            </View>
            <View className="bg-secondary/20 rounded-full p-3 border border-secondary/30">
              <Image
                source={icons.save}
                className="size-7"
                tintColor="#E50914"
              />
            </View>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#E50914" />
            <Text className="text-gray-400 text-base mt-4">
              Loading your watchlist...
            </Text>
          </View>
        ) : favorites.length === 0 ? (
          <View className="flex-1 justify-center items-center px-8 -mt-20">
            <View className="bg-dark-100/50 backdrop-blur rounded-3xl p-8 items-center border border-gray-800/50">
              <View className="bg-secondary/10 rounded-full p-6 mb-6">
                <Image
                  source={icons.save}
                  className="size-20"
                  tintColor="#E50914"
                />
              </View>
              <Text className="text-white text-2xl font-bold text-center mb-3">
                No Movies Yet
              </Text>
              <Text className="text-gray-400 text-base text-center leading-6">
                Start building your watchlist by{"\n"}tapping the ❤️ icon on any
                movie
              </Text>
            </View>
          </View>
        ) : (
          <FlatList
            key="watchlist-grid" // Add a fixed key to prevent the warning
            data={favorites}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{
              justifyContent: "space-between",
              paddingHorizontal: 15,
              marginBottom: 20,
            }}
            contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push(`/movie/${item.id}`)}
                className="relative"
                style={{ width: CARD_WIDTH }}
              >
                {/* Movie Poster */}
                <View
                  className="relative rounded-2xl overflow-hidden shadow-2xl"
                  style={{ height: CARD_HEIGHT }}
                >
                  <Image
                    source={{
                      uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
                    }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />

                  {/* Gradient Overlay */}
                  <View className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

                  {/* Play Button Overlay */}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      setModalMovieId(item.id.toString());
                      setModalMovieTitle(item.title);
                      setModalVisible(true);
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 rounded-full size-12 items-center justify-center shadow-xl"
                    activeOpacity={0.8}
                    style={{
                      transform: [{ translateX: -24 }, { translateY: -24 }],
                    }}
                  >
                    <Image
                      source={icons.play}
                      className="size-5 ml-0.5"
                      resizeMode="contain"
                    />
                  </TouchableOpacity>

                  {/* Remove Button */}
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      removeFavorite(item.id, item.title);
                    }}
                    className="absolute top-2 right-2 bg-black/70 backdrop-blur rounded-full size-8 items-center justify-center shadow-lg z-10 border border-white/20"
                    activeOpacity={0.7}
                  >
                    <Text className="text-white text-base font-bold">✕</Text>
                  </TouchableOpacity>

                  {/* Movie Info Overlay */}
                  <View className="absolute bottom-0 left-0 right-0 p-3">
                    <Text
                      className="text-white text-sm font-bold mb-2 leading-5"
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>

                    <View className="flex-row items-center justify-between">
                      {/* Rating */}
                      <View className="bg-secondary/90 backdrop-blur rounded-full px-2.5 py-1 flex-row items-center">
                        <Image source={icons.star} className="size-3 mr-1" />
                        <Text className="text-white text-xs font-bold">
                          {item.vote_average
                            ? item.vote_average.toFixed(1)
                            : "N/A"}
                        </Text>
                      </View>

                      {/* Year */}
                      {item.release_date && (
                        <View className="bg-black/60 backdrop-blur rounded-full px-2.5 py-1">
                          <Text className="text-white text-xs font-semibold">
                            {item.release_date.split("-")[0]}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
      <StreamingModal
        visible={modalVisible}
        movieId={modalMovieId}
        movieTitle={modalMovieTitle}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default Save;

// Streaming modal placed here so it overlays the Save screen
// (rendered by this component)
