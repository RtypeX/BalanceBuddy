
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInMinutes, parse, isValid } from 'date-fns';
import { PlusCircle, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Types
interface SleepLogEntry {
  id: string;
  date: string; // YYYY-MM-DD format for the *day* the user woke up
  sleepTime: string; // HH:mm format (24-hour)
  wakeTime: string; // HH:mm format (24-hour)
  durationMinutes: number;
  quality?: 'Poor' | 'Fair' | 'Good' | 'Excellent'; // Optional quality rating
}

// Local Storage Helpers
const STORAGE_KEY = 'sleepLog';

const getStoredSleepLog = (): SleepLogEntry[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    // Ensure dates are strings, durations are numbers
    return stored ? JSON.parse(stored).map((entry: any) => ({
        ...entry,
        durationMinutes: Number(entry.durationMinutes) || 0
    })).sort((a: SleepLogEntry, b: SleepLogEntry) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort newest first
    : [];
  } catch (error) {
    console.error("Error parsing sleep log from localStorage:", error);
    return [];
  }
};

const saveStoredSleepLog = (log: SleepLogEntry[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
};

// Helper to format minutes into H M format
const formatDuration = (totalMinutes: number): string => {
  if (isNaN(totalMinutes) || totalMinutes < 0) return 'N/A';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

// Helper to parse HH:mm time string into a Date object relative to a given date
const parseTimeString = (timeString: string, date: Date): Date | null => {
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null; // Invalid format
    }
    const resultDate = new Date(date);
    resultDate.setHours(hours, minutes, 0, 0);
    return resultDate;
}


const SleepTracker: React.FC = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()); // Date user *woke up*
  const [sleepTimeInput, setSleepTimeInput] = useState<string>(''); // HH:mm format
  const [wakeTimeInput, setWakeTimeInput] = useState<string>(''); // HH:mm format
  const [sleepLog, setSleepLog] = useState<SleepLogEntry[]>([]);

  // Load logs on mount
  useEffect(() => {
    setSleepLog(getStoredSleepLog());
  }, []);

  const handleAddSleepLog = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !sleepTimeInput || !wakeTimeInput) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill in date, sleep time, and wake time.' });
      return;
    }

    const wakeUpDate = new Date(selectedDate);
    wakeUpDate.setHours(0,0,0,0); // Ensure it's the start of the day

    const wakeTime = parseTimeString(wakeTimeInput, wakeUpDate);
    let sleepTime = parseTimeString(sleepTimeInput, wakeUpDate);

    if (!wakeTime || !sleepTime) {
        toast({ variant: 'destructive', title: 'Invalid Time Format', description: 'Please use HH:mm format (e.g., 23:00 or 07:30).' });
        return;
    }

    // Handle overnight sleep: if sleep time is later than wake time, assume it was the previous day
    if (sleepTime > wakeTime) {
        sleepTime.setDate(sleepTime.getDate() - 1);
    }

    const duration = differenceInMinutes(wakeTime, sleepTime);

    if (duration <= 0) {
         toast({ variant: 'destructive', title: 'Invalid Duration', description: 'Wake time must be after sleep time.' });
         return;
    }

    const newLogEntry: SleepLogEntry = {
      id: crypto.randomUUID(),
      date: format(wakeUpDate, 'yyyy-MM-dd'), // Log against the wake-up date
      sleepTime: sleepTimeInput,
      wakeTime: wakeTimeInput,
      durationMinutes: duration,
      // quality: undefined // Optionally add quality later
    };

    setSleepLog(prevLogs => {
      const updatedLog = [newLogEntry, ...prevLogs]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort newest first
      saveStoredSleepLog(updatedLog);
      return updatedLog;
    });

    toast({ title: 'Sleep Logged', description: `Sleep for ${format(wakeUpDate, 'PPP')} added.` });

    // Reset form
    setSleepTimeInput('');
    setWakeTimeInput('');
    // setSelectedDate(new Date()); // Optionally reset date
  };

  const handleDeleteLog = (id: string) => {
      setSleepLog(prevLogs => {
        const updatedLog = prevLogs.filter(log => log.id !== id);
        saveStoredSleepLog(updatedLog);
        toast({ title: 'Log Entry Removed' });
        return updatedLog;
      });
  }

   // Prepare data for the chart (show last 7 entries, reversed for chronological order)
   const chartData = useMemo(() => {
        return [...sleepLog] // Create a shallow copy
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort oldest first for chart
            .slice(-7) // Get the last 7 entries
            .map(log => ({
                date: format(new Date(log.date), 'MMM d'), // Format date for X-axis
                duration: parseFloat((log.durationMinutes / 60).toFixed(1)), // Duration in hours
            }));
    }, [sleepLog]);


  return (
    <div className="space-y-6">
      {/* Add Sleep Log Form */}
      <Card>
        <CardHeader>
          <CardTitle>Log Sleep Session</CardTitle>
          <CardDescription>Enter the date you woke up, when you went to sleep, and when you woke up.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSleepLog} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sleepDate">Wake-up Date</Label>
                <DatePicker date={selectedDate} setDate={setSelectedDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sleepTime">Sleep Time (HH:mm)</Label>
                <Input id="sleepTime" type="time" value={sleepTimeInput} onChange={e => setSleepTimeInput(e.target.value)} placeholder="e.g., 23:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wakeTime">Wake Time (HH:mm)</Label>
                <Input id="wakeTime" type="time" value={wakeTimeInput} onChange={e => setWakeTimeInput(e.target.value)} placeholder="e.g., 07:30" />
              </div>
              {/* Optional: Add Quality Input Here */}
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Sleep Log
            </Button>
          </form>
        </CardContent>
      </Card>

       {/* Sleep Chart */}
        <Card>
            <CardHeader>
                <CardTitle>Recent Sleep Duration</CardTitle>
                <CardDescription>Your sleep duration (in hours) over the last 7 logged nights.</CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length > 1 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                            <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} unit="h" domain={['dataMin - 1', 'dataMax + 1']} allowDataOverflow />
                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }} itemStyle={{ color: 'hsl(var(--foreground))' }} labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }} formatter={(value: number) => [`${value.toFixed(1)} hours`, 'Duration']}/>
                            <Line type="monotone" dataKey="duration" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} name="Duration" unit="h" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center text-muted-foreground">Log at least two sleep sessions to see the chart.</p>
                )}
            </CardContent>
        </Card>

      {/* Sleep Log Display */}
      <Card>
        <CardHeader>
          <CardTitle>Sleep History</CardTitle>
          <CardDescription>Your recorded sleep sessions, newest first.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full">
            {sleepLog.length === 0 ? (
              <p className="text-center text-muted-foreground">No sleep sessions logged yet.</p>
            ) : (
              <div className="space-y-4">
                {sleepLog.map(entry => (
                  <div key={entry.id} className="text-sm border-b pb-2 last:border-0">
                    <div className="flex justify-between items-start">
                        <div>
                             <p className="font-semibold">Woke up: {format(new Date(entry.date), 'EEE, MMM d, yyyy')}</p>
                             <p><span className="text-muted-foreground">Slept:</span> {entry.sleepTime} <span className="text-muted-foreground"> Woke:</span> {entry.wakeTime}</p>
                             <p><span className="font-semibold">Duration:</span> {formatDuration(entry.durationMinutes)}</p>
                             {/* Optional: Display Quality */}
                             {/* {entry.quality && <p><span className="font-semibold">Quality:</span> {entry.quality}</p>} */}
                        </div>
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteLog(entry.id)}>
                           <Trash2 className="h-4 w-4" />
                           <span className="sr-only">Delete log</span>
                         </Button>
                    </div>
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

export default SleepTracker;
