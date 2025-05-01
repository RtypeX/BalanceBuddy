'use client';

import { collection, getDocs, doc, DocumentData } from 'firebase/firestore';
import { getFirebase } from '@/lib/firebaseClient'; // Correct import path

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
 * Uses demo data for now.
 * @returns A promise resolving to an array of Exercise objects.
 */
export async function getExercises(): Promise<Exercise[]> {
  // Demo data - replace with actual Firestore fetch if needed later
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

  // If you want to fetch from Firestore, uncomment and adapt this:
  /*
  const firebase = getFirebase();
  if (!firebase || !firebase.db) {
      console.error("Firestore not initialized");
      return exercises; // Return demo data if Firestore isn't ready
  }
  const { db } = firebase; // Get the firestore instance

  try {
    const querySnapshot = await getDocs(collection(db, "exercises"));
    const fetchedExercises: Exercise[] = querySnapshot.docs.map(doc => doc.data() as Exercise);
    return fetchedExercises.length > 0 ? fetchedExercises : exercises; // Return fetched or demo data
  } catch (error) {
    console.error("Error fetching exercises from Firestore:", error);
    return exercises; // Return demo data on error
  }
  */

  return exercises; // Return demo data
}
