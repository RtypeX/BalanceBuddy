
// src/app/api/chat/route.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const GEMINI_MODEL_NAME = "gemini-1.5-flash-latest";
const GPT_MODEL_NAME = "gpt-4o-mini"; // Or your preferred GPT model
const CHAT_HISTORY_CONTEXT_LIMIT = 5; // Number of recent message pairs (user + model) to send as context

interface ApiChatMessage {
  role: 'user' | 'model' | 'system'; // Gemini uses 'user' and 'model', OpenAI uses 'user', 'assistant', 'system'
  parts?: { text: string }[]; // For Gemini
  content?: string; // For OpenAI
}

interface RequestBody {
  message: string;
  history?: { role: string; content: string }[];
  modelType: 'gemini' | 'gpt';
}

export async function POST(req: Request) {
  try {
    const { message, history = [], modelType }: RequestBody = await req.json();

    if (!message) {
      console.error("API Route Error: No message provided in request body.");
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }
    if (!modelType) {
      console.error("API Route Error: No modelType provided in request body.");
      return NextResponse.json({ error: "No modelType provided" }, { status: 400 });
    }

    let botResponseContent: string | null = null;
    const recentHistory = history.slice(-CHAT_HISTORY_CONTEXT_LIMIT * 2);

    if (modelType === 'gemini') {
      const apiKey = process.env.GOOGLE_GENAI_API_KEY;
      if (!apiKey) {
        console.error("API Route Error: Missing GOOGLE_GENAI_API_KEY environment variable for Gemini.");
        return NextResponse.json({ error: "Server configuration error: Gemini API key missing." }, { status: 500 });
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
      });

      const formattedHistoryForGemini: ApiChatMessage[] = recentHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));
      
      console.log("Sending request to Gemini API with history:", JSON.stringify(formattedHistoryForGemini, null, 2));
      console.log("Sending new message to Gemini API:", message);

      const chat = model.startChat({
          history: formattedHistoryForGemini,
          generationConfig: {
              maxOutputTokens: 200,
          },
      });
      
      const result = await chat.sendMessage(message);
      botResponseContent = result.response.text();
      console.log("Received successful response data from Gemini API:", botResponseContent);

    } else if (modelType === 'gpt') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        console.error("API Route Error: Missing or placeholder OPENAI_API_KEY environment variable for GPT.");
        return NextResponse.json({ error: "Server configuration error: GPT API key missing or not configured." }, { status: 500 });
      }

      const openai = new OpenAI({ apiKey });

      const formattedHistoryForGPT: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = recentHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      // Add system prompt and current user message for OpenAI
      const messagesForOpenAI: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: 'You are BalanceBot, a friendly and helpful fitness assistant.' },
        ...formattedHistoryForGPT,
        { role: 'user', content: message }
      ];
      
      console.log("Sending request to OpenAI API with messages:", JSON.stringify(messagesForOpenAI, null, 2));

      const completion = await openai.chat.completions.create({
        model: GPT_MODEL_NAME,
        messages: messagesForOpenAI,
        max_tokens: 200,
      });

      botResponseContent = completion.choices[0]?.message?.content;
      console.log("Received successful response data from OpenAI API:", botResponseContent);
    } else {
      console.error("API Route Error: Invalid modelType provided.");
      return NextResponse.json({ error: "Invalid modelType provided" }, { status: 400 });
    }

    if (!botResponseContent) {
        console.error("API Route Error: Unexpected API response structure or empty content.");
        return NextResponse.json({ error: "Received invalid response format from AI service." }, { status: 500 });
    }

    return NextResponse.json({ response: botResponseContent });

  } catch (error: any) {
    console.error(`Error caught in /api/chat route (${modelType || 'unknown model'}):`, error);
    let errorMessage = `Internal server error: ${error.message || 'Check server logs.'}`;
    if (error.response && error.response.data && error.response.data.error) {
        errorMessage = `AI API Error: ${error.response.data.error.message}`;
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
