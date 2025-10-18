'use server';

import geminiClient from '@/lib/gemini';
import { Part } from '@google/genai';
import type { GovernmentIdInfo, IdType } from '@/types/verify';

import { idExtractionPromptTemplate, geminiModel } from '@/constants/gemini';

export async function extractID(
  idType: IdType,
  file: File
): Promise<GovernmentIdInfo> {
  const ai = geminiClient();
  // Read the uploaded file into a base64 string
  const buffer = await file.arrayBuffer();
  const base64Data = Buffer.from(buffer).toString('base64');

  // Build the image part for the AI request
  const imagePart: Part = {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };

  // Create the final prompt by injecting the expected ID type**
  const finalPrompt = idExtractionPromptTemplate.replace(
    /__{EXPECTED_ID_TYPE}__/g,
    idType
  );

  // Call the Gemini model with the image and the now-dynamic prompt
  const result = await ai.models.generateContent({
    model: geminiModel,
    contents: [
      {
        role: 'user',
        parts: [
          imagePart,
          {
            text: finalPrompt, // Use the final, updated prompt
          },
        ],
      },
    ],
  });

  try {
    const data = result.text;
    if (typeof data !== 'string') {
      throw new Error('AI response did not return text');
    }

    const jsonString = data.replace(/```json\n?|```/g, '').trim();
    // Parse the cleaned string

    return JSON.parse(jsonString);
  } catch (e) {
    throw new Error(`Failed to parse JSON from AI response: ${e}`);
  }
}
