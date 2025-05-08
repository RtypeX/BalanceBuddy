
// src/app/api/chat/route.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, ChatSession } from '@google/generative-ai';
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const GEMINI_MODEL_NAME = "gemini-1.5-flash-latest";
const GPT_MODEL_NAME = "gpt-4o-mini"; // Or your preferred GPT model
const CHAT_HISTORY_CONTEXT_LIMIT = 5; // Number of recent message pairs (user + model) to send as context

interface ApiChatMessagePart {
  text: string;
}

interface ApiChatMessage {
  role: 'user' | 'model' | 'system'; // Gemini uses 'user' and 'model', OpenAI uses 'user', 'assistant', 'system'
  parts?: ApiChatMessagePart[]; // For Gemini
  content?: string; // For OpenAI
}

interface ProfileData {
  name?: string;
  age?: number;
  heightFt?: number;
  heightIn?: number;
  weightLbs?: number;
  fitnessGoal?: 'Lose Weight' | 'Gain Weight' | 'Maintain';
}

interface RequestBody {
  message: string;
  history?: { role: string; content: string }[];
  modelType: 'gemini' | 'gpt';
  profileData?: ProfileData | null; // Added profileData
}

export async function POST(req: Request) {
  let modelTypeFromRequest: 'gemini' | 'gpt' | undefined;
  try {
    const { message, history = [], modelType, profileData }: RequestBody = await req.json();
    modelTypeFromRequest = modelType; // Store for logging in catch block

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

    // Construct system message with profile data
    let systemMessageContent = 'You are BalanceBot, a friendly and helpful fitness and wellness assistant. Focus on providing helpful, safe, and positive advice related to exercise, nutrition, mindfulness, and general well-being. Avoid giving medical advice. If asked about topics outside of fitness and wellness, gently steer the conversation back or politely decline.';
    if (profileData) {
        systemMessageContent += ` The user's profile is as follows: Name: ${profileData.name || 'N/A'}, Age: ${profileData.age || 'N/A'}, Height: ${profileData.heightFt || 'N/A'} ft ${profileData.heightIn || 'N/A'} in, Weight: ${profileData.weightLbs || 'N/A'} lbs, Fitness Goal: ${profileData.fitnessGoal || 'N/A'}. Please consider this information when providing advice.`;
    }


    if (modelType === 'gemini') {
      const apiKey = process.env.GOOGLE_GENAI_API_KEY;
      if (!apiKey) {
        console.error("API Route Error: Missing GOOGLE_GENAI_API_KEY environment variable for Gemini.");
        return NextResponse.json({ error: "Server configuration error: Gemini API key missing." }, { status: 500 });
      }
      console.log(`API Route Info: Using Gemini API Key (starts with): ${apiKey.substring(0, 5)}...`);


      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL_NAME,
        safetySettings: [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
          { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ],
        systemInstruction: { role: "system", parts: [{text: systemMessageContent}] }, // Add system instruction here
      });

      const formattedHistoryForGemini: ApiChatMessage[] = recentHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));
      
      console.log("API Route Info: Sending request to Gemini API with history:", JSON.stringify(formattedHistoryForGemini, null, 2));
      console.log("API Route Info: Sending new message to Gemini API:", message);

      const chat: ChatSession = model.startChat({
          history: formattedHistoryForGemini,
          generationConfig: {
              maxOutputTokens: 200, // Limiting output tokens
          },
      });
      
      const result = await chat.sendMessage(message);
      console.log("API Route Info: Raw result from Gemini API:", JSON.stringify(result, null, 2));


      if (result && result.response) {
        try {
          botResponseContent = result.response.text();
          console.log("API Route Info: Successfully extracted text from Gemini response:", botResponseContent);
        } catch (textError: any) {
          console.error("API Route Error: Failed to extract text using result.response.text() from Gemini:", textError.message);
          console.error("API Route Info: Full Gemini result.response object:", JSON.stringify(result.response, null, 2));
          botResponseContent = null; // Ensure it remains null if text extraction fails
        }
      } else {
        console.error("API Route Error: Gemini result or result.response is undefined or null.");
        console.log("API Route Info: Full Gemini result object (if available):", JSON.stringify(result, null, 2));
      }


    } else if (modelType === 'gpt') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        console.error("API Route Error: Missing or placeholder OPENAI_API_KEY environment variable for GPT.");
        return NextResponse.json({ error: "Server configuration error: GPT API key missing or not configured." }, { status: 500 });
      }
      console.log(`API Route Info: Using OpenAI API Key (starts with): ${apiKey.substring(0, 5)}...`);


      const openai = new OpenAI({ apiKey });

      const formattedHistoryForGPT: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = recentHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const messagesForOpenAI: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemMessageContent }, // Use the constructed system message
        ...formattedHistoryForGPT,
        { role: 'user', content: message }
      ];
      
      console.log("API Route Info: Sending request to OpenAI API with messages:", JSON.stringify(messagesForOpenAI, null, 2));

      const completion = await openai.chat.completions.create({
        model: GPT_MODEL_NAME,
        messages: messagesForOpenAI,
        max_tokens: 200,
      });
      console.log("API Route Info: Raw completion from OpenAI API:", JSON.stringify(completion, null, 2));

      botResponseContent = completion.choices[0]?.message?.content;
      if (botResponseContent) {
        console.log("API Route Info: Successfully extracted text from OpenAI response:", botResponseContent);
      } else {
         console.error("API Route Error: Failed to extract content from OpenAI response. Choices[0].message.content is null or undefined.");
      }
    } else {
      console.error("API Route Error: Invalid modelType provided:", modelType);
      return NextResponse.json({ error: "Invalid modelType provided" }, { status: 400 });
    }

    if (!botResponseContent) {
        console.error(`API Route Error: Bot response content is null or empty after ${modelType} API call.`);
        return NextResponse.json({ error: `Received no valid content from ${modelType} AI service. Check server logs.` }, { status: 500 });
    }

    return NextResponse.json({ response: botResponseContent });

  } catch (error: any) {
    console.error(`Error caught in /api/chat route (Model Type: ${modelTypeFromRequest || 'unknown'}):`, error);
    let errorMessage = "An unexpected error occurred on the server.";
    if (error.message) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error("API Route Error: Failed to parse request body as JSON.");
        return NextResponse.json({ error: "Invalid request format. Expected JSON." }, { status: 400 });
    }

    console.error("API Route Final Error Message to Client:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

    