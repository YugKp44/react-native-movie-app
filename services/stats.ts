import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentUserId, getUserStorageKey } from "./userService";

interface Stats {
  watched: number;
  searches: number;
}

// Get current stats for the active user
export const getStats = async (): Promise<Stats> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { watched: 0, searches: 0 };
    }
    
    const statsKey = getUserStorageKey(userId, "stats");
    const statsJson = await AsyncStorage.getItem(statsKey);
    if (statsJson) {
      return JSON.parse(statsJson);
    }
    return { watched: 0, searches: 0 };
  } catch (error) {
    console.error("Error getting stats:", error);
    return { watched: 0, searches: 0 };
  }
};

// Increment watched count for the active user
export const incrementWatchedCount = async (): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;
    
    const stats = await getStats();
    stats.watched += 1;
    
    const statsKey = getUserStorageKey(userId, "stats");
    await AsyncStorage.setItem(statsKey, JSON.stringify(stats));
    console.log("Watched count incremented:", stats.watched);
  } catch (error) {
    console.error("Error incrementing watched count:", error);
  }
};

// Increment search count for the active user
export const incrementSearchCount = async (): Promise<void> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;
    
    const stats = await getStats();
    stats.searches += 1;
    
    const statsKey = getUserStorageKey(userId, "stats");
    await AsyncStorage.setItem(statsKey, JSON.stringify(stats));
    console.log("Search count incremented:", stats.searches);
  } catch (error) {
    console.error("Error incrementing search count:", error);
  }
};
