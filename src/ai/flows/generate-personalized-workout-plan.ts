'use server';
/**
 * @fileOverview Generates a personalized workout plan based on user input.
 *
 * - generatePersonalizedWorkoutPlan - A function that generates a personalized workout plan.
 * - PersonalizedWorkoutPlanInput - The input type for the generatePersonalizedWorkoutPlan function.
 * - PersonalizedWorkoutPlanOutput - The return type for the generatePersonalizedWorkoutPlan function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import {Exercise, getExercises} from '@/services/exercise';

const PersonalizedWorkoutPlanInputSchema = z.object({
  fitnessGoals: z
    .string()
    .describe('The user\u0027s fitness goals (e.g., lose weight, build muscle).'),
  experienceLevel: z
    .string()
    .describe('The user\u0027s experience level (beginner, intermediate, advanced).'),
  availableEquipment: z
    .string()
    .describe('The equipment available to the user (e.g., dumbbells, bodyweight only).'),
  workoutDuration: z
    .string()
    .describe('How long should each workout be, in minutes?'),
  workoutFrequency: z
    .string()
    .describe('How many days per week should the user workout?'),
});
export type PersonalizedWorkoutPlanInput = z.infer<
  typeof PersonalizedWorkoutPlanInputSchema
>;

const PersonalizedWorkoutPlanOutputSchema = z.object({
  workoutPlan: z.array(
    z.object({
      day: z.string().describe('The day of the week for the workout.'),
      exercises: z.array(
        z.object({
          name: z.string().describe('The name of the exercise.'),
          sets: z.number().describe('The number of sets for the exercise.'),
          reps: z.number().describe('The number of repetitions for the exercise.'),
        })
      ),
    })
  ),
  notes: z.string().describe('Additional notes or recommendations for the user.'),
});
export type PersonalizedWorkoutPlanOutput = z.infer<
  typeof PersonalizedWorkoutPlanOutputSchema
>;

export async function generatePersonalizedWorkoutPlan(
  input: PersonalizedWorkoutPlanInput
): Promise<PersonalizedWorkoutPlanOutput> {
  return generatePersonalizedWorkoutPlanFlow(input);
}

const generateWorkoutPlanPrompt = ai.definePrompt({
  name: 'generateWorkoutPlanPrompt',
  input: {
    schema: z.object({
      fitnessGoals: z
        .string()
        .describe('The user\u0027s fitness goals (e.g., lose weight, build muscle).'),
      experienceLevel: z
        .string()
        .describe('The user\u0027s experience level (beginner, intermediate, advanced).'),
      availableEquipment: z
        .string()
        .describe('The equipment available to the user (e.g., dumbbells, bodyweight only).'),
      exercises: z.string().describe('A list of exercises to choose from.'),
      workoutDuration: z
        .string()
        .describe('How long should each workout be, in minutes?'),
      workoutFrequency: z
        .string()
        .describe('How many days per week should the user workout?'),
    }),
  },
  output: {
    schema: z.object({
      workoutPlan: z.array(
        z.object({
          day: z.string().describe('The day of the week for the workout.'),
          exercises: z.array(
            z.object({
              name: z.string().describe('The name of the exercise.'),
              sets: z.number().describe('The number of sets for the exercise.'),
              reps: z.number().describe('The number of repetitions for the exercise.'),
            })
          ),
        })
      ),
      notes: z.string().describe('Additional notes or recommendations for the user.'),
    }),
  },
  prompt: `You are a personal trainer who designs workout plans for clients.

  Based on the user's fitness goals, experience level, available equipment, workout duration and frequency, generate a personalized workout plan.

  The workout plan should include a list of exercises for each day of the week, with the number of sets and reps for each exercise. Select exercises from the following list:
  {{exercises}}

  Fitness Goals: {{fitnessGoals}}
  Experience Level: {{experienceLevel}}
  Available Equipment: {{availableEquipment}}
  Workout Duration: {{workoutDuration}}
  Workout Frequency: {{workoutFrequency}}

  Return the workout plan in a JSON format.
  `,
});

const generatePersonalizedWorkoutPlanFlow = ai.defineFlow<
  typeof PersonalizedWorkoutPlanInputSchema,
  typeof PersonalizedWorkoutPlanOutputSchema
>(
  {
    name: 'generatePersonalizedWorkoutPlanFlow',
    inputSchema: PersonalizedWorkoutPlanInputSchema,
    outputSchema: PersonalizedWorkoutPlanOutputSchema,
  },
  async input => {
    const exercises = await getExercises();
    const exerciseNames = exercises.map(exercise => exercise.name).join(', ');
    const {output} = await generateWorkoutPlanPrompt({
      ...input,
      exercises: exerciseNames,
    });
    return output!;
  }
);
