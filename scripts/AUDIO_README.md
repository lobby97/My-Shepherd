# Voice of the Shepherd - Audio Generation System

This system generates high-quality speech audio for Jesus commands using ElevenLabs Text-to-Speech API.

## Features

- **High-Quality Speech**: Uses ElevenLabs Multilingual V2 model
- **Environment Variables**: Secure API key management
- **Progress Tracking**: Real-time generation progress
- **JSON Updates**: Automatic updating of audio URLs in the data file
- **Test Mode**: Generate audio for specific commands only
- **Resume Functionality**: Resume interrupted generations (skip existing files)
- **Status Checking**: Check completion status of audio generation
- **Error Handling**: Robust error handling with detailed logging

## Prerequisites

1. **ElevenLabs API Key**: Sign up at [ElevenLabs](https://elevenlabs.io) and get your API key
2. **Bun Runtime**: Install [Bun](https://bun.sh) for running TypeScript scripts

## Setup

1. Set your ElevenLabs API key:
   ```bash
   export ELEVENLABS_API_KEY=your-api-key-here
   ```

2. Test your setup:
   ```bash
   cd scripts
   bun run test-audio-setup
   ```

## Usage

### Quick Start Commands

```bash
# Test with a few commands
bun run generate-audio-test

# Generate all audio files
bun run generate-audio-production

# Check status of audio generation
bun run generate-audio-status

# Resume interrupted generation (skip existing files)
bun run generate-audio-resume

# Force regenerate all files (including existing ones)
bun run generate-audio-force
```

### Detailed Usage

#### Check Status
```bash
bun run generate-audio-status
```
This will show:
- Total number of commands
- How many audio files already exist
- How many are missing
- IDs of missing files

#### Resume Generation
```bash
bun run generate-audio-resume
```
This will:
- Skip existing audio files
- Only generate missing audio files
- Save progress every 10 commands
- Continue on errors (doesn't stop entire process)

#### Force Regeneration
```bash
bun run generate-audio-force
```
This will:
- Regenerate ALL audio files (ignoring existing ones)
- Useful if you want to update all audio with new voice settings

#### Test Mode
```bash
# Test with default IDs (1, 2, 3)
bun run generate-audio-test

# Test with specific IDs
bun run generate-audio.ts --test --test-ids=5,10,15
```

### Advanced Options

All scripts support these command line options:

```bash
bun run generate-audio.ts [options]

Options:
  --test                Run in test mode (generates only test IDs)
  --production         Run in production mode (generates all audios)
  --test-ids=1,2,3     Specify test IDs (comma-separated)
  --status             Check status of audio generation
  --help, -h           Show this help message

Resume script options:
bun run generate-audio-resume.ts [options]

Options:
  --status             Check status of audio generation
  --force              Force regenerate all audio files (ignore existing ones)
  --help, -h           Show this help message
```

## Configuration

The system uses these default settings:

```typescript
const CONFIG = {
  ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  VOICE_ID: "NFG5qt843uXKj4pFvR7C",           // Multilingual voice
  MODEL_ID: "eleven_multilingual_v2",          // High-quality model
  OUTPUT_FORMAT: "mp3_44100_128",              // CD quality MP3
  INPUT_JSON_PATH: "../assets/jesus_commands.json",
  OUTPUT_AUDIO_DIR: "../assets/audio",
  AUDIO_BASE_URL: "https://example.com/audio", // Update for your domain
  TEST_MODE: true,                             // Start in test mode
  TEST_IDS: ["1", "2", "3"],                  // Default test commands
};
```

## Output

### Audio Files
- **Location**: `../assets/audio/`
- **Format**: MP3 (44.1kHz, 128kbps)
- **Naming**: `command_[ID].mp3`
- **Quality**: High-quality speech optimized for web playback

### JSON Updates
The script automatically updates `../assets/jesus_commands.json` with:
```json
{
  "id": "1",
  "text": "Love your enemies and pray for those who persecute you.",
  "audioUrl": "https://example.com/audio/command_1.mp3"
}
```

## Error Handling

### Common Issues

1. **Missing API Key**
   ```
   ❌ ELEVENLABS_API_KEY environment variable is not set!
   ```
   **Solution**: Set your API key: `export ELEVENLABS_API_KEY=your-key`

2. **API Rate Limits**
   ```
   ❌ ElevenLabs API error: 429 - Rate limit exceeded
   ```
   **Solution**: The script includes 2-second delays between requests. For heavy usage, consider upgrading your ElevenLabs plan.

3. **Network Issues**
   ```
   ❌ Error generating speech for command X: Network error
   ```
   **Solution**: Run the resume script to continue from where it left off.

### Resume After Errors

If generation fails or is interrupted:

1. Check what's missing: `bun run generate-audio-status`
2. Resume generation: `bun run generate-audio-resume`
3. The script will skip existing files and only generate missing ones

## Performance

- **Speed**: ~2-5 seconds per audio file
- **Rate Limiting**: 2-second delay between requests
- **Progress Saving**: Every 10 commands
- **Memory Efficient**: Processes one file at a time

## File Structure

```
scripts/
├── generate-audio.ts           # Main generation script
├── generate-audio-resume.ts    # Resume functionality script
├── test-audio-setup.ts         # Setup testing script
├── package.json               # NPM scripts
└── AUDIO_README.md            # This documentation

../assets/
├── jesus_commands.json        # Input data file
└── audio/                     # Generated audio files
    ├── command_1.mp3
    ├── command_2.mp3
    └── ...
```

## Workflow Examples

### First Time Setup
```bash
# 1. Test your setup
bun run test-audio-setup

# 2. Generate a few test files
bun run generate-audio-test

# 3. Check results
ls ../assets/audio/

# 4. Generate all files
bun run generate-audio-production
```

### Resume Interrupted Generation
```bash
# 1. Check what's missing
bun run generate-audio-status

# 2. Resume generation
bun run generate-audio-resume

# 3. Verify completion
bun run generate-audio-status
```

### Update Existing Files
```bash
# Regenerate all files with new settings
bun run generate-audio-force
```

## Integration Notes

- **Web Integration**: Update `AUDIO_BASE_URL` to match your web server
- **CDN Integration**: Point `AUDIO_BASE_URL` to your CDN endpoint
- **API Limits**: Monitor your ElevenLabs usage to avoid rate limits
- **Storage**: Each audio file is typically 50-200KB

## Troubleshooting

### Check System Status
```bash
bun run test-audio-setup
```

### Verify Output
```bash
# Check if files exist
ls -la ../assets/audio/

# Check JSON was updated
grep -A 3 -B 3 "audioUrl" ../assets/jesus_commands.json | head -20
```

### Monitor Progress
The scripts provide detailed console output showing:
- Current command being processed
- API response status
- File save locations
- Progress counters
- Error details

For additional help, check the console output for specific error messages and solutions. 