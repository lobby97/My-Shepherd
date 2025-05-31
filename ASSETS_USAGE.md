# Using Local Assets in Voice of the Shepherd

This guide explains how to use the local images and audio files in your Expo React Native app without needing to upload them to external servers.

## 📁 Asset Structure

```
assets/
├── images/
│   ├── jesus-commands/        # Specific command images
│   │   ├── jesus-command-6.jpg
│   │   ├── jesus-command-8.jpg
│   │   └── ... (100+ images)
│   ├── jesus-command-test.jpg  # Default fallback image
│   ├── icon.png               # App icon
│   └── splash-icon.png        # Splash screen
├── audio/
│   ├── command_1.mp3
│   ├── command_2.mp3
│   └── ... (223 audio files)
└── jesus_commands.json        # Data with placeholder URLs
```

## 🚀 How It Works

### 1. Asset Mapping Files

I've created helper files that map your local assets:

- **`lib/audioAssets.ts`** - Maps all audio files (command_1.mp3 to command_223.mp3)
- **`lib/imageAssets.ts`** - Maps available images with fallback to default
- **`lib/commandsData.ts`** - Combines JSON data with local assets

### 2. Key Benefits

✅ **No External Hosting Required** - Assets are bundled with your app
✅ **Offline Support** - Works without internet connection  
✅ **Fast Loading** - No network requests for assets
✅ **Fallback System** - Default image when specific image not available
✅ **Type Safety** - Full TypeScript support

## 💻 Usage Examples

### Basic Image Display

```tsx
import { getImageAsset } from '../lib/imageAssets';

function MyComponent({ commandId }: { commandId: string }) {
  const imageSource = getImageAsset(commandId);
  
  return (
    <Image 
      source={imageSource} 
      style={{ width: 200, height: 200 }} 
      resizeMode="cover"
    />
  );
}
```

### Audio Playback

```tsx
import { Audio } from 'expo-av';
import { getAudioAsset } from '../lib/audioAssets';

async function playAudio(commandId: string) {
  const audioAsset = getAudioAsset(commandId);
  
  if (audioAsset) {
    const { sound } = await Audio.Sound.createAsync(audioAsset);
    await sound.playAsync();
  } else {
    console.log('No audio available for this command');
  }
}
```

### Using Processed Commands

```tsx
import { getProcessedCommands, getRandomCommand } from '../lib/commandsData';

function MyApp() {
  const allCommands = getProcessedCommands();
  const randomCommand = getRandomCommand();
  
  // Each command now has:
  // - hasLocalImage: boolean
  // - hasLocalAudio: boolean
  // - localImageAsset: require() reference
  // - localAudioAsset: require() reference
  
  return (
    <JesusCommandCard command={randomCommand} />
  );
}
```

## 🔧 Available Helper Functions

### Image Functions
```tsx
import { getImageAsset, hasImageAsset, getDefaultImage } from '../lib/imageAssets';

getImageAsset('123')      // Get image for command 123, fallback to default
hasImageAsset('123')      // Check if specific image exists
getDefaultImage()         // Get the default fallback image
```

### Audio Functions
```tsx
import { getAudioAsset, hasAudioAsset } from '../lib/audioAssets';

getAudioAsset('123')      // Get audio for command 123, null if not found
hasAudioAsset('123')      // Check if audio exists for command 123
```

### Data Functions
```tsx
import { 
  getProcessedCommands, 
  getCommandById,
  getCommandsByCategory,
  searchCommands,
  getAssetStats 
} from '../lib/commandsData';

const allCommands = getProcessedCommands();
const command123 = getCommandById('123');
const prayerCommands = getCommandsByCategory('Prayer & Faith');
const searchResults = searchCommands('love');
const stats = getAssetStats(); // Get asset availability statistics
```

## 📊 Asset Statistics

Based on your current assets:
- **Total Commands**: 223
- **Commands with Images**: ~100 (45%)
- **Commands with Audio**: 223 (100%)
- **Commands with Both**: ~100 (45%)

## 🎨 React Component Example

See `components/JesusCommandCard.tsx` for a complete example that:
- Displays images with fallback
- Plays audio with controls
- Shows loading states
- Handles errors gracefully

## 🚀 Running the Example

1. Install dependencies:
```bash
bun add expo-av
```

2. View the example page:
```
/app/example-usage.tsx
```

3. Use the `JesusCommandCard` component in your app:
```tsx
import { JesusCommandCard } from '../components/JesusCommandCard';
import { getRandomCommand } from '../lib/commandsData';

export default function MyScreen() {
  const command = getRandomCommand();
  return <JesusCommandCard command={command} />;
}
```

## 🔄 Alternative Approaches

If you prefer different approaches:

### Option 1: Metro Assets (Current Approach)
✅ **Pros**: Built into Expo, type-safe, offline support
❌ **Cons**: Increases app bundle size

### Option 2: Remote URLs
You could upload assets to:
- Firebase Storage
- AWS S3
- Cloudinary
- Any CDN

✅ **Pros**: Smaller app bundle, easy updates
❌ **Cons**: Requires internet, hosting costs

### Option 3: Hybrid Approach
- Keep essential assets local
- Load additional assets remotely as needed

## 🛠️ Customization

You can easily modify the asset mapping files to:
- Add new assets
- Change fallback behavior
- Implement caching strategies
- Add asset preprocessing

## 📱 Performance Tips

1. **Optimize Images**: Use appropriate sizes and formats
2. **Lazy Loading**: Load assets only when needed
3. **Caching**: Audio files are cached automatically by Expo
4. **Preloading**: Consider preloading critical assets

Your assets are now ready to use! The system automatically handles fallbacks and provides a smooth user experience whether assets are available or not. 