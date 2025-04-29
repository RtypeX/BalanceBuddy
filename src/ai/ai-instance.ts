'use server';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export async function createAiInstance() {
  return genkit({
    promptDir: './prompts',
    plugins: [
      googleAI({
        apiKey: process.env.GOOGLE_GENAI_API_KEY,
      }),
    ],
  });
}

export const ai = await createAiInstance();
