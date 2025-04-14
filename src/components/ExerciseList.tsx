'use client';

import React, {useEffect, useState} from 'react';
import {getExercises, Exercise} from '../services/exercise';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

const ExerciseList: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([
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
  ]);

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
