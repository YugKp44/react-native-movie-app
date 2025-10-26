import AsyncStorage from "@react-native-async-storage/async-storage";

const CURRENT_USER_KEY = "@movie_app_current_user";
const USERS_LIST_KEY = "@movie_app_users_list";

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  createdAt: string;
}

// Get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const userId = await AsyncStorage.getItem(CURRENT_USER_KEY);
    return userId;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Set current user
export const setCurrentUser = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(CURRENT_USER_KEY, userId);
  } catch (error) {
    console.error("Error setting current user:", error);
  }
};

// Get all users
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersJson = await AsyncStorage.getItem(USERS_LIST_KEY);
    if (usersJson) {
      return JSON.parse(usersJson);
    }
    return [];
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

// Create new user
export const createUser = async (name: string, email?: string, avatar?: string): Promise<User> => {
  try {
    const users = await getAllUsers();
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      avatar,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    await AsyncStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const users = await getAllUsers();
    return users.find((u) => u.id === userId) || null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
};

// Update user
export const updateUser = async (userId: string, updates: Partial<User>): Promise<void> => {
  try {
    const users = await getAllUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      await AsyncStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
    }
  } catch (error) {
    console.error("Error updating user:", error);
  }
};

// Get user-specific storage key
export const getUserStorageKey = (userId: string, key: string): string => {
  return `@movie_app_user_${userId}_${key}`;
};

// Initialize demo users for presentation
export const initializeDemoUsers = async (): Promise<void> => {
  try {
    const users = await getAllUsers();
    if (users.length === 0) {
      // Create three demo users with different avatars
      const user1 = await createUser("Yug", "yug@demo.com", "👨‍💼");
      const user2 = await createUser("Rohit", "rohit@demo.com", "🧑‍💻");
      const user3 = await createUser("Rahul", "rahul@demo.com", "👨‍🎨");
      
      // Set first user as current
      await setCurrentUser(user1.id);
      
      console.log("Demo users initialized:", [user1, user2, user3]);
    }
  } catch (error) {
    console.error("Error initializing demo users:", error);
  }
};

// Reset and recreate demo users (for updating from old users to new users)
export const resetDemoUsers = async (): Promise<void> => {
  try {
    // Clear existing users
    await AsyncStorage.removeItem(USERS_LIST_KEY);
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    
    // Create three new demo users with different avatars
    const user1 = await createUser("Yug", "yug@demo.com", "👨‍💼");
    const user2 = await createUser("Rohit", "rohit@demo.com", "🧑‍💻");
    const user3 = await createUser("Rahul", "rahul@demo.com", "👨‍🎨");
    
    // Set first user as current
    await setCurrentUser(user1.id);
    
    console.log("Demo users reset and recreated:", [user1, user2, user3]);
  } catch (error) {
    console.error("Error resetting demo users:", error);
  }
};

// Switch user
export const switchUser = async (userId: string): Promise<void> => {
  try {
    await setCurrentUser(userId);
  } catch (error) {
    console.error("Error switching user:", error);
  }
};
