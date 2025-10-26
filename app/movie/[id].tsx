import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { icons } from "@/constants/icons";
import useFetch from "@/services/usefetch";
import { fetchMovieDetails } from "@/services/api";
import StreamingModal from "@/components/StreamingModal";

const FAVORITES_KEY = "@movie_app_favorites";

interface MovieInfoProps {
  label: string;
  value?: string | number | null;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">{label}</Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || "N/A"}
    </Text>
  </View>
);

const Details = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { data: movie, loading } = useFetch(() =>
    fetchMovieDetails(id as string)
  );

  useEffect(() => {
    checkIfFavorite();
  }, [movie]);

  const checkIfFavorite = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      if (savedFavorites && movie) {
        const favorites = JSON.parse(savedFavorites);
        setIsFavorite(favorites.some((fav: Movie) => fav.id === movie.id));
      }
    } catch (error) {
      console.error("Error checking favorites:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!movie) return;

    try {
      const savedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);
      let favorites = savedFavorites ? JSON.parse(savedFavorites) : [];

      if (isFavorite) {
        // Remove from favorites
        favorites = favorites.filter((fav: Movie) => fav.id !== movie.id);
        Alert.alert("Removed", "Movie removed from watchlist");
      } else {
        // Add to favorites
        favorites.push(movie);
        Alert.alert("Saved", "Movie added to watchlist");
      }

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Error", "Failed to update watchlist");
    }
  };

  const handlePlayMovie = () => {
    if (!movie) return;
    setModalVisible(true);
  };

  if (loading)
    return (
      <SafeAreaView className="bg-primary flex-1">
        <ActivityIndicator />
      </SafeAreaView>
    );

  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View>
          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`,
            }}
            className="w-full h-[550px]"
            resizeMode="stretch"
          />

          <TouchableOpacity
            onPress={handlePlayMovie}
            className="absolute bottom-5 right-5 rounded-full size-14 bg-white flex items-center justify-center"
            activeOpacity={0.8}
          >
            <Image
              source={icons.play}
              className="w-6 h-7 ml-1"
              resizeMode="stretch"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleFavorite}
            className="absolute bottom-5 right-24 rounded-full size-14 bg-secondary flex items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-3xl">{isFavorite ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">{movie?.title}</Text>
          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">
              {movie?.release_date?.split("-")[0]} •
            </Text>
            <Text className="text-light-200 text-sm">{movie?.runtime}m</Text>
          </View>

          <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" />

            <Text className="text-white font-bold text-sm">
              {Math.round(movie?.vote_average ?? 0)}/10
            </Text>

            <Text className="text-light-200 text-sm">
              ({movie?.vote_count} votes)
            </Text>
          </View>

          <MovieInfo label="Overview" value={movie?.overview} />
          <MovieInfo
            label="Genres"
            value={movie?.genres?.map((g) => g.name).join(" • ") || "N/A"}
          />

          <View className="flex flex-row justify-between w-1/2">
            <MovieInfo
              label="Budget"
              value={`$${(movie?.budget ?? 0) / 1_000_000} million`}
            />
            <MovieInfo
              label="Revenue"
              value={`$${Math.round(
                (movie?.revenue ?? 0) / 1_000_000
              )} million`}
            />
          </View>

          <MovieInfo
            label="Production Companies"
            value={
              movie?.production_companies?.map((c) => c.name).join(" • ") ||
              "N/A"
            }
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
        onPress={router.back}
      >
        <Image
          source={icons.arrow}
          className="size-5 mr-1 mt-0.5 rotate-180"
          tintColor="#fff"
        />
        <Text className="text-white font-semibold text-base">Go Back</Text>
      </TouchableOpacity>

      <StreamingModal
        visible={modalVisible}
        movieId={id as string}
        movieTitle={movie?.title || ""}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default Details;
