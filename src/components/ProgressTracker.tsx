'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker"; // Assuming DatePicker component exists
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

interface WorkoutLogEntry {
  id: string;
  date: Date;
  exerciseType: string;
  duration: number; // in minutes
  calories: number;
}

// Helper to get logs from localStorage
const getStoredLogs = (): WorkoutLogEntry[] => {
  try {
    const storedLogs = localStorage.getItem('workoutLogs');
    // Ensure dates are properly parsed back into Date objects
    return storedLogs ? JSON.parse(storedLogs).map((log: any) => ({ ...log, date: new Date(log.date) })) : [];
  } catch (error) {
    console.error("Error parsing workout logs from localStorage:", error);
    return [];
  }
};

// Helper to save logs to localStorage
const saveStoredLogs = (logs: WorkoutLogEntry[]) => {
  localStorage.setItem('workoutLogs', JSON.stringify(logs));
};


const ProgressTracker: React.FC = () => {
  const [logs, setLogs] = useState<WorkoutLogEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [exerciseType, setExerciseType] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [calories, setCalories] = useState<string>('');
  const { toast } = useToast();

  // Load logs from localStorage on mount
  useEffect(() => {
    setLogs(getStoredLogs());
  }, []);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !exerciseType || !duration || !calories) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all fields to log your workout.",
      });
      return;
    }

    const durationNum = parseInt(duration, 10);
    const caloriesNum = parseInt(calories, 10);

    if (isNaN(durationNum) || durationNum <= 0 || isNaN(caloriesNum) || caloriesNum < 0) {
       toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter valid numbers for duration and calories.",
      });
      return;
    }

    const newLog: WorkoutLogEntry = {
      id: crypto.randomUUID(),
      date: selectedDate,
      exerciseType,
      duration: durationNum,
      calories: caloriesNum,
    };

    const updatedLogs = [newLog, ...logs].sort((a, b) => b.date.getTime() - a.date.getTime()); // Keep sorted by date descending
    setLogs(updatedLogs);
    saveStoredLogs(updatedLogs);

    toast({
      title: "Workout Logged",
      description: `${exerciseType} workout on ${format(selectedDate, 'PPP')} added successfully.`,
    });

    // Reset form
    setSelectedDate(new Date());
    setExerciseType('');
    setDuration('');
    setCalories('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Log New Workout</CardTitle>
          <CardDescription>Enter the details of your completed workout session.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddLog} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <DatePicker date={selectedDate} setDate={setSelectedDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exerciseType">Exercise Type</Label>
              <Select value={exerciseType} onValueChange={setExerciseType}>
                <SelectTrigger id="exerciseType">
                  <SelectValue placeholder="Select exercise type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cardio">Cardio</SelectItem>
                  <SelectItem value="Strength Training">Strength Training</SelectItem>
                  <SelectItem value="Yoga">Yoga</SelectItem>
                  <SelectItem value="Flexibility">Flexibility</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 45"
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories">Calories Burned</Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="e.g., 350"
                min="0"
              />
            </div>
            <Button type="submit" className="w-full">Add Workout Log</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workout History</CardTitle>
          <CardDescription>Your recorded workout sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground">No workouts logged yet.</p>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <Card key={log.id} className="p-4">
                    <p className="font-semibold">{format(log.date, 'PPP')}</p>
                    <p><span className="font-medium">Type:</span> {log.exerciseType}</p>
                    <p><span className="font-medium">Duration:</span> {log.duration} minutes</p>
                    <p><span className="font-medium">Calories:</span> {log.calories} kcal</p>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressTracker;