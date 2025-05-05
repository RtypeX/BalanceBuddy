// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';

const AIMLAPI_URL = "https://api.aimlapi.com/v1/chat/completions";
const MODEL_NAME = "gpt-4o-mini"; // Or "gpt-4o-mini-2024-07-18"

export async function POST(req: Request) {
  try {
    const { message, history = [] } = await req.json(); // Expect message and optional history

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    const apiKey = process.env.AIMLAPI_KEY;
    if (!apiKey) {
      console.error("Missing AIMLAPI_KEY environment variable.");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Construct messages array including history and the new user message
    const messages = [
        // Optional: Add a system prompt if needed
        // { role: "system", content: "You are a helpful fitness assistant." },
        ...history, // Include previous messages if provided
        { role: "user", content: message }
    ];

    const response = await fetch(AIMLAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: messages,
        // Add other optional parameters from AI/ML API docs if needed
        // temperature: 0.7,
        // max_tokens: 150,
      }),
    });

    if (!response.ok) {
      // Attempt to parse error details from the API response
      let errorDetails = `HTTP error! status: ${response.status}`;
      try {
        const errorBody = await response.json();
        errorDetails += ` - ${JSON.stringify(errorBody)}`;
      } catch (parseError) {
        // Ignore if response body is not JSON or empty
      }
      console.error("AI/ML API Error:", errorDetails);
      return NextResponse.json({ error: "Failed to get response from AI service." }, { status: response.status });
    }

    const data = await response.json();

    // Extract the response content - structure might vary slightly based on API
    const botResponse = data?.choices?.[0]?.message?.content;

    if (!botResponse) {
        console.error("Unexpected API response structure:", data);
        return NextResponse.json({ error: "Received invalid response from AI service." }, { status: 500 });
    }

    return NextResponse.json({ response: botResponse });

  } catch (error: any) {
    console.error("Error in /api/chat route:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
