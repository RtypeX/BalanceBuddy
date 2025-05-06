// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';

const AIMLAPI_URL = "https://api.aimlapi.com/v1/chat/completions";
const MODEL_NAME = "gpt-4o-mini"; // Or "gpt-4o-mini-2024-07-18"
const MAX_TOKENS_LIMIT = 200; // Set a reasonable token limit for the AI's response
const CHAT_HISTORY_CONTEXT_LIMIT = 10; // Number of recent message pairs (user + assistant) to send as context

export async function POST(req: Request) {
  try {
    const { message, history = [] } = await req.json(); // Expect message and optional history

    if (!message) {
      console.error("API Route Error: No message provided in request body.");
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    const apiKey = process.env.AIMLAPI_KEY;
    if (!apiKey) {
      console.error("API Route Error: Missing AIMLAPI_KEY environment variable.");
      // Return a clear error message to the client
      return NextResponse.json({ error: "Server configuration error: API key missing." }, { status: 500 });
    }

    // Take only the most recent messages from history to limit context size
    const recentHistory = history.slice(-CHAT_HISTORY_CONTEXT_LIMIT * 2); // *2 because each exchange has a user and assistant message

    // Construct messages array including system prompt, recent history, and the new user message
    const messagesForAPI = [
        { role: "system", content: "You are BalanceBot, a friendly and helpful fitness assistant. Keep your responses concise and well-formatted. Use markdown for emphasis (bold, italics) and headings (###) where appropriate." },
        ...recentHistory.map((msg: { role: string; content: string }) => ({
           role: msg.role === 'assistant' ? 'assistant' : 'user',
           content: msg.content
        })),
        { role: "user", content: message }
    ];

    const requestBody = {
        model: MODEL_NAME,
        messages: messagesForAPI,
        max_tokens: MAX_TOKENS_LIMIT,
      };

    console.log("Sending request to AI/ML API with body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(AIMLAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`Received response status from AI/ML API: ${response.status}`);

    if (!response.ok) {
      let errorDetails = `AI/ML API Error (${response.status} ${response.statusText})`;
      let errorBodyText = '';
      try {
        errorBodyText = await response.text();
        console.log("Raw error response body from AI/ML API:", errorBodyText);
        try {
            const errorBodyJson = JSON.parse(errorBodyText);
            const apiErrorMessage = errorBodyJson?.error?.message || errorBodyJson?.error || JSON.stringify(errorBodyJson);
            errorDetails += `: ${apiErrorMessage}`;
        } catch (jsonParseError) {
            errorDetails += `: ${errorBodyText.substring(0, 500)}${errorBodyText.length > 500 ? '...' : ''}`;
            console.warn("AI/ML API error response body was not valid JSON:", jsonParseError);
        }
      } catch (textError) {
        console.error("Failed to read error response body as text:", textError);
        errorDetails += " (Failed to read error body)";
      }
      console.error("Detailed AI/ML API Error:", errorDetails);
      return NextResponse.json({ error: errorDetails }, { status: response.status });
    }

    const data = await response.json();
    console.log("Received successful response data from AI/ML API:", data);

    const botResponse = data?.choices?.[0]?.message?.content;

    if (!botResponse) {
        console.error("API Route Error: Unexpected API response structure:", data);
        return NextResponse.json({ error: "Received invalid response format from AI service." }, { status: 500 });
    }

    return NextResponse.json({ response: botResponse });

  } catch (error: any) {
    console.error("Error caught in /api/chat route:", error);
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error("API Route Error: Failed to parse request body as JSON.");
        return NextResponse.json({ error: "Invalid request format." }, { status: 400 });
    }
    return NextResponse.json({ error: `Internal server error: ${error.message || 'Check server logs.'}` }, { status: 500 });
  }
}
