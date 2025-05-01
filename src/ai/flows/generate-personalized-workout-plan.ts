'use server';
/**
 * @fileOverview Generates a personalized workout plan based on user input using Gemini.
 *
 * - generatePersonalizedWorkoutPlan - A function that generates a personalized workout plan.
 * - PersonalizedWorkoutPlanInput - The input type for the generatePersonalizedWorkoutPlan function.
 * - PersonalizedWorkoutPlanOutput - The return type for the generatePersonalizedWorkoutPlan function.
 */

import { getGeminiModel } from '@/ai/ai-instance';
import { z } from 'zod'; // Use zod directly for schema definition
import { Exercise, getExercises } from '@/services/exercise';

// Define input schema using Zod
export const PersonalizedWorkoutPlanInputSchema = z.object({
  fitnessGoals: z
    .string()
    .min(3, "Please describe your fitness goals.")
    .describe('The user\u0027s fitness goals (e.g., lose weight, build muscle).'),
  experienceLevel: z
    .enum(['Beginner', 'Intermediate', 'Advanced'])
    .describe('The user\u0027s experience level.'),
  availableEquipment: z
    .string()
    .min(3, "Please list available equipment.")
    .describe('The equipment available to the user (e.g., dumbbells, bodyweight only).'),
  workoutDuration: z
    .number()
    .int()
    .positive("Duration must be positive.")
    .min(15, "Workout must be at least 15 minutes.")
    .max(120, "Workout cannot exceed 120 minutes.")
    .describe('How long should each workout be, in minutes?'),
  workoutFrequency: z
    .number()
    .int()
    .positive("Frequency must be positive.")
    .min(1, "Must work out at least 1 day a week.")
    .max(7, "Cannot work out more than 7 days a week.")
    .describe('How many days per week should the user workout?'),
});
export type PersonalizedWorkoutPlanInput = z.infer<typeof PersonalizedWorkoutPlanInputSchema>;

// Define output structure (consider if AI should output JSON or formatted text)
// Option 1: Expecting structured JSON from AI (more robust)
export const PersonalizedWorkoutPlanOutputSchema = z.object({
  workoutPlan: z.array(
    z.object({
      day: z.string().describe('The day of the week or workout number (e.g., "Day 1", "Monday").'),
      focus: z.string().optional().describe('Optional focus for the day (e.g., "Upper Body", "Legs & Core").'),
      exercises: z.array(
        z.object({
          name: z.string().describe('The name of the exercise.'),
          sets: z.number().int().positive().describe('The number of sets.'),
          reps: z.string().describe('The number of repetitions (e.g., "8-12", "15", "AMRAP").'), // Use string for flexibility
          // rest: z.string().optional().describe('Optional rest time between sets (e.g., "60s", "90s").')
        })
      ).min(1, "Each workout day must have at least one exercise."),
    })
  ).min(1, "Workout plan must have at least one day."),
  notes: z.string().optional().describe('Additional notes, warm-up/cool-down suggestions, or recommendations.'),
});
export type PersonalizedWorkoutPlanOutput = z.infer<typeof PersonalizedWorkoutPlanOutputSchema>;

// Option 2: Expecting formatted text (simpler for AI, requires UI parsing)
// export interface PersonalizedWorkoutPlanOutput {
//   planText: string;
// }


/**
 * Generates a personalized workout plan using the Gemini model.
 * @param input - The user's preferences for the workout plan.
 * @returns A promise resolving to the generated workout plan (structure TBD).
 */
export async function generatePersonalizedWorkoutPlan(
  input: PersonalizedWorkoutPlanInput
): Promise<PersonalizedWorkoutPlanOutput | { error: string }> { // Return error object on failure
  // Validate input using Zod
  const validationResult = PersonalizedWorkoutPlanInputSchema.safeParse(input);
  if (!validationResult.success) {
    console.error("Invalid input for workout plan generation:", validationResult.error.errors);
    // Combine error messages for user feedback
    const errorMessages = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
    return { error: `Invalid input:\n${errorMessages}` };
  }

  const validIinput = validationResult.data;


  try {
    const exercises = await getExercises();
    // Filter exercises slightly based on equipment if possible (simple check)
    const relevantExercises = exercises.filter(ex =>
        validIinput.availableEquipment.toLowerCase().includes('bodyweight') ||
        validIinput.availableEquipment.toLowerCase().includes(ex.muscleGroup.toLowerCase()) || // Basic keyword match
         validIinput.availableEquipment.toLowerCase().includes('gym') || // Assume full gym access
        ex.name.toLowerCase().includes('dumbbell') && validIinput.availableEquipment.toLowerCase().includes('dumbbell') ||
        ex.name.toLowerCase().includes('barbell') && validIinput.availableEquipment.toLowerCase().includes('barbell')
    );
    const exerciseListText = relevantExercises.map(ex => `- ${ex.name} (${ex.muscleGroup})`).join('\n');

    const model = getGeminiModel();

    // Construct the prompt for the AI
    const prompt = `
      You are an expert personal trainer creating a weekly workout plan.
      Generate a personalized workout plan based on the following user details.
      Structure the output as a JSON object matching this schema:
      ${JSON.stringify(PersonalizedWorkoutPlanOutputSchema.shape)}

      User Details:
      - Fitness Goals: ${validIinput.fitnessGoals}
      - Experience Level: ${validIinput.experienceLevel}
      - Available Equipment: ${validIinput.availableEquipment}
      - Desired Workout Duration (per session): ${validIinput.workoutDuration} minutes
      - Workout Frequency: ${validIinput.workoutFrequency} days per week

      Available Exercises to choose from (prioritize these):
      ${exerciseListText}

      Instructions for Plan:
      - Create a plan for ${validIinput.workoutFrequency} distinct workout days. Label them clearly (e.g., "Day 1", "Day 2" or specific days like "Monday").
      - Assign exercises appropriate for the user's experience level and available equipment.
      - For each exercise, specify the number of sets and a suitable rep range (e.g., "8-12", "15") or duration (e.g., "30s", "5 min").
      - Ensure the total workout time for each day is roughly around ${validIinput.workoutDuration} minutes, considering sets, reps, and typical rest periods (assume 60-90 seconds rest).
      - Include brief general notes, like suggesting a warm-up and cool-down.
      - Output ONLY the JSON object. Do not include any introductory text or markdown formatting like \`\`\`json.

      JSON Output:
    `;

    // console.log("Sending prompt to Gemini:", prompt); // For debugging

    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    // console.log("Received response text from Gemini:", responseText); // For debugging

    if (!responseText) {
      console.warn("Received empty response for workout plan generation:", response);
       if (response?.promptFeedback?.blockReason) {
         console.error("Response blocked due to:", response.promptFeedback.blockReason);
         return { error: "Workout plan generation failed due to safety guidelines. Please adjust your goals or equipment description." };
      }
      return { error: "The AI failed to generate a workout plan. Please try again." };
    }

     // Attempt to parse the JSON response
    try {
        // Clean potential markdown backticks if AI includes them
        const cleanedJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
        const parsedPlan = JSON.parse(cleanedJson);

        // Validate the parsed plan against the Zod schema
        const validation = PersonalizedWorkoutPlanOutputSchema.safeParse(parsedPlan);
        if (!validation.success) {
            console.error("Generated plan failed Zod validation:", validation.error.errors);
            // Try to provide specific feedback, otherwise generic error
             const errorDetails = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
            return { error: `The generated plan structure was invalid (${errorDetails}). Please try again.` };
        }

        console.log("Successfully generated and validated workout plan.");
        return validation.data; // Return the validated data

    } catch (parseError) {
        console.error("Failed to parse generated workout plan JSON:", parseError, "\nRaw Response Text:", responseText);
        // Fallback or error message
        return { error: "Failed to parse the generated workout plan structure. The AI might have provided an invalid format." };
    }

  } catch (error: any) {
    console.error("Error generating personalized workout plan:", error);
     if (error.message.includes('API key not valid')) {
        return { error: "API configuration error. Please contact support." };
    }
    return { error: "An unexpected error occurred while generating the workout plan." };
  }
}
