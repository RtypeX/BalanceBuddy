'use server';

/**
 * @fileOverview Workout advice AI agent.
 *
 * - getWorkoutAdvice - A function that provides workout advice.
 * - WorkoutAdviceInput - The input type for the getWorkoutAdvice function.
 * - WorkoutAdviceOutput - The return type for the getWorkoutAdvice function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const WorkoutAdviceInputSchema = z.object({
  query: z.string().describe('The user\u0027s query about workouts.'),
});
export type WorkoutAdviceInput = z.infer<typeof WorkoutAdviceInputSchema>;

const WorkoutAdviceOutputSchema = z.object({
  advice: z.string().describe('The workout advice based on the query.'),
});
export type WorkoutAdviceOutput = z.infer<typeof WorkoutAdviceOutputSchema>;

export async function getWorkoutAdvice(
  input: WorkoutAdviceInput
): Promise<WorkoutAdviceOutput> {
  return workoutAdviceFlow(input);
}

const workoutAdvicePrompt = ai.definePrompt({
  name: 'workoutAdvicePrompt',
  input: {
    schema: z.object({
      query: z
        .string()
        .describe('The user\u0027s query about workouts.'),
    }),
  },
  output: {
    schema: z.object({
      advice: z.string().describe('The workout advice based on the query.'),
    }),
  },
  prompt: `You are a helpful workout assistant.

  The user will ask a question about working out, and you will provide helpful advice.

  Query: {{query}}
  `,
  model: 'models/gemini-1.0-pro', // Define the model here
});

const workoutAdviceFlow = ai.defineFlow<
  typeof WorkoutAdviceInputSchema,
  typeof WorkoutAdviceOutputSchema
>(
  {
    name: 'workoutAdviceFlow',
    inputSchema: WorkoutAdviceInputSchema,
    outputSchema: WorkoutAdviceOutputSchema,
  },
  async input => {
    const {output} = await workoutAdvicePrompt(input);
    return output!;
  }
);
