import { genkit } from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  defaultModel: 'gemini-1.0-pro',
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
    }),
  ],
});
