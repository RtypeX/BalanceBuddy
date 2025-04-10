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
 * Asynchronously retrieves a list of exercises.
 * @returns A promise that resolves to an array of Exercise objects.
 */
export async function getExercises(): Promise<Exercise[]> {
  // TODO: Implement this by calling an API.

  return [
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
  ];
}
