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

async function checkStatus() {
  const projectRoot = process.cwd().replace("/scripts", ""); // Go back to project root
  const assetsDir = path.join(projectRoot, "assets");
  const imagesDir = path.join(assetsDir, "images/jesus-commands");

  try {
    // Read JSON file
    const jsonPath = path.join(assetsDir, "jesus_commands.json");
    const jsonContent = await fs.readFile(jsonPath, "utf-8");
    const commands: JesusCommand[] = JSON.parse(jsonContent);

    console.log("📊 Image Generation Status Report");
    console.log("=====================================\n");

    let existingCount = 0;
    let missingCount = 0;
    const missingIds: string[] = [];

    for (const command of commands) {
      const filename = `jesus-command-${command.id}.jpg`;
      const imagePath = path.join(imagesDir, filename);

      try {
        await fs.access(imagePath);
        existingCount++;
      } catch {
        missingCount++;
        missingIds.push(command.id);
      }
    }

    console.log(`📈 Summary:`);
    console.log(`   Total commands: ${commands.length}`);
    console.log(`   Images generated: ${existingCount}`);
    console.log(`   Images missing: ${missingCount}`);
    console.log(
      `   Progress: ${((existingCount / commands.length) * 100).toFixed(1)}%\n`
    );

    if (missingCount > 0) {
      console.log(`🔍 Missing images for IDs:`);

      // Group by ranges for easier reading
      const ranges = [];
      let start = parseInt(missingIds[0]);
      let end = start;

      for (let i = 1; i < missingIds.length; i++) {
        const current = parseInt(missingIds[i]);
        if (current === end + 1) {
          end = current;
        } else {
          if (start === end) {
            ranges.push(`${start}`);
          } else {
            ranges.push(`${start}-${end}`);
          }
          start = current;
          end = current;
        }
      }

      // Add the last range
      if (start === end) {
        ranges.push(`${start}`);
      } else {
        ranges.push(`${start}-${end}`);
      }

      console.log(`   ${ranges.join(", ")}\n`);
    }

    // Check if images directory exists
    try {
      await fs.access(imagesDir);

      // List actual files in the directory
      const files = await fs.readdir(imagesDir);
      const imageFiles = files.filter(
        (f) => f.endsWith(".jpg") && f.startsWith("jesus-command-")
      );

      console.log(`📁 Files in images directory: ${imageFiles.length}`);

      if (imageFiles.length !== existingCount) {
        console.log(
          `⚠️  Warning: File count mismatch! Expected ${existingCount}, found ${imageFiles.length}`
        );
      }
    } catch {
      console.log(`📁 Images directory does not exist yet`);
    }

    if (existingCount === commands.length) {
      console.log("🎉 All images have been generated!");
    } else {
      console.log(
        `🔄 Run the generate script to create the remaining ${missingCount} images`
      );
    }
  } catch (error) {
    console.error("❌ Error checking status:", error);
    process.exit(1);
  }
}

checkStatus().catch(console.error);
