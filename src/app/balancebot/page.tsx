
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
// Select components are no longer needed as we default to Gemini
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
import { Trash2, Save, FilePlus2, FolderOpen, Rocket, ShieldCheck, RotateCcw } from 'lucide-react';

// Define the structure for a chat message
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
}

// ModelType is always 'gemini' now
type ModelType = 'gemini'; // Simplified, though API route can still handle 'gpt' if sent

// Define the structure for a saved chat
interface SavedChat {
  id: string;
  name: string;
  messages: ChatMessage[];
  modelType: ModelType; // Will always be 'gemini' for new saves
  timestamp: number; // For sorting or display
}

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
const REQUEST_TIMESTAMPS_KEY = 'balanceBotRequestTimestamps_Gemini'; // Single key for Gemini
const SAVED_CHATS_KEY = 'balanceBotSavedChats';
const SUBSCRIPTION_STATUS_KEY = 'balanceBotSubscriptionStatus';

export default function BalanceBotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  // selectedModel is no longer needed, defaults to Gemini
  // const [selectedModel, setSelectedModel] = useState<ModelType>('gemini');

  const [requestTimestamps, setRequestTimestamps] = useState<number[]>([]);
  const [rateLimitMessage, setRateLimitMessage] = useState<string>('');
  const [canSendMessage, setCanSendMessage] = useState<boolean>(true);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);


  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null); // Track current loaded/saved chat ID


  // Load request timestamps, saved chats, and subscription status from localStorage on mount
  useEffect(() => {
    const subscriptionStatus = localStorage.getItem(SUBSCRIPTION_STATUS_KEY);
    if (subscriptionStatus === 'true') {
      setIsSubscribed(true);
    }

    const storedTimestamps = localStorage.getItem(REQUEST_TIMESTAMPS_KEY);
    if (storedTimestamps) {
      try {
        const parsedTimestamps: number[] = JSON.parse(storedTimestamps);
        const now = Date.now();
        const validTimestamps = parsedTimestamps.filter(
          (ts) => now - ts < ONE_HOUR_IN_MS
        );
        setRequestTimestamps(validTimestamps);
        if (validTimestamps.length !== parsedTimestamps.length) {
            localStorage.setItem(REQUEST_TIMESTAMPS_KEY, JSON.stringify(validTimestamps));
        }
      } catch (e) {
        console.error("Failed to parse request timestamps from localStorage", e);
        localStorage.removeItem(REQUEST_TIMESTAMPS_KEY);
      }
    } else {
      setRequestTimestamps([]);
    }

    const storedSavedChats = localStorage.getItem(SAVED_CHATS_KEY);
    if (storedSavedChats) {
        try {
            setSavedChats(JSON.parse(storedSavedChats).sort((a: SavedChat, b: SavedChat) => b.timestamp - a.timestamp));
        } catch (e) {
            console.error("Failed to parse saved chats from localStorage", e);
            localStorage.removeItem(SAVED_CHATS_KEY);
        }
    }

  }, []); 

  // Effect to update rate limit status and message
  useEffect(() => {
    if (isSubscribed) {
      setCanSendMessage(true);
      setRateLimitMessage(`Premium Subscription: Unlimited BalanceBot requests.`);
      return;
    }

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
        `Rate limit reached for BalanceBot. Please try again in ~${minutesToWait} minute(s) or subscribe for unlimited access.`
      );
    } else {
      setCanSendMessage(true);
      setRateLimitMessage(
        `${MAX_REQUESTS_PER_HOUR - numRecentRequests} of ${MAX_REQUESTS_PER_HOUR} requests remaining for BalanceBot this hour.`
      );
    }
  }, [requestTimestamps, isSubscribed]);


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

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setIsLoading(false);
    setCurrentChatId(null); // No longer associated with a saved chat
    toast({ title: "New Chat Started" });
  };

  const handleSaveChat = async () => {
    if (messages.length === 0) {
      toast({ title: "Cannot save empty chat", variant: "destructive" });
      return;
    }

    const existingChat = currentChatId ? savedChats.find(c => c.id === currentChatId) : null;
    let chatNameToSave = existingChat?.name;

    if (!chatNameToSave) { // Prompt for name if it's a new save
        chatNameToSave = prompt("Enter a name for this chat:", `Chat - ${new Date().toLocaleDateString()}`);
        if (chatNameToSave === null) return; // User cancelled
        if (!chatNameToSave.trim()) {
            toast({ title: "Chat name cannot be empty", variant: "destructive" });
            return;
        }
    }

    const chatData: SavedChat = {
      id: currentChatId || crypto.randomUUID(),
      name: chatNameToSave,
      messages: [...messages],
      modelType: 'gemini', // Always Gemini
      timestamp: Date.now(),
    };

    let updatedSavedChats;
    if (savedChats.some(chat => chat.id === chatData.id)) {
      // Update existing chat
      updatedSavedChats = savedChats.map(chat => chat.id === chatData.id ? chatData : chat);
    } else {
      // Add new chat
      updatedSavedChats = [...savedChats, chatData];
    }
    updatedSavedChats.sort((a, b) => b.timestamp - a.timestamp);

    setSavedChats(updatedSavedChats);
    localStorage.setItem(SAVED_CHATS_KEY, JSON.stringify(updatedSavedChats));
    setCurrentChatId(chatData.id); // Ensure current chat ID is set/updated
    toast({ title: "Chat Saved", description: `"${chatData.name}" has been saved.` });
  };

  const handleLoadChat = (chatId: string) => {
    const chatToLoad = savedChats.find(chat => chat.id === chatId);
    if (chatToLoad) {
      setMessages([...chatToLoad.messages]); // Load a copy
      // setSelectedModel(chatToLoad.modelType); // No longer needed
      setCurrentChatId(chatToLoad.id); // Set the current chat ID
      setInput('');
      setIsLoading(false);
      toast({ title: "Chat Loaded", description: `"${chatToLoad.name}" has been loaded.`});
    } else {
      toast({ title: "Error Loading Chat", variant: "destructive" });
    }
  };

  const handleDeleteChat = (chatId: string) => {
    const chatToDelete = savedChats.find(chat => chat.id === chatId);
    if (chatToDelete) {
        const updatedSavedChats = savedChats.filter(chat => chat.id !== chatId);
        setSavedChats(updatedSavedChats);
        localStorage.setItem(SAVED_CHATS_KEY, JSON.stringify(updatedSavedChats));
        if (currentChatId === chatId) { // If deleting the currently loaded chat
            handleNewChat(); // Start a new chat
        }
        toast({ title: "Chat Deleted", description: `"${chatToDelete.name}" has been deleted.`});
    }
  };

  const handleSubscription = () => {
    // Simulate a payment process
    toast({
        title: "Redirecting to payment...",
        description: "This is a demo. You will be 'subscribed' shortly."
    });
    setTimeout(() => {
        setIsSubscribed(true);
        localStorage.setItem(SUBSCRIPTION_STATUS_KEY, 'true');
        setShowSubscriptionModal(false);
        toast({
            title: "Subscription Successful!",
            description: "You now have unlimited access to BalanceBot.",
        });
    }, 2000);
  };


  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    if (!canSendMessage) {
        setShowSubscriptionModal(true); // Show subscription modal if rate limited
        toast({
            variant: "destructive",
            title: "Rate Limit Exceeded",
            description: rateLimitMessage.includes('Rate limit reached') ? rateLimitMessage : `You have used all ${MAX_REQUESTS_PER_HOUR} requests for BalanceBot this hour.`,
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

    // Update request timestamps if not subscribed
    if (!isSubscribed) {
        const now = Date.now();
        const updatedTimestamps = [...requestTimestamps, now].filter(ts => now - ts < ONE_HOUR_IN_MS);
        setRequestTimestamps(updatedTimestamps);
        localStorage.setItem(REQUEST_TIMESTAMPS_KEY, JSON.stringify(updatedTimestamps));
    }


    try {
      console.log("Sending to /api/chat:", { message: trimmedInput, history: historyForAPI, modelType: 'gemini' }); // Always Gemini
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: trimmedInput, history: historyForAPI, modelType: 'gemini' }), // Hardcode gemini
      });

      console.log(`Received response status from /api/chat: ${response.status}`);

      if (!response.ok) {
        let errorMsg = `Error: ${response.status} ${response.statusText}`;
        let errorData: { error?: string } | null = null;
        try {
          errorData = await response.json();
          errorMsg = errorData?.error || errorMsg;
          if (errorMsg.includes("API key missing")) {
            errorMsg = `Server configuration error: Gemini API key is missing. Please check the .env file on the server.`;
          }
          console.error("API Error Response (Parsed JSON):", errorData);
        } catch (e) {
           console.warn("Failed to parse error response as JSON. Status:", response.status);
           try {
                const textResponse = await response.text();
                console.error("Non-JSON error response body:", textResponse.substring(0, 500));
                 errorMsg = `Server error (${response.status}) for Gemini: ${textResponse.substring(0,100) || 'Could not retrieve details.'}`;
            } catch (textError) {
                console.error("Failed to read error response body as text:", textError);
                errorMsg = `Server error (${response.status}) for Gemini: Could not read response body.`;
            }
        }
        console.error(`API Call Failed (Frontend) for Gemini:`, errorMsg);

        const errorChatMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'error',
          content: `Failed to get response from BalanceBot: ${errorMsg}`
        };
        setMessages(prev => [...prev, errorChatMsg]);

        toast({
            variant: "destructive",
            title: `Chatbot Error (BalanceBot)`,
            description: errorMsg,
        });

      } else {
        const data = await response.json();
        console.log("API Success Response:", data);

        if (data.response) {
          const assistantMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: data.response };
          setMessages(prev => [...prev, assistantMsg]);
        } else {
          console.error(`Unexpected successful API response structure from BalanceBot:`, data);
          const errorMsgContent = `Received an unexpected response from BalanceBot.`;
          const errorMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'error',
            content: errorMsgContent
          };
          setMessages(prev => [...prev, errorMsg]);
           toast({
                variant: "destructive",
                title: `Chatbot Error (BalanceBot)`,
                description: errorMsgContent,
            });
        }
      }

    } catch (error: any) {
       console.error(`Error sending chat message for BalanceBot (Network/Fetch):`, error);
       const errorMsgContent = `Sorry, failed to send message to BalanceBot. ${error.message || 'Please check your connection.'}`;
       const errorMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'error',
            content: errorMsgContent
        };
       setMessages(prev => [...prev, errorMsg]);
        toast({
            variant: "destructive",
            title: `Network Error (BalanceBot)`,
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

      {/* Saved Chats Section */}
      <Card className="w-full max-w-xl shadow-md rounded-lg mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            Saved Conversations
          </CardTitle>
          <CardDescription>Load or delete previous conversations.</CardDescription>
        </CardHeader>
        <CardContent>
          {savedChats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No chats saved yet. Start a conversation and save it!</p>
          ) : (
            <ScrollArea className="h-40 border rounded-md p-2">
              <ul className="space-y-1">
                {savedChats.map(chat => (
                  <li key={chat.id} className="flex justify-between items-center p-2 hover:bg-muted/50 rounded-md">
                    <span
                        className="text-sm font-medium truncate cursor-pointer flex-grow mr-2 hover:text-primary"
                        onClick={() => handleLoadChat(chat.id)}
                        title={`Load chat: ${chat.name} (Model: ${chat.modelType.toUpperCase()})`}
                    >
                      {chat.name}
                    </span>
                    <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={() => handleDeleteChat(chat.id)} title="Delete chat">
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete chat</span>
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>


      <Card className="w-full max-w-xl shadow-md rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Chat with BalanceBot</CardTitle>
              <CardDescription className="mt-1">
                {currentChatId && savedChats.find(c => c.id === currentChatId)
                    ? `Editing: "${savedChats.find(c => c.id === currentChatId)?.name}"`
                    : messages.length === 0
                    ? "Start a new conversation."
                    : `Conversation with BalanceBot`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSaveChat} disabled={isLoading || messages.length === 0} title="Save current chat">
                    <Save className="mr-2 h-4 w-4" /> Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleNewChat} title="Start a new chat">
                    <FilePlus2 className="mr-2 h-4 w-4" /> New
                </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-4">
            {/* Model selection UI removed */}
          <ScrollArea className="h-96 w-full rounded-md border p-4" viewportRef={scrollAreaViewportRef}>
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
              placeholder={!canSendMessage && !isSubscribed ? "Rate limit reached. Subscribe for unlimited." : "Ask BalanceBot anything..."}
              onKeyDown={e => {
                 if (e.key === 'Enter' && !isLoading && input.trim() && (canSendMessage || isSubscribed)) {
                    e.preventDefault();
                    handleSend();
                 }
              }}
              disabled={isLoading || (!canSendMessage && !isSubscribed)}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim() || (!canSendMessage && !isSubscribed)}>
              {isLoading ? '...' : 'Send'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">{rateLimitMessage}</p>
           {!isSubscribed && (
            <div className="mt-4 p-4 border rounded-lg bg-secondary/30 text-center">
                <h3 className="text-md font-semibold mb-2">Go Premium!</h3>
                <p className="text-sm text-muted-foreground mb-3">
                    Unlock unlimited chat requests, priority support, and more features with BalanceBot Premium.
                </p>
                <Button onClick={() => setShowSubscriptionModal(true)} className="w-full sm:w-auto">
                    <Rocket className="mr-2 h-4 w-4"/> Subscribe Now
                </Button>
            </div>
           )}
        </CardContent>
      </Card>

       {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl">Upgrade to BalanceBot Premium</CardTitle>
              <CardDescription>Get unlimited access and more!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li><ShieldCheck className="inline h-4 w-4 mr-1 text-primary" /> Unlimited chat requests with BalanceBot.</li>
                <li><Rocket className="inline h-4 w-4 mr-1 text-primary" /> Faster response times (simulated).</li>
                <li><RotateCcw className="inline h-4 w-4 mr-1 text-primary" /> Access to future premium features.</li>
              </ul>
              <p className="text-lg font-semibold text-center">$9.99 / month (Demo)</p>
              <Button onClick={handleSubscription} className="w-full">
                Subscribe Now & Unlock All Features
              </Button>
              <Button variant="outline" onClick={() => setShowSubscriptionModal(false)} className="w-full mt-2">
                Maybe Later
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

    