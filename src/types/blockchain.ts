export interface NewWalletData {
  address: string;
  privateKey: string;
  mnemonic: string;
  encryptedKey: string;
}

export interface CreateBlockchainAgreementParams {
  otherParty: string; // Ethereum address
  detailsHash: string; // bytes32 hash of agreement details
}

export interface BlockchainAgreementEvent {
  partyA: string;
  partyB: string;
  totalFee: bigint;
  burnedAmount: bigint;
  devAmount: bigint;
  details: string;
  timestamp: bigint;
}

export interface BlockchainAgreement {
  partyA: string;
  partyB: string;
  details: string;
  timestamp: bigint;
}
