import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useEffect, useCallback } from "react";

import useFetch from "@/services/usefetch";
import { fetchMovies, testConnectivity } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";

import SearchBar from "@/components/SearchBar";
import MovieCard from "@/components/MovieCard";
import TrendingCard from "@/components/TrendingCard";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    // Test connectivity on mount
    testConnectivity();
  }, []);

  const {
    data: trendingMovies,
    loading: trendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useFetch(getTrendingMovies);

  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() => fetchMovies({ query: "" }));

  // Refetch trending movies when tab is focused
  useFocusEffect(
    useCallback(() => {
      console.log("Home tab focused - refetching trending movies");
      refetchTrending();
    }, [])
  );

  useEffect(() => {
    console.log("Index component mounted");
    console.log(
      "Movies loading:",
      moviesLoading,
      "Movies data:",
      movies?.length
    );
    console.log(
      "Trending loading:",
      trendingLoading,
      "Trending data:",
      trendingMovies?.length
    );
    if (moviesError) console.error("Movies error:", moviesError);
    if (trendingError) console.error("Trending error:", trendingError);
  }, [
    moviesLoading,
    trendingLoading,
    movies,
    trendingMovies,
    moviesError,
    trendingError,
  ]);

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
      >
        <Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

        {moviesLoading || trendingLoading ? (
          <View className="mt-10 self-center items-center">
            <ActivityIndicator size="large" color="#0000ff" />
            <Text className="text-white mt-4">Loading movies...</Text>
          </View>
        ) : moviesError || trendingError ? (
          <View className="mt-10 px-5">
            <Text className="text-red-500 text-center">
              Error: {moviesError?.message || trendingError?.message}
            </Text>
            <Text className="text-white text-center mt-2">
              Please check your internet connection and API keys.
            </Text>
          </View>
        ) : (
          <View className="flex-1 mt-5">
            <SearchBar
              onPress={() => {
                router.push("/search");
              }}
              placeholder="Search for a movie"
            />

            {trendingMovies && trendingMovies.length > 0 && (
              <View className="mt-10">
                <Text className="text-lg text-white font-bold mb-3">
                  Trending Movies
                </Text>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-4 mt-3"
                  data={trendingMovies}
                  contentContainerStyle={{
                    gap: 26,
                  }}
                  renderItem={({ item, index }) => (
                    <TrendingCard movie={item} index={index} />
                  )}
                  keyExtractor={(item) => item.movie_id.toString()}
                  ItemSeparatorComponent={() => <View className="w-4" />}
                />
              </View>
            )}

            <>
              <Text className="text-lg text-white font-bold mt-5 mb-3">
                Latest Movies
              </Text>

              <FlatList
                data={movies}
                renderItem={({ item }) => <MovieCard {...item} />}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "flex-start",
                  gap: 20,
                  paddingRight: 5,
                  marginBottom: 10,
                }}
                className="mt-2 pb-32"
                scrollEnabled={false}
              />
            </>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Index;
