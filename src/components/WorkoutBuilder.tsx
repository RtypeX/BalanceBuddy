
'use client';

import React, { useState, useEffect } from 'react';
import { Exercise, getExercises } from '@/services/exercise';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Trash2, PlusCircle, Save } from 'lucide-react';

interface RoutineExercise extends Exercise {
  sets: number;
  reps: string; // Use string to allow ranges like "8-12" or time like "30s"
}

interface SavedRoutine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
}

const WorkoutBuilder: React.FC = () => {
  const { toast } = useToast();
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [currentRoutine, setCurrentRoutine] = useState<RoutineExercise[]>([]);
  const [selectedExerciseName, setSelectedExerciseName] = useState<string>('');
  const [sets, setSets] = useState<string>('3');
  const [reps, setReps] = useState<string>('10');
  const [routineName, setRoutineName] = useState<string>('');
  const [savedRoutines, setSavedRoutines] = useState<SavedRoutine[]>([]);
  const [selectedSavedRoutineId, setSelectedSavedRoutineId] = useState<string>('');

  // Load exercises and saved routines on mount
  useEffect(() => {
    const fetchExercises = async () => {
      const exercises = await getExercises();
      setAllExercises(exercises);
      if (exercises.length > 0) {
        setSelectedExerciseName(exercises[0].name); // Default selection
      }
    };
    fetchExercises();

    const storedRoutines = localStorage.getItem('savedWorkouts');
    if (storedRoutines) {
      try {
        setSavedRoutines(JSON.parse(storedRoutines));
      } catch (error) {
        console.error("Failed to parse saved routines from localStorage", error);
        localStorage.removeItem('savedWorkouts'); // Clear corrupted data
      }
    }
  }, []);

  // Save routines to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedWorkouts', JSON.stringify(savedRoutines));
  }, [savedRoutines]);

  const handleAddExercise = () => {
    if (!selectedExerciseName) {
      toast({ variant: "destructive", title: "Error", description: "Please select an exercise." });
      return;
    }
    const exerciseToAdd = allExercises.find(ex => ex.name === selectedExerciseName);
    const setsNum = parseInt(sets, 10);

    if (!exerciseToAdd || isNaN(setsNum) || setsNum <= 0 || !reps.trim()) {
      toast({ variant: "destructive", title: "Invalid Input", description: "Please ensure sets, reps, and exercise selection are valid." });
      return;
    }

    // Check if exercise is already in the routine
    if (currentRoutine.some(ex => ex.name === exerciseToAdd.name)) {
        toast({ variant: "destructive", title: "Duplicate Exercise", description: `${exerciseToAdd.name} is already in the routine.` });
        return;
    }


    setCurrentRoutine(prev => [...prev, { ...exerciseToAdd, sets: setsNum, reps: reps }]);
    // Reset inputs for next addition
    setSets('3');
    setReps('10');
    if (allExercises.length > 0) {
      setSelectedExerciseName(allExercises[0].name);
    } else {
       setSelectedExerciseName('');
    }

    toast({ title: "Exercise Added", description: `${exerciseToAdd.name} added to the routine.` });
  };

  const handleRemoveExercise = (index: number) => {
    const exerciseName = currentRoutine[index]?.name || 'Exercise';
    setCurrentRoutine(prev => prev.filter((_, i) => i !== index));
    toast({ title: "Exercise Removed", description: `${exerciseName} removed from the routine.` });
  };

  const handleUpdateExercise = (index: number, field: keyof RoutineExercise, value: string | number) => {
     setCurrentRoutine(prev => prev.map((ex, i) => {
       if (i === index) {
         // Validate numeric fields
         if ((field === 'sets') && (typeof value === 'string')) {
             const numValue = parseInt(value, 10);
             if (isNaN(numValue) || numValue <= 0) {
                 toast({ variant: "destructive", title: "Invalid Sets", description: "Sets must be a positive number." });
                 return ex; // Return original if invalid
             }
             return { ...ex, [field]: numValue };
         }
         if (field === 'reps' && typeof value === 'string' && !value.trim()){
             toast({ variant: "destructive", title: "Invalid Reps", description: "Reps cannot be empty." });
             return ex; // Return original if invalid
         }
         return { ...ex, [field]: value };
       }
       return ex;
     }));
   };

  const handleSaveRoutine = () => {
    if (!routineName.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a name for the routine." });
      return;
    }
    if (currentRoutine.length === 0) {
      toast({ variant: "destructive", title: "Error", description: "Cannot save an empty routine." });
      return;
    }

    const newRoutine: SavedRoutine = {
      id: crypto.randomUUID(),
      name: routineName,
      exercises: [...currentRoutine], // Clone the array
    };

    setSavedRoutines(prev => [...prev, newRoutine]);
    setRoutineName(''); // Clear name input
    setCurrentRoutine([]); // Optionally clear the current routine after saving
    toast({ title: "Routine Saved", description: `"${newRoutine.name}" saved successfully.` });
  };

  const handleLoadRoutine = () => {
    if (!selectedSavedRoutineId) {
        toast({ variant: "destructive", title: "Error", description: "Please select a routine to load." });
        return;
    }
    const routineToLoad = savedRoutines.find(r => r.id === selectedSavedRoutineId);
    if (routineToLoad) {
      setCurrentRoutine([...routineToLoad.exercises]); // Load exercises
      setRoutineName(routineToLoad.name); // Pre-fill name if user wants to resave
      toast({ title: "Routine Loaded", description: `"${routineToLoad.name}" loaded.` });
    } else {
         toast({ variant: "destructive", title: "Error", description: "Could not find the selected routine." });
    }
  };

   const handleDeleteRoutine = () => {
    if (!selectedSavedRoutineId) {
      toast({ variant: "destructive", title: "Error", description: "Please select a routine to delete." });
      return;
    }
    const routineToDelete = savedRoutines.find(r => r.id === selectedSavedRoutineId);
    if (routineToDelete) {
        setSavedRoutines(prev => prev.filter(r => r.id !== selectedSavedRoutineId));
        setSelectedSavedRoutineId(''); // Clear selection
        toast({ title: "Routine Deleted", description: `"${routineToDelete.name}" deleted.` });
    } else {
        toast({ variant: "destructive", title: "Error", description: "Could not find the selected routine to delete." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Exercise Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Exercise</CardTitle>
          <CardDescription>Select an exercise and specify sets/reps.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exerciseSelect">Exercise</Label>
            <Select value={selectedExerciseName} onValueChange={setSelectedExerciseName}>
              <SelectTrigger id="exerciseSelect">
                <SelectValue placeholder="Select an exercise" />
              </SelectTrigger>
              <SelectContent>
                {allExercises.length > 0 ? (
                  allExercises.map((ex) => (
                    <SelectItem key={ex.name} value={ex.name}>{ex.name}</SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled>Loading exercises...</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sets">Sets</Label>
              <Input
                id="sets"
                type="number"
                min="1"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                placeholder="e.g., 3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reps">Reps / Duration</Label>
              <Input
                id="reps"
                type="text"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="e.g., 10 or 30s"
              />
            </div>
          </div>
          <Button onClick={handleAddExercise} className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Add to Routine
          </Button>
        </CardContent>
      </Card>

      {/* Current Routine Section */}
      <Card>
        <CardHeader>
          <CardTitle>Current Routine</CardTitle>
          <CardDescription>Your workout for today.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full mb-4 border rounded-md p-2">
            {currentRoutine.length === 0 ? (
              <p className="text-center text-muted-foreground">No exercises added yet.</p>
            ) : (
              <div className="space-y-4">
                {currentRoutine.map((ex, index) => (
                  <Card key={index} className="p-3 flex justify-between items-center">
                    <div className="flex-grow space-y-1 mr-2">
                      <p className="font-semibold">{ex.name}</p>
                      <div className="flex items-center gap-2 text-sm">
                          <Label htmlFor={`sets-${index}`} className="sr-only">Sets</Label>
                          <Input
                            id={`sets-${index}`}
                            type="number"
                            min="1"
                            value={ex.sets}
                            onChange={(e) => handleUpdateExercise(index, 'sets', e.target.value)}
                            className="h-8 w-16 text-xs"
                            aria-label={`Sets for ${ex.name}`}
                          />
                          <span>sets</span>
                           <Label htmlFor={`reps-${index}`} className="sr-only">Reps</Label>
                          <Input
                             id={`reps-${index}`}
                            type="text"
                            value={ex.reps}
                            onChange={(e) => handleUpdateExercise(index, 'reps', e.target.value)}
                            className="h-8 w-20 text-xs"
                            aria-label={`Reps/Duration for ${ex.name}`}
                          />
                          <span>reps/dur</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveExercise(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label={`Remove ${ex.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
          {currentRoutine.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="routineName">Routine Name</Label>
              <div className="flex gap-2">
                <Input
                  id="routineName"
                  type="text"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  placeholder="e.g., Leg Day"
                  className="flex-grow"
                />
                <Button onClick={handleSaveRoutine}>
                  <Save className="mr-2 h-4 w-4" /> Save Routine
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

       {/* Saved Routines Section */}
        <Card>
            <CardHeader>
                <CardTitle>Saved Routines</CardTitle>
                <CardDescription>Load or delete your previously saved routines.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="savedRoutineSelect">Select Routine</Label>
                     <Select value={selectedSavedRoutineId} onValueChange={setSelectedSavedRoutineId}>
                        <SelectTrigger id="savedRoutineSelect">
                            <SelectValue placeholder="Select a saved routine" />
                        </SelectTrigger>
                        <SelectContent>
                             {savedRoutines.length > 0 ? (
                                savedRoutines.map((routine) => (
                                    <SelectItem key={routine.id} value={routine.id}>{routine.name}</SelectItem>
                                ))
                            ) : (
                                <SelectItem value="no-routines" disabled>No saved routines</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                 </div>
                <div className="flex justify-between gap-2">
                     <Button onClick={handleLoadRoutine} disabled={!selectedSavedRoutineId || savedRoutines.length === 0} className="flex-1">
                         Load Routine
                     </Button>
                     <Button variant="destructive" onClick={handleDeleteRoutine} disabled={!selectedSavedRoutineId || savedRoutines.length === 0} className="flex-1">
                         <Trash2 className="mr-2 h-4 w-4"/> Delete Routine
                     </Button>
                </div>
            </CardContent>
        </Card>

    </div>
  );
};

export default WorkoutBuilder;
