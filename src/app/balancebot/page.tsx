'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Added AvatarImage
import { useToast } from "@/hooks/use-toast"; // Import useToast
import Image from 'next/image'; // Import Image

// Define the structure for a chat message
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error'; // Role can be user, bot (assistant), or error
  content: string;
}

export default function BalanceBotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null); // Ref for the scrollable chat area content
  const { toast } = useToast(); // Initialize toast

  // Function to scroll to the bottom of the chat messages
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      // Use setTimeout to ensure scrolling happens after the DOM updates
      setTimeout(() => {
        if(scrollAreaRef.current){
             scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 0);
    }
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return; // Prevent sending empty or duplicate messages while loading

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: trimmedInput };
    // Prepare chat history in the format the new API expects (role and content)
    const historyForAPI = messages
        .filter(msg => msg.role !== 'error') // Exclude error messages from history
        .map(msg => ({ role: msg.role === 'assistant' ? 'assistant' : 'user', content: msg.content }));

    setMessages(prev => [...prev, userMsg]); // Add user message to UI immediately
    setIsLoading(true);
    setInput(''); // Clear input field

    try {
      // Call the API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the current user message and the formatted history
        body: JSON.stringify({ message: trimmedInput, history: historyForAPI }),
      });

      // Check if the response is okay (status code 200-299)
      if (!response.ok) {
        let errorMsg = `Error: ${response.status} ${response.statusText}`; // Default error message
        try {
          // Attempt to parse the JSON error response *from our API route*
          const errorData = await response.json();
          errorMsg = errorData.error || errorMsg; // Use specific error from our API if available
        } catch (e) {
          // If response.json() fails, the error body wasn't JSON
          console.warn("Failed to parse error response as JSON. Status:", response.status);
           try {
                // Attempt to read the response as text to see if it's HTML or something else
                const textResponse = await response.text();
                console.error("Non-JSON error response body:", textResponse);
                // You might want to display a generic error or part of the textResponse if appropriate
                // errorMsg = `Server error: ${response.status}`; // Keep it simple for the user
            } catch (textError) {
                console.error("Failed to read error response body as text:", textError);
            }
        }
        console.error("API Call Failed:", errorMsg);
        // Display error in chat and toast
        const errorChatMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'error',
          content: `Failed to get response: ${errorMsg}`
        };
        setMessages(prev => [...prev, errorChatMsg]);
        toast({
            variant: "destructive",
            title: "Chatbot Error",
            description: errorMsg,
        });
        // No need to throw here, handled by adding error message

      } else {
        // Parse the JSON response from the API (if response.ok)
        const data = await response.json();

        // Check if the response contains the expected 'response' field
        if (data.response) {
          const assistantMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: data.response };
          setMessages(prev => [...prev, assistantMsg]); // Add assistant message to UI
        } else {
          // Handle cases where the API response structure is unexpected (but status was ok)
          console.error("Unexpected successful API response structure:", data);
          const errorMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'error',
            content: 'Received an unexpected response from the assistant.'
          };
          setMessages(prev => [...prev, errorMsg]);
           toast({
                variant: "destructive",
                title: "Chatbot Error",
                description: "Received an unexpected response format.",
            });
        }
      }

    } catch (error: any) {
       // Catch network errors or other exceptions during fetch/processing
       console.error("Error sending chat message:", error);
       const errorMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'error',
            content: `Sorry, failed to send message. ${error.message || 'Please check your connection.'}` // Include error message
        };
       setMessages(prev => [...prev, errorMsg]);
        toast({
            variant: "destructive",
            title: "Network Error",
            description: error.message || "Could not connect to the chatbot service.",
        });
    } finally {
      setIsLoading(false); // Ensure loading state is turned off
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
          <ScrollArea className="h-96 w-full rounded-md border p-4" >
             {/* We need a div inside ScrollArea to correctly get scrollHeight */}
            <div ref={scrollAreaRef} className="space-y-3">
                {messages.length === 0 && (
                <p className="text-center text-muted-foreground">Ask BalanceBot about fitness!</p>
                )}
                {messages.map((msg) => (
                <div key={msg.id} className={`mb-3 flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role !== 'user' && (
                        <Avatar className="h-8 w-8 border bg-primary text-primary-foreground flex items-center justify-center">
                           {/* Use AvatarImage for the logo */}
                           <AvatarImage
                             src="https://cdn.glitch.global/baa5928e-6c09-4efd-bb8d-06e0fe6e4aac/BB.png?v=1729706784295"
                             alt="BalanceBot Logo"
                             className="object-cover" // Ensure image covers the avatar area
                           />
                           {/* Fallback if image fails */}
                           <AvatarFallback>{msg.role === 'error' ? '⚠️' : 'BB'}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm shadow-sm break-words whitespace-pre-wrap ${ // Added whitespace-pre-wrap
                        msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : msg.role === 'error'
                            ? 'bg-destructive text-destructive-foreground italic rounded-bl-none'
                            : 'bg-muted text-muted-foreground rounded-bl-none' // Standard bot message
                        }`}
                    >
                    {/* Basic rendering of content, potential markdown could be handled here */}
                    {msg.content}
                    </div>
                    {msg.role === 'user' && (
                        <Avatar className="h-8 w-8 border">
                            <AvatarFallback>U</AvatarFallback> {/* Placeholder for User */}
                        </Avatar>
                    )}
                </div>
                ))}
                {isLoading && (
                <div className="flex justify-start items-start gap-3 mb-3">
                        <Avatar className="h-8 w-8 border bg-primary text-primary-foreground flex items-center justify-center">
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
            </div> {/* End of scrollable content div */}
          </ScrollArea>

           {/* Input Area */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1"
              placeholder="Ask me anything..."
              onKeyDown={e => {
                 if (e.key === 'Enter' && !isLoading && input.trim()) {
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
