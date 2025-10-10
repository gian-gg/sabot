export type TransactionStatus = 'completed' | 'active' | 'pending' | 'reported';

export type TransactionType =
  | 'electronics'
  | 'services'
  | 'fashion'
  | 'home-goods'
  | 'vehicles'
  | 'collectibles'
  | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  buyerName: string;
  sellerName: string;
  price: number;
  currency: string;
  status: TransactionStatus;
  location: string;
  timestamp: Date;
  platform?: string;
}
