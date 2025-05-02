import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const apiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey) {
  throw new Error('Missing GOOGLE_GENAI_API_KEY in environment variables.');
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey,
    }),
  ],
  model: 'googleai/gemini-1.5-flash-latest', // Or another suitable model
  logLevel: 'debug', // Optional: for detailed logs during development
  enableTracingAndMetrics: true, // Optional: for monitoring
});
