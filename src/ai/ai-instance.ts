'use server';
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

async function createAiInstance() {
  return genkit({
    promptDir: './prompts',
    plugins: [
      googleAI({
        apiKey: process.env.GOOGLE_GENAI_API_KEY,
      }),
    ],
  });
}

export const getAi = async () => {
  return await createAiInstance();
};
