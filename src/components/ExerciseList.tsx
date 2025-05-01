'use client';

import React, { useEffect, useState } from 'react';
import { getExercises, Exercise } from '../services/exercise';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { Video } from 'lucide-react'; // Import Video icon

const ExerciseList: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const fetchedExercises = await getExercises();
        setExercises(fetchedExercises);
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
        // Optionally set an error state here
      } finally {
        setIsLoading(false);
      }
    };
    fetchExercises();
  }, []);

  if (isLoading) {
    // Optional: Add a skeleton loader here
    return <p>Loading exercises...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Exercise Library</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Increased gap */}
        {exercises.map((exercise, index) => (
          <Card key={index} className="overflow-hidden flex flex-col shadow-lg rounded-lg transition-transform hover:scale-105"> {/* Added shadow, rounded, transition */}
            <CardHeader className="p-4 pb-2"> {/* Adjusted padding */}
              <CardTitle>{exercise.name}</CardTitle>
              <CardDescription className="text-sm">
                {exercise.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex-grow"> {/* Adjusted padding */}
              {exercise.imageUrl && (
                <div className="relative w-full h-48 mb-4 rounded-md overflow-hidden"> {/* Fixed height container */}
                  <Image
                    src={exercise.imageUrl}
                    alt={exercise.name}
                    layout="fill" // Use fill layout
                    objectFit="cover" // Cover the container
                    data-ai-hint={exercise.imageHint || exercise.name.toLowerCase()} // Add AI hint
                    className="transition-opacity duration-300 ease-in-out" // Optional: Add transition
                    // Optional: Add placeholder and blurDataURL for better loading experience
                    // placeholder="blur"
                    // blurDataURL="data:image/png;base64,..." // Generate a low-res placeholder
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">Muscle Group: {exercise.muscleGroup}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0"> {/* Adjusted padding */}
              {exercise.videoUrl && (
                <Button asChild variant="outline" size="sm" className="w-full">
                  <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer">
                    <Video className="mr-2 h-4 w-4" /> Watch Demo
                  </a>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExerciseList;
