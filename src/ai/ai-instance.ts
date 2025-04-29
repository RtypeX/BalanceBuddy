'use server';

import {genkit} from '@genkit-ai/core';
import {GoogleGenerativeAI} from '@google/generative-ai';
import {z} from 'zod';

const MODEL_NAME = 'gemini-pro';

let genAI: GoogleGenerativeAI | null = null;

async function getGenAI() {
  if (genAI) {
    return genAI;
  }

  const apiKey = "AIzaSyDic31oJDNLfi_uOZCSkfOPhiPKvezH5gI";
  if (!apiKey) {
    throw new Error(
      'Missing GOOGLE_GENAI_API_KEY environment variable.  Did you forget to copy .env.example to .env and populate it with your API key?'
    );
  }

  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

async function getTextModel() {
  const genAI = await getGenAI();
  return genAI.getGenerativeModel({model: MODEL_NAME});
}

export async function generate(prompt: string): Promise<string> {
  const model = await getTextModel();
  const result = await model.generateContent(prompt);
  const response = result.response;
  if (!response.text) {
    console.warn('No text in response:', response);
    throw new Error('No response text');
  }
  return response.text;
}
