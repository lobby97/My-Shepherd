import { FluxImageGenerator } from "./generate-images";

async function testSingleImage() {
  const apiKey = process.env.BFL_API_KEY;

  if (!apiKey) {
    console.error("❌ Error: BFL_API_KEY environment variable is required");
    console.log(
      'Please set your API key: export BFL_API_KEY="your_api_key_here"'
    );
    process.exit(1);
  }

  const projectRoot = process.cwd().replace("/scripts", ""); // Go back to project root
  const generator = new FluxImageGenerator(apiKey, projectRoot);

  // Test with a simple prompt (the generateImage method will automatically add the no-text instruction)
  const testPrompt =
    "A person turning away from a shadowy path towards a brightly lit gate, symbolizing repentance and the Kingdom of Heaven.";
  const testId = "test";

  console.log("🧪 Testing FLUX API with a single image...");
  console.log(`📝 Base Prompt: ${testPrompt}`);
  console.log(
    "📝 Note: 'Do not insert texts' instruction will be automatically added"
  );

  try {
    await generator.ensureDirectoriesExist();
    const imagePath = await generator.generateImage(testPrompt, testId);
    console.log(`🎉 Test successful! Image saved to: ${imagePath}`);
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testSingleImage().catch(console.error);
