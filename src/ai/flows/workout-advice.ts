'use server';

/**
 * @fileOverview Workout advice AI agent.
 *
 * - getWorkoutAdvice - A function that provides workout advice.
 * - WorkoutAdviceInput - The input type for the getWorkoutAdvice function.
 * - WorkoutAdviceOutput - The return type for the getWorkoutAdvice function.
 */

import {generate} from '@/ai/ai-instance';
import {z} from 'zod';

const WorkoutAdviceInputSchema = z.object({
  query: z.string().describe('The user\u0027s query about workouts.'),
});
export type WorkoutAdviceInput = z.infer<typeof WorkoutAdviceInputSchema>;

const WorkoutAdviceOutputSchema = z.object({
  advice: z.string().describe('The workout advice based on the query.'),
});
export type WorkoutAdviceOutput = z.infer<typeof WorkoutAdviceOutputSchema>;

const PROMPT_PREFIX = `You are a helpful workout assistant using gemini ai.

The user will ask a question about working out, and you will provide helpful advice.`;

export async function getWorkoutAdvice(
  input: WorkoutAdviceInput
): Promise<WorkoutAdviceOutput> {
  try {
    const prompt = `${PROMPT_PREFIX}\n\nQuery: ${input.query}`;
    const advice = await generate(prompt);
    if (advice) {
      return {advice};
    } else {
      console.error('Workout advice flow: No advice received from prompt.');
      return {
        advice:
          'Sorry, I could not generate workout advice at this time. Please try again.',
      };
    }
  } catch (error: any) {
    console.error('Workout advice flow failed:', error);
    return {
      advice:
        'An error occurred while generating workout advice. Please try again later.',
    };
  }
}
