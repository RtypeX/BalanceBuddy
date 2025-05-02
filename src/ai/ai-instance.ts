// src/ai/ai-instance.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
  // It's better to throw an error or log a serious warning if the key is missing.
  // For now, we'll log an error and proceed, but API calls will fail.
  console.error('Missing or placeholder GOOGLE_GENAI_API_KEY in environment variables. AI features will not work.');
  // Consider throwing new Error('Missing GOOGLE_GENAI_API_KEY...') in production
}

export const ai = genkit({
  plugins: [
    googleAI({
      // Pass the potentially undefined key; the plugin might handle it internally
      // or fail gracefully during API calls if the key is truly missing/invalid.
      apiKey: apiKey,
    }),
  ],
  // Specify a default model
  model: 'googleai/gemini-1.5-flash-latest', // Or another suitable model like 'gemini-pro'
  logLevel: 'debug', // Optional: for detailed logs during development
  enableTracingAndMetrics: true, // Optional: for monitoring
});
