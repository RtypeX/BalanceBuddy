import React from 'react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

const WorkoutBuilder: React.FC = () => {
  const demoWorkouts = [
    {
      name: 'Full Body Blast',
      exercises: ['Squats', 'Push-ups', 'Rows', 'Plank', 'Lunges'],
    },
    {
      name: 'Leg Day',
      exercises: ['Squats', 'Lunges', 'Calf Raises'],
    },
    {
      name: 'Upper Body',
      exercises: ['Push-ups', 'Rows', 'Bicep Curls'],
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Workout Builder</h2>
      <p className="mb-4">This feature allows users to create and save custom workout routines.</p>
      <div>
        {demoWorkouts.map((workout, index) => (
          <Card key={index} className="mb-4">
            <CardHeader>
              <CardTitle>{workout.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {workout.exercises.map((exercise, i) => (
                  <li key={i}>{exercise}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkoutBuilder;
