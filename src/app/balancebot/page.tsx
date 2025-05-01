'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ChatMessage } from "@/ai/flows/generate-response"; // Import the type

export default function BalanceBotPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  // Use the ChatMessage interface for state
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessageContent = query.trim();
    if (!userMessageContent || isLoading) return;

    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userMessageContent,
      timestamp: Date.now(),
    };

    // Add user message to history immediately for UI update
    const updatedHistory = [...chatHistory, newUserMessage];
    setChatHistory(updatedHistory);
    setQuery('');
    setIsLoading(true);

    try {
      // Send the *entire updated history* to the API
      const response = await fetch('/api/chat-with-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history: updatedHistory }), // Send history
      });

      setIsLoading(false); // Stop loading indicator once response starts

      if (!response.ok) {
        // Try to get error message from response body
        let errorData;
        try {
            errorData = await response.json();
        } catch (parseError) {
            // Ignore if response body isn't valid JSON
            console.error("Error parsing error response:", parseError);
        }
        const errorMessage = errorData?.error || `HTTP error! status: ${response.status}`;
        console.error("API Error:", errorMessage);
        const assistantErrorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Sorry, I encountered an error: ${errorMessage}. Please try again later.`,
          timestamp: Date.now(),
        };
        setChatHistory(prev => [...prev, assistantErrorMessage]);
        return; // Stop processing on error
      }

      const data = await response.json();

      if (data.response) {
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.response,
          timestamp: Date.now(),
        };
        setChatHistory(prev => [...prev, assistantMessage]);
      } else {
        // Handle cases where response is ok but data is missing 'response'
        console.warn("Received OK response but no 'response' field in data:", data);
        const assistantErrorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Sorry, I received an unexpected response format. Please try again.',
          timestamp: Date.now(),
        };
        setChatHistory(prev => [...prev, assistantErrorMessage]);
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error("Error submitting chat:", error);
      const assistantErrorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'An unexpected error occurred while sending your message. Please check your connection or try again later.',
        timestamp: Date.now(),
      };
      setChatHistory(prev => [...prev, assistantErrorMessage]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-2 bg-background">
      <div className="flex items-center justify-between p-4 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-foreground">BalanceBot</h1>
        <Button variant="secondary" onClick={() => router.push('/home')}>
          Back to Home
        </Button>
      </div>
      <Card className="w-full max-w-md rounded-lg shadow-md bg-card">
        <CardContent className="p-6 flex flex-col h-[60vh]">
          <div ref={chatHistoryRef} className="flex-grow space-y-4 overflow-y-auto mb-4 pr-2">
            {chatHistory.map((item) => ( // Use item.id for key
              <div key={item.id} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {item.role === 'assistant' && (
                  <Avatar className="mr-2 h-8 w-8 self-start">
                    <AvatarFallback className="bg-primary text-primary-foreground">BB</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2 text-sm shadow-sm break-words ${ // Added break-words
                    item.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {/* Basic markdown-like formatting (replace newlines with breaks) */}
                  {item.content.split('\n').map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i < arr.length - 1 && <br />} {/* Add <br> only if not the last line */}
                    </span>
                  ))}
                </div>
                {item.role === 'user' && (
                  <Avatar className="ml-2 h-8 w-8 self-start">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <Avatar className="mr-2 h-8 w-8 self-start">
                  <AvatarFallback className="bg-primary text-primary-foreground">BB</AvatarFallback>
                </Avatar>
                <div className="rounded-xl px-4 py-2 bg-muted text-muted-foreground italic text-sm shadow-sm">
                  BalanceBot is thinking...
                </div>
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="mt-auto pt-4 border-t border-border">
            <div className="flex space-x-2 items-center">
              <Textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask BalanceBot..."
                className="flex-grow rounded-xl resize-none"
                rows={1}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as React.FormEvent);
                  }
                }}
              />
              <Button type="submit" className="rounded-xl" disabled={isLoading || !query.trim()}>
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Send'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
