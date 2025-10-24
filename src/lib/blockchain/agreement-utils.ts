import { ethers } from 'ethers';

export interface TransactionData {
  partyA: string;
  partyB: string;
  details: string;
  timestamp: number;
}

export function generateAgreementHash(data: TransactionData): string {
  // Create a formatted summary string
  const summary = `
Transaction Details
------------------
Party A: ${data.partyA}
Party B: ${data.partyB}
Details: ${data.details}
Timestamp: ${new Date(data.timestamp).toISOString()}
`.trim();

  // Create hash of the summary
  return ethers.keccak256(ethers.toUtf8Bytes(summary));
}
