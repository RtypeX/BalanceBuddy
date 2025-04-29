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
    <div>
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-semibold">BalanceBot</h1>
        <Button variant="secondary" onClick={() => router.push('/home')}>Back to Home</Button>
      </div>
      <Card className="w-full max-w-md mx-auto">
        <CardContent>
          <div ref={chatHistoryRef} className="space-y-2 max-h-64 overflow-y-auto">
            {chatHistory.map((item, index) => (
              <div key={index} className={item.type === 'query' ? 'text-right' : 'text-left'}>
                <span
                  className={`inline-block p-2 rounded-lg ${item.type === 'query' ? 'bg-blue-200' : 'bg-gray-200'}`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
          <form onSubmit={handleChatSubmit} className="mt-4">
            <div className="flex">
              <Textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask me anything about workouts..."
                className="flex-grow mr-2"
              />
              <Button type="submit">Send</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceBotPage;
