'use client';

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
   * URL of a video demonstrating the exercise (optional).
   */
  videoUrl?: string;
}

/**
 * Fetches exercises.
 * @returns A promise resolving to an array of Exercise objects.
 */
export async function getExercises(): Promise<Exercise[]> {
  const exercises: Exercise[] = [
    {
      name: 'Push-ups',
      description: 'A classic exercise for chest and triceps.',
      videoUrl: 'https://example.com/pushups.mp4',
    },
    {
      name: 'Squats',
      description: 'A fundamental exercise for legs and glutes.',
      videoUrl: 'https://example.com/squats.mp4',
    },
    {
      name: 'Bicep Curls',
      description: 'Isolate the biceps for strength and definition.',
      videoUrl: 'https://example.com/bicepcurls.mp4',
    },
    {
      name: 'Plank',
      description: 'Core strengthening exercise that improves stability.',
      videoUrl: 'https://example.com/plank.mp4',
    },
    {
      name: 'Lunges',
      description: 'Great for legs and balance, targets quads and glutes.',
      videoUrl: 'https://example.com/lunges.mp4',
    },
    {
      name: 'Rows',
      description: 'Works the back muscles for better posture and strength.',
      videoUrl: 'https://example.com/rows.mp4',
    },
  ];

  return exercises;
}
