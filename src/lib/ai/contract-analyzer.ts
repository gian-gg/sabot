'use server';

import geminiClient from '@/lib/gemini';
import { geminiModel } from '@/constants/gemini';

/**
 * Suggestion type from AI analysis
 */
export interface AISuggestion {
  id: string;
  type: 'grammar' | 'clause' | 'risk' | 'improvement';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestedText?: string;
  location?: string;
}

/**
 * Full analysis result from AI
 */
export interface ContractAnalysisResult {
  grammar: AISuggestion[];
  clauses: AISuggestion[];
  risks: AISuggestion[];
  improvements: AISuggestion[];
  summary: string;
}

/**
 * Analyze a legal contract for issues, grammar, risks, and missing clauses
 */
export async function analyzeContractDocument(
  htmlContent: string
): Promise<ContractAnalysisResult> {
  const ai = geminiClient();

  const analysisPrompt = `You are an expert legal document analyzer and contract reviewer. Analyze the following legal document/contract and provide comprehensive feedback.

LEGAL DOCUMENT TO ANALYZE:
${htmlContent}

Analyze this document for:
1. Grammatical errors and clarity improvements
2. Missing standard legal clauses
3. Ambiguous or vague terms
4. Legal risks and potential issues
5. General improvements for clarity and professionalism

Return ONLY a valid JSON object with this exact structure (no explanations, no extra text, no markdown):
{
  "grammar": [
    {
      "id": "g1",
      "type": "grammar",
      "severity": "low|medium|high",
      "title": "Issue title",
      "description": "What's wrong and why it matters",
      "suggestedText": "Improved text (optional)",
      "location": "Where in document this appears"
    }
  ],
  "clauses": [
    {
      "id": "c1",
      "type": "clause",
      "severity": "low|medium|high",
      "title": "Missing/Weak Clause Name",
      "description": "Why this clause is important",
      "suggestedText": "Suggested clause text",
      "location": "Where this should be added"
    }
  ],
  "risks": [
    {
      "id": "r1",
      "type": "risk",
      "severity": "low|medium|high",
      "title": "Risk description",
      "description": "Potential legal or business impact",
      "location": "Where this risk exists"
    }
  ],
  "improvements": [
    {
      "id": "i1",
      "type": "improvement",
      "severity": "low|medium|high",
      "title": "Improvement suggestion",
      "description": "How to improve this section",
      "suggestedText": "Improved text (optional)",
      "location": "Section to improve"
    }
  ],
  "summary": "A 2-3 sentence summary of overall contract quality and key concerns"
}

IMPORTANT RULES:
- Set severity to "high" only for critical legal issues
- Set severity to "medium" for important but non-critical issues
- Set severity to "low" for minor improvements
- suggestedText is optional but recommended for grammar and improvements
- location should be specific section or clause reference
- If a category has no issues, return an empty array
- Return pure JSON only`;

  try {
    const result = await ai.models.generateContent({
      model: geminiModel,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: analysisPrompt,
            },
          ],
        },
      ],
    });

    const responseText = result.text;
    if (typeof responseText !== 'string') {
      throw new Error('AI response did not return text');
    }

    // Parse the JSON response
    const jsonString = responseText.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(jsonString);

    // Validate response structure
    const analysis: ContractAnalysisResult = {
      grammar: Array.isArray(parsed.grammar) ? parsed.grammar : [],
      clauses: Array.isArray(parsed.clauses) ? parsed.clauses : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      improvements: Array.isArray(parsed.improvements)
        ? parsed.improvements
        : [],
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    };

    // Add unique IDs if missing
    [
      ...analysis.grammar,
      ...analysis.clauses,
      ...analysis.risks,
      ...analysis.improvements,
    ].forEach((suggestion, index) => {
      if (!suggestion.id) {
        suggestion.id = `${suggestion.type}-${index}`;
      }
    });

    return analysis;
  } catch (error) {
    console.error('Error analyzing contract:', error);
    throw new Error(
      `Failed to analyze contract: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check grammar and clarity of a specific section
 */
export async function checkGrammar(sectionContent: string): Promise<string> {
  const ai = geminiClient();

  const grammarPrompt = `You are a grammar and legal writing expert. Review this legal document section for:
1. Grammatical errors
2. Clarity and readability improvements
3. Professional tone alignment
4. Ambiguous or unclear language

Section to review:
${sectionContent}

Provide a brief, concise analysis of issues and improvements needed. Format as plain text, not JSON.`;

  try {
    const result = await ai.models.generateContent({
      model: geminiModel,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: grammarPrompt,
            },
          ],
        },
      ],
    });

    return typeof result.text === 'string'
      ? result.text
      : 'Unable to analyze grammar';
  } catch (error) {
    console.error('Error checking grammar:', error);
    throw new Error('Failed to check grammar');
  }
}

/**
 * Get AI-powered explanation of a clause
 */
export async function explainClause(clauseText: string): Promise<string> {
  const ai = geminiClient();

  const explanationPrompt = `You are a legal expert explaining contract clauses to non-lawyers. Explain this clause in simple, clear language:

Clause:
${clauseText}

Provide:
1. What this clause means in simple terms
2. Why it's important
3. What it means for both parties
4. Any key terms defined

Keep explanation under 200 words and easy to understand.`;

  try {
    const result = await ai.models.generateContent({
      model: geminiModel,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: explanationPrompt,
            },
          ],
        },
      ],
    });

    return typeof result.text === 'string'
      ? result.text
      : 'Unable to explain clause';
  } catch (error) {
    console.error('Error explaining clause:', error);
    throw new Error('Failed to explain clause');
  }
}

/**
 * Simplify and clarify legal language
 */
export async function simplifyLanguage(complexText: string): Promise<string> {
  const ai = geminiClient();

  const simplificationPrompt = `You are a legal writing expert who specializes in making legal documents clear and accessible. Rewrite this legal text to be clearer and simpler while maintaining the same legal meaning:

Original text:
${complexText}

Provide ONLY the simplified version, no explanations.`;

  try {
    const result = await ai.models.generateContent({
      model: geminiModel,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: simplificationPrompt,
            },
          ],
        },
      ],
    });

    return typeof result.text === 'string'
      ? result.text
      : 'Unable to simplify text';
  } catch (error) {
    console.error('Error simplifying language:', error);
    throw new Error('Failed to simplify language');
  }
}

/**
 * Identify missing standard clauses
 */
export async function suggestMissingClauses(
  documentContent: string
): Promise<AISuggestion[]> {
  const ai = geminiClient();

  const suggestionPrompt = `You are a contract drafting expert. Review this document and identify missing standard legal clauses that should be included based on the document type and content.

Document content:
${documentContent}

Return ONLY a valid JSON array of missing clause suggestions with this structure (no explanations):
[
  {
    "id": "clause_1",
    "type": "clause",
    "severity": "high|medium|low",
    "title": "Clause name",
    "description": "Why this clause is needed",
    "suggestedText": "Suggested clause text"
  }
]

Focus on important clauses that would strengthen the document. Return empty array if no missing clauses.`;

  try {
    const result = await ai.models.generateContent({
      model: geminiModel,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: suggestionPrompt,
            },
          ],
        },
      ],
    });

    const responseText = result.text;
    if (typeof responseText !== 'string') {
      return [];
    }

    const jsonString = responseText.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(jsonString);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error suggesting missing clauses:', error);
    return [];
  }
}

/**
 * Identify legal risks in the document
 */
export async function identifyRisks(
  documentContent: string
): Promise<AISuggestion[]> {
  const ai = geminiClient();

  const riskPrompt = `You are a legal risk assessment expert. Analyze this document for potential legal, financial, and business risks.

Document:
${documentContent}

Return ONLY a valid JSON array of identified risks with this structure (no explanations):
[
  {
    "id": "risk_1",
    "type": "risk",
    "severity": "high|medium|low",
    "title": "Risk description",
    "description": "What could go wrong and potential impact",
    "location": "Where this risk exists in the document"
  }
]

Only include material risks that could have significant impact. Return empty array if no significant risks.`;

  try {
    const result = await ai.models.generateContent({
      model: geminiModel,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: riskPrompt,
            },
          ],
        },
      ],
    });

    const responseText = result.text;
    if (typeof responseText !== 'string') {
      return [];
    }

    const jsonString = responseText.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(jsonString);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error identifying risks:', error);
    return [];
  }
}
