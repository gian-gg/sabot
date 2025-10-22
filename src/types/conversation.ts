export interface ConversationData {
  platform: 'whatsapp' | 'telegram' | 'messenger' | 'other';
  buyerName?: string;
  sellerName?: string;
  itemDescription?: string;
  transactionType: 'meetup' | 'online';
  productType: string;
  productModel: string;
  productCondition: string;
  proposedPrice?: number;
  currency?: string;
  meetingLocation?: string;
  meetingTime?: string;
  riskFlags: string[];
  confidence: number;
  extractedText: string;
}
