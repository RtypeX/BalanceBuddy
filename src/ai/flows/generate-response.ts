// This file is no longer used for the direct API call approach.
// The chat logic has been moved to src/app/api/chat/route.ts.

// If you were using Genkit, the flow definition would be here.
// 'use server';
// import { ai } from '@/ai/ai-instance'; 
// import { z } from 'genkit';

// const GenerateResponseInputSchema = z.object({
//   message: z.string().describe('The message to send to the bot.'),
//   modelType: z.enum(['gemini', 'gpt']).describe('The AI model to use.'),
//   history: z.array(z.object({ role: z.string(), content: z.string() })).optional().describe('Conversation history'),
// });
// export type GenerateResponseInput = z.infer<typeof GenerateResponseInputSchema>;

// const GenerateResponseOutputSchema = z.object({
//   response: z.string().describe('The response from the bot.'),
// });
// export type GenerateResponseOutput = z.infer<typeof GenerateResponseOutputSchema>;

// export async function generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
//   // This function would typically call a Genkit flow.
//   // For the simplified direct API approach, this file is not directly used in the same way.
//   // The actual API call is handled in src/app/api/chat/route.ts
//   console.warn("generateResponse flow function in src/ai/flows/generate-response.ts is being called, but logic is now primarily in /api/chat/route.ts for direct API calls.");
//   return { response: "This flow is deprecated for direct API calls." };
// }

// // Example Genkit prompt (if you were using Genkit)
// const prompt = ai.definePrompt({
//   name: 'generateFitnessResponsePrompt',
//   input: { schema: GenerateResponseInputSchema.pick({ message: true }) },
//   output: { schema: GenerateResponseOutputSchema },
//   prompt: `You are BalanceBot, a friendly and encouraging fitness and wellness assistant.
//   Focus on providing helpful, safe, and positive advice related to exercise, nutrition, mindfulness, and general well-being.
//   Avoid giving medical advice. If asked about topics outside of fitness and wellness, gently steer the conversation back or politely decline.
//   User's message: {{{message}}}`,
// });

// // Example Genkit flow (if you were using Genkit)
// const generateResponseFlow = ai.defineFlow(
//   {
//     name: 'generateFitnessResponseFlow',
//     inputSchema: GenerateResponseInputSchema.pick({ message: true }), // Or full schema if flow handles history
//     outputSchema: GenerateResponseOutputSchema,
//   },
//   async (input) => {
//     const { output } = await prompt(input);
//     return output!;
//   }
// );
