
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";


// Define the structure for a chat message
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
}

type ModelType = 'gemini' | 'gpt';

// Simple function to convert **bold** markdown to <strong> tags and ### to <h3>
const renderMarkdown = (text: string): { __html: string } => {
  let html = text;
  // Convert ### headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold my-2">$1</h3>');
  // Convert **bold** text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Convert lists (simple unordered list)
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^(<li>.*<\/li>\s*)+/gim, '<ul>$&</ul>'); // Wrap LIs in UL

  // Convert newlines to <br> tags for better spacing, but not inside <ul> or <h3>
  const blocks = html.split(/(<\/?(?:ul|h3)[^>]*>)/g);
  html = blocks.map((block, index) => {
    if (index % 2 === 0 && !block.match(/<\/?(?:ul|h3)[^>]*>/)) { 
      return block.split('\n').map(p => p.trim() ? `<p>${p.trim()}</p>` : '').join('');
    }
    return block;
  }).join('');
  html = html.replace(/<p><\/p>/g, ''); // Remove empty paragraphs

  return { __html: html };
};


const MAX_REQUESTS_PER_HOUR = 10;
const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const REQUEST_TIMESTAMPS_KEY_PREFIX = 'balanceBotRequestTimestamps_';

export default function BalanceBotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<ModelType>('gemini');

  const [requestTimestamps, setRequestTimestamps] = useState<number[]>([]);
  const [rateLimitMessage, setRateLimitMessage] = useState<string>('');
  const [canSendMessage, setCanSendMessage] = useState<boolean>(true);

  const getRequestTimestampsKey = () => `${REQUEST_TIMESTAMPS_KEY_PREFIX}${selectedModel}`;

  // Load request timestamps from localStorage on mount and when model changes
  useEffect(() => {
    const key = getRequestTimestampsKey();
    const storedTimestamps = localStorage.getItem(key);
    if (storedTimestamps) {
      try {
        const parsedTimestamps: number[] = JSON.parse(storedTimestamps);
        const now = Date.now();
        const validTimestamps = parsedTimestamps.filter(
          (ts) => now - ts < ONE_HOUR_IN_MS
        );
        setRequestTimestamps(validTimestamps);
        if (validTimestamps.length !== parsedTimestamps.length) {
            localStorage.setItem(key, JSON.stringify(validTimestamps));
        }
      } catch (e) {
        console.error("Failed to parse request timestamps from localStorage", e);
        localStorage.removeItem(key);
      }
    } else {
      setRequestTimestamps([]); // Reset if no key found for current model
    }
  }, [selectedModel]);

  // Effect to update rate limit status and message
  useEffect(() => {
    const now = Date.now();
    const recentTimestamps = requestTimestamps.filter(
      (timestamp) => now - timestamp < ONE_HOUR_IN_MS
    );
    const numRecentRequests = recentTimestamps.length;

    if (numRecentRequests >= MAX_REQUESTS_PER_HOUR) {
      setCanSendMessage(false);
      const oldestRecentRequestTime = recentTimestamps.length > 0 ? recentTimestamps[0] : now; 
      const expiryTime = oldestRecentRequestTime + ONE_HOUR_IN_MS;
      const timeToWaitMs = expiryTime - now;
      const minutesToWait = Math.max(1, Math.ceil(timeToWaitMs / (1000 * 60))); 
      setRateLimitMessage(
        `Rate limit reached for ${selectedModel.toUpperCase()}. Please try again in ~${minutesToWait} minute(s).`
      );
    } else {
      setCanSendMessage(true);
      setRateLimitMessage(
        `${MAX_REQUESTS_PER_HOUR - numRecentRequests} of ${MAX_REQUESTS_PER_HOUR} requests remaining for ${selectedModel.toUpperCase()} this hour.`
      );
    }
  }, [requestTimestamps, selectedModel]);


  const scrollToBottom = () => {
    if (scrollAreaViewportRef.current) {
      setTimeout(() => {
        if(scrollAreaViewportRef.current){
            const viewport = scrollAreaViewportRef.current.firstChild as HTMLDivElement;
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
      }, 0);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    if (!canSendMessage) {
        toast({
            variant: "destructive",
            title: "Rate Limit Exceeded",
            description: rateLimitMessage.includes('Rate limit reached') ? rateLimitMessage : `You have used all ${MAX_REQUESTS_PER_HOUR} requests for ${selectedModel.toUpperCase()} this hour.`,
        });
        return;
    }

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: trimmedInput };
    const historyForAPI = messages
        .filter(msg => msg.role !== 'error')
        .map(msg => ({ role: msg.role, content: msg.content }));

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setInput('');

    // Update request timestamps
    const now = Date.now();
    const key = getRequestTimestampsKey();
    const updatedTimestamps = [...requestTimestamps, now].filter(ts => now - ts < ONE_HOUR_IN_MS);
    setRequestTimestamps(updatedTimestamps);
    localStorage.setItem(key, JSON.stringify(updatedTimestamps));


    try {
      console.log("Sending to /api/chat:", { message: trimmedInput, history: historyForAPI, modelType: selectedModel });
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: trimmedInput, history: historyForAPI, modelType: selectedModel }),
      });

      console.log(`Received response status from /api/chat: ${response.status}`);

      if (!response.ok) {
        let errorMsg = `Error: ${response.status} ${response.statusText}`;
        let errorData: { error?: string } | null = null;
        try {
          errorData = await response.json();
          errorMsg = errorData?.error || errorMsg;
          if (errorMsg.includes("API key missing")) {
            errorMsg = `Server configuration error: ${selectedModel.toUpperCase()} API key is missing. Please check the .env file on the server.`;
          }
          console.error("API Error Response (Parsed JSON):", errorData);
        } catch (e) {
           console.warn("Failed to parse error response as JSON. Status:", response.status);
           try {
                const textResponse = await response.text();
                console.error("Non-JSON error response body:", textResponse.substring(0, 500));
                 errorMsg = `Server error (${response.status}) for ${selectedModel.toUpperCase()}: ${textResponse.substring(0,100) || 'Could not retrieve details.'}`;
            } catch (textError) {
                console.error("Failed to read error response body as text:", textError);
                errorMsg = `Server error (${response.status}) for ${selectedModel.toUpperCase()}: Could not read response body.`;
            }
        }
        console.error(`API Call Failed (Frontend) for ${selectedModel.toUpperCase()}:`, errorMsg);

        const errorChatMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'error',
          content: `Failed to get response from ${selectedModel.toUpperCase()}: ${errorMsg}`
        };
        setMessages(prev => [...prev, errorChatMsg]);

        toast({
            variant: "destructive",
            title: `Chatbot Error (${selectedModel.toUpperCase()})`,
            description: errorMsg,
        });

      } else {
        const data = await response.json();
        console.log("API Success Response:", data);

        if (data.response) {
          const assistantMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: data.response };
          setMessages(prev => [...prev, assistantMsg]);
        } else {
          console.error(`Unexpected successful API response structure from ${selectedModel.toUpperCase()}:`, data);
          const errorMsgContent = `Received an unexpected response from the ${selectedModel.toUpperCase()} assistant.`;
          const errorMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'error',
            content: errorMsgContent
          };
          setMessages(prev => [...prev, errorMsg]);
           toast({
                variant: "destructive",
                title: `Chatbot Error (${selectedModel.toUpperCase()})`,
                description: errorMsgContent,
            });
        }
      }

    } catch (error: any) {
       console.error(`Error sending chat message for ${selectedModel.toUpperCase()} (Network/Fetch):`, error);
       const errorMsgContent = `Sorry, failed to send message to ${selectedModel.toUpperCase()}. ${error.message || 'Please check your connection.'}`;
       const errorMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'error',
            content: errorMsgContent
        };
       setMessages(prev => [...prev, errorMsg]);
        toast({
            variant: "destructive",
            title: `Network Error (${selectedModel.toUpperCase()})`,
            description: error.message || "Could not connect to the chatbot service.",
        });
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
             <div className="pt-2">
                <Label htmlFor="model-select">Select AI Model:</Label>
                <Select
                    value={selectedModel}
                    onValueChange={(value) => setSelectedModel(value as ModelType)}
                    disabled={isLoading || messages.length > 0} // Disable if mid-conversation or loading
                >
                    <SelectTrigger id="model-select" className="w-full mt-1">
                        <SelectValue placeholder="Select AI Model" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="gemini">Gemini (Google)</SelectItem>
                        <SelectItem value="gpt">GPT (OpenAI)</SelectItem>
                    </SelectContent>
                </Select>
                 {messages.length > 0 && <p className="text-xs text-muted-foreground pt-1">Model cannot be changed mid-conversation. Clear chat or refresh to switch.</p>}
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-96 w-full rounded-md border p-4" viewportRef={scrollAreaViewportRef}>
            <div className="space-y-3">
                {messages.length === 0 && (
                <p className="text-center text-muted-foreground">Ask BalanceBot about fitness! Select a model above.</p>
                )}
                {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {msg.role !== 'user' && (
                            <Avatar className="h-8 w-8 border bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                               <AvatarImage
                                 src="https://cdn.glitch.global/baa5928e-6c09-4efd-bb8d-06e0fe6e4aac/BB.png?v=1729706784295"
                                 alt="BalanceBot Logo"
                                 className="object-cover"
                               />
                               <AvatarFallback>{msg.role === 'error' ? '⚠️' : 'BB'}</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={`rounded-xl px-4 py-2 text-sm shadow-sm break-words ${
                            msg.role === 'user'
                                ? 'bg-primary text-primary-foreground rounded-br-none'
                                : msg.role === 'error'
                                ? 'bg-destructive text-destructive-foreground italic rounded-bl-none'
                                : 'bg-muted text-muted-foreground rounded-bl-none'
                            } prose prose-sm max-w-none`} 
                           dangerouslySetInnerHTML={renderMarkdown(msg.content)}
                        />
                        {msg.role === 'user' && (
                            <Avatar className="h-8 w-8 border shrink-0">
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                </div>
                ))}
                {isLoading && (
                <div className="flex justify-start items-start gap-3 mb-3">
                        <Avatar className="h-8 w-8 border bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                            <AvatarImage
                             src="https://cdn.glitch.global/baa5928e-6c09-4efd-bb8d-06e0fe6e4aac/BB.png?v=1729706784295"
                             alt="BalanceBot Logo Typing"
                             className="object-cover"
                           />
                            <AvatarFallback>BB</AvatarFallback>
                        </Avatar>
                    <div className="bg-muted text-muted-foreground rounded-xl px-4 py-2 text-sm shadow-sm animate-pulse rounded-bl-none">
                        Typing...
                    </div>
                </div>
                )}
            </div>
          </ScrollArea>

          <div className="flex items-center gap-2 pt-4 border-t">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1"
              placeholder={!canSendMessage ? "Rate limit reached. Try again later." : "Ask BalanceBuddy anything..."}
              onKeyDown={e => {
                 if (e.key === 'Enter' && !isLoading && input.trim() && canSendMessage) {
                    e.preventDefault();
                    handleSend();
                 }
              }}
              disabled={isLoading || !canSendMessage}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim() || !canSendMessage}>
              {isLoading ? '...' : 'Send'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center pt-2">{rateLimitMessage}</p>
        </CardContent>
      </Card>
    </div>
  );
}

