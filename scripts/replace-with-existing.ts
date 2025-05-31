// ===================================================================
// 🔄 MANUAL ARRAY INPUT - Paste your IDs here to replace with existing images
// ===================================================================
const MANUAL_IDS: number[] = [
  6, 8, 10, 17, 18, 20, 25, 26, 27, 29, 41, 54, 61, 76, 85, 88, 90, 91, 93, 94,
  95, 119, 121, 122, 124, 126, 130, 142, 145, 147, 148, 157, 160, 161, 171, 181,
  193, 194, 195, 200, 168, 158, 155, 154, 153, 125, 107, 106, 105, 103, 86, 87,
];

// These IDs will be replaced with copies of random existing images that are NOT in this array
// ===================================================================

import * as fs from "fs/promises";
import * as path from "path";

interface JesusCommand {
  id: string;
  text: string;
  attribution: string;
  category: string;
  explanation: string;
  image_prompt: string;
  voice_prompt: string;
  imageUrl: string;
  audioUrl: string;
  reference: string;
}

class ImageReplacer {
  private assetsDir: string;
  private imagesDir: string;

  constructor(projectRoot: string) {
    this.assetsDir = path.join(projectRoot, "assets");
    this.imagesDir = path.join(this.assetsDir, "images/jesus-commands");
  }

  async ensureDirectoriesExist(): Promise<void> {
    try {
      await fs.access(this.imagesDir);
    } catch {
      await fs.mkdir(this.imagesDir, { recursive: true });
    }
  }

  async getExistingImages(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.imagesDir);
      return files.filter(
        (f) =>
          f.endsWith(".jpg") &&
          f.startsWith("jesus-command-") &&
          !f.includes("backup")
      );
    } catch {
      return [];
    }
  }

  async imageExists(id: string): Promise<boolean> {
    const filename = `jesus-command-${id}.jpg`;
    const imagePath = path.join(this.imagesDir, filename);

    try {
      await fs.access(imagePath);
      return true;
    } catch {
      return false;
    }
  }

  extractIdFromFilename(filename: string): string | null {
    const match = filename.match(/jesus-command-(\d+)\.jpg$/);
    return match ? match[1] : null;
  }

  shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async replaceWithExistingImages(targetIds: string[]): Promise<void> {
    console.log("🔄 Starting replacement with existing images...");
    console.log(`🎯 Target IDs to replace: ${targetIds.join(", ")}`);

    // Ensure directories exist
    await this.ensureDirectoriesExist();

    // Read JSON file
    const jsonPath = path.join(this.assetsDir, "jesus_commands.json");
    const jsonContent = await fs.readFile(jsonPath, "utf-8");
    const commands: JesusCommand[] = JSON.parse(jsonContent);

    console.log(`📖 Found ${commands.length} total commands`);

    // Get all existing images
    const existingFiles = await this.getExistingImages();
    const existingIds = existingFiles
      .map((f) => this.extractIdFromFilename(f))
      .filter((id) => id !== null) as string[];

    console.log(`📁 Found ${existingFiles.length} existing images`);

    // Find source images (existing images NOT in the target array)
    const sourceIds = existingIds.filter((id) => !targetIds.includes(id));

    console.log(`\n📊 Replacement Summary:`);
    console.log(`   Target IDs to replace: ${targetIds.length}`);
    console.log(`   Available source images: ${sourceIds.length}`);
    console.log(
      `   Source IDs: ${sourceIds.slice(0, 10).join(", ")}${
        sourceIds.length > 10 ? "..." : ""
      }`
    );

    if (sourceIds.length === 0) {
      console.log("❌ No source images available for replacement");
      console.log(
        "💡 Make sure you have existing images that are not in the target array"
      );
      return;
    }

    if (targetIds.length > sourceIds.length) {
      console.log(
        `⚠️  Warning: More targets (${targetIds.length}) than sources (${sourceIds.length})`
      );
      console.log("   Some source images will be used multiple times");
    }

    // Create backup directory
    const backupDir = path.join(this.imagesDir, "backup");
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }

    // Shuffle source IDs for random selection
    const shuffledSources = this.shuffleArray(sourceIds);

    let successCount = 0;
    let errorCount = 0;
    const results: {
      targetId: string;
      sourceId: string;
      success: boolean;
      error?: string;
    }[] = [];

    for (let i = 0; i < targetIds.length; i++) {
      const targetId = targetIds[i];
      const sourceId = shuffledSources[i % shuffledSources.length]; // Cycle through sources if needed

      console.log(
        `\n📍 Replacing ${i + 1}/${
          targetIds.length
        } - ID: ${targetId} with image from ID: ${sourceId}`
      );

      try {
        const targetFilename = `jesus-command-${targetId}.jpg`;
        const sourceFilename = `jesus-command-${sourceId}.jpg`;

        const targetPath = path.join(this.imagesDir, targetFilename);
        const sourcePath = path.join(this.imagesDir, sourceFilename);

        // Check if source exists
        try {
          await fs.access(sourcePath);
        } catch {
          throw new Error(`Source image ${sourceFilename} not found`);
        }

        // Backup existing target if it exists
        try {
          await fs.access(targetPath);
          const backupPath = path.join(
            backupDir,
            `${targetFilename}-backup-${Date.now()}.jpg`
          );
          await fs.copyFile(targetPath, backupPath);
          console.log(
            `💾 Backed up existing target to: ${path.basename(backupPath)}`
          );
        } catch {
          console.log(`ℹ️  No existing target image for ID ${targetId}`);
        }

        // Copy source to target
        await fs.copyFile(sourcePath, targetPath);
        console.log(`✅ Copied ${sourceFilename} → ${targetFilename}`);

        results.push({ targetId, sourceId, success: true });
        successCount++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`❌ Failed to replace ID ${targetId}:`, error);

        results.push({
          targetId,
          sourceId,
          success: false,
          error: errorMessage,
        });
        errorCount++;
      }
    }

    // Update JSON for successful replacements
    let updatedJsonPath = path.join(
      this.assetsDir,
      "jesus_commands_updated.json"
    );
    let updatedCommands: JesusCommand[];

    try {
      const updatedContent = await fs.readFile(updatedJsonPath, "utf-8");
      updatedCommands = JSON.parse(updatedContent);
    } catch {
      // If updated JSON doesn't exist, use original
      updatedCommands = [...commands];
      console.log(
        "ℹ️  Using original JSON as base (updated version not found)"
      );
    }

    // Update imageUrl for successfully replaced images
    for (const result of results) {
      if (result.success) {
        const commandIndex = updatedCommands.findIndex(
          (cmd) => cmd.id === result.targetId
        );
        if (commandIndex !== -1) {
          updatedCommands[
            commandIndex
          ].imageUrl = `./assets/images/jesus-commands/jesus-command-${result.targetId}.jpg`;
        }
      }
    }

    // Save updated JSON
    await fs.writeFile(
      updatedJsonPath,
      JSON.stringify(updatedCommands, null, 2)
    );

    console.log("\n🎉 Replacement operation complete!");
    console.log(`✅ Successfully replaced: ${successCount} images`);
    console.log(`❌ Failed: ${errorCount} images`);

    if (successCount > 0) {
      console.log(`💾 Updated JSON saved to: jesus_commands_updated.json`);
      console.log(
        `💾 Backup images saved to: assets/images/jesus-commands/backup/`
      );
    }

    // Show detailed results
    if (results.length > 0) {
      console.log("\n📋 Detailed Results:");
      for (const result of results) {
        if (result.success) {
          console.log(
            `   ✅ ID ${result.targetId} ← ID ${result.sourceId}: Success`
          );
        } else {
          console.log(
            `   ❌ ID ${result.targetId} ← ID ${result.sourceId}: Failed - ${result.error}`
          );
        }
      }
    }

    // Show mapping summary
    if (successCount > 0) {
      console.log("\n🔗 Image Mapping Summary:");
      const mappings = results
        .filter((r) => r.success)
        .map((r) => `${r.targetId}←${r.sourceId}`);
      console.log(`   ${mappings.join(", ")}`);
    }
  }
}

// Main execution
async function main() {
  // Determine which IDs to use - prioritize manual array
  let targetIds: string[];
  let inputMethod: string;

  if (MANUAL_IDS.length > 0) {
    // Use manual array from the top of the file
    targetIds = MANUAL_IDS.map((id) => id.toString());
    inputMethod = "📝 Manual Array";
    console.log("🎯 Using manual array from script file");
  } else {
    // Fall back to command line arguments
    targetIds = process.argv.slice(2);
    inputMethod = "💻 Command Line";

    if (targetIds.length === 0) {
      console.error("❌ Error: No IDs provided for replacement");
      console.log("\n🔧 Two ways to provide IDs:");
      console.log(
        "\n1️⃣  Edit the script file and add IDs to MANUAL_IDS array:"
      );
      console.log("   const MANUAL_IDS: number[] = [6, 8, 10, 17, 18, 20];");
      console.log("\n2️⃣  Or provide IDs as command line arguments:");
      console.log("   bun run replace-with-existing 1 5 10 25");
      console.log(
        "\n💡 These IDs will be replaced with copies of other existing images"
      );
      process.exit(1);
    }
    console.log("🎯 Using command line arguments");
  }

  console.log(`📊 Input Method: ${inputMethod}`);
  console.log(`🔢 Total IDs to replace: ${targetIds.length}`);
  console.log(`🔄 Replacing images for IDs: ${targetIds.join(", ")}`);

  const projectRoot = process.cwd().replace("/scripts", ""); // Go back to project root
  const replacer = new ImageReplacer(projectRoot);

  try {
    await replacer.replaceWithExistingImages(targetIds);
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { ImageReplacer };
