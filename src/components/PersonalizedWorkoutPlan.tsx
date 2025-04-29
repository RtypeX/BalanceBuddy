'use client';

import React, {useState} from 'react';
import {generatePersonalizedWorkoutPlan, PersonalizedWorkoutPlanInput} from '../ai/flows/generate-personalized-workout-plan';
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

const PersonalizedWorkoutPlan: React.FC = () => {
  const [fitnessGoals, setFitnessGoals] = useState('Build muscle');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [availableEquipment, setAvailableEquipment] = useState('Dumbbells, barbell, bench');
  const [workoutDuration, setWorkoutDuration] = useState('60');
  const [workoutFrequency, setWorkoutFrequency] = useState('3');
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
          <Label htmlFor="fitnessGoals">
            Fitness Goals
          </Label>
          <Textarea
            id="fitnessGoals"
            value={fitnessGoals}
            onChange={(e) => setFitnessGoals(e.target.value)}
            placeholder="e.g., lose weight, build muscle"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="experienceLevel">
            Experience Level
          </Label>
          <Input
            type="text"
            id="experienceLevel"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            placeholder="e.g., beginner, intermediate, advanced"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="availableEquipment">
            Available Equipment
          </Label>
          <Textarea
            id="availableEquipment"
            value={availableEquipment}
            onChange={(e) => setAvailableEquipment(e.target.value)}
            placeholder="e.g., dumbbells, bodyweight only"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="workoutDuration">
            Workout Duration (minutes)
          </Label>
          <Input
            type="number"
            id="workoutDuration"
            value={workoutDuration}
            onChange={(e) => setWorkoutDuration(e.target.value)}
            placeholder="e.g., 30, 45, 60"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="workoutFrequency">
            Workout Frequency (days per week)
          </Label>
          <Input
            type="number"
            id="workoutFrequency"
            value={workoutFrequency}
            onChange={(e) => setWorkoutFrequency(e.target.value)}
            placeholder="e.g., 3, 4, 5"
            required
            className="mt-1"
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
