
'use server';

/**
 * @fileOverview A Gemini Chatbot flow.
 *
 * - generateResponse - A function that sends a message to the Gemini API and returns the response.
 * - GenerateResponseInput - The input type for the generateResponse function.
 * - GenerateResponseOutput - The return type for the generateResponse function.
 */

import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

const GenerateResponseInputSchema = z.object({
  message: z.string().describe('The message to send to the bot.'),
});
export type GenerateResponseInput = z.infer<typeof GenerateResponseInputSchema>;

const GenerateResponseOutputSchema = z.object({
  response: z.string().describe('The response from the bot.'),
});
export type GenerateResponseOutput = z.infer<typeof GenerateResponseOutputSchema>;

export async function generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
  return await generateResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateResponsePrompt',
  input: {
    schema: GenerateResponseInputSchema,
  },
  output: {
    schema: GenerateResponseOutputSchema,
  },
  prompt: `You are a helpful chatbot. Respond to the user's message below:

Message:
{{message}}`,
});

const generateResponseFlow = ai.defineFlow<
  typeof GenerateResponseInputSchema,
  typeof GenerateResponseOutputSchema
>(
  {
    name: 'generateResponseFlow',
    inputSchema: GenerateResponseInputSchema,
    outputSchema: GenerateResponseOutputSchema,
  },
  async input => {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch (e) {
      console.error('Error in generateResponseFlow:', e);
      return { response: 'Sorry, I encountered an error. Please try again.' };
    }
  }
);
