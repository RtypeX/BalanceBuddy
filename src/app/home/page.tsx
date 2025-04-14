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
import {getWorkoutAdvice, WorkoutAdviceInput} from "@/ai/flows/workout-advice";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent} from "@/components/ui/card";
import {ScrollArea} from "@/components/ui/scroll-area";
import {cn} from "@/lib/utils";

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

  useEffect(() => {
    // Scroll to bottom when chat history changes
    chatHistoryRef.current?.scrollTo({
      top: chatHistoryRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [chatHistory]);


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
    setChatHistory(prev => [...prev, { type: 'advice', text: adviceResult.advice }]);
    setQuery('');
  };

  return (
    <div className="flex flex-col h-screen bg-ios-light-background dark:bg-ios-dark-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-ios-light-gray dark:bg-ios-dark-gray shadow-md">
        <h1 className="text-2xl font-semibold text-ios-blue dark:text-ios-blue">BalanceBuddy</h1>
        <div className="flex items-center space-x-4">
          <ModeToggle/>
          <Avatar>
            <AvatarImage src="https://picsum.photos/50/50" alt="User Avatar"/>
            <AvatarFallback>BB</AvatarFallback>
          </Avatar>
          <Button variant="secondary" onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="exercises" className="flex-1 flex flex-col">
        <TabsList className="flex justify-around bg-ios-light-gray dark:bg-ios-dark-gray p-2 rounded-full">
          <TabsTrigger value="exercises"
                       className="data-[state=active]:bg-ios-blue data-[state=active]:text-white rounded-full px-4 py-2 font-semibold transition-colors">
            Exercises
          </TabsTrigger>
          <TabsTrigger value="builder"
                       className="data-[state=active]:bg-ios-blue data-[state=active]:text-white rounded-full px-4 py-2 font-semibold transition-colors">
            Workout
          </TabsTrigger>
          <TabsTrigger value="progress"
                       className="data-[state=active]:bg-ios-blue data-[state=active]:text-white rounded-full px-4 py-2 font-semibold transition-colors">
            Progress
          </TabsTrigger>
          <TabsTrigger value="balancebot"
                       className="data-[state=active]:bg-ios-blue data-[state=active]:text-white rounded-full px-4 py-2 font-semibold transition-colors">
            BalanceBot
          </TabsTrigger>
          <TabsTrigger value="profile"
                       className="data-[state=active]:bg-ios-blue data-[state=active]:text-white rounded-full px-4 py-2 font-semibold transition-colors">
            Profile
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="flex-1 p-4 overflow-y-auto">
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
              <div ref={chatHistoryRef} className="flex-grow overflow-y-auto">
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
              </div>
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
        </div>
      </Tabs>
    </div>
  );
}
