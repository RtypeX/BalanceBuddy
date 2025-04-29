'use client';

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getWorkoutAdvice, WorkoutAdviceInput } from "@/ai/flows/workout-advice";
import { useRouter } from "next/navigation";

const BalanceBotPage = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<
    { type: 'query' | 'advice'; text: string }[]
  >([]);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

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
    <div className="flex flex-col items-center justify-start min-h-screen py-2">
      <div className="flex items-center justify-between p-4 w-full max-w-md">
        <h1 className="text-2xl font-semibold">BalanceBot</h1>
        <Button variant="secondary" onClick={() => router.push('/home')}>Back to Home</Button>
      </div>
      <Card className="w-full max-w-md rounded-lg shadow-md">
        <CardContent className="p-6">
          <div ref={chatHistoryRef} className="space-y-3 max-h-64 overflow-y-auto mb-4">
            {chatHistory.map((item, index) => (
              <div key={index} className={item.type === 'query' ? 'text-right' : 'text-left'}>
                <span
                  className={`inline-block p-3 rounded-xl ${item.type === 'query' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'}`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
          <form onSubmit={handleChatSubmit} className="mt-2">
            <div className="flex space-x-2">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask me anything about workouts..."
                className="flex-grow rounded-xl"
              />
              <Button type="submit" className="rounded-xl">Send</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceBotPage;
