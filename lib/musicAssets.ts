// Background music assets
export const musicAssets = {
  peaceful_ambient: require("../assets/music/peaceful_ambient.mp3"),
};

export function getMusicAsset(musicId: string): any {
  return musicAssets[musicId as keyof typeof musicAssets] || null;
}

// Get the peaceful ambient music asset specifically
export function getPeacefulAmbientMusic(): any {
  return musicAssets.peaceful_ambient;
}
