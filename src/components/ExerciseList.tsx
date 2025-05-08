'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getExercises, Exercise } from '../services/exercise';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  // DialogTrigger, // No longer directly using DialogTrigger to open, will control via state
  DialogClose
} from "@/components/ui/dialog";
import { ScrollArea } from './ui/scroll-area';
import { usePathname } from 'next/navigation'; // Import usePathname

const ExerciseList: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('All');
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
  const [currentTutorial, setCurrentTutorial] = useState<{ name: string; content: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const fetchedExercises = await getExercises();
        setExercises(fetchedExercises);
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExercises();
  }, []);

  // Effect to close tutorial modal on route change
  useEffect(() => {
    if (isTutorialModalOpen) {
      setIsTutorialModalOpen(false);
      setCurrentTutorial(null); // Also clear current tutorial content
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Only run when pathname changes

  const muscleGroups = useMemo(() => {
    const groups = new Set(exercises.map(ex => ex.muscleGroup));
    return ['All', ...Array.from(groups).sort()];
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    if (selectedMuscleGroup === 'All') {
      return exercises;
    }
    return exercises.filter(ex => ex.muscleGroup === selectedMuscleGroup);
  }, [exercises, selectedMuscleGroup]);

  const openTutorial = (exercise: Exercise) => {
    if (exercise.tutorial) {
      setCurrentTutorial({ name: exercise.name, content: exercise.tutorial });
      setIsTutorialModalOpen(true);
    }
  };

  if (isLoading) {
    return <p>Loading exercises...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Exercise Library</h2>
        <div className="flex items-center space-x-2">
          <Label htmlFor="muscleGroupFilter" className="text-sm font-medium">Filter by Muscle:</Label>
          <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
            <SelectTrigger id="muscleGroupFilter" className="w-[180px]">
              <SelectValue placeholder="Select Muscle Group" />
            </SelectTrigger>
            <SelectContent>
              {muscleGroups.map(group => (
                <SelectItem key={group} value={group}>{group}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredExercises.length === 0 && !isLoading ? (
        <p className="text-center text-muted-foreground mt-8">No exercises found for this muscle group.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.name} className="overflow-hidden flex flex-col shadow-lg rounded-lg transition-transform hover:scale-105">
              <CardHeader className="p-4 pb-2">
                <CardTitle>{exercise.name}</CardTitle>
                <CardDescription className="text-sm">
                  {exercise.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <p className="text-xs text-muted-foreground mb-2">Muscle Group: {exercise.muscleGroup}</p>
                {exercise.tutorial ? (
                  <Button
                    variant="link"
                    className="text-sm text-primary hover:underline inline-flex items-center p-0 h-auto"
                    onClick={() => openTutorial(exercise)}
                  >
                    <BookOpen className="mr-1 h-4 w-4 inline" /> View Tutorial
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">No tutorial available</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {currentTutorial && (
        <Dialog open={isTutorialModalOpen} onOpenChange={(open) => {
          setIsTutorialModalOpen(open);
          if (!open) {
            setCurrentTutorial(null);
          }
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{currentTutorial.name} Tutorial</DialogTitle>
              <DialogDescription>
                Follow these steps to perform the exercise correctly.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] w-full rounded-md border p-4 my-4">
              <pre className="whitespace-pre-wrap text-sm font-sans">
                {currentTutorial.content}
              </pre>
            </ScrollArea>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ExerciseList;
