'use client';

import { collection, getDocs, doc, DocumentData } from 'firebase/firestore';
import { getFirebase } from "@/lib/firebaseClient"; // Ensure this path is correct

/**
 * Represents an exercise.
 */
export interface Exercise {
  /**
   * The name of the exercise.
   */
  name: string;
  /**
   * A description of the exercise.
   */
  description: string;
  /**
   * The muscle group targeted by the exercise.
   */
  muscleGroup: string;
  /**
   * URL of a video demonstrating the exercise (optional).
   */
  videoUrl?: string;
}

/**
 * Fetches exercises.
 * Uses demo data for now.
 * @returns A promise resolving to an array of Exercise objects.
 */
export async function getExercises(): Promise<Exercise[]> {
  // Demo data with more lifting exercises
  const exercises: Exercise[] = [
    // Chest
    {
      name: 'Bench Press (Barbell)',
      description: 'Compound exercise targeting the chest, shoulders, and triceps.',
      muscleGroup: 'Chest',
      videoUrl: 'https://example.com/benchpress.mp4',
    },
    {
      name: 'Incline Dumbbell Press',
      description: 'Targets the upper chest muscles.',
      muscleGroup: 'Chest',
      videoUrl: 'https://example.com/inclinedumbbellpress.mp4',
    },
    {
      name: 'Dumbbell Flyes',
      description: 'Isolation exercise for stretching and contracting the chest.',
      muscleGroup: 'Chest',
      videoUrl: 'https://example.com/dumbbellflyes.mp4',
    },
    {
      name: 'Push-ups',
      description: 'Bodyweight exercise for chest, shoulders, and triceps.',
      muscleGroup: 'Chest',
      videoUrl: 'https://example.com/pushups.mp4',
    },
    // Back
    {
      name: 'Pull-ups',
      description: 'Compound bodyweight exercise targeting the back and biceps.',
      muscleGroup: 'Back',
      videoUrl: 'https://example.com/pullups.mp4',
    },
    {
      name: 'Bent-Over Rows (Barbell)',
      description: 'Compound exercise for overall back thickness.',
      muscleGroup: 'Back',
      videoUrl: 'https://example.com/bentoverrows.mp4',
    },
    {
      name: 'Lat Pulldowns',
      description: 'Machine exercise targeting the latissimus dorsi.',
      muscleGroup: 'Back',
      videoUrl: 'https://example.com/latpulldowns.mp4',
    },
    {
      name: 'Seated Cable Rows',
      description: 'Targets the middle back muscles.',
      muscleGroup: 'Back',
      videoUrl: 'https://example.com/seatedcablerows.mp4',
    },
    // Legs
    {
      name: 'Squats (Barbell)',
      description: 'Fundamental compound exercise for legs and glutes.',
      muscleGroup: 'Legs',
      videoUrl: 'https://example.com/squats.mp4',
    },
    {
      name: 'Deadlifts (Conventional)',
      description: 'Full-body compound lift emphasizing posterior chain.',
      muscleGroup: 'Legs',
      videoUrl: 'https://example.com/deadlifts.mp4',
    },
    {
      name: 'Leg Press',
      description: 'Machine exercise targeting quads, hamstrings, and glutes.',
      muscleGroup: 'Legs',
      videoUrl: 'https://example.com/legpress.mp4',
    },
    {
      name: 'Lunges (Dumbbell)',
      description: 'Unilateral exercise for legs and balance.',
      muscleGroup: 'Legs',
      videoUrl: 'https://example.com/lunges.mp4',
    },
    {
      name: 'Hamstring Curls',
      description: 'Isolation exercise for the hamstrings.',
      muscleGroup: 'Legs',
      videoUrl: 'https://example.com/hamstringcurls.mp4',
    },
    {
      name: 'Calf Raises',
      description: 'Targets the calf muscles.',
      muscleGroup: 'Legs',
      videoUrl: 'https://example.com/calfraises.mp4',
    },
    // Shoulders
    {
      name: 'Overhead Press (Barbell)',
      description: 'Compound exercise for shoulder strength and size.',
      muscleGroup: 'Shoulders',
      videoUrl: 'https://example.com/overheadpress.mp4',
    },
    {
      name: 'Lateral Raises (Dumbbell)',
      description: 'Isolation exercise for the side deltoids.',
      muscleGroup: 'Shoulders',
      videoUrl: 'https://example.com/lateralraises.mp4',
    },
    {
      name: 'Front Raises (Dumbbell)',
      description: 'Isolation exercise for the front deltoids.',
      muscleGroup: 'Shoulders',
      videoUrl: 'https://example.com/frontraises.mp4',
    },
    {
      name: 'Face Pulls',
      description: 'Targets rear deltoids and upper back, improves posture.',
      muscleGroup: 'Shoulders',
      videoUrl: 'https://example.com/facepulls.mp4',
    },
    // Arms (Biceps)
    {
      name: 'Bicep Curls (Barbell)',
      description: 'Classic exercise for building bicep mass.',
      muscleGroup: 'Arms',
      videoUrl: 'https://example.com/barbellcurls.mp4',
    },
    {
      name: 'Hammer Curls (Dumbbell)',
      description: 'Targets biceps and brachialis for thicker arms.',
      muscleGroup: 'Arms',
      videoUrl: 'https://example.com/hammercurls.mp4',
    },
    {
      name: 'Concentration Curls',
      description: 'Isolation exercise for peaking the biceps.',
      muscleGroup: 'Arms',
      videoUrl: 'https://example.com/concentrationcurls.mp4',
    },
    // Arms (Triceps)
    {
      name: 'Close-Grip Bench Press',
      description: 'Compound exercise emphasizing the triceps.',
      muscleGroup: 'Arms',
      videoUrl: 'https://example.com/closegripbench.mp4',
    },
    {
      name: 'Triceps Pushdowns (Cable)',
      description: 'Isolation exercise for the triceps.',
      muscleGroup: 'Arms',
      videoUrl: 'https://example.com/tricepspushdowns.mp4',
    },
    {
      name: 'Overhead Triceps Extension (Dumbbell)',
      description: 'Stretches and targets the long head of the triceps.',
      muscleGroup: 'Arms',
      videoUrl: 'https://example.com/overheadtricepsext.mp4',
    },
    // Core
    {
      name: 'Plank',
      description: 'Core stability exercise.',
      muscleGroup: 'Core',
      videoUrl: 'https://example.com/plank.mp4',
    },
    {
      name: 'Crunches',
      description: 'Targets the upper abdominal muscles.',
      muscleGroup: 'Core',
      videoUrl: 'https://example.com/crunches.mp4',
    },
    {
      name: 'Leg Raises',
      description: 'Targets the lower abdominal muscles.',
      muscleGroup: 'Core',
      videoUrl: 'https://example.com/legraises.mp4',
    },
    {
      name: 'Russian Twists',
      description: 'Targets the oblique muscles.',
      muscleGroup: 'Core',
      videoUrl: 'https://example.com/russiantwists.mp4',
    },
  ];

  return exercises; // Return updated demo data
}
