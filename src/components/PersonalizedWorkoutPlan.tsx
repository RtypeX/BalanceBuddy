
'use client';

import React, {useState} from 'react';
import {generatePersonalizedWorkoutPlan, PersonalizedWorkoutPlanInput} from '../ai/flows/generate-personalized-workout-plan';
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";
import {Input} from "@/components/ui/input";

const PersonalizedWorkoutPlan: React.FC = () => {
  const [fitnessGoals, setFitnessGoals] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [availableEquipment, setAvailableEquipment] = useState('');
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [workoutFrequency, setWorkoutFrequency] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input: PersonalizedWorkoutPlanInput = {
      fitnessGoals,
      experienceLevel,
      availableEquipment,
      workoutDuration,
      workoutFrequency,
    };

    const plan = await generatePersonalizedWorkoutPlan(input);
    setWorkoutPlan(plan);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Personalized Workout Plan</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fitnessGoals" className="block text-sm font-medium text-gray-700">
            Fitness Goals
          </label>
          <Textarea
            id="fitnessGoals"
            value={fitnessGoals}
            onChange={(e) => setFitnessGoals(e.target.value)}
            placeholder="e.g., lose weight, build muscle"
            required
            className="mt-1 p-2 border rounded-md w-full"
          />
        </div>
        <div>
          <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700">
            Experience Level
          </label>
          <Input
            type="text"
            id="experienceLevel"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            placeholder="e.g., beginner, intermediate, advanced"
            required
            className="mt-1 p-2 border rounded-md w-full"
          />
        </div>
        <div>
          <label htmlFor="availableEquipment" className="block text-sm font-medium text-gray-700">
            Available Equipment
          </label>
          <Textarea
            id="availableEquipment"
            value={availableEquipment}
            onChange={(e) => setAvailableEquipment(e.target.value)}
            placeholder="e.g., dumbbells, bodyweight only"
            required
            className="mt-1 p-2 border rounded-md w-full"
          />
        </div>
        <div>
          <label htmlFor="workoutDuration" className="block text-sm font-medium text-gray-700">
            Workout Duration (minutes)
          </label>
          <Input
            type="number"
            id="workoutDuration"
            value={workoutDuration}
            onChange={(e) => setWorkoutDuration(e.target.value)}
            placeholder="e.g., 30, 45, 60"
            required
            className="mt-1 p-2 border rounded-md w-full"
          />
        </div>
        <div>
          <label htmlFor="workoutFrequency" className="block text-sm font-medium text-gray-700">
            Workout Frequency (days per week)
          </label>
          <Input
            type="number"
            id="workoutFrequency"
            value={workoutFrequency}
            onChange={(e) => setWorkoutFrequency(e.target.value)}
            placeholder="e.g., 3, 4, 5"
            required
            className="mt-1 p-2 border rounded-md w-full"
          />
        </div>
        <Button type="submit">Generate Workout Plan</Button>
      </form>

      {workoutPlan && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Generated Workout Plan:</h3>
          {workoutPlan.workoutPlan.map((dayPlan: any, index: number) => (
            <Card key={index} className="mb-4">
              <CardHeader>
                <CardTitle>{dayPlan.day}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul>
                  {dayPlan.exercises.map((exercise: any, exerciseIndex: number) => (
                    <li key={exerciseIndex} className="mb-2">
                      {exercise.name} - Sets: {exercise.sets}, Reps: {exercise.reps}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
          {workoutPlan.notes && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold">Additional Notes:</h4>
              <p>{workoutPlan.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalizedWorkoutPlan;
