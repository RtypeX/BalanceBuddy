// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';

const AIMLAPI_URL = "https://api.aimlapi.com/v1/chat/completions";
const MODEL_NAME = "gpt-4o-mini"; // Or "gpt-4o-mini-2024-07-18"
const MAX_TOKENS_LIMIT = 200; // Set a reasonable token limit

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

    // Construct messages array including history and the new user message
    const messages = [
        // Optional: Add a system prompt if needed
        { role: "system", content: "You are BalanceBot, a friendly and helpful fitness assistant." },
        ...history.map((msg: { role: string; content: string }) => ({ // Ensure history format
           role: msg.role === 'assistant' ? 'assistant' : 'user',
           content: msg.content
        })),
        { role: "user", content: message }
    ];

    const requestBody = {
        model: MODEL_NAME,
        messages: messages,
        max_tokens: MAX_TOKENS_LIMIT, // Add the max_tokens limit
        // Add other optional parameters from AI/ML API docs if needed
        // temperature: 0.7,
      };

    console.log("Sending request to AI/ML API with body:", JSON.stringify(requestBody, null, 2)); // Log request body

    const response = await fetch(AIMLAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`Received response status from AI/ML API: ${response.status}`); // Log status

    if (!response.ok) {
      // Improved error handling for upstream API errors
      let errorDetails = `AI/ML API Error (${response.status} ${response.statusText})`;
      let errorBodyText = '';
      try {
        errorBodyText = await response.text(); // Get raw response body as text first
        console.log("Raw error response body from AI/ML API:", errorBodyText); // Log raw error body
        try {
            const errorBodyJson = JSON.parse(errorBodyText); // Try parsing as JSON
            // Use specific error message from API if available, otherwise stringify the JSON
            const apiErrorMessage = errorBodyJson?.error?.message || errorBodyJson?.error || JSON.stringify(errorBodyJson);
            errorDetails += `: ${apiErrorMessage}`;
        } catch (jsonParseError) {
            // If parsing fails, append the raw text body (truncated if too long)
            errorDetails += `: ${errorBodyText.substring(0, 500)}${errorBodyText.length > 500 ? '...' : ''}`;
            console.warn("AI/ML API error response body was not valid JSON:", jsonParseError);
        }
      } catch (textError) {
        console.error("Failed to read error response body as text:", textError);
        errorDetails += " (Failed to read error body)";
      }
      console.error("Detailed AI/ML API Error:", errorDetails);
      // IMPORTANT: Return a JSON error response to the client with the details
      return NextResponse.json({ error: errorDetails }, { status: response.status });
    }

    const data = await response.json();
    console.log("Received successful response data from AI/ML API:", data); // Log success data

    // Extract the response content - structure might vary slightly based on API
    const botResponse = data?.choices?.[0]?.message?.content;

    if (!botResponse) {
        console.error("API Route Error: Unexpected API response structure:", data);
         // IMPORTANT: Return a JSON error response
        return NextResponse.json({ error: "Received invalid response format from AI service." }, { status: 500 });
    }

    // Return JSON success response
    return NextResponse.json({ response: botResponse });

  } catch (error: any) {
    console.error("Error caught in /api/chat route:", error);
     // IMPORTANT: Return a JSON error response
    // Check if it's a JSON parsing error from the *request*
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error("API Route Error: Failed to parse request body as JSON.");
        return NextResponse.json({ error: "Invalid request format." }, { status: 400 });
    }
    // General internal server error
    return NextResponse.json({ error: `Internal server error: ${error.message || 'Check server logs.'}` }, { status: 500 });
  }
}
