'use server'; // Required for server-side execution in Next.js

/**
 * @fileOverview A Gemini Chatbot flow.
 *
 * - generateResponse - A function that sends a message to the Gemini API and returns the response.
 * - GenerateResponseInput - The input type for the generateResponse function.
 * - GenerateResponseOutput - The return type for the generateResponse function.
 */

// Make sure the path to your ai-instance is correct
import { ai } from '@/ai/ai-instance';
import { z } from 'genkit';

// Define the input schema (what the function expects)
const GenerateResponseInputSchema = z.object({
  message: z.string().describe('The message to send to the bot.'),
});
export type GenerateResponseInput = z.infer<typeof GenerateResponseInputSchema>;

// Define the output schema (what the function will return)
const GenerateResponseOutputSchema = z.object({
  response: z.string().describe('The response from the bot.'),
});
export type GenerateResponseOutput = z.infer<typeof GenerateResponseOutputSchema>;

// Export the main function to be called from your UI
export async function generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
  // This calls the underlying Genkit flow
  return generateResponseFlow(input);
}

// Define the Genkit prompt
const prompt = ai.definePrompt({
  name: 'generateResponsePrompt', // Unique name for the prompt
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
  // The actual prompt template sent to the LLM
  prompt: `You are a helpful chatbot. Respond to the user's message below:

Message:
{{message}}`,
});

// Define the Genkit flow
const generateResponseFlow = ai.defineFlow<
  typeof GenerateResponseInputSchema,
  typeof GenerateResponseOutputSchema
>(
  {
    name: 'generateResponseFlow', // Unique name for the flow
    inputSchema: GenerateResponseInputSchema,
    outputSchema: GenerateResponseOutputSchema,
  },
  // The function that executes when the flow is called
  async input => {
    try {
      // Call the prompt with the input
      const { output } = await prompt(input);
      // Return the output (or throw if output is unexpectedly null/undefined)
      return output!;
    } catch (e) {
      // Log the error for debugging
      console.error('Error in generateResponseFlow:', e);
      // Returning a structured error response might be better for the UI:
       return { response: "Sorry, I encountered an error. Please try again." };
    }
  }
);
