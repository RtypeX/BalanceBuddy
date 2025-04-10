'use client';

import React, {useEffect, useState} from 'react';
import {getExercises, Exercise} from '../services/exercise';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

const ExerciseList: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    const fetchExercises = async () => {
      const data = await getExercises();
      setExercises(data);
    };

    fetchExercises();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Exercise Library</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exercises.map((exercise, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{exercise.name}</CardTitle>
              <CardDescription>
                {exercise.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {exercise.videoUrl && (
                <a href={exercise.videoUrl} target="_blank" rel="noopener noreferrer">
                  Watch Demo
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExerciseList;
