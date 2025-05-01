'use server';

import {GoogleGenerativeAI} from "@google/generative-ai";
import {NextResponse} from 'next/server';
import {retry, Retry} from "google-gax";

const {Exponential} = retry;
const MODEL_NAME = "gemini-pro";

/**
 * @fileOverview An endpoint that that uses Gemini to respond to work out prompts.
 *
 * - POST - Post a request to the server, respond with work out related advice.
 */
export async function POST(req: Request) {
  try {
    const {message} = await req.json();

    if (!message) {
      return NextResponse.json({error: "No message provided"}, {status: 400});
    }

    if (!process.env.GOOGLE_GENAI_API_KEY) {
      console.error("Missing GOOGLE_GENAI_API_KEY environment variable.");
      return NextResponse.json(
        {error: "Missing GOOGLE_GENAI_API_KEY environment variable. "},
        {status: 500}
      );
    }
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

    const model = genAI.getGenerativeModel({model: MODEL_NAME});

    const retryableGenerateContent = new Retry({
      retryCodes: ["UNAVAILABLE"],
      backoffSettings: {
        initialRetryDelayMillis: 1000,
        retryDelayMultiplier: 1.3,
        maxRetryDelayMillis: 60000,
        totalTimeoutMillis: 300000
      },
      retryableStatusCodes: [503, 500]
    }).wrap(model.generateContent.bind(model));
    const result = await retryableGenerateContent(message);
    const response = result.response;

    if (!response.text()) {
      console.warn("No text in response:", response);
      throw new Error("No response text");
    }

    return NextResponse.json({advice: response.text()});
  } catch (error: any) {
    console.error("Error generating workout advice:", error);
    return NextResponse.json({error: "Failed to generate advice"}, {status: 500});
  }
}
