export type TransactionStatus =
  | 'completed'
  | 'active'
  | 'pending'
  | 'reported'
  | 'disputed';

export type TransactionType =
  | 'electronics'
  | 'services'
  | 'fashion'
  | 'home-goods'
  | 'vehicles'
  | 'collectibles'
  | 'other';

export type TransactionMethod = 'meetup' | 'online';

export interface Transaction {
  id: string;
  type: TransactionType;
  buyerName: string;
  sellerName: string;
  price: number;
  currency: string;
  status: TransactionStatus;
  method: TransactionMethod;
  location: string;
  timestamp: Date;
  platform?: string;
}
