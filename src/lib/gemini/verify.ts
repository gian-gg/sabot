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

// Convert File to Gemini API Part format
const fileToGenerativePart = async (file: File): Promise<Part> => {
  const buffer = await file.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(buffer).toString('base64'),
      mimeType: file.type,
    },
  };
};

// Parse and clean Gemini JSON response
const parseGeminiResponse = <T>(data: unknown): T => {
  if (typeof data !== 'string') {
    throw new Error('AI response did not return text');
  }

  const jsonString = data.replace(/```json\n?|```/g, '').trim();

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    throw new Error(`Failed to parse JSON from AI response: ${e}`);
  }
};

// Verify government ID and extract information
export async function verifyUserId(
  idType: IdType,
  file: File
): Promise<GovernmentIdInfo> {
  const ai = geminiClient();

  const imagePart = await fileToGenerativePart(file);
  const prompt = VERIFY_USER_ID_CHECK_PROMPT.replace(
    /__{EXPECTED_ID_TYPE}__/g,
    idType
  );

  const result = await ai.models.generateContent({
    model: geminiModel,
    contents: [
      {
        role: 'user',
        parts: [imagePart, { text: prompt }],
      },
    ],
  });

  return parseGeminiResponse<GovernmentIdInfo>(result.text);
}

// Verify liveness check and face matching
export async function verifyLivenessCheck(
  faceCapture: File,
  userIdCard: File,
  step: string
): Promise<LivenessCheckResult> {
  const ai = geminiClient();

  const [faceCapturePart, userIdCardPart] = await Promise.all([
    fileToGenerativePart(faceCapture),
    fileToGenerativePart(userIdCard),
  ]);

  const prompt = VERIFY_LIVENESS_CHECK_PROMPT.replace(
    /__LIVENESS_STEP__/g,
    step
  );

  const result = await ai.models.generateContent({
    model: geminiModel,
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          faceCapturePart, // Live selfie (first image)
          userIdCardPart, // Government ID (second image)
        ],
      },
    ],
  });

  return parseGeminiResponse<LivenessCheckResult>(result.text);
}
