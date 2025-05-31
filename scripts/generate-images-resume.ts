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

interface FluxResponse {
  id: string;
  status: string;
  result?: {
    sample: string;
  };
}

class FluxImageGeneratorResumable {
  private apiKey: string;
  private baseUrl = "https://api.us1.bfl.ai";
  private assetsDir: string;
  private imagesDir: string;

  constructor(apiKey: string, projectRoot: string) {
    this.apiKey = apiKey;
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

  async createImageRequest(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/v1/flux-kontext-pro`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "x-key": this.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        width: 1024,
        height: 1024,
        aspect_ratio: "1:1",
        output_format: "jpeg",
        safety_tolerance: 2,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create image request: ${response.status} ${response.statusText}`
      );
    }

    const data: FluxResponse = await response.json();
    return data.id;
  }

  async pollForResult(
    requestId: string,
    maxAttempts: number = 60
  ): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

      const response = await fetch(
        `${this.baseUrl}/v1/get_result?id=${requestId}`,
        {
          headers: {
            accept: "application/json",
            "x-key": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to poll result: ${response.status} ${response.statusText}`
        );
      }

      const data: FluxResponse = await response.json();

      console.log(`Attempt ${attempt + 1}: Status - ${data.status}`);

      if (data.status === "Ready" && data.result?.sample) {
        return data.result.sample;
      } else if (data.status !== "Processing" && data.status !== "Queued") {
        throw new Error(`Unexpected status: ${data.status}`);
      }
    }

    throw new Error("Timeout waiting for image generation");
  }

  async downloadImage(imageUrl: string, filename: string): Promise<string> {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to download image: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const imagePath = path.join(this.imagesDir, filename);
    await fs.writeFile(imagePath, buffer);

    return imagePath;
  }

  async generateImage(prompt: string, id: string): Promise<string> {
    // Add instruction to prevent text generation in images
    const enhancedPrompt = `${prompt}. Do not insert texts, words, letters, or any written characters in the image.`;

    console.log(`\n🎨 Generating image for ID ${id}...`);
    console.log(`Prompt: ${enhancedPrompt.substring(0, 100)}...`);

    try {
      // Create request
      const requestId = await this.createImageRequest(enhancedPrompt);
      console.log(`✅ Request created with ID: ${requestId}`);

      // Poll for result
      const imageUrl = await this.pollForResult(requestId);
      console.log(`✅ Image generated successfully`);

      // Download and save image
      const filename = `jesus-command-${id}.jpg`;
      await this.downloadImage(imageUrl, filename);
      console.log(`✅ Image saved as: ${filename}`);

      return `./assets/images/${filename}`;
    } catch (error) {
      console.error(`❌ Error generating image for ID ${id}:`, error);
      throw error;
    }
  }

  async processAllCommands(resumeMode: boolean = true): Promise<void> {
    console.log("🚀 Starting batch image generation...");

    if (resumeMode) {
      console.log("🔄 Resume mode enabled - skipping existing images");
    }

    // Ensure directories exist
    await this.ensureDirectoriesExist();

    // Read JSON file
    const jsonPath = path.join(this.assetsDir, "jesus_commands.json");
    const jsonContent = await fs.readFile(jsonPath, "utf-8");
    const commands: JesusCommand[] = JSON.parse(jsonContent);

    console.log(`📖 Found ${commands.length} commands to process`);

    // Check which images already exist
    let skippedCount = 0;
    const toProcess: JesusCommand[] = [];

    if (resumeMode) {
      for (const command of commands) {
        const exists = await this.imageExists(command.id);
        if (exists) {
          console.log(`⏭️  Skipping ID ${command.id} - image already exists`);
          skippedCount++;
        } else {
          toProcess.push(command);
        }
      }
    } else {
      toProcess.push(...commands);
    }

    console.log(`📊 Processing Summary:`);
    console.log(`   Total commands: ${commands.length}`);
    console.log(`   Already completed: ${skippedCount}`);
    console.log(`   To process: ${toProcess.length}`);

    if (toProcess.length === 0) {
      console.log("🎉 All images already exist! Nothing to process.");
      return;
    }

    const updatedCommands: JesusCommand[] = [];
    let successCount = 0;
    let errorCount = 0;

    // First, add all commands with existing images
    for (const command of commands) {
      const exists = await this.imageExists(command.id);
      if (exists) {
        const imagePath = `./assets/images/jesus-command-${command.id}.jpg`;
        updatedCommands.push({
          ...command,
          imageUrl: imagePath,
        });
      }
    }

    // Then process the remaining ones
    for (let i = 0; i < toProcess.length; i++) {
      const command = toProcess[i];
      console.log(
        `\n📍 Processing ${i + 1}/${toProcess.length} - ID: ${command.id}`
      );
      console.log(
        `📊 Overall progress: ${skippedCount + successCount + errorCount + 1}/${
          commands.length
        }`
      );

      try {
        const imagePath = await this.generateImage(
          command.image_prompt,
          command.id
        );

        // Update the command with the new image path
        const updatedCommand = {
          ...command,
          imageUrl: imagePath,
        };

        // Insert in the correct position to maintain order
        const originalIndex = commands.findIndex((c) => c.id === command.id);
        updatedCommands[originalIndex] = updatedCommand;

        successCount++;
        console.log(`✅ Successfully processed ID ${command.id}`);

        // Add a small delay between requests to be respectful to the API
        if (i < toProcess.length - 1) {
          console.log("⏳ Waiting 3 seconds before next request...");
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`❌ Failed to process ID ${command.id}:`, error);

        // Keep original data if generation fails
        const originalIndex = commands.findIndex((c) => c.id === command.id);
        updatedCommands[originalIndex] = command;
        errorCount++;
      }

      // Save progress every 10 images
      if ((successCount + errorCount) % 10 === 0) {
        const progressJsonPath = path.join(
          this.assetsDir,
          "jesus_commands_progress.json"
        );
        await fs.writeFile(
          progressJsonPath,
          JSON.stringify(updatedCommands.filter(Boolean), null, 2)
        );
        console.log("💾 Progress saved...");
      }
    }

    // Save final updated JSON
    const updatedJsonPath = path.join(
      this.assetsDir,
      "jesus_commands_updated.json"
    );
    await fs.writeFile(
      updatedJsonPath,
      JSON.stringify(updatedCommands, null, 2)
    );

    console.log("\n🎉 Batch processing complete!");
    console.log(`⏭️  Skipped (already existed): ${skippedCount} images`);
    console.log(`✅ Successfully generated: ${successCount} images`);
    console.log(`❌ Failed: ${errorCount} images`);
    console.log(
      `📊 Total completion: ${skippedCount + successCount}/${
        commands.length
      } images`
    );
    console.log(`💾 Updated JSON saved to: jesus_commands_updated.json`);
  }
}

// Main execution
async function main() {
  const apiKey = process.env.BFL_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: BFL_API_KEY environment variable is required");
    console.log(
      'Please set your API key: export BFL_API_KEY="your_api_key_here"'
    );
    process.exit(1);
  }

  const projectRoot = process.cwd();
  const generator = new FluxImageGeneratorResumable(apiKey, projectRoot);

  // Check if user wants to force regenerate all images
  const forceRegenerate = process.argv.includes("--force");
  const resumeMode = !forceRegenerate;

  if (forceRegenerate) {
    console.log("🔄 Force mode enabled - will regenerate all images");
  }

  try {
    await generator.processAllCommands(resumeMode);
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { FluxImageGeneratorResumable };
