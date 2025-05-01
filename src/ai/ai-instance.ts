'use server';
/**
 * @fileOverview Initializes and provides access to the Google Generative AI instance.
 *
 * - getGeminiModel - Returns a configured generative model instance.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const MODEL_NAME = "gemini-1.5-flash-latest"; // Using a recommended model

let genAIInstance: GoogleGenerativeAI | null = null;

function getGenAIInstance(): GoogleGenerativeAI {
  if (!genAIInstance) {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY;

    if (!apiKey) {
      console.error("GOOGLE_GENAI_API_KEY environment variable not found.");
      throw new Error("GOOGLE_GENAI_API_KEY is not set.");
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
      // systemInstruction: "You are BalanceBot, a friendly and encouraging fitness and wellness assistant. Focus on providing helpful, safe, and positive advice related to exercise, nutrition, mindfulness, and general well-being. Avoid giving medical advice. If asked about topics outside of fitness and wellness, gently steer the conversation back or politely decline.",
      safetySettings,
    });

  return model;
}
