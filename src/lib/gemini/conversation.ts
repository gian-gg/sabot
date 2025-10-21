'use server';

import geminiClient from '@/lib/gemini';
import { Part } from '@google/genai';

export interface ConversationData {
  platform: 'whatsapp' | 'telegram' | 'messenger' | 'other';
  buyerName?: string;
  sellerName?: string;
  itemDescription?: string;
  agreedPrice?: number;
  currency?: string;
  meetingLocation?: string;
  meetingTime?: string;
  riskFlags: string[];
  confidence: number;
  extractedText: string;
}

const conversationPrompt = `
Analyze this conversation screenshot and extract key transaction information.
Return a JSON object with:
- platform: The messaging platform used (whatsapp, telegram, messenger, other)
- buyerName/sellerName: Names of parties if identifiable
- itemDescription: What is being sold
- agreedPrice: Final agreed price (number only)
- currency: Currency used (USD, PHP, etc.)
- meetingLocation: Where to meet
- meetingTime: When to meet
- riskFlags: Array of potential red flags or concerns
- confidence: Confidence score (0-1)
- extractedText: Full conversation text

Focus on identifying:
- Platform indicators (UI elements, branding, colors)
- Names and contact info
- Item details and pricing negotiations
- Meeting arrangements and logistics
- Any suspicious language, urgent requests, or red flags
- Payment methods discussed

Be thorough but conservative - only extract information you're confident about.
`;

export async function extractConversation(
  file: File
): Promise<ConversationData> {
  const ai = geminiClient();
  const buffer = await file.arrayBuffer();
  const base64Data = Buffer.from(buffer).toString('base64');

  const imagePart: Part = {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };

  const result = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          imagePart,
          {
            text: conversationPrompt,
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
    return JSON.parse(jsonString);
  } catch (e) {
    throw new Error(`Failed to parse JSON from AI response: ${e}`);
  }
}
