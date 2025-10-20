'use server';

import geminiClient from '@/lib/gemini';
import { Part } from '@google/genai';
import type {
  GovernmentIdInfo,
  IdType,
  LivenessCheckResult,
} from '@/types/verify';

import {
  VERIFY_USER_ID_CHECK_PROMPT,
  VERIFY_LIVENESS_CHECK_PROMPT,
  geminiModel,
} from '@/constants/gemini';

/**
 * A helper function to convert a File object into the Base64 Part format for the Gemini API.
 */
export const fileToGenerativePart = async (file: File): Promise<Part> => {
  const buffer = await file.arrayBuffer();
  const base64Data = Buffer.from(buffer).toString('base64');
  return {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };
};

export async function verifyUserId(
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
  const finalPrompt = VERIFY_USER_ID_CHECK_PROMPT.replace(
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

/**
 * Performs a liveness and face match verification using the Gemini API.
 * @param faceCapture The live selfie image file from the user.
 * @param userIdCard The government ID image file from the user.
 * @param step The specific liveness challenge the user was asked to perform.
 * @returns A promise that resolves to a structured LivenessCheckResult object.
 */
export async function verifyLivenessCheck(
  faceCapture: File,
  userIdCard: File,
  step: string
): Promise<LivenessCheckResult> {
  const ai = geminiClient();

  // Convert both image files into the required Part format
  const faceCapturePart = await fileToGenerativePart(faceCapture);
  const userIdCardPart = await fileToGenerativePart(userIdCard);

  // Create the final prompt by injecting the dynamic liveness step
  const finalPrompt = VERIFY_LIVENESS_CHECK_PROMPT.replace(
    /__LIVENESS_STEP__/g,
    step
  );

  // Call the Gemini model with the prompt and the two images in the correct order
  const result = await ai.models.generateContent({
    model: geminiModel,
    contents: [
      {
        role: 'user',
        parts: [
          // The order here is critical and must match the prompt's instructions
          { text: finalPrompt },
          faceCapturePart, // Referred to as the "First Image" in the prompt
          userIdCardPart, // Referred to as the "Second Image" in the prompt
        ],
      },
    ],
  });

  try {
    const data = result.text; // Or result.response.text() depending on SDK version
    if (typeof data !== 'string') {
      throw new Error('AI response did not return text');
    }

    // Clean the response to remove markdown fences and ensure it's a valid JSON string
    const jsonString = data.replace(/```json\n?|```/g, '').trim();

    // Parse the cleaned string and return it
    return JSON.parse(jsonString);
  } catch (e) {
    throw new Error(`Failed to parse JSON from AI response: ${e}`);
  }
}
