'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getExercises, Exercise } from '../services/exercise';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Removed Image import
import { BookOpen } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose // Import DialogClose
} from "@/components/ui/dialog";
import { ScrollArea } from './ui/scroll-area'; // Import ScrollArea


const ExerciseList: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('All'); // State for filter

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

  // Get unique muscle groups for the filter dropdown
  const muscleGroups = useMemo(() => {
    const groups = new Set(exercises.map(ex => ex.muscleGroup));
    return ['All', ...Array.from(groups).sort()]; // Sort muscle groups alphabetically
  }, [exercises]);

  // Filter exercises based on the selected muscle group
  const filteredExercises = useMemo(() => {
    if (selectedMuscleGroup === 'All') {
      return exercises;
    }
    return exercises.filter(ex => ex.muscleGroup === selectedMuscleGroup);
  }, [exercises, selectedMuscleGroup]);

  if (isLoading) {
    // Optional: Add a skeleton loader here
    return <p>Loading exercises...</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6"> {/* Increased margin-bottom */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Increased gap */}
            {filteredExercises.map((exercise, index) => (
            <Card key={index} className="overflow-hidden flex flex-col shadow-lg rounded-lg transition-transform hover:scale-105"> {/* Added shadow, rounded, transition */}
                <CardHeader className="p-4 pb-2"> {/* Adjusted padding */}
                <CardTitle>{exercise.name}</CardTitle>
                <CardDescription className="text-sm">
                    {exercise.description}
                </CardDescription>
                </CardHeader>
                <CardContent className="p-4 flex-grow"> {/* Adjusted padding */}
                {/* Image component removed */}
                <p className="text-xs text-muted-foreground">Muscle Group: {exercise.muscleGroup}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-center"> {/* Centered the footer content */}
                {exercise.tutorial ? (
                    <Dialog>
                       <DialogTrigger asChild>
                           <Button variant="outline" size="sm" className="w-full max-w-xs"> {/* Centered button */}
                               <BookOpen className="mr-2 h-4 w-4 inline" /> View Tutorial
                           </Button>
                       </DialogTrigger>
                       <DialogContent className="sm:max-w-[425px]">
                           <DialogHeader>
                               <DialogTitle>{exercise.name} Tutorial</DialogTitle>
                               <DialogDescription>
                                   Follow these steps to perform the exercise correctly.
                               </DialogDescription>
                           </DialogHeader>
                            {/* Make tutorial content scrollable */}
                           <ScrollArea className="max-h-[60vh] w-full rounded-md border p-4 my-4">
                                <pre className="whitespace-pre-wrap text-sm font-sans">
                                    {exercise.tutorial}
                                </pre>
                           </ScrollArea>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                Close
                                </Button>
                           </DialogClose>
                       </DialogContent>
                    </Dialog>
                ) : (
                    <p className="text-xs text-muted-foreground">No tutorial available</p>
                )}
                </CardFooter>
            </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default ExerciseList;

    