
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image'; // Import Image

// Define the structure for a chat message
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error'; // Role can be user, bot (assistant), or error
  content: string;
}

// Simple function to convert **bold** markdown to <strong> tags and ### to <h3>
const renderMarkdown = (text: string): { __html: string } => {
  let html = text;
  // Replace ### Heading with <h3>Heading</h3>
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  // Replace **text** with <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return { __html: html }; // Return object for dangerouslySetInnerHTML
};


export default function BalanceBotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null); // Ref for the ScrollArea viewport
  const { toast } = useToast(); // Initialize toast

  // Function to scroll to the bottom of the chat messages
  const scrollToBottom = () => {
    if (scrollAreaViewportRef.current) {
      // Use setTimeout to ensure scrolling happens after the DOM updates
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
      console.log("Sending to /api/chat:", { message: trimmedInput, history: historyForAPI }); // Log payload
      // Call the API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the current user message and the formatted history
        body: JSON.stringify({ message: trimmedInput, history: historyForAPI }),
      });

      console.log(`Received response status from /api/chat: ${response.status}`); // Log status

      // Check if the response is okay (status code 200-299)
      if (!response.ok) {
        let errorMsg = `Error: ${response.status} ${response.statusText}`; // Default error message
        let errorData: { error?: string } | null = null;
        try {
          // Attempt to parse the JSON error response *from our API route*
          errorData = await response.json();
          errorMsg = errorData?.error || errorMsg; // Use specific error from our API if available
          console.error("API Error Response (Parsed JSON):", errorData); // Log the structured error
        } catch (e) {
           // If response.json() fails, the error body wasn't JSON
           console.warn("Failed to parse error response as JSON. Status:", response.status);
           try {
                // Attempt to read the response as text to see if it's HTML or something else
                const textResponse = await response.text(); // Note: This consumes the body again if json() failed early
                console.error("Non-JSON error response body:", textResponse);
                // Display a generic error or part of the textResponse if appropriate
                // Avoid showing potentially large HTML responses directly to the user
                 errorMsg = `Server error (${response.status}): Could not retrieve details. Check server logs.`;
            } catch (textError) {
                console.error("Failed to read error response body as text:", textError);
                errorMsg = `Server error (${response.status}): Could not read response body.`;
            }
        }
        console.error("API Call Failed (Frontend):", errorMsg); // Log the final determined error message

        // Display error in chat
        const errorChatMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'error',
          content: `Failed to get response: ${errorMsg}`
        };
        setMessages(prev => [...prev, errorChatMsg]);

        // Show toast for user feedback
        toast({
            variant: "destructive",
            title: "Chatbot Error",
            description: errorMsg, // Show the detailed error in the toast
        });
        // No need to throw here, handled by adding error message

      } else {
        // Parse the JSON response from the API (if response.ok)
        const data = await response.json();
        console.log("API Success Response:", data); // Log success data

        // Check if the response contains the expected 'response' field
        if (data.response) {
          const assistantMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: data.response };
          setMessages(prev => [...prev, assistantMsg]); // Add assistant message to UI
        } else {
          // Handle cases where the API response structure is unexpected (but status was ok)
          console.error("Unexpected successful API response structure:", data);
          const errorMsgContent = 'Received an unexpected response from the assistant.';
          const errorMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'error',
            content: errorMsgContent
          };
          setMessages(prev => [...prev, errorMsg]);
           toast({
                variant: "destructive",
                title: "Chatbot Error",
                description: errorMsgContent,
            });
        }
      }

    } catch (error: any) {
       // Catch network errors or other exceptions during fetch/processing
       console.error("Error sending chat message (Network/Fetch):", error);
       const errorMsgContent = `Sorry, failed to send message. ${error.message || 'Please check your connection.'}`;
       const errorMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'error',
            content: errorMsgContent
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
          <ScrollArea className="h-96 w-full rounded-md border p-4" viewportRef={scrollAreaViewportRef}>
            {/* Content automatically rendered within ScrollArea's viewport */}
            <div className="space-y-3">
                {messages.length === 0 && (
                <p className="text-center text-muted-foreground">Ask BalanceBot about fitness!</p>
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
                                : 'bg-muted text-muted-foreground rounded-bl-none' // Standard bot message
                            }`}
                            // Render markdown using dangerouslySetInnerHTML
                           dangerouslySetInnerHTML={renderMarkdown(msg.content)}
                           // Apply prose styles for better markdown rendering if needed
                           // className="prose prose-sm dark:prose-invert"
                        />
                        {msg.role === 'user' && (
                            <Avatar className="h-8 w-8 border shrink-0">
                                <AvatarFallback>U</AvatarFallback> {/* Placeholder for User */}
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

