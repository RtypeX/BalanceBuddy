'use server';
/**
 * @fileOverview Handles generating chatbot responses using the Gemini API.
 *
 * - generateResponse - Takes chat history and generates the next assistant response.
 * - ChatMessage - Interface for chat messages.
 */

import { getGeminiModel } from '@/ai/ai-instance';
import type { Content, Part } from "@google/generative-ai";

// Define the structure for chat messages (consistent with UI)
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant'; // Use 'assistant' for UI consistency
  content: string;
  timestamp: number;
}

// Define the input type for the main function
export interface GenerateResponseInput {
  history: ChatMessage[]; // Pass the entire history
}

// Define the output type
export interface GenerateResponseOutput {
  response: string; // The generated text response
}

/**
 * Maps our ChatMessage role to the Gemini API's role ('user' or 'model').
 */
function mapRoleToGemini(role: ChatMessage['role']): 'user' | 'model' {
  return role === 'assistant' ? 'model' : 'user';
}

/**
 * Formats the chat history for the Gemini API.
 * @param history - The array of ChatMessage objects.
 * @returns The formatted history for the Gemini API.
 */
function formatChatHistoryForGemini(history: ChatMessage[]): Content[] {
  // Filter out potential empty messages and map roles/content
  return history
    .filter(msg => msg.content.trim() !== '')
    .map(msg => ({
      role: mapRoleToGemini(msg.role),
      parts: [{ text: msg.content }],
    }));
}

/**
 * Generates a response from the Gemini model based on the chat history.
 * @param input - An object containing the chat history.
 * @returns A promise resolving to the generated response text.
 */
export async function generateResponse(input: GenerateResponseInput): Promise<GenerateResponseOutput> {
  const { history } = input;

  // Ensure history is not empty
  if (!history || history.length === 0) {
    console.error("Error generating response: Chat history is empty.");
    return { response: "It looks like there's no conversation yet. Send me a message!" };
  }

  const model = getGeminiModel();
  const formattedHistory = formatChatHistoryForGemini(history);

  // Extract the latest user message (last item in formattedHistory)
  // The history should already include the latest user message before calling this function.
  const latestMessageContent = formattedHistory.pop(); // Remove last message to send separately

  if (!latestMessageContent || latestMessageContent.role !== 'user') {
    console.error("Error generating response: Last message in history is not from the user or history is malformed.");
    // Attempt to recover or return error
    if(history.length > 0 && history[history.length-1].role === 'user'){
        // If the formatting failed but the raw history looks okay, try sending just the last message
         latestMessageContent = { role: 'user', parts: [{ text: history[history.length-1].content }] };
         formattedHistory.pop(); // Remove the possibly incorrect last entry from formatted history too
         console.warn("Attempting recovery by sending only the last user message.");
    } else {
        return { response: "I seem to have lost track of the conversation. Could you please repeat your last message?" };
    }
  }


  try {
    // Start chat with the history *before* the last user message
    const chat = model.startChat({
      history: formattedHistory,
      // generationConfig: { // Optional: Adjust generation parameters if needed
      //   maxOutputTokens: 200,
      // }
    });

    // Send the latest user message
    const result = await chat.sendMessage(latestMessageContent.parts);
    const response = result.response;

    if (!response?.text()) {
      console.warn("Received empty response from Gemini:", response);
      // Check for safety ratings or other reasons for empty response
      if (response?.promptFeedback?.blockReason) {
         console.error("Response blocked due to:", response.promptFeedback.blockReason);
         return { response: "I can't respond to that due to safety guidelines. Let's talk about something else fitness-related!" };
      }
      return { response: "Sorry, I couldn't generate a response for that. Could you try rephrasing?" };
    }

    return { response: response.text() };

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    // Provide more specific feedback if possible
    if (error.message.includes('API key not valid')) {
        return { response: "There seems to be an issue with the API configuration. Please contact support." };
    }
    return { response: "Sorry, I encountered an error trying to generate a response. Please try again later." };
  }
}
