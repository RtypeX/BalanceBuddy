'use server';
/**
 * @fileOverview A generic chatbot response generator.
 *
 * - generateResponse - A function that handles generating a response to a message.
 * - GenerateResponseInput - The input type for the generateResponse function.
 * - GenerateResponseOutput - The return type for the generateResponse function.
 */

// Import necessary modules
import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

// Define the input schema
const GenerateResponseInputSchema = z.object({
  message: z.string().describe('The message to send to the bot.'),
});
export type GenerateResponseInput = z.infer<typeof GenerateResponseInputSchema>;

// Define the output schema
const GenerateResponseOutputSchema = z.object({
  response: z.string().describe('The response from the bot.'),
});
export type GenerateResponseOutput = z.infer<typeof GenerateResponseOutputSchema>;

// Define the main function
export async function generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
  return generateResponseFlow(input);
}

// Define the prompt
const prompt = ai.definePrompt({
  name: 'generateResponsePrompt',
  input: {
    schema: z.object({
      message: z.string().describe('The message to send to the bot.'),
    }),
  },
  output: {
    schema: z.object({
      response: z.string().describe('The response from the bot.'),
    }),
  },
  prompt: `You are a helpful fitness assistant chatbot named BalanceBot. Respond to the following message, focusing on fitness, health, and wellness topics. If the message is off-topic, gently guide the conversation back to fitness or politely decline to answer.

{{{message}}}`,
});

// Define the flow
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
      const {output} = await prompt(input);
      return output!;
    } catch (e) {
      console.error('Error in generateResponseFlow: ', e);
      // Provide a user-friendly error message in the output
      return { response: 'Sorry, I encountered an error trying to generate a response. Please try again later.' };
    }
  }
);