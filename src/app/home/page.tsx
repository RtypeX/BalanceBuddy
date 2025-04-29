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
import {getWorkoutAdvice, WorkoutAdviceInput} from "@/ai/flows/workout-advice";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<
    { type: 'query' | 'advice'; text: string }[]
  >([]);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/');
    }
  }, [router]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setChatHistory(prev => [...prev, { type: 'query', text: query }]);

    const input: WorkoutAdviceInput = { query: query };
    const adviceResult = await getWorkoutAdvice(input);

    if (adviceResult && adviceResult.advice) {
      setChatHistory(prev => [...prev, { type: 'advice', text: adviceResult.advice }]);
    } else {
      setChatHistory(prev => [...prev, { type: 'advice', text: 'Error generating advice. Please try again.' }]);
    }

    setQuery('');
    // Scroll to bottom of chat
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-ios-light-background dark:bg-ios-dark-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-ios-light-gray dark:bg-ios-dark-gray shadow-md">
        <Image
          src="https://cdn.glitch.global/baa5928e-6c09-4efd-bb8d-06e0fe6e4aac/BB.png?v=1729706784295"
          alt="BalanceBuddy Logo"
          width={75}
          height={75}
          className="mr-2"
        />
        <h1 className="text-2xl font-semibold text-ios-blue dark:text-ios-blue">BalanceBuddy</h1>
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
              <Button variant="outline" onClick={() => router.push('/home?tab=exercises')} className="mt-4 w-full">
                View Exercises
              </Button>
            </CardContent>
          </Card>

          {/* Workout Builder Card */}
          <Card className="shadow-md rounded-lg overflow-hidden">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Workout Builder</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Create your personalized workout routines.</p>
              <Button variant="outline" onClick={() => router.push('/home?tab=builder')} className="mt-4 w-full">
                Build Workout
              </Button>
            </CardContent>
          </Card>

          {/* Progress Tracker Card */}
          <Card className="shadow-md rounded-lg overflow-hidden">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Progress Tracker</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track your fitness journey and stay motivated.</p>
              <Button variant="outline" onClick={() => router.push('/home?tab=progress')} className="mt-4 w-full">
                View Progress
              </Button>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card className="shadow-md rounded-lg overflow-hidden">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Profile</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your profile and settings.</p>
              <Button variant="outline" onClick={() => router.push('/home?tab=profile')} className="mt-4 w-full">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
          {/* BalanceBot Card */}
          <Card className="shadow-md rounded-lg overflow-hidden">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">BalanceBot</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">BalanceBot is here to help you with workouts.</p>
              <Button variant="outline" onClick={() => router.push('/home?tab=balancebot')} className="mt-4 w-full">
                Start Chat
              </Button>
            </CardContent>
          </Card>
            {/* Fasting Calendar Card */}
            <Card className="shadow-md rounded-lg overflow-hidden">
              <CardContent className="p-4">
                <h2 className="text-lg font-semibold mb-2">Fasting Calendar</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Plan your fasting schedule.</p>
                <FastingCalendar/>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
