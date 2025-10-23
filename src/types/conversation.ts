export interface ConversationData {
  platform: 'whatsapp' | 'telegram' | 'messenger' | 'other';
  buyerName?: string;
  sellerName?: string;
  itemDescription?: string;
  transactionType: 'meetup' | 'online' | 'other';
  productType: string;
  productModel: string;
  productCondition: string;
  proposedPrice?: number;
  currency?: string;
  quantity?: number;
  meetingLocation?: string;
  meetingSchedule?: string; // Renamed from meetingTime, format: YYYY-MM-DDTHH:mm for datetime-local input
  deliveryAddress?: string;
  deliveryMethod?: string;
  riskFlags: string[];
  confidence: number;
  extractedText: string;
}
