
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, differenceInSeconds, formatDistanceStrict } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface FastingLogEntry {
  id: string; // Unique ID for key prop
  startTime: string; // ISO string
  endTime: string; // ISO string
  durationSeconds: number;
  goalHours: number;
}

// Helper function to format seconds into HH:MM:SS
const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Helper to get fasting log from localStorage
const getStoredLog = (): FastingLogEntry[] => {
    try {
        const storedLog = localStorage.getItem('fastingLog');
        return storedLog ? JSON.parse(storedLog) : [];
    } catch (error) {
        console.error("Error parsing fasting log from localStorage:", error);
        return [];
    }
};

// Helper to save fasting log to localStorage
const saveStoredLog = (log: FastingLogEntry[]) => {
    localStorage.setItem('fastingLog', JSON.stringify(log));
};


const FastingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isFasting, setIsFasting] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0); // in seconds
  const [goalHours, setGoalHours] = useState<number>(16); // Default goal
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [fastingLog, setFastingLog] = useState<FastingLogEntry[]>([]);
  const { toast } = useToast();

  // Load state from localStorage on mount
  useEffect(() => {
    const storedStartTime = localStorage.getItem('fastingStartTime');
    const storedGoalHours = localStorage.getItem('fastingGoalHours');
    const storedLog = getStoredLog();

    setFastingLog(storedLog);

    if (storedGoalHours) {
      setGoalHours(parseInt(storedGoalHours, 10));
    }

    if (storedStartTime) {
      const start = new Date(storedStartTime);
      setStartTime(start);
      setIsFasting(true);
      const now = new Date();
      setElapsedTime(differenceInSeconds(now, start));
    }
  }, []);

  // Effect to run the timer
  useEffect(() => {
    if (isFasting && startTime) {
      const id = setInterval(() => {
        setElapsedTime(differenceInSeconds(new Date(), startTime));
      }, 1000);
      setIntervalId(id);

    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    // Cleanup interval on component unmount or when fasting stops
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isFasting, startTime]); // Removed elapsedTime and goalHours dependencies as they don't influence the timer interval itself

  const startFasting = useCallback(() => {
    if (isFasting) return; // Already fasting

    const now = new Date();
    setStartTime(now);
    setIsFasting(true);
    setElapsedTime(0);
    localStorage.setItem('fastingStartTime', now.toISOString());
    localStorage.setItem('fastingGoalHours', String(goalHours));
    toast({ title: "Fasting Started", description: `Goal: ${goalHours} hours.` });
  }, [isFasting, goalHours, toast]);

  const stopFasting = useCallback(() => {
    if (!isFasting || !startTime) return; // Not fasting or no start time

    const endTime = new Date();
    const finalElapsedTime = differenceInSeconds(endTime, startTime); // Calculate final duration

    // Create new log entry
    const newLogEntry: FastingLogEntry = {
        id: crypto.randomUUID(), // Simple unique ID
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationSeconds: finalElapsedTime,
        goalHours: goalHours,
    };

    // Update log state and localStorage
    const updatedLog = [newLogEntry, ...fastingLog];
    setFastingLog(updatedLog);
    saveStoredLog(updatedLog);

    // Reset fasting state
    setIsFasting(false);
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    setStartTime(null);
    setElapsedTime(0);
    localStorage.removeItem('fastingStartTime');
    // Keep goal hours in local storage for next time

    toast({
      title: "Fasting Ended",
      description: `Duration: ${formatTime(finalElapsedTime)}. Logged successfully.`,
    });
  }, [isFasting, intervalId, startTime, fastingLog, goalHours, toast]); // Added missing dependencies

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = parseInt(e.target.value, 10);
    if (!isNaN(hours) && hours > 0) {
      setGoalHours(hours);
      if (!isFasting) { // Only save if not currently fasting to avoid changing mid-fast goal persistence
         localStorage.setItem('fastingGoalHours', String(hours));
      }
    } else if (e.target.value === '') {
        setGoalHours(0); // Allow clearing the input
    }
  };

  const goalSeconds = goalHours * 3600;
  const progressPercent = goalSeconds > 0 ? Math.min((elapsedTime / goalSeconds) * 100, 100) : 0;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col space-y-6">
       <Card>
            <CardHeader>
                <CardTitle>Fasting Timer</CardTitle>
                <CardDescription>Track your current fasting session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="goalHours">Fasting Goal (hours)</Label>
                    <Input
                        id="goalHours"
                        type="number"
                        value={goalHours > 0 ? goalHours : ''}
                        onChange={handleGoalChange}
                        placeholder="e.g., 16"
                        min="1"
                        disabled={isFasting} // Disable changing goal while fasting
                        className="w-full"
                    />
                </div>

                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Elapsed Time</p>
                    <p className="text-4xl font-bold tabular-nums">{formatTime(elapsedTime)}</p>
                </div>

                {goalHours > 0 && (
                    <div className="space-y-2">
                         <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Progress</span>
                            <span>Goal: {goalHours}h</span>
                        </div>
                        <Progress value={progressPercent} className="w-full h-3" />
                        <p className="text-center text-sm">{progressPercent.toFixed(1)}% complete</p>
                    </div>
                )}

                <div className="flex justify-center space-x-4">
                    {!isFasting ? (
                        <Button onClick={startFasting} className="w-full" disabled={goalHours <= 0}>Start Fasting</Button>
                    ) : (
                        <Button onClick={stopFasting} variant="destructive" className="w-full">Stop Fasting</Button>
                    )}
                </div>
                 {isFasting && startTime && (
                    <p className="text-center text-xs text-muted-foreground">
                        Started: {format(startTime, "PPP p")}
                    </p>
                 )}
            </CardContent>
        </Card>

       <Card>
          <CardHeader>
             <CardTitle>Calendar View</CardTitle>
             <CardDescription>Select dates to view your fasting history (Highlights planned).</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                // TODO: Implement highlighting of days with logged fasts
                // modifiers={{ fasted: fastingLog.map(log => new Date(log.startTime)) }}
                // modifiersClassNames={{ fasted: 'bg-accent text-accent-foreground rounded-full' }}
                initialFocus
              />
          </CardContent>
       </Card>

       <Card>
            <CardHeader>
                <CardTitle>Fasting Log</CardTitle>
                <CardDescription>Your completed fasting sessions.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] w-full"> {/* Adjust height as needed */}
                    {fastingLog.length === 0 ? (
                        <p className="text-center text-muted-foreground">No fasting sessions logged yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {fastingLog.map((entry) => (
                                <div key={entry.id} className="text-sm">
                                    <p>
                                        <span className="font-semibold">Started:</span> {format(new Date(entry.startTime), "MMM d, yyyy 'at' p")}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Ended:</span> {format(new Date(entry.endTime), "MMM d, yyyy 'at' p")}
                                    </p>
                                    <p>
                                        <span className="font-semibold">Duration:</span> {formatDistanceStrict(new Date(entry.startTime), new Date(entry.endTime))} ({formatTime(entry.durationSeconds)})
                                    </p>
                                    <p>
                                        <span className="font-semibold">Goal:</span> {entry.goalHours} hours
                                    </p>
                                    <Separator className="my-2" />
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
       </Card>
    </div>
  );
};

export default FastingCalendar;
