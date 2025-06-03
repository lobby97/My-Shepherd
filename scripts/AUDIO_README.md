# Voice of the Shepherd - Audio Generation

This directory contains scripts for generating both speech audio and background music for the Voice of the Shepherd mobile app.

## Prerequisites

1. **ElevenLabs API Key**: You need an ElevenLabs API account and API key
2. **Bun Runtime**: Make sure you have Bun installed for running TypeScript scripts

## Setup

Set your ElevenLabs API key as an environment variable:

```bash
export ELEVENLABS_API_KEY="your-api-key-here"
```

Or create a `.env` file in the scripts directory:

```
ELEVENLABS_API_KEY=your-api-key-here
```

## Speech Audio Generation

Generate speech audio for individual Jesus commands using Text-to-Speech.

### Available Commands

```bash
# Test mode - generates audio for test IDs only
npm run generate-audio-test

# Production mode - generates all audio files
npm run generate-audio-production

# Check status of audio generation
npm run generate-audio-status

# Generate specific test IDs
bun run generate-audio.ts --test --test-ids=1,2,3
```

### Features

- ✅ Converts text from `jesus_commands.json` to speech
- ✅ Uses ElevenLabs multilingual voice model
- ✅ Saves MP3 files in `../assets/audio/`
- ✅ Updates JSON with audio URLs
- ✅ Skips existing files to avoid regeneration
- ✅ Rate limiting and error handling
- ✅ Resume functionality for interrupted generations

### Configuration

Edit `CONFIG` in `generate-audio.ts`:

```typescript
const CONFIG = {
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY || "",
  VOICE_ID: "NFG5qt843uXKj4pFvR7C", // Change voice here
  MODEL_ID: "eleven_multilingual_v2",
  OUTPUT_FORMAT: "mp3_44100_128",
  // ... other settings
};
```

## Background Music Generation

Generate background music tracks using ElevenLabs' sound generation API.

### Available Commands

```bash
# Test mode - generates first track only
npm run generate-music-test

# Production mode - generates all music tracks
npm run generate-music-production

# Check status of music generation
npm run generate-music-status

# List available music tracks
npm run generate-music-list
```

### Available Music Tracks

The script generates 5 different background music tracks:

1. **Peaceful Ambient** (`peaceful_ambient.mp3`)
   - Gentle ambient music for peaceful contemplation
   - Soft piano and warm strings, no drums

2. **Uplifting Orchestral** (`uplifting_orchestral.mp3`)
   - Inspiring orchestral music for motivational moments
   - Strings and woodwinds, moderate tempo

3. **Contemplative Piano** (`contemplative_piano.mp3`)
   - Solo piano for deep reflection
   - Gentle and reflective, slow tempo

4. **Worship Atmosphere** (`worship_atmosphere.mp3`)
   - Atmospheric music for worship and prayer
   - Subtle choir voices, ethereal and sacred

5. **Gentle Acoustic Guitar** (`gentle_guitar.mp3`)
   - Soft acoustic guitar for intimate moments
   - Fingerpicking style, no percussion

### Features

- ✅ Generates 22-second music loops
- ✅ 5 different mood-appropriate tracks
- ✅ Saves MP3 files in `../assets/music/`
- ✅ Skips existing files to avoid regeneration
- ✅ Rate limiting and error handling
- ✅ Customizable music prompts

### Configuration

Edit `MUSIC_TRACKS` array in `generate-background-music.ts` to customize tracks:

```typescript
const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: "peaceful_ambient",
    name: "Peaceful Ambient", 
    description: "Gentle ambient music for peaceful contemplation",
    prompt: "Soft, peaceful ambient music with gentle piano...",
    filename: "peaceful_ambient.mp3"
  },
  // Add more tracks here...
];
```

## Directory Structure

After running the scripts, your assets directory will look like:

```
assets/
├── audio/                    # Speech audio files
│   ├── command_1.mp3
│   ├── command_2.mp3
│   └── ...
├── music/                    # Background music files
│   ├── peaceful_ambient.mp3
│   ├── uplifting_orchestral.mp3
│   ├── contemplative_piano.mp3
│   ├── worship_atmosphere.mp3
│   └── gentle_guitar.mp3
├── jesus_commands.json       # Updated with audio URLs
└── jesus_commands_updated.json
```

## Usage in Your App

### Playing Speech Audio

```typescript
// Load command with audio URL
const command = commands.find(c => c.id === "1");
const audio = new Audio(command.audioUrl);
await audio.play();
```

### Playing Background Music

```typescript
// Load background music
const backgroundMusic = new Audio("assets/music/peaceful_ambient.mp3");
backgroundMusic.loop = true;
backgroundMusic.volume = 0.3; // Lower volume for background

// Play with command audio
await backgroundMusic.play();
const commandAudio = new Audio(command.audioUrl);
await commandAudio.play();
```

### Crossfading Between Tracks

```typescript
// Crossfade between different background tracks
async function crossfadeMusic(fromTrack: string, toTrack: string) {
  const currentMusic = new Audio(`assets/music/${fromTrack}.mp3`);
  const nextMusic = new Audio(`assets/music/${toTrack}.mp3`);
  
  // Fade out current, fade in next
  // Implementation depends on your audio library
}
```

## API Rate Limits

ElevenLabs has rate limits on their API:

- **Free tier**: Limited requests per month
- **Paid tier**: Higher limits based on plan

The scripts include rate limiting delays:
- Speech audio: 1-2 second delays between requests
- Background music: 3 second delays between requests

## Troubleshooting

### Common Issues

1. **API Key Not Set**
   ```
   ❌ ELEVENLABS_API_KEY environment variable is not set!
   ```
   Solution: Set your API key as described in Setup

2. **Rate Limit Exceeded**
   ```
   ElevenLabs API error: 429 - Rate limit exceeded
   ```
   Solution: Wait and retry, or upgrade your ElevenLabs plan

3. **Network Issues**
   ```
   ❌ Error generating speech: fetch failed
   ```
   Solution: Check internet connection and try again

### Status Checking

Always check status before running production:

```bash
npm run generate-audio-status
npm run generate-music-status
```

### Resuming Interrupted Generations

Both scripts skip existing files, so you can safely re-run them to resume interrupted generations.

## Cost Estimation

ElevenLabs pricing (approximate):
- **Speech Audio**: ~$0.30 per 1000 characters
- **Background Music**: ~$0.10 per minute of generated audio

For 2000+ commands, budget accordingly for speech generation costs.

## File Sizes

- **Speech Audio**: ~50-200KB per command (30-60 seconds)
- **Background Music**: ~500KB-1MB per track (22 seconds)
- **Total**: Varies based on number of commands

## Support

For issues with the audio generation scripts:

1. Check the console output for detailed error messages
2. Verify your API key is correct and has sufficient credits
3. Check ElevenLabs API status page
4. Use `--status` flags to diagnose missing files 