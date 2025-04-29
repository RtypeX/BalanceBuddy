'use client';

import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";
import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";

export default function BalanceBotPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<
    { type: 'query' | 'advice'; text: string }[]
  >([]);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom of chat on component mount and when new messages are added
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setChatHistory(prev => [...prev, {type: 'query', text: query}]);
    setQuery('');
    try {
      const response = await fetch('/api/chat-with-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({message: query}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.advice) {
        setChatHistory(prev => [...prev, {type: 'advice', text: data.advice}]);
      } else {
        setChatHistory(prev => [...prev, {
          type: 'advice',
          text: 'Error generating advice. Please try again.',
        }]);
      }
    } catch (error: any) {
      console.error("Failed to fetch workout advice:", error);
      setChatHistory(prev => [...prev, {
        type: 'advice',
        text: 'Error generating advice. Please try again later.',
      }]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-2">
      <div className="flex items-center justify-between p-4 w-full max-w-md">
        <h1 className="text-2xl font-semibold">BalanceBot</h1>
        <Button variant="secondary" onClick={() => router.push('/home')}>
          Back to Home
        </Button>
      </div>
      <Card className="w-full max-w-md rounded-lg shadow-md">
        <CardContent className="p-6">
          <div ref={chatHistoryRef} className="space-y-3 max-h-96 overflow-y-auto mb-4">
            {chatHistory.map((item, index) => (
              <div key={index} className="flex items-start">
                {item.type === 'advice' ? (
                  <Avatar className="mr-2 h-8 w-8">
                    <AvatarFallback>BB</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="mr-2 h-8 w-8"></div>
                )}
                <div
                  className={`rounded-xl px-4 py-2 ${
                    item.type === 'query' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {item.text}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="mt-2">
            <div className="flex space-x-2">
              <Textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask me anything about workouts..."
                className="flex-grow rounded-xl"
              />
              <Button type="submit" className="rounded-xl">
                Send
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
