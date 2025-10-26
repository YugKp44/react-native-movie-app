import { Alert, Linking } from 'react-native';
import { fetchWatchProviders } from './api';

interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

interface CountryProviders {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

// Map provider IDs to their direct URLs
const PROVIDER_URLS: { [key: number]: string } = {
  8: 'https://www.netflix.com', // Netflix
  9: 'https://www.primevideo.com', // Amazon Prime Video
  337: 'https://www.disneyplus.com', // Disney+
  15: 'https://www.hulu.com', // Hulu
  350: 'https://tv.apple.com', // Apple TV+
  384: 'https://www.hbomax.com', // HBO Max
  531: 'https://www.paramountplus.com', // Paramount+
  387: 'https://www.peacocktv.com', // Peacock
};

const PROVIDER_SEARCH_URLS: { [key: number]: (title: string) => string } = {
  8: (title) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
  9: (title) => `https://www.primevideo.com/search?phrase=${encodeURIComponent(title)}`,
  337: (title) => `https://www.disneyplus.com/search?q=${encodeURIComponent(title)}`,
  15: (title) => `https://www.hulu.com/search?q=${encodeURIComponent(title)}`,
  350: (title) => `https://tv.apple.com/search?q=${encodeURIComponent(title)}`,
};

export const getWatchProviders = async (movieId: string, movieTitle: string) => {
  try {
    const providers = await fetchWatchProviders(movieId);
    
    // Try to get providers for US first, then fallback to other regions
    const regions = ['US', 'GB', 'CA', 'IN', 'AU'];
    let countryData: CountryProviders | null = null;
    let selectedRegion = 'US';

    for (const region of regions) {
      if (providers[region]) {
        countryData = providers[region];
        selectedRegion = region;
        break;
      }
    }

    if (!countryData) {
      console.log('No watch providers found for any region');
      return null;
    }

    // Priority: flatrate (subscription) > rent > buy
    const availableProviders = countryData.flatrate || countryData.rent || countryData.buy;

    if (!availableProviders || availableProviders.length === 0) {
      console.log('No streaming providers available');
      return null;
    }

    // Get the first available provider (usually the most popular)
    const primaryProvider = availableProviders[0];
    
    // Try to get the TMDB link first
    if (countryData.link) {
      return {
        url: countryData.link,
        providerName: primaryProvider.provider_name,
        region: selectedRegion,
      };
    }

    // Fallback to provider search URL
    const searchUrlFunc = PROVIDER_SEARCH_URLS[primaryProvider.provider_id];
    if (searchUrlFunc) {
      return {
        url: searchUrlFunc(movieTitle),
        providerName: primaryProvider.provider_name,
        region: selectedRegion,
      };
    }

    // Last fallback to provider homepage
    const providerUrl = PROVIDER_URLS[primaryProvider.provider_id];
    if (providerUrl) {
      return {
        url: providerUrl,
        providerName: primaryProvider.provider_name,
        region: selectedRegion,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching watch providers:', error);
    return null;
  }
};

export const playMovie = async (movieId: string, movieTitle: string) => {
  try {
    // Show loading state
    Alert.alert('Finding Movie', 'Searching for where to watch...');

    const providerInfo = await getWatchProviders(movieId, movieTitle);

    if (providerInfo) {
      // Open the streaming platform
      const canOpen = await Linking.canOpenURL(providerInfo.url);
      if (canOpen) {
        await Linking.openURL(providerInfo.url);
      } else {
        Alert.alert(
          'Platform Found',
          `"${movieTitle}" is available on ${providerInfo.providerName}, but we couldn't open it automatically.`,
          [{ text: 'OK' }]
        );
      }
    } else {
      // No provider found, fallback to Google search
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(movieTitle + ' watch online streaming')}`;
      
      Alert.alert(
        'No Streaming Platform Found',
        `We couldn't find where "${movieTitle}" is currently streaming. Would you like to search online?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Search Online',
            onPress: async () => {
              await Linking.openURL(searchUrl);
            },
          },
        ]
      );
    }
  } catch (error) {
    console.error('Error playing movie:', error);
    Alert.alert(
      'Error',
      'Unable to find streaming information. Would you like to search online?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Search Online',
          onPress: async () => {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(movieTitle + ' watch online')}`;
            await Linking.openURL(searchUrl);
          },
        },
      ]
    );
  }
};

// Deprecated - keeping for backwards compatibility
export const showStreamingOptions = (movieTitle: string) => {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(movieTitle + ' watch online streaming')}`;
  Linking.openURL(searchUrl);
};

