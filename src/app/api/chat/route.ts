// src/app/api/chat/route.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const GEMINI_MODEL_NAME = "gemini-1.5-flash-latest";
const CHAT_HISTORY_CONTEXT_LIMIT = 5; // Number of recent message pairs (user + model) to send as context

interface ApiChatMessage {
  role: 'user' | 'model'; // Gemini uses 'user' and 'model'
  parts: { text: string }[];
}

export async function POST(req: Request) {
  try {
    const { message, history = [] } = await req.json();

    if (!message) {
      console.error("API Route Error: No message provided in request body.");
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENAI_API_KEY;
    if (!apiKey) {
      console.error("API Route Error: Missing GOOGLE_GENAI_API_KEY environment variable.");
      return NextResponse.json({ error: "Server configuration error: API key missing." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL_NAME,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      // System instruction can be added here if needed for Gemini 1.5 models
      // systemInstruction: "You are BalanceBot, a friendly and helpful fitness assistant..."
    });

    const recentHistory = history.slice(-CHAT_HISTORY_CONTEXT_LIMIT * 2);

    const formattedHistory: ApiChatMessage[] = recentHistory.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
    
    // Add the current user message to the history for the API call
    const currentMessageForApi: ApiChatMessage = { role: 'user', parts: [{ text: message }] };
    const messagesForAPI = [...formattedHistory, currentMessageForApi];


    console.log("Sending request to Gemini API with messages:", JSON.stringify(messagesForAPI, null, 2));

    // For Gemini, a chat session is better for multi-turn conversations
    const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
            maxOutputTokens: 200, // Corresponds to max_tokens
        },
    });
    
    const result = await chat.sendMessage(message); // Send only the new message
    const botResponseContent = result.response.text();


    console.log("Received successful response data from Gemini API:", botResponseContent);

    if (!botResponseContent) {
        console.error("API Route Error: Unexpected API response structure from Gemini.");
        return NextResponse.json({ error: "Received invalid response format from AI service." }, { status: 500 });
    }

    return NextResponse.json({ response: botResponseContent });

  } catch (error: any) {
    console.error("Error caught in /api/chat route (Gemini):", error);
    let errorMessage = `Internal server error: ${error.message || 'Check server logs.'}`;
    if (error.response && error.response.data && error.response.data.error) {
        errorMessage = `Gemini API Error: ${error.response.data.error.message}`;
    } else if (error.message) {
        errorMessage = error.message;
    }
    
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error("API Route Error: Failed to parse request body as JSON.");
        return NextResponse.json({ error: "Invalid request format." }, { status: 400 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
