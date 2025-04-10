'use client';

import ExerciseList from '@/components/ExerciseList';
import WorkoutBuilder from '@/components/WorkoutBuilder';
import ProgressTracker from '@/components/ProgressTracker';
import Profile from '@/components/Profile';
import PersonalizedWorkoutPlan from '@/components/PersonalizedWorkoutPlan';
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useRouter} from "next/navigation";
import {useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold">BalanceBuddy</h1>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="https://picsum.photos/50/50" alt="User Avatar"/>
            <AvatarFallback>BB</AvatarFallback>
          </Avatar>
          <Button variant="secondary" onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      <Tabs defaultValue="exercises" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="builder">Workout Builder</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="ai">AI Workout Plan</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="exercises">
          <ExerciseList/>
        </TabsContent>
        <TabsContent value="builder">
          <WorkoutBuilder/>
        </TabsContent>
        <TabsContent value="progress">
          <ProgressTracker/>
        </TabsContent>
        <TabsContent value="ai">
          <PersonalizedWorkoutPlan/>
        </TabsContent>
        <TabsContent value="profile">
          <Profile/>
        </TabsContent>
      </Tabs>
    </div>
  );
}

