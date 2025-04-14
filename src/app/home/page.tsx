'use client';

import ExerciseList from '@/components/ExerciseList';
import WorkoutBuilder from '@/components/WorkoutBuilder';
import ProgressTracker from '@/components/ProgressTracker';
import Profile from '@/components/Profile';
import PersonalizedWorkoutPlan from '@/components/PersonalizedWorkoutPlan';
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {ModeToggle} from "@/components/ModeToggle";
import {getWorkoutAdvice, WorkoutAdviceInput} from "@/ai/flows/workout-advice";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent} from "@/components/ui/card";
import {ScrollArea} from "@/components/ui/scroll-area";

export default function Home() {
  const router = useRouter();
  const [advice, setAdvice] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<
    { type: 'query' | 'advice'; text: string }[]
  >([]);

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

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setChatHistory(prev => [...prev, { type: 'query', text: query }]);

    const input: WorkoutAdviceInput = {query: query};
    const adviceResult = await getWorkoutAdvice(input);
    setAdvice(adviceResult.advice);
    setChatHistory(prev => [...prev, { type: 'advice', text: adviceResult.advice }]);
    setQuery('');
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold">BalanceBuddy</h1>
        <div className="flex items-center space-x-4">
          <ModeToggle/>
          <Avatar>
            <AvatarImage src="https://picsum.photos/50/50" alt="User Avatar"/>
            <AvatarFallback>BB</AvatarFallback>
          </Avatar>
          <Button variant="secondary" onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      <Tabs defaultValue="exercises" className="w-full">
        <TabsList>
          <TabsTrigger value="exercises">Exercises</TabsTrigger>
          <TabsTrigger value="builder">Workout Builder</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="balancebot">BalanceBot</TabsTrigger>
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
        <TabsContent value="balancebot">
          <div className="flex flex-col h-[500px]">
            <ScrollArea className="flex-grow">
              <Card className="mb-4">
                <CardContent className="p-4">
                  {chatHistory.map((item, index) => (
                    <div key={index}
                         className={`mb-2 ${item.type === 'query' ? 'text-right' : 'text-left'}`}>
                      <span
                        className={`inline-block p-2 rounded-lg ${item.type === 'query' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </ScrollArea>
            <form onSubmit={handleChatSubmit} className="mt-4">
              <div className="flex">
                <Textarea
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Ask me anything about workouts!"
                  className="flex-grow mr-2"
                />
                <Button type="submit">Send</Button>
              </div>
            </form>
          </div>
        </TabsContent>
        <TabsContent value="profile">
          <Profile/>
        </TabsContent>
      </Tabs>
    </div>
  );
}
