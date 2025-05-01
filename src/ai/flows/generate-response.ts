'use server';
/**
 * @fileOverview A generic chatbot response generator using Genkit.
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
    schema: z.object({ // Use the existing schema object
      message: z.string().describe('The message to send to the bot.'),
    }),
  },
  output: {
    schema: z.object({ // Use the existing schema object
      response: z.string().describe('The response from the bot.'),
    }),
  },
  prompt: `You are a helpful fitness assistant chatbot named BalanceBot. Respond to the following message, focusing on fitness, health, and wellness topics. If the message is off-topic, gently guide the conversation back to fitness or politely decline to answer.

User Message: {{{message}}}
Your Response:`,
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
       if (!output) {
         console.error('Error in generateResponseFlow: Received null or undefined output from prompt.');
         // Return a structured error response matching the output schema
         return { response: 'Sorry, I received an unexpected empty response. Please try again.' };
       }
       return output;
    } catch (e: unknown) {
      // Log the detailed error on the server for debugging
       console.error('Error in generateResponseFlow: ', e instanceof Error ? e.message : String(e));
       // Return a user-friendly error message within the expected output schema
       // Avoid throwing here to allow the client to receive a structured error message
       return { response: 'Sorry, I encountered an error trying to generate a response. Please check the server logs for details or try again later.' };
    }
  }
);
