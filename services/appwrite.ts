import { Client, Databases, ID, Query } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

// Test function to check Appwrite connection
export const testAppwriteConnection = async () => {
  try {
    console.log('Testing Appwrite connection...');
    console.log('Project ID:', process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID);
    console.log('Database ID:', DATABASE_ID);
    console.log('Collection ID:', COLLECTION_ID);
    
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID);
    console.log('Appwrite connection SUCCESS. Documents:', result.documents.length);
    return true;
  } catch (error) {
    console.error('Appwrite connection FAILED:', error);
    if (error && typeof error === 'object') {
      console.error('Error details:', JSON.stringify(error, null, 2));
    }
    return false;
  }
};

export const updateSearchCount = async (query: string, movie: Movie) => {
  try {
    console.log('updateSearchCount called with:', {
      query,
      movieId: movie.id,
      movieTitle: movie.title,
      databaseId: DATABASE_ID,
      collectionId: COLLECTION_ID
    });

    // Search by movie_id instead of searchTerm to avoid duplicates
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("movie_id", movie.id),
    ]);

    console.log('Existing documents found:', result.documents.length);

    if (result.documents.length > 0) {
      const existingMovie = result.documents[0];
      console.log('Updating existing document:', existingMovie.$id, 'Current count:', existingMovie.count);
      
      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        existingMovie.$id,
        {
          count: existingMovie.count + 1,
          searchTerm: query, // Update the search term to the latest one
        }
      );
      console.log('Document updated successfully. New count:', existingMovie.count + 1);
    } else {
      console.log('Creating new document...');
      
      const newDoc = await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: query,
        movie_id: movie.id,
        title: movie.title,
        count: 1,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      });
      
      console.log('New document created:', newDoc.$id);
    }
  } catch (error) {
    console.error("Error updating search count:", error);
    if (error && typeof error === 'object') {
      console.error("Error details:", JSON.stringify(error, null, 2));
    }
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<
  TrendingMovie[] | undefined
> => {
  try {
    console.log('Fetching trending movies from Appwrite...');
    console.log('Database ID:', DATABASE_ID);
    console.log('Collection ID:', COLLECTION_ID);
    
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(100), // Get more documents to filter duplicates
      Query.orderDesc("count"),
    ]);

    console.log('Documents fetched:', result.documents.length);

    // Filter out duplicates by movie_id, keeping only the highest count
    const uniqueMovies = new Map<number, TrendingMovie>();
    
    result.documents.forEach((doc: any) => {
      const movieId = doc.movie_id;
      if (!uniqueMovies.has(movieId) || (uniqueMovies.get(movieId)?.count || 0) < doc.count) {
        uniqueMovies.set(movieId, doc as unknown as TrendingMovie);
      }
    });

    // Convert map to array and sort by count, then limit to 5
    const trendingMovies = Array.from(uniqueMovies.values())
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 5);

    console.log('Unique trending movies:', trendingMovies.length);
    return trendingMovies;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return undefined;
  }
};
