'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DatePicker } from "@/components/ui/date-picker";

interface WeightLogEntry {
  id: string;
  date: string; // Store date as ISO string for consistency in localStorage
  weight: number; // Weight in lbs
}

// Helper to get logs from localStorage
const getStoredWeightLog = (): WeightLogEntry[] => {
  try {
    const storedLog = localStorage.getItem('weightLog');
    // Parse dates back into Date objects for sorting/display
    return storedLog ? JSON.parse(storedLog).sort((a: WeightLogEntry, b: WeightLogEntry) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];
  } catch (error) {
    console.error("Error parsing weight log from localStorage:", error);
    return [];
  }
};

// Helper to save logs to localStorage
const saveStoredWeightLog = (logs: WeightLogEntry[]) => {
  localStorage.setItem('weightLog', JSON.stringify(logs));
};

// Helper to get/set goal weight from localStorage
const getStoredWeightGoal = (): number | null => {
  const storedGoal = localStorage.getItem('weightGoal');
  return storedGoal ? parseFloat(storedGoal) : null;
};

const saveStoredWeightGoal = (goal: number | null) => {
    if (goal === null) {
      localStorage.removeItem('weightGoal');
    } else {
      localStorage.setItem('weightGoal', String(goal));
    }
};

// Helper to get/set start weight from localStorage
const getStoredStartWeight = (): number | null => {
    const storedStart = localStorage.getItem('startWeight');
    return storedStart ? parseFloat(storedStart) : null;
};

const saveStoredStartWeight = (weight: number | null) => {
    if (weight === null) {
        localStorage.removeItem('startWeight');
    } else {
        localStorage.setItem('startWeight', String(weight));
    }
};


const WeightTracker: React.FC = () => {
  const { toast } = useToast();
  const [weightLog, setWeightLog] = useState<WeightLogEntry[]>([]);
  const [goalWeight, setGoalWeight] = useState<number | null>(null);
  const [startWeight, setStartWeight] = useState<number | null>(null);
  const [currentWeightInput, setCurrentWeightInput] = useState<string>('');
  const [goalWeightInput, setGoalWeightInput] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedLog = getStoredWeightLog();
    const loadedGoal = getStoredWeightGoal();
    const loadedStart = getStoredStartWeight() || (loadedLog.length > 0 ? loadedLog[0].weight : null);

    setWeightLog(loadedLog);
    setGoalWeight(loadedGoal);
    setStartWeight(loadedStart);
    setGoalWeightInput(loadedGoal ? String(loadedGoal) : '');
  }, []);

   // Set start weight automatically if it's null and log exists
    useEffect(() => {
      if (startWeight === null && weightLog.length > 0) {
        const firstLogWeight = weightLog[0].weight;
        setStartWeight(firstLogWeight);
        saveStoredStartWeight(firstLogWeight);
      }
    }, [weightLog, startWeight]);


  const handleAddWeightLog = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(currentWeightInput);

    if (!selectedDate || isNaN(weightNum) || weightNum <= 0) {
      toast({ variant: "destructive", title: "Invalid Input", description: "Please enter a valid date and weight." });
      return;
    }

    const logDateISO = selectedDate.toISOString().split('T')[0]; // Use YYYY-MM-DD format

    // Check if log for this date already exists
    const existingLogIndex = weightLog.findIndex(log => log.date === logDateISO);

    let updatedLog: WeightLogEntry[];
    const newLogEntry: WeightLogEntry = {
        id: crypto.randomUUID(),
        date: logDateISO,
        weight: weightNum,
    };

    if (existingLogIndex > -1) {
      // Update existing log
      updatedLog = [...weightLog];
      updatedLog[existingLogIndex] = newLogEntry;
      toast({ title: "Weight Updated", description: `Weight for ${format(selectedDate, 'PPP')} updated.` });
    } else {
      // Add new log
      updatedLog = [...weightLog, newLogEntry];
       toast({ title: "Weight Logged", description: `Weight for ${format(selectedDate, 'PPP')} logged.` });
    }

     // Sort log by date after adding/updating
    updatedLog.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setWeightLog(updatedLog);
    saveStoredWeightLog(updatedLog);

    // Update start weight if this is the first entry
    if (updatedLog.length === 1) {
        setStartWeight(weightNum);
        saveStoredStartWeight(weightNum);
    }

    setCurrentWeightInput('');
    setSelectedDate(new Date()); // Reset date picker
  };

  const handleSetGoal = () => {
    const goalNum = parseFloat(goalWeightInput);
    if (isNaN(goalNum) || goalNum <= 0) {
      toast({ variant: "destructive", title: "Invalid Goal", description: "Please enter a valid goal weight in pounds." });
      setGoalWeight(null);
      saveStoredWeightGoal(null);
      setGoalWeightInput('');
    } else {
      setGoalWeight(goalNum);
      saveStoredWeightGoal(goalNum);
      toast({ title: "Goal Set", description: `Weight goal set to ${goalNum.toFixed(1)} lbs.` });
    }
  };

  const handleRemoveGoal = () => {
      setGoalWeight(null);
      saveStoredWeightGoal(null);
      setGoalWeightInput('');
      toast({ title: "Goal Removed", description: "Weight goal has been removed." });
  };

  const chartData = useMemo(() => {
    return weightLog.map(log => ({
      date: format(parseISO(log.date), 'MMM d'), // Format date for X-axis
      weight: log.weight,
    }));
  }, [weightLog]);

  // Progress Bar Calculation
  const currentWeight = weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : startWeight;
  let progressPercent = 0;
  let progressDescription = "Set a goal and log your weight to see progress.";

  if (startWeight !== null && goalWeight !== null && currentWeight !== null) {
    const totalChangeNeeded = goalWeight - startWeight;
    const changeAchieved = currentWeight - startWeight;

    if (totalChangeNeeded === 0) {
        progressPercent = currentWeight === goalWeight ? 100 : 0;
        progressDescription = currentWeight === goalWeight ? "Goal achieved!" : "Start weight is the same as goal.";
    } else if ( (totalChangeNeeded > 0 && changeAchieved >= totalChangeNeeded) || (totalChangeNeeded < 0 && changeAchieved <= totalChangeNeeded) ) {
        progressPercent = 100; // Goal met or exceeded
        progressDescription = "Goal achieved!";
    } else if ((totalChangeNeeded > 0 && changeAchieved < 0) || (totalChangeNeeded < 0 && changeAchieved > 0)) {
        progressPercent = 0; // Moving away from goal
        progressDescription = `Moving away from goal. Current: ${currentWeight.toFixed(1)} lbs`;
    }
     else {
      progressPercent = Math.abs((changeAchieved / totalChangeNeeded) * 100);
      progressDescription = `Current: ${currentWeight.toFixed(1)} lbs / Goal: ${goalWeight.toFixed(1)} lbs`;
    }
  } else if (currentWeight !== null) {
      progressDescription = `Current: ${currentWeight.toFixed(1)} lbs. Set a goal to track progress.`;
  }


  return (
    <div className="space-y-6">
      {/* Log Weight Section */}
      <Card>
        <CardHeader>
          <CardTitle>Log Your Weight</CardTitle>
          <CardDescription>Enter your weight (in lbs) for today or a specific date.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddWeightLog} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="space-y-2 flex-1">
                    <Label htmlFor="logDate">Date</Label>
                    <DatePicker date={selectedDate} setDate={setSelectedDate} />
                </div>
                <div className="space-y-2 flex-1">
                    <Label htmlFor="currentWeight">Weight (lbs)</Label>
                    <Input
                    id="currentWeight"
                    type="number"
                    step="0.1"
                    value={currentWeightInput}
                    onChange={(e) => setCurrentWeightInput(e.target.value)}
                    placeholder="e.g., 165.5"
                    />
                </div>
            </div>
            <Button type="submit" className="w-full sm:w-auto">Log Weight</Button>
          </form>
        </CardContent>
      </Card>

       {/* Goal Setting Section */}
        <Card>
            <CardHeader>
                <CardTitle>Weight Goal</CardTitle>
                <CardDescription>Set or update your target weight (in lbs).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="space-y-2 flex-1">
                        <Label htmlFor="goalWeight">Goal Weight (lbs)</Label>
                        <Input
                            id="goalWeight"
                            type="number"
                            step="0.1"
                            value={goalWeightInput}
                            onChange={(e) => setGoalWeightInput(e.target.value)}
                            placeholder="e.g., 160.0"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                         <Button onClick={handleSetGoal} className="flex-1 sm:flex-initial">Set Goal</Button>
                         {goalWeight !== null && <Button variant="outline" onClick={handleRemoveGoal} className="flex-1 sm:flex-initial">Remove</Button>}
                    </div>
                </div>
                 {goalWeight !== null && (
                     <p className="text-sm text-muted-foreground">Your current goal is {goalWeight.toFixed(1)} lbs.</p>
                 )}
            </CardContent>
        </Card>

      {/* Progress Bar Section */}
       {(startWeight !== null || goalWeight !== null) && (
           <Card>
               <CardHeader>
                   <CardTitle>Progress Towards Goal</CardTitle>
               </CardHeader>
               <CardContent className="space-y-2">
                   <Progress value={progressPercent} className="w-full h-3" />
                   <p className="text-sm text-muted-foreground text-center">{progressDescription}</p>
                    {startWeight !== null && <p className="text-xs text-center text-muted-foreground">Start: {startWeight.toFixed(1)} lbs</p>}
               </CardContent>
           </Card>
       )}


      {/* Chart Section */}
      <Card>
        <CardHeader>
          <CardTitle>Weight History</CardTitle>
          <CardDescription>Your weight progress over time (in lbs).</CardDescription>
        </CardHeader>
        <CardContent>
          {weightLog.length > 1 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} domain={['dataMin - 5', 'dataMax + 5']} allowDataOverflow={true} unit=" lbs"/> {/* Adjusted domain slightly for lbs */}
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} itemStyle={{ color: 'hsl(var(--foreground))' }} labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }} formatter={(value: number) => [`${value.toFixed(1)} lbs`, 'Weight']}/>
                <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} name="Weight" unit=" lbs"/>
                {goalWeight !== null && (
                    <ReferenceLine y={goalWeight} label={{ value: `Goal: ${goalWeight.toFixed(1)} lbs`, position: 'insideTopRight', fill: 'hsl(var(--primary))', fontSize: 12 }} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
                )}
                 {startWeight !== null && (
                    <ReferenceLine y={startWeight} label={{ value: `Start: ${startWeight.toFixed(1)} lbs`, position: 'insideBottomLeft', fill: 'hsl(var(--accent-foreground))', fontSize: 12 }} stroke="hsl(var(--accent))" strokeDasharray="3 3" />
                 )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground">Log at least two weight entries to see the chart.</p>
          )}
        </CardContent>
      </Card>

       {/* Log History Table Section */}
       <Card>
           <CardHeader>
               <CardTitle>Weight Log Details</CardTitle>
               <CardDescription>A detailed list of your weight entries (in lbs).</CardDescription>
           </CardHeader>
           <CardContent>
               <ScrollArea className="h-[300px] w-full">
                   {weightLog.length === 0 ? (
                       <p className="text-center text-muted-foreground">No weight logged yet.</p>
                   ) : (
                       <table className="w-full text-sm">
                           <thead>
                               <tr className="border-b">
                                   <th className="text-left p-2 font-medium text-muted-foreground">Date</th>
                                   <th className="text-right p-2 font-medium text-muted-foreground">Weight (lbs)</th>
                               </tr>
                           </thead>
                           <tbody>
                               {[...weightLog].reverse().map((log) => ( // Display newest first
                                   <tr key={log.id} className="border-b last:border-b-0 hover:bg-muted/50">
                                       <td className="p-2">{format(parseISO(log.date), 'PPP')}</td>
                                       <td className="text-right p-2">{log.weight.toFixed(1)}</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   )}
               </ScrollArea>
           </CardContent>
       </Card>
    </div>
  );
};

export default WeightTracker;
