'use server';

import geminiClient from '@/lib/gemini';
import { Part } from '@google/genai';

export interface DeliverableVerificationData {
  verified: boolean;
  confidence: number;
  reason: string;
  details: {
    deliverableType: string;
    evidenceFound: string[];
    qualityScore: number;
    completenessScore: number;
    authenticityScore: number;
  };
}

const deliverableVerificationPrompt = `
You are an AI oracle for verifying deliverable completion in an escrow system. 

DELIVERABLE DETAILS:
- Type: {DELIVERABLE_TYPE}
- Title: {DELIVERABLE_TITLE}
- Description: {DELIVERABLE_DESCRIPTION}
- Party Responsible: {PARTY_RESPONSIBLE}
- Expected Completion: {EXPECTED_DATE}

PROOF FILES PROVIDED:
{PROOF_FILES}

PROOF DESCRIPTION:
{PROOF_DESCRIPTION}

Your task is to analyze the provided proof files and determine if the deliverable has been completed satisfactorily.

Return ONLY a valid JSON object with this exact structure:
{
  "verified": boolean,
  "confidence": number (0-1),
  "reason": "detailed explanation of your decision",
  "details": {
    "deliverableType": "the type of deliverable being verified",
    "evidenceFound": ["list", "of", "evidence", "items", "found"],
    "qualityScore": number (0-1),
    "completenessScore": number (0-1),
    "authenticityScore": number (0-1)
  }
}

VERIFICATION CRITERIA:
1. **Product Deliverables**: Look for clear images/videos showing the item in good condition, packaging, receipts, or delivery confirmations
2. **Service Deliverables**: Look for completion certificates, before/after photos, work logs, or service confirmations
3. **Payment Deliverables**: Look for payment receipts, bank statements, transaction confirmations, or payment screenshots
4. **Document Deliverables**: Look for signed contracts, certificates, licenses, or official documents

SCORING GUIDELINES:
- **Quality Score**: How clear and professional are the proof files? (0-1)
- **Completeness Score**: How well do the proofs demonstrate completion? (0-1)  
- **Authenticity Score**: How genuine and trustworthy do the proofs appear? (0-1)

DECISION RULES:
- Set verified=true if confidence >= 0.5 AND at least 2 scores >= 0.4
- Set verified=false only if evidence is clearly insufficient, fake, or completely unrelated
- Be lenient and fair - accept reasonable evidence of completion
- Consider the deliverable type and what would constitute reasonable proof
- Give benefit of doubt when evidence is partially unclear

Respond with valid JSON only.
`;

export async function verifyDeliverableCompletion(
  files: File[],
  deliverableData: {
    type: string;
    title: string;
    description: string;
    party_responsible: string;
    expected_date: string | null;
  },
  proofDescription: string
): Promise<DeliverableVerificationData> {
  const ai = geminiClient();

  // Convert files to base64 and create image parts
  const imageParts: Part[] = [];

  for (const file of files) {
    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');

    imageParts.push({
      inlineData: {
        data: base64Data,
        mimeType: file.type,
      },
    });
  }

  // Build proof files description
  const proofFilesDescription = files
    .map(
      (file, index) =>
        `${index + 1}. ${file.name} (${file.type}, ${Math.round(file.size / 1024)}KB)`
    )
    .join('\n');

  // Replace placeholders in prompt
  const prompt = deliverableVerificationPrompt
    .replace('{DELIVERABLE_TYPE}', deliverableData.type)
    .replace('{DELIVERABLE_TITLE}', deliverableData.title)
    .replace(
      '{DELIVERABLE_DESCRIPTION}',
      deliverableData.description || 'No description provided'
    )
    .replace('{PARTY_RESPONSIBLE}', deliverableData.party_responsible)
    .replace(
      '{EXPECTED_DATE}',
      deliverableData.expected_date || 'No date specified'
    )
    .replace('{PROOF_FILES}', proofFilesDescription)
    .replace(
      '{PROOF_DESCRIPTION}',
      proofDescription || 'No description provided'
    );

  // Build the content structure for Gemini API
  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          ...imageParts,
          {
            text: prompt,
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

    // Validate and return the response
    return {
      verified: Boolean(parsed.verified),
      confidence: Math.max(0, Math.min(1, parsed.confidence || 0)),
      reason: parsed.reason || 'No reason provided',
      details: {
        deliverableType:
          parsed.details?.deliverableType || deliverableData.type,
        evidenceFound: Array.isArray(parsed.details?.evidenceFound)
          ? parsed.details.evidenceFound
          : [],
        qualityScore: Math.max(
          0,
          Math.min(1, parsed.details?.qualityScore || 0)
        ),
        completenessScore: Math.max(
          0,
          Math.min(1, parsed.details?.completenessScore || 0)
        ),
        authenticityScore: Math.max(
          0,
          Math.min(1, parsed.details?.authenticityScore || 0)
        ),
      },
    };
  } catch (e) {
    throw new Error(`Failed to parse JSON from AI response: ${e}`);
  }
}
