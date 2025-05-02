// src/ai/ai-instance.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') { // Added check for placeholder
  console.warn('Missing or placeholder GOOGLE_GENAI_API_KEY in environment variables. AI features may not work.');
  // You might throw an error here if the API key is absolutely required at startup
  // throw new Error('Missing GOOGLE_GENAI_API_KEY in environment variables.');
}

export const ai = genkit({
  plugins: [
    googleAI({
      // Ensure GOOGLE_GENAI_API_KEY is set in your environment variables
      apiKey: apiKey, // Use the variable defined above
    }),
  ],
  // You can specify a default model
  model: 'googleai/gemini-1.5-flash-latest', // Or another suitable model
  logLevel: 'debug', // Optional: for detailed logs during development
  enableTracingAndMetrics: true, // Optional: for monitoring
});
