
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
import { Card, CardContent } from "@/components/ui/card"; // Import Card and CardContent
import { BarChart3, Dumbbell, FileText, Bot, Calendar, Weight, Utensils, Bed, SettingsIcon } from 'lucide-react'; // Removed User, Added Bed and SettingsIcon
import { getFirebase } from '@/lib/firebaseClient'; // Import getFirebase
import { signOut } from 'firebase/auth'; // Import signOut

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    // Keep demo login behavior for now
    // if (!user) {
    //   router.push('/');
    // }
  }, [router]);

  const clearAllUserData = () => {
    // Clear all relevant localStorage items
    localStorage.removeItem('user');
    localStorage.removeItem('profileData');
    localStorage.removeItem('fastingLog');
    localStorage.removeItem('fastingStartTime');
    localStorage.removeItem('fastingGoalHours');
    localStorage.removeItem('workoutLogs');
    localStorage.removeItem('weightLog');
    localStorage.removeItem('weightGoal');
    localStorage.removeItem('startWeight');
    localStorage.removeItem('nutritionLog');
    localStorage.removeItem('sleepLog');
    localStorage.removeItem('balanceBotSubscriptionStatus');
    localStorage.removeItem('balanceBotNotificationPreferences');
    localStorage.removeItem('balanceBotRequestTimestamps_Gemini');
    localStorage.removeItem('balanceBotSavedChats');
    // Add any other keys used by your application features
    // e.g., localStorage.removeItem('onboardingFormData');
    // e.g., localStorage.removeItem('onboardingPage');
    // e.g., localStorage.removeItem('onboardingUserEmail');
  };


  const handleLogout = async () => {
    const { auth } = getFirebase();
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out from Firebase:", error);
      // Still proceed with local cleanup
    }
    clearAllUserData();
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
          data-ai-hint="logo fitness"
        />
        <h1 className="text-2xl font-semibold text-primary">BalanceBuddy</h1> {/* Use primary color */}
        <div className="flex items-center space-x-4">
          {/* ModeToggle moved to profile page/settings page */}
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
              <Dumbbell className="h-12 w-12 mb-2 text-primary" /> {/* Icon */}
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
               <FileText className="h-12 w-12 mb-2 text-primary" /> {/* Icon */}
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
             <BarChart3 className="h-12 w-12 mb-2 text-primary" /> {/* Icon */}
              <h2 className="text-lg font-semibold mb-1">Progress Tracker</h2>
              <p className="text-sm text-muted-foreground mb-3">Track your fitness journey and stay motivated.</p>
              <Button variant="outline" onClick={() => router.push('/progress-tracker')} className="w-full">
                View Progress
              </Button>
            </CardContent>
          </Card>

          {/* BalanceBot Card */}
          <Card className="shadow-md rounded-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-lg">
            <CardContent className="p-4 flex flex-col items-center text-center">
               <Bot className="h-12 w-12 mb-2 text-primary" />
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
               <Calendar className="h-12 w-12 mb-2 text-primary" /> {/* Icon */}
                <h2 className="text-lg font-semibold mb-1">Fasting Tracker</h2>
                <p className="text-sm text-muted-foreground mb-3">Plan and track your fasting schedule.</p>
                <Button variant="outline" onClick={() => router.push('/fasting-calendar')} className="w-full">
                  View Calendar
                </Button>
              </CardContent>
            </Card>

           {/* Weight Tracker Card */}
          <Card className="shadow-md rounded-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-lg">
              <CardContent className="p-4 flex flex-col items-center text-center">
               <Weight className="h-12 w-12 mb-2 text-primary" /> {/* Icon */}
                <h2 className="text-lg font-semibold mb-1">Weight Tracker</h2>
                <p className="text-sm text-muted-foreground mb-3">Log your weight and track progress.</p>
                <Button variant="outline" onClick={() => router.push('/weight-tracker')} className="w-full">
                  Track Weight
                </Button>
              </CardContent>
            </Card>

           {/* Nutrition Tracker Card */}
          <Card className="shadow-md rounded-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-lg">
              <CardContent className="p-4 flex flex-col items-center text-center">
               <Utensils className="h-12 w-12 mb-2 text-primary" /> {/* Icon */}
                <h2 className="text-lg font-semibold mb-1">Nutrition Tracker</h2>
                <p className="text-sm text-muted-foreground mb-3">Log your meals and track macros.</p>
                <Button variant="outline" onClick={() => router.push('/nutrition-tracker')} className="w-full">
                  Track Nutrition
                </Button>
              </CardContent>
            </Card>

            {/* Sleep Tracker Card */}
            <Card className="shadow-md rounded-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-lg">
              <CardContent className="p-4 flex flex-col items-center text-center">
               <Bed className="h-12 w-12 mb-2 text-primary" /> {/* Icon */}
                <h2 className="text-lg font-semibold mb-1">Sleep Tracker</h2>
                <p className="text-sm text-muted-foreground mb-3">Log your sleep and track patterns.</p>
                <Button variant="outline" onClick={() => router.push('/sleep-tracker')} className="w-full">
                  Track Sleep
                </Button>
              </CardContent>
            </Card>

          {/* Settings Card - New Card */}
          <Card className="shadow-md rounded-lg overflow-hidden transition-transform hover:scale-105 hover:shadow-lg">
            <CardContent className="p-4 flex flex-col items-center text-center">
               <SettingsIcon className="h-12 w-12 mb-2 text-primary" /> {/* Icon */}
              <h2 className="text-lg font-semibold mb-1">Settings</h2>
              <p className="text-sm text-muted-foreground mb-3">App preferences, billing, and account.</p>
              <Button variant="outline" onClick={() => router.push('/settings')} className="w-full">
                Go to Settings
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
