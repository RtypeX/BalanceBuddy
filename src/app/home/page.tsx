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
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent} from "@/components/ui/card";
import Image from 'next/image';
import FastingCalendar from "@/components/FastingCalendar";
import Link from 'next/link';
import BalanceBotPage from "@/app/balancebot/page";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="flex flex-col h-screen bg-green-100 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-green-200 dark:bg-gray-800 shadow-md">
        <Image
          src="https://cdn.glitch.global/baa5928e-6c09-4efd-bb8d-06e0fe6e4aac/BB.png?v=1729706784295"
          alt="BalanceBuddy Logo"
          width={75}
          height={75}
          className="mr-2"
        />
        <h1 className="text-2xl font-semibold text-green-700 dark:text-green-300">BalanceBuddy</h1>
        <div className="flex items-center space-x-4">
          <ModeToggle/>
          <Avatar>
            <AvatarImage src="https://picsum.photos/50/50" alt="User Avatar"/>
            <AvatarFallback>BB</AvatarFallback>
          </Avatar>
          <Button variant="secondary" onClick={() => router.push('/')}>Logout</Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 flex flex-col space-y-4">
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Exercise List Card */}
          <Card className="shadow-md rounded-lg overflow-hidden">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Exercises</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Browse our extensive exercise library.</p>
              <Button variant="outline" onClick={() => router.push('/exercises')} className="mt-4 w-full">
                View Exercises
              </Button>
            </CardContent>
          </Card>

          {/* Workout Builder Card */}
          <Card className="shadow-md rounded-lg overflow-hidden">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Workout Builder</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create your personalized workout routines.</p>
              <Button variant="outline" onClick={() => router.push('/workout-builder')} className="mt-4 w-full">
                Build Workout
              </Button>
            </CardContent>
          </Card>

          {/* Progress Tracker Card */}
          <Card className="shadow-md rounded-lg overflow-hidden">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Progress Tracker</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track your fitness journey and stay motivated.</p>
              <Button variant="outline" onClick={() => router.push('/progress-tracker')} className="mt-4 w-full">
                View Progress
              </Button>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card className="shadow-md rounded-lg overflow-hidden">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Profile</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your profile and settings.</p>
              <Button variant="outline" onClick={() => router.push('/profile')} className="mt-4 w-full">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
          {/* BalanceBot Card */}
          <Card className="shadow-md rounded-lg overflow-hidden">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">BalanceBot</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">BalanceBot is here to help you with workouts.</p>
              <Button variant="outline" onClick={() => router.push('/balancebot')} className="mt-4 w-full">
                Start Chat
              </Button>
            </CardContent>
          </Card>
            {/* Fasting Calendar Card */}
            <Card className="shadow-md rounded-lg overflow-hidden">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-2">Fasting Calendar</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Plan your fasting schedule.</p>
                <Button variant="outline" onClick={() => router.push('/fasting-calendar')} className="mt-4 w-full">
                  View Calendar
                </Button>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
