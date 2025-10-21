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
