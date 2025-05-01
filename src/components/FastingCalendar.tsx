'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, differenceInSeconds } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Helper function to format seconds into HH:MM:SS
const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const FastingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isFasting, setIsFasting] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0); // in seconds
  const [goalHours, setGoalHours] = useState<number>(16); // Default goal
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Load state from localStorage on mount
  useEffect(() => {
    const storedStartTime = localStorage.getItem('fastingStartTime');
    const storedGoalHours = localStorage.getItem('fastingGoalHours');

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

      // Check if goal reached
      const goalSeconds = goalHours * 3600;
      if (elapsedTime >= goalSeconds) {
          // Optionally notify user or stop timer automatically
          // For now, just let it run past the goal
      }

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
  }, [isFasting, startTime, elapsedTime, goalHours]); // Rerun effect if these change


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
    if (!isFasting) return; // Not fasting

    setIsFasting(false);
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    const finalElapsedTime = elapsedTime; // Capture elapsed time before reset
    setStartTime(null);
    setElapsedTime(0);
    localStorage.removeItem('fastingStartTime');
    // Keep goal hours in local storage for next time
    toast({
      title: "Fasting Ended",
      description: `Duration: ${formatTime(finalElapsedTime)}`,
    });
  }, [isFasting, intervalId, elapsedTime, toast]);

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
                <CardDescription>Track your fasting progress.</CardDescription>
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
             <CardTitle>Fasting Log</CardTitle>
             <CardDescription>Select dates to view your fasting history (Calendar view only for now).</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                // You might want to disable future dates or dates before tracking started
                // disabled={(date) => date > new Date() || date < new Date('2024-01-01')}
                initialFocus
              />
          </CardContent>
       </Card>
       {/* The Popover below is kept for potential future use but commented out as the main display is now the Card */}
       {/*
        <Popover>
            <PopoverTrigger asChild>
            <Button
                variant={"outline"}
                className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
                )}
            >
                {selectedDate ? format(selectedDate, "PPP") : (
                <span>Pick a date</span>
                )}
            </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) =>
                date > new Date() || date < new Date('2024-01-01')
                }
                initialFocus
            />
            </PopoverContent>
        </Popover>
       */}
    </div>
  );
};

export default FastingCalendar;
