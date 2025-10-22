'use server';

import geminiClient from '@/lib/gemini';
import type { ConversationData } from '@/types/conversation'; // assuming you move the interface here
import { conversationPromptTemplate, geminiModel } from '@/constants/gemini'; // keep prompt externally like the ID version
import { Part } from '@google/genai';

export async function extractConversation(
  file: File
): Promise<ConversationData> {
  const ai = geminiClient();

  // Convert file to base64 string
  const buffer = await file.arrayBuffer();
  const base64Data = Buffer.from(buffer).toString('base64');

  // Build the image part for the AI request
  const imagePart: Part = {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };

  // Build the content structure for Gemini API
  const result = await ai.models.generateContent({
    model: geminiModel,
    contents: [
      {
        role: 'user',
        parts: [
          imagePart,
          {
            text: conversationPromptTemplate,
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
    const parsed = JSON.parse(jsonString);

    // ✅ Basic validation & defaults
    return {
      platform: parsed.platform || 'other',
      buyerName: parsed.buyerName ?? undefined,
      sellerName: parsed.sellerName ?? undefined,
      transactionType: parsed.transactionType || 'other',
      itemDescription: parsed.itemDescription ?? undefined,
      productType: parsed.productType ?? undefined,
      productModel: parsed.productModel ?? undefined,
      productCondition: parsed.productCondition ?? undefined,
      proposedPrice:
        typeof parsed.proposedPrice === 'number'
          ? parsed.proposedPrice
          : parseFloat(parsed.proposedPrice) || undefined,
      currency: parsed.currency ?? undefined,
      quantity:
        typeof parsed.quantity === 'number'
          ? parsed.quantity
          : parseInt(parsed.quantity) || undefined,
      meetingLocation: parsed.meetingLocation ?? undefined,
      meetingSchedule: parsed.meetingSchedule ?? undefined,
      deliveryAddress: parsed.deliveryAddress ?? undefined,
      deliveryMethod: parsed.deliveryMethod ?? undefined,
      riskFlags: Array.isArray(parsed.riskFlags) ? parsed.riskFlags : [],
      confidence:
        typeof parsed.confidence === 'number'
          ? Math.max(0, Math.min(1, parsed.confidence))
          : 0,
      extractedText: parsed.extractedText ?? '',
    };
  } catch (e) {
    throw new Error(`Failed to parse JSON from AI response: ${e}`);
  }
}
