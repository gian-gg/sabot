import { GoogleGenAI } from '@google/genai';

export default function geminiClient(): GoogleGenAI {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    throw new Error(
      'GEMINI_API_KEY environment variable is not set on the server.'
    );
  }

  return new GoogleGenAI({ apiKey: API_KEY }); // Gemini client instance
}
