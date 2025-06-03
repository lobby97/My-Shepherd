# Background Music Feature

## Overview

The Voice of the Shepherd app now includes a background music feature that plays peaceful ambient music while users listen to the teachings. This feature can be toggled on/off in the Settings screen.

## How It Works

### Music Asset
- Uses only `peaceful_ambient.mp3` from the `assets/music/` folder
- The music is a 22-second loop designed for peaceful contemplation
- Plays at 30% volume to ensure it doesn't interfere with the teachings

### User Control
- **Settings Toggle**: Users can enable/disable background music in Settings > Audio > Background Music
- **Automatic Start**: When enabled, background music starts automatically when a teaching session begins
- **Continuous Playback**: Background music continues seamlessly between teachings in a session
- **Session-Based**: Music stops only when the user pauses or completely stops listening

### Technical Implementation

#### Files Modified:
1. **`lib/musicAssets.ts`** - Manages the music asset imports
2. **`store/playerStore.ts`** - Adds background music state and controls
3. **`components/AudioProvider.tsx`** - Handles background music logic
4. **`store/settingsStore.ts`** - Already had the toggle setting
5. **`components/BackgroundMusicIndicator.tsx`** - Development indicator (only shows in `__DEV__`)

#### Key Components:

**AudioProvider**:
- Creates a separate `backgroundMusicPlayer` using `expo-audio`
- Monitors the `enableBackgroundMusic` setting and session state
- Starts background music when teaching session begins (if setting is enabled)
- Continues music during transitions between teachings
- Stops background music only when session ends or setting is disabled

**PlayerStore**:
- `startBackgroundMusic()` - Loads and plays the peaceful ambient music in a loop
- `stopBackgroundMusic()` - Stops the background music
- `isBackgroundMusicPlaying` - Tracks current background music state
- Audio players are excluded from persistence to avoid serialization issues

### Behavior Rules

1. **When to Start**:
   - Setting is enabled AND first teaching in a session starts playing
   - Only starts if not already playing (prevents multiple instances)

2. **When to Continue**:
   - Between teachings in the same session
   - During brief pauses between songs
   - During transitions from one teaching to another

3. **When to Stop**:
   - User pauses playback for more than 1 second
   - User completely stops the session
   - End of playlist is reached
   - User toggles the setting OFF
   - App is closed/terminated

4. **Seamless Experience**:
   - Music flows continuously during active listening sessions
   - No interruptions between individual teachings
   - Creates uninterrupted peaceful atmosphere

### Development Testing

In development mode (`__DEV__`), a small indicator appears in the top-right corner showing:
- Background Music Setting: Enabled/Disabled
- Background Music Playing: Yes/No

This helps developers verify the feature is working correctly.

### Volume Levels
- Background music: 30% volume
- Teachings: Default volume (usually 100%)
- This ensures teachings remain clearly audible over the background music

## Usage Instructions for Users

1. **Enable Background Music**:
   - Go to Settings
   - Toggle "Background Music" ON under the Audio section

2. **Start Listening Session**:
   - Play any teaching
   - Background music will automatically start

3. **Continuous Background Music**:
   - Music continues playing between teachings
   - Provides uninterrupted peaceful atmosphere during the session
   - No need to restart between different teachings

4. **End Session**:
   - Pause or stop playback to end the music
   - Music will stop after a brief delay
   - Or disable the setting to turn off completely

## Technical Notes

- Uses `expo-audio` for audio playback
- Background music and teachings use separate audio player instances
- Music asset is loaded as a React Native require() for optimal performance
- State is managed through Zustand with proper persistence handling
- Background music player is not persisted (recreated on app restart)
- 1-second delay prevents music stopping during brief transitions
- Smart detection distinguishes between transitions and actual session ends 