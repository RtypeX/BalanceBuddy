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

  // Ensure history is not empty and the last message is from the user
  if (!history || history.length === 0 || history[history.length - 1]?.role !== 'user') {
    console.error("Error generating response: Chat history is empty or last message not from user.");
    return { response: "It looks like there's no conversation yet, or I missed your last message. Send me a message!" };
  }

  const model = getGeminiModel();
  const formattedHistory = formatChatHistoryForGemini(history);

  // The history includes the latest user message. Pop it for sending separately.
  const latestUserMessage = formattedHistory.pop();

  // Basic check, though covered by the initial check
  if (!latestUserMessage || latestUserMessage.role !== 'user') {
      console.error("Internal error: History formatting failed.");
      return { response: "I seem to have lost track of the conversation. Could you please repeat?" };
  }


  try {
    // Start chat with the history *before* the last user message
    const chat = model.startChat({
      history: formattedHistory, // History excluding the latest user message
    });

    // Send the latest user message
    const result = await chat.sendMessage(latestUserMessage.parts);
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
    if (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID')) {
        return { response: "There seems to be an issue with the API configuration. Please check the API key." };
    }
    if (error.message.includes('quota')) {
         return { response: "The API quota has been exceeded. Please try again later." };
    }
     // Catch potential fetch errors or network issues
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
        return { response: "Sorry, I couldn't connect to the AI service. Please check your network connection." };
    }
    // Generic error for other cases
    return { response: "Sorry, I encountered an error trying to generate a response. Please try again later." };
  }
}
