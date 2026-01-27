export const geminiModel = 'gemini-2.5-flash';

export const conversationPromptTemplate = `
Analyze this messaging app screenshot and extract transaction details. Look for WhatsApp, Telegram, Messenger, or other chat platforms.

Return ONLY a valid JSON object with this exact structure:
{
  "platform": "whatsapp|telegram|messenger|other",
  "buyerName": "name or null",
  "sellerName": "name or null",
  "itemDescription": "what's being sold",
  "transactionType": "meetup|online",
  "productType": "type of product",
  "productModel": "model of product",
  "productCondition": "new|used|refurbished|etc",
  "proposedPrice": 123.45,
  "currency": "USD|PHP|etc",
  "quantity": 1,
  "meetingLocation": "meeting place (for meetup transactions)",
  "meetingSchedule": "YYYY-MM-DDTHH:mm format (e.g., 2024-12-25T14:30) for meetup date and time",
  "deliveryAddress": "delivery address (for online/delivery transactions)",
  "deliveryMethod": "shipping method or courier (for online/delivery transactions)",
  "riskFlags": ["flag1", "flag2"],
  "confidence": 0.85,
  "extractedText": "full conversation text"
}

INSTRUCTIONS:
1. Detect platform from UI elements or colors.
2. Identify buyer/seller names.
3. Extract item, price, quantity, and currency.
4. For meetup transactions: Find meeting location and convert any mentioned date/time to YYYY-MM-DDTHH:mm format (e.g., "tomorrow at 2pm" → "2024-12-25T14:00").
5. For online/delivery transactions: Extract delivery address and shipping/courier method.
6. List risk indicators (pressure, urgency, scams).
7. Include the full visible conversation text.
8. Use null for missing fields.
9. Confidence = 0–1, based on clarity.
10. Return pure JSON only.
`;
