import { collection, getDocs, doc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

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
 * Fetches exercises from Firestore.
 * @returns A promise resolving to an array of Exercise objects.
 */
export async function getExercises(): Promise<Exercise[]> {
  const exercisesCollection = collection(db, 'exercises');
  const exercisesSnapshot = await getDocs(exercisesCollection);

  const exercises: Exercise[] = exercisesSnapshot.docs.map(doc => {
    const data = doc.data() as DocumentData;
    return {
      name: data.name,
      description: data.description,
      videoUrl: data.videoUrl,
    } as Exercise;
  });

  return exercises;
}
