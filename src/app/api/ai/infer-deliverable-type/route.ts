import { NextRequest, NextResponse } from 'next/server';
import geminiClient from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const { itemName, itemDescription, category } = await request.json();

    if (!itemName) {
      return NextResponse.json(
        { error: 'Item name is required' },
        { status: 400 }
      );
    }

    const ai = geminiClient();

    const prompt = `
Analyze the following item details and determine the most appropriate deliverable type from these options:
- service: Work, consulting, maintenance, cleaning, tutoring, photography, etc.
- item: Physical goods, products, merchandise, electronics, clothing, furniture, etc.
- digital: Digital files, software, apps, games, ebooks, digital art, NFTs, etc.
- document: Papers, certificates, licenses, contracts, legal documents, etc.
- cash: Physical cash transactions, money, currency
- digital_transfer: Online payments, bank transfers, digital wallets, etc.

Item Name: ${itemName}
Description: ${itemDescription || 'No description provided'}
Category: ${category || 'No category provided'}

Respond with ONLY the deliverable type (one word) that best matches this item. Consider the context and nature of the item.
`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
    });

    const response = result.text;

    if (!response) {
      throw new Error('No response from AI');
    }

    // Clean up the response to get just the type
    const deliverableType = response.trim().toLowerCase();

    // Validate that it's one of our valid types
    const validTypes = [
      'service',
      'item',
      'digital',
      'document',
      'cash',
      'digital_transfer',
    ];
    const inferredType = validTypes.includes(deliverableType)
      ? deliverableType
      : 'item';

    return NextResponse.json({
      deliverableType: inferredType,
      confidence: 0.9, // High confidence for AI inference
    });
  } catch (error) {
    console.error('Error inferring deliverable type:', error);
    return NextResponse.json(
      { error: 'Failed to infer deliverable type' },
      { status: 500 }
    );
  }
}
