import AsyncStorage from "@react-native-async-storage/async-storage";

const STATS_KEY = "@movie_app_stats";

interface Stats {
  watched: number;
  searches: number;
}

// Get current stats
export const getStats = async (): Promise<Stats> => {
  try {
    const statsJson = await AsyncStorage.getItem(STATS_KEY);
    if (statsJson) {
      return JSON.parse(statsJson);
    }
    return { watched: 0, searches: 0 };
  } catch (error) {
    console.error("Error getting stats:", error);
    return { watched: 0, searches: 0 };
  }
};

// Increment watched count
export const incrementWatchedCount = async (): Promise<void> => {
  try {
    const stats = await getStats();
    stats.watched += 1;
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    console.log("Watched count incremented:", stats.watched);
  } catch (error) {
    console.error("Error incrementing watched count:", error);
  }
};

// Increment search count
export const incrementSearchCount = async (): Promise<void> => {
  try {
    const stats = await getStats();
    stats.searches += 1;
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    console.log("Search count incremented:", stats.searches);
  } catch (error) {
    console.error("Error incrementing search count:", error);
  }
};
