/**
 * @fileOverview Initializes and provides access to the Google Generative AI instance.
 *
 * - getGeminiModel - Returns a configured generative model instance.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const MODEL_NAME = "gemini-pro"; // Using a standard model

let genAIInstance: GoogleGenerativeAI | null = null;

function getGenAIInstance(): GoogleGenerativeAI {
  if (!genAIInstance) {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      console.error("GOOGLE_GENAI_API_KEY environment variable not found.");
      // In a real app, you might want to throw an error or handle this more gracefully
      // For now, we'll throw to make the configuration issue clear.
      throw new Error("GOOGLE_GENAI_API_KEY is not set. Please add it to your .env file.");
    }
    genAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return genAIInstance;
}

/**
 * Gets the configured generative model instance.
 * @returns The generative model instance.
 */
export function getGeminiModel() {
  const genAI = getGenAIInstance();
  // Basic safety settings - adjust as needed
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      // Optional: Add system instruction if needed
      // systemInstruction: "You are BalanceBot...",
      safetySettings,
    });

  return model;
}
