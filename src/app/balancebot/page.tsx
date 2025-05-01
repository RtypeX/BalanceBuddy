'use client';

import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Textarea} from "@/components/ui/textarea";
import {useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import { generateResponse, GenerateResponseInput } from "@/ai/flows/generate-response"; // Import the flow

export default function BalanceBotPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<
    { type: 'query' | 'advice'; text: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom of chat on component mount and when new messages are added
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return; // Prevent multiple submissions

    const userMessage = query;
    setChatHistory(prev => [...prev, {type: 'query', text: userMessage}]);
    setQuery('');
    setIsLoading(true); // Set loading state

    try {
      const input: GenerateResponseInput = { message: userMessage };
      // Call the Genkit flow function directly
      const result = await generateResponse(input);

      // The flow now returns the error message within the 'response' field if something goes wrong server-side
      if (result.response) {
        setChatHistory(prev => [...prev, {type: 'advice', text: result.response}]);
      } else {
         // This case should ideally not happen if the flow returns the error in the response field
        console.warn("Received unexpected empty result from generateResponse");
        setChatHistory(prev => [...prev, {
          type: 'advice',
          text: 'Sorry, I couldn\'t get a response right now.',
        }]);
      }
    } catch (error: any) {
      // Catch errors that might happen during the network request itself or if the flow *throws* unexpectedly
      console.error("Error calling generateResponse:", error);
      setChatHistory(prev => [...prev, {
        type: 'advice',
        // Display a generic error for unexpected client-side or network issues
        text: 'An unexpected error occurred while sending your message. Please check your connection or try again later.',
      }]);
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen py-2 bg-background"> {/* Added bg-background */}
      <div className="flex items-center justify-between p-4 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-foreground">BalanceBot</h1> {/* Use foreground */}
        <Button variant="secondary" onClick={() => router.push('/home')}>
          Back to Home
        </Button>
      </div>
      <Card className="w-full max-w-md rounded-lg shadow-md bg-card"> {/* Added bg-card */}
        <CardContent className="p-6 flex flex-col h-[60vh]"> {/* Set fixed height and flex-col */}
          <div ref={chatHistoryRef} className="flex-grow space-y-4 overflow-y-auto mb-4 pr-2"> {/* Adjusted spacing and added padding */}
            {chatHistory.map((item, index) => (
              <div key={index} className={`flex ${item.type === 'query' ? 'justify-end' : 'justify-start'}`}>
                 {item.type === 'advice' && (
                   <Avatar className="mr-2 h-8 w-8 self-start"> {/* Align avatar top */}
                     <AvatarFallback className="bg-primary text-primary-foreground">BB</AvatarFallback> {/* Themed fallback */}
                   </Avatar>
                 )}
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-2 text-sm shadow-sm ${ // Added text-sm and shadow
                    item.type === 'query'
                      ? 'bg-primary text-primary-foreground' // Themed user message
                      : 'bg-muted text-muted-foreground' // Themed bot message
                  }`}
                >
                  {/* Basic markdown-like formatting (replace newlines with breaks) */}
                  {item.text.split('\n').map((line, i) => (
                      <span key={i}>{line}<br/></span>
                  ))}
                </div>
                 {item.type === 'query' && (
                    <Avatar className="ml-2 h-8 w-8 self-start"> {/* Align avatar top */}
                       <AvatarFallback>U</AvatarFallback> {/* Simple user fallback */}
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
          <form onSubmit={handleSubmit} className="mt-auto pt-4 border-t border-border"> {/* Added border */}
            <div className="flex space-x-2 items-center"> {/* Align items center */}
              <Textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask BalanceBot..."
                className="flex-grow rounded-xl resize-none" // Prevent resize
                rows={1} // Start with 1 row, might need dynamic resizing logic later
                disabled={isLoading} // Disable while loading
                onKeyDown={(e) => { // Submit on Enter, new line on Shift+Enter
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e as unknown as React.FormEvent); // Type assertion might be needed
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
