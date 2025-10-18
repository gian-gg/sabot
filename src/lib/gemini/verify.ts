'use server';

import { GoogleGenAI, Part } from '@google/genai';
import type { GovernmentIdInfo } from '@/types/verify';

import { idExtractionPrompt as prompt, geminiModel } from '@/constants/gemini';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error(
    'GEMINI_API_KEY environment variable is not set on the server.'
  );
}
const ai = new GoogleGenAI({}); // Gemini client instance

export async function extractID(file: File): Promise<GovernmentIdInfo> {
  // Read the uploaded file into a base64 string for inline sending
  const buffer = await file.arrayBuffer();
  const base64Data = Buffer.from(buffer).toString('base64');

  // Build the image part to include in the AI request
  const imagePart: Part = {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };

  // Call the Gemini model with the image and prompt
  const result = await ai.models.generateContent({
    model: geminiModel,
    contents: [
      {
        role: 'user',
        parts: [
          imagePart,
          {
            text: prompt,
          },
        ],
      },
    ],
  });

  try {
    // Expect the model response as a JSON string
    const data = result.text;
    if (typeof data !== 'string') {
      throw new Error('AI response did not return text');
    }

    // Parse and return the structured GovernmentIdInfo
    return JSON.parse(data) as GovernmentIdInfo;
  } catch (e) {
    throw new Error(`Failed to parse JSON from AI response: ${e}`);
  }
}
