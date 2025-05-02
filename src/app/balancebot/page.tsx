
'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
// Removed AI import: import { generateResponse } from "@/ai/flows/generate-response";

// Define the structure for chat messages (consistent with UI)
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'info'; // Use 'assistant' for AI, 'info' for messages from the app
  content: string;
  timestamp: number;
}


export default function BalanceBotPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  // Initialize with an informational message
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
        id: crypto.randomUUID(),
        role: 'info',
        content: 'BalanceBot is currently unavailable. This feature is under development.',
        timestamp: Date.now(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false); // Keep loading state (though unused for now)
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Placeholder submit handler - prevents sending messages
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Do nothing as AI is disabled
    console.log("Chat submit prevented - AI disabled.");
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
            {chatHistory.map((item) => (
              <div key={item.id} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {(item.role === 'assistant' || item.role === 'info') && (
                  <Avatar className="mr-2 h-8 w-8 self-start">
                    <AvatarFallback className="bg-primary text-primary-foreground">BB</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2 text-sm shadow-sm break-words ${
                    item.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : item.role === 'info'
                      ? 'bg-secondary text-secondary-foreground italic' // Style for info messages
                      : 'bg-muted text-muted-foreground' // Style for assistant (though none will be generated)
                  }`}
                >
                  {/* Basic formatting (replace newlines with breaks) */}
                  {item.content.split('\n').map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
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
            {/* Keep loading indicator structure if needed later */}
            {/* {isLoading && ( ... )} */}
          </div>
          <form onSubmit={handleChatSubmit} className="mt-auto pt-4 border-t border-border">
            <div className="flex space-x-2 items-center">
              <Textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="BalanceBot is currently unavailable..." // Updated placeholder
                className="flex-grow rounded-xl resize-none"
                rows={1}
                disabled={true} // Disable the textarea
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // handleChatSubmit(e as unknown as React.FormEvent); // Keep commented out
                  }
                }}
              />
              <Button type="submit" className="rounded-xl" disabled={true}> {/* Disable the send button */}
                Send
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
