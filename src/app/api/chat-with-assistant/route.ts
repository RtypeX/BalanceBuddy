// src/app/api/chat-with-assistant/route.ts
import { generateResponse, ChatMessage } from "@/ai/flows/generate-response";
import { NextResponse } from 'next/server';

/**
 * @fileOverview API endpoint for handling chat messages with the AI assistant.
 */

export async function POST(req: Request) {
  try {
    // Expecting the *entire* chat history in the request body now
    const { history }: { history: ChatMessage[] } = await req.json();

    if (!history || !Array.isArray(history) || history.length === 0) {
      return NextResponse.json({ error: "Invalid chat history provided" }, { status: 400 });
    }

    // The last message in the history should be the user's latest message
    if (history[history.length - 1]?.role !== 'user') {
         return NextResponse.json({ error: "Last message must be from the user" }, { status: 400 });
    }

    // Call the backend function with the history
    const result = await generateResponse({ history });

    // Send the AI's response back to the client
    return NextResponse.json({ response: result.response });

  } catch (error: any) {
    console.error("Error in chat API route:", error);
    // Check if it's a known error type or provide a generic message
    const errorMessage = error.message || "Failed to communicate with the assistant";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
