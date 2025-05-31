# Image Generation Scripts

This directory contains TypeScript scripts to generate AI images using the FLUX.1 Kontext API for all the Jesus commands in the `assets/jesus_commands.json` file.

## Prerequisites

1. **FLUX.1 Kontext API Key**: You need to obtain an API key from [Black Forest Labs](https://api.bfl.ai/)
2. **Bun Runtime**: This project uses Bun for TypeScript execution
3. **Environment Variable**: Set your API key as an environment variable

## Setup

1. **Set your API key**:
   ```bash
   export BFL_API_KEY="your_api_key_here"
   ```

2. **Install dependencies** (from the scripts directory):
   ```bash
   cd scripts
   bun install
   ```

## Usage

### Check Current Status

Check how many images have been generated and which ones are missing:

```bash
cd scripts
bun run status
```

This will show you:
- Total number of commands
- How many images have been generated
- Which IDs are still missing
- Overall progress percentage

### Test Single Image Generation

Before running the full batch, test with a single image:

```bash
cd scripts
bun run test-single
```

This will:
- Generate one test image using the first image prompt
- Save it to `assets/images/jesus-commands/jesus-command-test.jpg`
- Verify that your API key and setup work correctly

### Generate All Images (Basic)

Generate images for all commands:

```bash
cd scripts
bun run generate-images
```

### Generate All Images (Resumable - Recommended)

Generate images with resume capability:

```bash
cd scripts
bun run generate-images-resume
```

This **resumable version** will:
- Skip images that already exist
- Save progress every 10 images
- Maintain proper order in the final JSON
- Allow you to stop and restart without losing progress

### Force Regenerate All Images

To regenerate all images (even existing ones):

```bash
cd scripts
bun run generate-images-force
```

### Regenerate Specific Images (NEW!)

Regenerate only specific images you didn't like by providing their IDs:

```bash
cd scripts
# Regenerate a single image
bun run regenerate-specific 5

# Regenerate multiple images
bun run regenerate-specific 1 5 10 25 100

# Alternative syntax with quotes
bun run regenerate-specific "1" "5" "10"
```

This **selective regeneration** will:
- ✅ Only regenerate the specified IDs
- ✅ Automatically backup existing images before replacing them
- ✅ Update the JSON with new image paths
- ✅ Preserve all other existing images
- ✅ Show detailed results for each ID
- ✅ Handle missing IDs gracefully

**Perfect for**: When you want to replace a few images you didn't like without regenerating everything!

## Scripts Overview

| Script | Purpose | Resume Support | Use Case |
|--------|---------|---------------|-----------|
| `test-single` | Test API with one image | N/A | Initial testing |
| `status` | Check generation progress | N/A | Monitor progress |
| `generate-images` | Basic batch generation | ❌ | Simple one-time run |
| `generate-images-resume` | Smart batch generation | ✅ | Recommended for large batches |
| `generate-images-force` | Force regenerate all | ❌ | Redo all images |
| `regenerate-specific` | Regenerate selected IDs | N/A | Replace specific images |

## Output

### Generated Images
- **Location**: `assets/images/`
- **Format**: JPEG (1024x1024 pixels)
- **Naming**: `jesus-command-{id}.jpg`

### Updated JSON Files
- **`assets/jesus_commands_updated.json`**: Final output with correct image paths
- **`assets/jesus_commands_progress.json`**: Progress backup (created during processing)

## Features

- ✅ **Batch Processing**: Handles all entries automatically
- ✅ **Resume Capability**: Skip existing images and continue from where you left off
- ✅ **Error Handling**: Continues processing even if some images fail
- ✅ **Rate Limiting**: Includes delays between requests to respect API limits
- ✅ **Progress Reporting**: Shows detailed progress and status for each image
- ✅ **Progress Saving**: Saves progress every 10 images
- ✅ **Status Monitoring**: Check progress anytime with the status script
- ✅ **Directory Management**: Automatically creates the images directory if it doesn't exist

## Recommended Workflow

1. **Test first**: `bun run test-single`
2. **Check status**: `bun run status`
3. **Start generation**: `bun run generate-images-resume`
4. **Monitor progress**: `bun run status` (in another terminal)
5. **Resume if needed**: `bun run generate-images-resume` (automatically resumes)

## API Details

The script uses the FLUX.1 Kontext Pro endpoint with these parameters:
- **Size**: 1024x1024 pixels
- **Aspect Ratio**: 1:1
- **Format**: JPEG
- **Safety Tolerance**: 2 (moderate)

## Cost Considerations

With ~400+ entries in the JSON file, this will make 400+ API calls. Please check the current pricing at [Black Forest Labs API pricing](https://api.bfl.ai/) before running the full batch.

## Troubleshooting

### Common Issues

1. **API Key Error**: Make sure `BFL_API_KEY` is set correctly
2. **Network Issues**: The script includes retry logic, but network problems may cause failures
3. **Rate Limiting**: If you hit rate limits, increase the delay between requests in the script
4. **Disk Space**: Ensure you have enough space for 400+ 1024x1024 JPEG images

### Error Recovery

The resumable script handles interruptions gracefully:
1. Use `bun run status` to see current progress
2. Simply run `bun run generate-images-resume` again to continue
3. Progress is saved every 10 images, so minimal work is lost
4. Failed images keep their original data and can be retried

### If Something Goes Wrong

1. **Check status**: `bun run status`
2. **Look at logs**: The script provides detailed console output
3. **Resume safely**: The resume script won't duplicate work
4. **Force restart**: Use `bun run generate-images-force` only if needed

## File Structure

```
scripts/
├── generate-images.ts          # Basic batch processing script
├── generate-images-resume.ts   # Resumable batch processing (recommended)
├── test-single-image.ts        # Single image test script
├── check-status.ts             # Status checking script
├── regenerate-specific.ts      # Selective regeneration script (NEW!)
├── package.json                # Dependencies and scripts
└── README.md                   # This file

assets/
├── jesus_commands.json          # Original data
├── jesus_commands_updated.json  # Final output with image paths
├── jesus_commands_progress.json # Progress backup file
└── images/
    └── jesus-commands/          # Generated images directory
        ├── jesus-command-1.jpg
        ├── jesus-command-2.jpg
        ├── jesus-command-test.jpg   # Test image
        ├── backup/                  # Backup images (created by regenerate-specific)
        │   ├── jesus-command-5-backup-1234567890.jpg
        │   └── ...
        └── ...
``` 