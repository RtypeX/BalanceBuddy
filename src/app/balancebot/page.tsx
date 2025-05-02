
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { generateResponse } from '@/ai/flows/generate-response';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input"; // Using Input instead of Textarea for single line
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Message {
  role: 'user' | 'bot' | 'error';
  content: string;
}

export default function BalanceBotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    const currentInput = input; // Capture input before clearing
    setInput(''); // Clear input immediately

    try {
      const { response } = await generateResponse({ message: currentInput });
      setMessages(prev => [...prev, { role: 'bot', content: response }]);
    } catch (error){
       console.error("Error generating response:", error);
      setMessages(prev => [...prev, { role: 'error', content: 'Sorry, failed to get response.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-6 px-4">
       <div className="flex items-center justify-between p-4 w-full max-w-xl mb-4">
          <h1 className="text-2xl font-semibold">BalanceBot</h1>
          <Button variant="secondary" onClick={() => router.push('/home')}>
            Back to Home
          </Button>
      </div>

      <Card className="w-full max-w-xl shadow-md rounded-lg">
        <CardHeader>
            <CardTitle>Chat with BalanceBot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           {/* Chat Area */}
          <ScrollArea className="h-96 w-full rounded-md border p-4" ref={scrollAreaRef}>
            {messages.length === 0 && (
              <p className="text-center text-muted-foreground">Start chatting with BalanceBot!</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm shadow-sm break-words ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : msg.role === 'error'
                        ? 'bg-destructive text-destructive-foreground italic'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                   {msg.content}
                 </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start mb-3">
                   <div className="bg-muted text-muted-foreground rounded-xl px-4 py-2 text-sm shadow-sm animate-pulse">
                       Typing...
                   </div>
               </div>
            )}
          </ScrollArea>

           {/* Input Area */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1"
              placeholder="Ask me anything..."
              onKeyDown={e => {
                 if (e.key === 'Enter' && !isLoading) {
                    e.preventDefault(); // Prevent form submission/newline
                    handleSend();
                 }
              }}
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? '...' : 'Send'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
