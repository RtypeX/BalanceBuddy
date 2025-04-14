import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

const ProgressTracker: React.FC = () => {
  const demoProgress = [
    {
      date: '2024-07-15',
      workout: 'Full Body Blast',
      duration: '45 minutes',
      calories: '350',
    },
    {
      date: '2024-07-16',
      workout: 'Leg Day',
      duration: '30 minutes',
      calories: '280',
    },
    {
      date: '2024-07-17',
      workout: 'Upper Body',
      duration: '40 minutes',
      calories: '320',
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Progress Tracking</h2>
      <p className="mb-4">This feature tracks workout history, including exercises, sets, reps, and weight used.</p>
      <div>
        {demoProgress.map((progress, index) => (
          <Card key={index} className="mb-4">
            <CardHeader>
              <CardTitle>{progress.date}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Workout: {progress.workout}</p>
              <p>Duration: {progress.duration}</p>
              <p>Calories Burned: {progress.calories}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProgressTracker;
