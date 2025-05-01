import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This assumes GOOGLE_GENAI_API_KEY is set in your .env file
// Make sure you have a .env file in the root of your project with:
// GOOGLE_GENAI_API_KEY=AIz...your...key...

if (!process.env.GOOGLE_GENAI_API_KEY) {
  console.warn(
    'GOOGLE_GENAI_API_KEY environment variable not found. AI features may not work.'
  );
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY, // Read from environment variable
    }),
  ],
  logLevel: 'debug', // Optional: Set log level for more details during development
  enableTracingAndMetrics: true, // Optional: Enable tracing
});
