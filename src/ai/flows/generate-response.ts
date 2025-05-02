// src/ai/flows/generate-response.ts
'use server';

/**
 * @fileOverview A Gemini Fitness Chatbot flow.
 *
 * - generateResponse - A function that sends a message to the Gemini API and returns the response.
 * - GenerateResponseInput - The input type for the generateResponse function.
 * - GenerateResponseOutput - The return type for the generateResponse function.
 */

import {ai} from '@/ai/ai-instance'; // Adjust path if needed
import {z} from 'genkit';

// Input Schema
const GenerateResponseInputSchema = z.object({
  message: z.string().describe('The message to send to the bot.'),
});
export type GenerateResponseInput = z.infer<typeof GenerateResponseInputSchema>;

// Output Schema
const GenerateResponseOutputSchema = z.object({
  response: z.string().describe('The response from the bot.'),
});
export type GenerateResponseOutput = z.infer<typeof GenerateResponseOutputSchema>;

// Exported function to be called by the UI
export async function generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
  return generateResponseFlow(input);
}

// Genkit Prompt Definition
const prompt = ai.definePrompt({
  name: 'generateFitnessResponsePrompt', // Unique name
  input: {
    schema: z.object({
      message: z.string().describe('The user\'s fitness-related message.'),
    }),
  },
  output: {
    schema: z.object({
      response: z.string().describe('The fitness chatbot\'s response.'),
    }),
  },
  // Prompt template defining the chatbot's persona and task
  prompt: `You are a knowledgeable and encouraging fitness chatbot. Provide helpful and safe advice related to exercise, nutrition, and general wellness. Keep your responses concise and easy to understand. Respond to the following message:

{{{message}}}`,
});

// Genkit Flow Definition
const generateResponseFlow = ai.defineFlow<
  typeof GenerateResponseInputSchema,
  typeof GenerateResponseOutputSchema
>(
  {
    name: 'generateFitnessResponseFlow', // Unique name
    inputSchema: GenerateResponseInputSchema,
    outputSchema: GenerateResponseOutputSchema,
  },
  async input => {
    try {
      // Call the defined prompt with the user's input
      const {output} = await prompt(input);
      // Return the generated response
      return output!; // Use non-null assertion if confident output is always present on success
    } catch (e) {
      console.error('Error in generateResponseFlow: ', e);
      // Provide a user-friendly error message
      return { response: 'Sorry, I encountered an error processing your request. Please try again.' };
      // Or re-throw for higher-level error handling:
      // throw new Error('Failed to generate fitness response: ' + (e instanceof Error ? e.message : String(e)));
    }
  }
);
