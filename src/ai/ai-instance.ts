import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Ensure GOOGLE_GENAI_API_KEY is set in your .env file
if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.warn(
    'GOOGLE_GENAI_API_KEY environment variable not found. AI features may not work.'
  );
  // Optionally throw an error if the API key is absolutely required at startup
  // throw new Error("GOOGLE_GENAI_API_KEY environment variable is not set.");
}

export const ai = genkit({
  plugins: [
    googleAI({
      // Ensure GOOGLE_GENAI_API_KEY is set in your environment variables
      apiKey: process.env.GOOGLE_GENAI_API_KEY || 'YOUR_PLACEHOLDER_API_KEY', // Provide a fallback or handle error
    }),
  ],
  // Specify a default model
  model: 'googleai/gemini-1.5-flash-latest', // Or 'gemini-pro' or another suitable model
  logLevel: 'debug', // Optional: for detailed logs during development
  enableTracingAndMetrics: true, // Optional: for monitoring
});
