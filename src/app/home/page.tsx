'use client';

import ExerciseList from '@/components/ExerciseList';
import WorkoutBuilder from '@/components/WorkoutBuilder';
import ProgressTracker from '@/components/ProgressTracker';
import Profile from '@/components/Profile';
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useRouter} from "next/navigation";
import {useEffect, useState, useRef} from "react";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {ModeToggle} from "@/components/ModeToggle";
import Image from 'next/image';
import FastingCalendar from "@/components/FastingCalendar";
import Link from 'next/link';
import BalanceBotPage from "@/app/balancebot/page";
import { Card, CardContent } from "@/components/ui/card"; // Import Card and CardContent

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user data
    localStorage.removeItem('profileData'); // Clear profile data
    localStorage.removeItem('fastingLog'); // Clear fasting log
    localStorage.removeItem('fastingStartTime'); // Clear active fast start time
    localStorage.removeItem('fastingGoalHours'); // Clear fasting goal
    localStorage.removeItem('workoutLogs'); // Clear workout logs
    router.push('/'); // Redirect to login/start screen
  };


  return (
    <div className="flex flex-col min-h-screen bg-background"> {/* Use background for main container */}
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card text-card-foreground shadow-md border-b"> {/* Use card colors for header */}
        <Image
          src="https://cdn.glitch.global/baa5928e-6c09-4efd-bb8d-06e0fe6e4aac/BB.png?v=1729706784295"
          alt="BalanceBuddy Logo"
          width={75} // Adjusted size
          height={75} // Adjusted size
          className="mr-2 rounded-full" // Added rounded-full
        />
        <h1 className="text-2xl font-semibold text-primary">BalanceBuddy</h1> {/* Use primary color */}
        <div className="flex items-center space-x-4">
          {/* ModeToggle moved to profile page */}
          <Avatar>
            {/* Consider adding a dynamic user image source if available */}
            <AvatarImage src="https://picsum.photos/50/50" alt="User Avatar" data-ai-hint="user avatar"/>
            <AvatarFallback>BB</AvatarFallback>
          </Avatar>
          <Button variant="ghost" onClick={handleLogout}>Logout</Button> {/* Use ghost variant for less emphasis */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-4 md:p-6 lg:p-8"> {/* Added padding for different screen sizes */}
        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"> {/* Responsive grid */}

          {/* Exercise List Card */}
          <Card className="shadow-md rounded-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-lg"> {/* Added hover effect */}
            <CardContent className="p-4 flex flex-col items-center text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              <h2 className="text-lg font-semibold mb-1">Exercises</h2>
              <p className="text-sm text-muted-foreground mb-3">Browse our extensive exercise library.</p>
              <Button variant="outline" onClick={() => router.push('/exercises')} className="w-full">
                View Exercises
              </Button>
            </CardContent>
          </Card>

          {/* Workout Builder Card */}
          <Card className="shadow-md rounded-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-lg">
            <CardContent className="p-4 flex flex-col items-center text-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              <h2 className="text-lg font-semibold mb-1">Workout Builder</h2>
              <p className="text-sm text-muted-foreground mb-3">Create personalized workout routines.</p>
              <Button variant="outline" onClick={() => router.push('/workout-builder')} className="w-full">
                Build Workout
              </Button>
            </CardContent>
          </Card>

          {/* Progress Tracker Card */}
          <Card className="shadow-md rounded-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-lg">
            <CardContent className="p-4 flex flex-col items-center text-center">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
              <h2 className="text-lg font-semibold mb-1">Progress Tracker</h2>
              <p className="text-sm text-muted-foreground mb-3">Track your fitness journey and stay motivated.</p>
              <Button variant="outline" onClick={() => router.push('/progress-tracker')} className="w-full">
                View Progress
              </Button>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card className="shadow-md rounded-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-lg">
            <CardContent className="p-4 flex flex-col items-center text-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <h2 className="text-lg font-semibold mb-1">Profile</h2>
              <p className="text-sm text-muted-foreground mb-3">Manage your profile and settings.</p>
              <Button variant="outline" onClick={() => router.push('/profile')} className="w-full">
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* BalanceBot Card */}
          <Card className="shadow-md rounded-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-lg">
            <CardContent className="p-4 flex flex-col items-center text-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <h2 className="text-lg font-semibold mb-1">BalanceBot</h2>
              <p className="text-sm text-muted-foreground mb-3">Ask BalanceBot for workout advice.</p>
              <Button variant="outline" onClick={() => router.push('/balancebot')} className="w-full">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          {/* Fasting Calendar Card */}
          <Card className="shadow-md rounded-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-lg">
              <CardContent className="p-4 flex flex-col items-center text-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <h2 className="text-lg font-semibold mb-1">Fasting Tracker</h2>
                <p className="text-sm text-muted-foreground mb-3">Plan and track your fasting schedule.</p>
                <Button variant="outline" onClick={() => router.push('/fasting-calendar')} className="w-full">
                  View Calendar
                </Button>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
