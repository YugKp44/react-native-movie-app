# Movie App - Multi-User Demo Guide

## Overview
The app now supports multiple user profiles, allowing you to demonstrate different user experiences during your presentation.

## Demo Users
Three demo users are automatically created when you first open the app:
1. **Yug** (yug@demo.com)
2. **Rohit** (rohit@demo.com)
3. **Rahul** (rahul@demo.com)

## How to Switch Users During Demo

### Method 1: Profile Screen User Switcher
1. Navigate to the **Profile** tab
2. Look for the **"Demo Mode - Switch User"** section at the top (below the header)
3. Tap on it to expand the user selector
4. Tap on any user to switch to their profile
5. All data (watchlist, stats) will update to show that user's information

### Method 2: Manual Testing
Each user has their own separate:
- **Watchlist** - Saved/favorite movies
- **Watch Count** - Number of times they clicked watch buttons
- **Search Count** - Number of times they searched for movies

## Features Per User

### User-Specific Data Storage
- ✅ Favorites/Watchlist (separate for each user)
- ✅ Watch statistics (tracked per user)
- ✅ Search statistics (tracked per user)
- ✅ Profile name (editable per user)

### Shared Features
- Movie search results (same TMDB API for all users)
- Trending movies (same for all users)
- Streaming platform availability

## Demo Workflow

### Presentation Flow:
1. **Start with User 1 (Yug)**
   - Open the app → Navigate to Profile
   - Show empty stats initially
   - Go to Home → Search for movies
   - Save some movies to watchlist
   - Click watch buttons to increment watch count
   - Return to Profile → Show updated stats

2. **Switch to User 2 (Rohit)**
   - Go to Profile → Tap "Demo Mode - Switch User"
   - Select Rohit
   - Show that Rohit has different/empty watchlist
   - Demonstrate that stats are independent
   - Add different movies to Rohit's watchlist
   - Show separate activity tracking

3. **Switch to User 3 (Rahul)**
   - Go to Profile → Tap "Demo Mode - Switch User"
   - Select Rahul
   - Show that Rahul also has independent data
   - Add different movies to Rahul's watchlist
   - Demonstrate separate activity tracking

4. **Compare Users**
   - Switch back to Yug → Show his original data is preserved
   - Switch to Rohit → Show his separate data is maintained
   - Switch to Rahul → Show his independent data
   - Demonstrate complete data isolation between all three users

## Technical Implementation

### Storage Keys
Each user has unique storage keys:
```
@movie_app_user_<userId>_favorites  - User's favorite movies
@movie_app_user_<userId>_stats      - User's watch/search stats
```

### User Management Functions
- `getCurrentUserId()` - Get active user
- `switchUser(userId)` - Change active user
- `getAllUsers()` - Get list of all users
- `getUserStorageKey(userId, key)` - Generate user-specific storage key

## Tips for Demo

1. **Before Demo**: Clear app data or create fresh demo users with sample data
2. **During Demo**: Use the user switcher to show data isolation across all three users
3. **Highlight**: Each user (Yug, Rohit, Rahul) has completely independent watchlists and statistics
4. **Show**: Real-time updates when switching between users

## Resetting Demo Data

If you need to reset the demo:
1. Clear AsyncStorage data (reinstall app)
2. App will automatically create fresh demo users on next launch

## Notes
- User switcher only appears when there are 2+ users
- Current user is indicated with a green checkmark ✓
- All operations (save, watch, search) are tied to the active user
- Stats update in real-time when you switch users
- Three demo users (Yug, Rohit, Rahul) are created automatically on first launch

