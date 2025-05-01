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
   * URL of an image representing the exercise (optional).
   */
  imageUrl?: string;
  /**
   * URL of a video demonstrating the exercise (optional).
   */
  videoUrl?: string;
  /**
   * AI hint for image generation.
   */
  imageHint?: string;
}

/**
 * Fetches exercises.
 * Uses demo data for now.
 * @returns A promise resolving to an array of Exercise objects.
 */
export async function getExercises(): Promise<Exercise[]> {
  // Demo data with more lifting exercises, images, and video URLs
  const exercises: Exercise[] = [
    // Chest
    {
      name: 'Bench Press (Barbell)',
      description: 'Compound exercise targeting the chest, shoulders, and triceps.',
      muscleGroup: 'Chest',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/benchpress.mp4',
      imageHint: 'barbell bench press',
    },
    {
      name: 'Incline Dumbbell Press',
      description: 'Targets the upper chest muscles.',
      muscleGroup: 'Chest',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/inclinedumbbellpress.mp4',
      imageHint: 'incline dumbbell press',
    },
    {
      name: 'Dumbbell Flyes',
      description: 'Isolation exercise for stretching and contracting the chest.',
      muscleGroup: 'Chest',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/dumbbellflyes.mp4',
      imageHint: 'dumbbell flyes',
    },
    {
      name: 'Push-ups',
      description: 'Bodyweight exercise for chest, shoulders, and triceps.',
      muscleGroup: 'Chest',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/pushups.mp4',
      imageHint: 'push up',
    },
    // Back
    {
      name: 'Pull-ups',
      description: 'Compound bodyweight exercise targeting the back and biceps.',
      muscleGroup: 'Back',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/pullups.mp4',
      imageHint: 'pull up',
    },
    {
      name: 'Bent-Over Rows (Barbell)',
      description: 'Compound exercise for overall back thickness.',
      muscleGroup: 'Back',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/bentoverrows.mp4',
      imageHint: 'barbell row',
    },
    {
      name: 'Lat Pulldowns',
      description: 'Machine exercise targeting the latissimus dorsi.',
      muscleGroup: 'Back',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/latpulldowns.mp4',
      imageHint: 'lat pulldown machine',
    },
    {
      name: 'Seated Cable Rows',
      description: 'Targets the middle back muscles.',
      muscleGroup: 'Back',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/seatedcablerows.mp4',
      imageHint: 'seated cable row',
    },
    // Legs
    {
      name: 'Squats (Barbell)',
      description: 'Fundamental compound exercise for legs and glutes.',
      muscleGroup: 'Legs',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/squats.mp4',
      imageHint: 'barbell squat',
    },
    {
      name: 'Deadlifts (Conventional)',
      description: 'Full-body compound lift emphasizing posterior chain.',
      muscleGroup: 'Legs',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/deadlifts.mp4',
      imageHint: 'deadlift',
    },
    {
      name: 'Leg Press',
      description: 'Machine exercise targeting quads, hamstrings, and glutes.',
      muscleGroup: 'Legs',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/legpress.mp4',
      imageHint: 'leg press machine',
    },
    {
      name: 'Lunges (Dumbbell)',
      description: 'Unilateral exercise for legs and balance.',
      muscleGroup: 'Legs',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/lunges.mp4',
      imageHint: 'dumbbell lunge',
    },
    {
      name: 'Hamstring Curls',
      description: 'Isolation exercise for the hamstrings.',
      muscleGroup: 'Legs',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/hamstringcurls.mp4',
      imageHint: 'hamstring curl machine',
    },
    {
      name: 'Calf Raises',
      description: 'Targets the calf muscles.',
      muscleGroup: 'Legs',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/calfraises.mp4',
      imageHint: 'calf raise',
    },
    // Shoulders
    {
      name: 'Overhead Press (Barbell)',
      description: 'Compound exercise for shoulder strength and size.',
      muscleGroup: 'Shoulders',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/overheadpress.mp4',
      imageHint: 'overhead barbell press',
    },
    {
      name: 'Lateral Raises (Dumbbell)',
      description: 'Isolation exercise for the side deltoids.',
      muscleGroup: 'Shoulders',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/lateralraises.mp4',
      imageHint: 'dumbbell lateral raise',
    },
    {
      name: 'Front Raises (Dumbbell)',
      description: 'Isolation exercise for the front deltoids.',
      muscleGroup: 'Shoulders',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/frontraises.mp4',
      imageHint: 'dumbbell front raise',
    },
    {
      name: 'Face Pulls',
      description: 'Targets rear deltoids and upper back, improves posture.',
      muscleGroup: 'Shoulders',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/facepulls.mp4',
      imageHint: 'cable face pull',
    },
    // Arms (Biceps)
    {
      name: 'Bicep Curls (Barbell)',
      description: 'Classic exercise for building bicep mass.',
      muscleGroup: 'Arms',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/barbellcurls.mp4',
      imageHint: 'barbell bicep curl',
    },
    {
      name: 'Hammer Curls (Dumbbell)',
      description: 'Targets biceps and brachialis for thicker arms.',
      muscleGroup: 'Arms',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/hammercurls.mp4',
      imageHint: 'dumbbell hammer curl',
    },
    {
      name: 'Concentration Curls',
      description: 'Isolation exercise for peaking the biceps.',
      muscleGroup: 'Arms',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/concentrationcurls.mp4',
      imageHint: 'concentration curl',
    },
    // Arms (Triceps)
    {
      name: 'Close-Grip Bench Press',
      description: 'Compound exercise emphasizing the triceps.',
      muscleGroup: 'Arms',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/closegripbench.mp4',
      imageHint: 'close grip bench press',
    },
    {
      name: 'Triceps Pushdowns (Cable)',
      description: 'Isolation exercise for the triceps.',
      muscleGroup: 'Arms',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/tricepspushdowns.mp4',
      imageHint: 'cable triceps pushdown',
    },
    {
      name: 'Overhead Triceps Extension (Dumbbell)',
      description: 'Stretches and targets the long head of the triceps.',
      muscleGroup: 'Arms',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/overheadtricepsext.mp4',
      imageHint: 'dumbbell overhead triceps extension',
    },
    // Core
    {
      name: 'Plank',
      description: 'Core stability exercise.',
      muscleGroup: 'Core',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/plank.mp4',
      imageHint: 'plank hold',
    },
    {
      name: 'Crunches',
      description: 'Targets the upper abdominal muscles.',
      muscleGroup: 'Core',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/crunches.mp4',
      imageHint: 'crunch exercise',
    },
    {
      name: 'Leg Raises',
      description: 'Targets the lower abdominal muscles.',
      muscleGroup: 'Core',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/legraises.mp4',
      imageHint: 'leg raise exercise',
    },
    {
      name: 'Russian Twists',
      description: 'Targets the oblique muscles.',
      muscleGroup: 'Core',
      imageUrl: 'https://picsum.photos/400/300',
      videoUrl: 'https://example.com/russiantwists.mp4',
      imageHint: 'russian twist exercise',
    },
  ];

  return exercises;
}
