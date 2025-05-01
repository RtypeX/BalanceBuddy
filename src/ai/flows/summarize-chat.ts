'use server';
/**
 * @fileOverview Optional flow to summarize chat history.
 *               This can be used to manage context window size for LLMs.
 *
 * - summarizeChat - Takes chat history and returns a summary.
 */

import { getGeminiModel } from '@/ai/ai-instance';
import type { ChatMessage } from './generate-response'; // Reuse the interface

export interface SummarizeChatInput {
  history: ChatMessage[];
}

export interface SummarizeChatOutput {
  summary: string;
}

export async function summarizeChat(input: SummarizeChatInput): Promise<SummarizeChatOutput> {
  const { history } = input;

  if (!history || history.length < 3) { // Don't summarize very short chats
    return { summary: "Conversation just started." };
  }

  const model = getGeminiModel(); // Use the same model instance

  // Combine history into a single text block for summarization prompt
  const conversationText = history.map(msg => `${msg.role}: ${msg.content}`).join('\n');

  const prompt = `Summarize the following fitness and wellness conversation concisely:\n\n${conversationText}\n\nSummary:`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;

    if (!response?.text()) {
      console.warn("Summarization failed to produce text:", response);
      return { summary: "[Summarization unavailable]" };
    }

    return { summary: response.text() };

  } catch (error) {
    console.error("Error during chat summarization:", error);
    return { summary: "[Error during summarization]" };
  }
}
