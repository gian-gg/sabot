export const geminiModel = 'gemini-2.5-flash';

export const idExtractionPromptTemplate = `
You are an intelligent data extraction and verification assistant that analyzes government ID documents from images.

An "expected ID type" of "__{EXPECTED_ID_TYPE}__" will be provided. Your primary task is to verify if the document in the image matches this expected type. After verification, you must extract the key details.

Respond ONLY with a valid JSON object — no explanations, no extra text, no markdown.

Ensure you scan the entire document in the image to accurately determine its data before extraction, this is crucial for verification.

The JSON format must strictly follow this structure:
{
  "isVerified": boolean,
  "idType": string | null,
  "firstName": string | null,
  "lastName": string | null,
  "middleName": string | null,
  "idNumber": string | null,
  "dateOfBirth": string | null,
  "issueDate": string | null,
  "expiryDate": string | null,
  "address": string | null,
  "sex": string | null,
  "notes": string | null
}

**CRITICAL OVERRIDE RULE:**
- This is the most important rule. If you add ANY text to the "notes" field for any reason (e.g., verification failure, blurry image, glare), you MUST set all other personal data fields to null. The fields to nullify are: "idType", "firstName", "lastName", "middleName", "idNumber", "dateOfBirth", "issueDate", "expiryDate", "address", and "sex". The "isVerified" field should still be set correctly (e.g., false if there's a mismatch).

**VERIFICATION RULES:**
- If the document in the image **matches** the expected type "__{EXPECTED_ID_TYPE}__", you MUST set "isVerified" to true.
- If the document in the image **does NOT match** the expected type, you MUST set "isVerified" to false and add a note explaining the mismatch (e.g., "Verification failed: Expected __{EXPECTED_ID_TYPE}__ but detected National ID."). This will trigger the CRITICAL OVERRIDE RULE.

**GENERAL RULES:**
- Dates must be in YYYY-MM-DD format.
- If a field is not present or is unreadable, its value must be null.
- If the image quality is poor, add that information to the "notes" field. This will also trigger the CRITICAL OVERRIDE RULE.

Respond with valid JSON only.
`;

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
  "meetingLocation": "meeting place",
  "meetingTime": "time/date",
  "riskFlags": ["flag1", "flag2"],
  "confidence": 0.85,
  "extractedText": "full conversation text"
}

INSTRUCTIONS:
1. Detect platform from UI elements or colors.
2. Identify buyer/seller names.
3. Extract item, price, and currency.
4. Find meeting location and time.
5. List risk indicators (pressure, urgency, scams).
6. Include the full visible conversation text.
7. Use null for missing fields.
8. Confidence = 0–1, based on clarity.
9. Return pure JSON only.
`;
