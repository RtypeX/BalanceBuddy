
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Added RadioGroup

// Define the structure for log entries
type LogType = 'exercise' | 'sport';

interface BaseLogEntry {
  id: string;
  date: Date;
  duration: number; // in minutes
  calories?: number; // Optional calories
}

interface ExerciseLogEntry extends BaseLogEntry {
  logType: 'exercise';
  exerciseType: string;
  sportName?: never; // Ensure sportName is not present for exercise
}

interface SportLogEntry extends BaseLogEntry {
  logType: 'sport';
  sportName: string; // This will store the final sport name (e.g., "Basketball" or "Custom: Kayaking")
  exerciseType?: never; // Ensure exerciseType is not present for sport
}

type WorkoutLogEntry = ExerciseLogEntry | SportLogEntry;


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
  const [logType, setLogType] = useState<LogType>('exercise'); // State for exercise/sport selection
  const [exerciseType, setExerciseType] = useState<string>('');
  const [sportSelection, setSportSelection] = useState<string>(''); // Stores the dropdown value ('Basketball', 'Other', etc.)
  const [customSportName, setCustomSportName] = useState<string>(''); // Stores the user's input for 'Other'
  const [duration, setDuration] = useState<string>('');
  const [calories, setCalories] = useState<string>('');
  const { toast } = useToast();

  // Load logs from localStorage on mount
  useEffect(() => {
    setLogs(getStoredLogs());
  }, []);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !duration) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a date and enter the duration.",
      });
      return;
    }

    const durationNum = parseInt(duration, 10);
    const caloriesNum = calories ? parseInt(calories, 10) : undefined;

    if (isNaN(durationNum) || durationNum <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Duration",
        description: "Please enter a valid duration in minutes.",
      });
      return;
    }
     if (calories && (isNaN(caloriesNum!) || caloriesNum! < 0)) {
       toast({
        variant: "destructive",
        title: "Invalid Calories",
        description: "Please enter a valid number for calories burned.",
      });
      return;
    }

    let newLog: WorkoutLogEntry;
    let loggedActivityName = ''; // For the toast message

    if (logType === 'exercise') {
      if (!exerciseType) {
        toast({ variant: "destructive", title: "Missing Information", description: "Please select an exercise type." });
        return;
      }
      loggedActivityName = exerciseType;
      newLog = {
        id: crypto.randomUUID(),
        date: selectedDate,
        logType: 'exercise',
        exerciseType,
        duration: durationNum,
        calories: caloriesNum,
      };
    } else { // logType === 'sport'
       let finalSportName = sportSelection; // Start with the dropdown selection
       if (sportSelection === 'Other') {
           if (!customSportName.trim()) {
               toast({ variant: "destructive", title: "Missing Information", description: "Please specify the sport name." });
               return;
           }
           finalSportName = customSportName.trim(); // Use the custom input if 'Other' was selected
       } else if (!sportSelection) {
           toast({ variant: "destructive", title: "Missing Information", description: "Please select or enter a sport name." });
           return;
       }

      loggedActivityName = finalSportName;
      newLog = {
        id: crypto.randomUUID(),
        date: selectedDate,
        logType: 'sport',
        sportName: finalSportName, // Use the determined final sport name
        duration: durationNum,
        calories: caloriesNum,
      };
    }


    const updatedLogs = [newLog, ...logs].sort((a, b) => b.date.getTime() - a.date.getTime()); // Keep sorted by date descending
    setLogs(updatedLogs);
    saveStoredLogs(updatedLogs);

    toast({
      title: "Activity Logged",
      description: `${loggedActivityName} on ${format(selectedDate, 'PPP')} added successfully.`,
    });

    // Reset form
    setSelectedDate(new Date());
    setExerciseType('');
    setSportSelection(''); // Reset dropdown selection
    setCustomSportName(''); // Reset custom sport input
    setDuration('');
    setCalories('');
    // setLogType('exercise'); // Optionally reset log type selector
  };

   // Handle sport selection change
   const handleSportSelectionChange = (value: string) => {
        setSportSelection(value);
        // Clear custom input if a specific sport (not 'Other') is chosen
        if (value !== 'Other') {
            setCustomSportName('');
        }
   }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Log New Activity</CardTitle>
          <CardDescription>Record your exercises or sports sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddLog} className="space-y-4">
            {/* Log Type Selection */}
            <div className="space-y-2">
              <Label>Activity Type</Label>
              <RadioGroup
                defaultValue="exercise"
                onValueChange={(value: LogType) => setLogType(value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="exercise" id="r1" />
                  <Label htmlFor="r1">Exercise</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sport" id="r2" />
                  <Label htmlFor="r2">Sport</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Common Fields */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <DatePicker date={selectedDate} setDate={setSelectedDate} />
            </div>

            {/* Conditional Fields */}
            {logType === 'exercise' ? (
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
                     <SelectItem value="Walking">Walking</SelectItem>
                     <SelectItem value="Running">Running</SelectItem>
                     <SelectItem value="Cycling">Cycling</SelectItem>
                    <SelectItem value="Other">Other</SelectItem> {/* Keep 'Other' for Exercise too if needed */}
                  </SelectContent>
                </Select>
              </div>
            ) : ( // logType === 'sport'
              <div className="space-y-2">
                <Label htmlFor="sportName">Sport Name</Label>
                 <Select value={sportSelection} onValueChange={handleSportSelectionChange}>
                    <SelectTrigger id="sportName">
                        <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Basketball">Basketball</SelectItem>
                        <SelectItem value="Soccer">Soccer</SelectItem>
                        <SelectItem value="Tennis">Tennis</SelectItem>
                        <SelectItem value="Swimming">Swimming</SelectItem>
                        <SelectItem value="Volleyball">Volleyball</SelectItem>
                        <SelectItem value="Hiking">Hiking</SelectItem>
                        {/* Add more common sports */}
                        <SelectItem value="Other">Other (Specify Below)</SelectItem>
                    </SelectContent>
                 </Select>
                 {/* Conditionally render the input for "Other" sport */}
                 {sportSelection === 'Other' && (
                    <div className="space-y-2 mt-2"> {/* Added margin-top */}
                         <Label htmlFor="customSportName" className="text-sm text-muted-foreground">Specify Sport</Label>
                        <Input
                            id="customSportName"
                            type="text"
                            value={customSportName}
                            onChange={(e) => setCustomSportName(e.target.value)}
                            placeholder="e.g., Kayaking, Rock Climbing"
                        />
                    </div>
                 )}
              </div>
            )}

            {/* More Common Fields */}
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
              <Label htmlFor="calories">Calories Burned (Optional)</Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="e.g., 350"
                min="0"
              />
            </div>
            <Button type="submit" className="w-full">Add Activity Log</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>Your recorded sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground">No activities logged yet.</p>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <Card key={log.id} className="p-4">
                    <p className="font-semibold">{format(log.date, 'PPP')}</p>
                    {log.logType === 'exercise' ? (
                        <p><span className="font-medium">Exercise:</span> {log.exerciseType}</p>
                    ) : (
                        <p><span className="font-medium">Sport:</span> {log.sportName}</p>
                    )}
                    <p><span className="font-medium">Duration:</span> {log.duration} minutes</p>
                    {log.calories !== undefined && <p><span className="font-medium">Calories:</span> {log.calories} kcal</p>}
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
