
// src/app/api/chat/route.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, ChatSession } from '@google/generative-ai';
// OpenAI import is removed as we will use fetch for AIMLAPI
import { NextResponse } from 'next/server';

const GEMINI_MODEL_NAME = "gemini-1.5-flash-latest";
const GPT_MODEL_NAME = "gpt-4o-mini"; // This will be used in the AIMLAPI request
const CHAT_HISTORY_CONTEXT_LIMIT = 5; 

interface ApiChatMessagePart {
  text: string;
}

interface ApiChatMessage {
  role: 'user' | 'model' | 'system' | 'assistant'; // Added 'assistant' for AIMLAPI
  parts?: ApiChatMessagePart[]; 
  content?: string; 
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
  profileData?: ProfileData | null;
}

export async function POST(req: Request) {
  let modelTypeFromRequest: 'gemini' | 'gpt' | undefined;
  console.log("API Route Info: Received POST request to /api/chat");
  try {
    const requestBody: RequestBody = await req.json();
    const { message, history = [], modelType, profileData } = requestBody;
    modelTypeFromRequest = modelType; 
    console.log("API Route Info: Parsed request body:", { message: message ? "Exists" : "Missing", historyLength: history.length, modelType, profileData: profileData ? "Exists" : "Missing" });


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

    let systemMessageContent = 'You are BalanceBot, a friendly and helpful fitness and wellness assistant. Focus on providing helpful, safe, and positive advice related to exercise, nutrition, mindfulness, and general well-being. Avoid giving medical advice. If asked about topics outside of fitness and wellness, gently steer the conversation back or politely decline.';
    if (profileData) {
        systemMessageContent += ` The user's profile is as follows: Name: ${profileData.name || 'N/A'}, Age: ${profileData.age || 'N/A'}, Height: ${profileData.heightFt || 'N/A'} ft ${profileData.heightIn || 'N/A'} in, Weight: ${profileData.weightLbs || 'N/A'} lbs, Fitness Goal: ${profileData.fitnessGoal || 'N/A'}. Please consider this information when providing advice.`;
    }
    console.log("API Route Info: System message content:", systemMessageContent);


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
        systemInstruction: { role: "system", parts: [{text: systemMessageContent}] },
      });

      const formattedHistoryForGemini: ApiChatMessage[] = recentHistory.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));
      
      console.log("API Route Info: Sending request to Gemini API with history:", JSON.stringify(formattedHistoryForGemini, null, 2));
      console.log("API Route Info: Sending new message to Gemini API:", message);

      const chat: ChatSession = model.startChat({
          history: formattedHistoryForGemini,
          generationConfig: { maxOutputTokens: 200 },
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
          botResponseContent = null; 
        }
      } else {
        console.error("API Route Error: Gemini result or result.response is undefined or null.");
        console.log("API Route Info: Full Gemini result object (if available):", JSON.stringify(result, null, 2));
      }

    } else if (modelType === 'gpt') {
      const aimlApiKey = process.env.OPENAI_API_KEY; // This should be your AIMLAPI key
      if (!aimlApiKey) {
        console.error("API Route Error: Missing OPENAI_API_KEY (for AIMLAPI) environment variable for GPT.");
        return NextResponse.json({ error: "Server configuration error: AIMLAPI key missing or not configured." }, { status: 500 });
      }
      console.log(`API Route Info: Using AIMLAPI Key (starts with): ${aimlApiKey.substring(0, 5)}...`);

      const messagesForAIMLAPI: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        { role: 'system', content: systemMessageContent },
        ...recentHistory.map((msg: { role: string; content: string }) => ({
          role: msg.role as 'user' | 'assistant', 
          content: msg.content,
        })),
        { role: 'user', content: message }
      ];

      console.log("API Route Info: Sending request to AIMLAPI with messages:", JSON.stringify(messagesForAIMLAPI, null, 2));

      const aimlApiResponse = await fetch("https://api.aimlapi.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${aimlApiKey}`,
        },
        body: JSON.stringify({
          model: GPT_MODEL_NAME, 
          messages: messagesForAIMLAPI,
          max_tokens: 200, 
        }),
      });

      console.log("API Route Info: AIMLAPI response status:", aimlApiResponse.status);
      const responseText = await aimlApiResponse.text(); // Read the response text first
      console.log("API Route Info: AIMLAPI raw response text:", responseText.substring(0, 500)); // Log first 500 chars

      if (!aimlApiResponse.ok) {
        console.error(`API Route Error: AIMLAPI request failed with status ${aimlApiResponse.status}: ${responseText}`);
        return NextResponse.json({ error: `AIMLAPI request failed: ${aimlApiResponse.statusText} - ${responseText.substring(0, 200)}` }, { status: aimlApiResponse.status });
      }

      try {
        const completion = JSON.parse(responseText); // Now parse the text
        console.log("API Route Info: Raw completion from AIMLAPI:", JSON.stringify(completion, null, 2));

        botResponseContent = completion.choices?.[0]?.message?.content;
        if (botResponseContent) {
          console.log("API Route Info: Successfully extracted text from AIMLAPI response:", botResponseContent);
        } else {
           console.error("API Route Error: Failed to extract content from AIMLAPI response. Choices[0].message.content is null or undefined.");
        }
      } catch (parseError) {
        console.error("API Route Error: Failed to parse AIMLAPI response as JSON:", parseError);
        console.error("API Route Info: AIMLAPI response text that failed to parse:", responseText);
        return NextResponse.json({ error: "Failed to parse AIMLAPI response. Raw response: " + responseText.substring(0,200) }, { status: 500 });
      }
    } else {
      console.error("API Route Error: Invalid modelType provided:", modelType);
      return NextResponse.json({ error: "Invalid modelType provided" }, { status: 400 });
    }

    if (!botResponseContent) {
        console.error(`API Route Error: Bot response content is null or empty after ${modelType} API call.`);
        return NextResponse.json({ error: `The AI service (${modelType}) did not return a valid response. Please check server logs for details.` }, { status: 500 });
    }
    console.log(`API Route Info: Sending successful response to client for model ${modelType}:`, { response: botResponseContent.substring(0,100) + "..."});
    return NextResponse.json({ response: botResponseContent });

  } catch (error: any) {
    console.error(`Critical error in /api/chat route (Model Type: ${modelTypeFromRequest || 'unknown'}):`, error);
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
