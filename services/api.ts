import axios from 'axios';

const API_KEY = process.env.EXPO_PUBLIC_MOVIE_API_KEY;

// Use local proxy server to bypass network restrictions
const USE_PROXY = true;
const PROXY_URL = "http://10.137.170.161:3001/api";
const BASE_URL = USE_PROXY ? PROXY_URL : "https://api.themoviedb.org/3";

// Test basic connectivity
export const testConnectivity = async () => {
  try {
    console.log('Testing basic connectivity...');
    const response = await axios.get('https://httpbin.org/get', { timeout: 5000 });
    console.log('Connectivity test SUCCESS:', response.status);
    return true;
  } catch (error) {
    console.error('Connectivity test FAILED:', error);
    return false;
  }
};

// Create axios instance with timeout
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 seconds timeout
  headers: USE_PROXY ? {} : {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
});

export const TMDB_CONFIG = {
  BASE_URL: BASE_URL,
  API_KEY: API_KEY,
  USE_PROXY: USE_PROXY,
  headers: USE_PROXY ? {} : {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

export const fetchMovies = async ({
  query,
}: {
  query: string;
}): Promise<Movie[]> => {
  try {
    const path = query
      ? `/search/movie?query=${encodeURIComponent(query)}`
      : `/discover/movie?sort_by=popularity.desc`;

    console.log('Fetching movies from:', BASE_URL + path);
    console.log('Using proxy:', USE_PROXY);
    console.log('API Key available:', !!API_KEY);

    const response = await apiClient.get(path);

    console.log('Response status:', response.status);
    console.log('Movies fetched:', response.data.results?.length);
    
    return response.data.results || [];
  } catch (error) {
    console.error('Error in fetchMovies:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.message);
      console.error('Error code:', error.code);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
    throw error;
  }
};

export const fetchMovieDetails = async (
  movieId: string
): Promise<MovieDetails> => {
  try {
    const response = await apiClient.get(`/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.message);
      console.error('Error code:', error.code);
      console.error('Response data:', error.response?.data);
    }
    throw error;
  }
};

export const fetchWatchProviders = async (
  movieId: string
): Promise<any> => {
  try {
    const response = await apiClient.get(`/movie/${movieId}/watch/providers`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching watch providers:", error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.message);
    }
    throw error;
  }
};
