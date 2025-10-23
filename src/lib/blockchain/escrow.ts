/* eslint-disable */
// @ts-nocheck

/**
 * Blockchain Escrow Integration Library
 * Provides functions to interact with the AgreementLedger escrow smart contract
 */

import { ethers, BrowserProvider, Contract } from 'ethers';
import type { Log } from 'ethers';

// Import the ABI from compiled contract
// You'll need to update this path after deployment
import AgreementLedgerABI from './AgreementLedger.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_AGREEMENT_LEDGER_ADDRESS || '';

if (!CONTRACT_ADDRESS) {
  console.warn('Agreement Ledger contract address not configured');
}

// Deliverable types enum matching the smart contract
export enum DeliverableType {
  Crypto = 0,
  BankTransfer = 1,
  FileDeliverable = 2,
  PhysicalItem = 3,
  Service = 4,
  Hybrid = 5,
}

// Escrow status enum matching the smart contract
export enum EscrowStatus {
  Pending = 0,
  Active = 1,
  Completed = 2,
  Disputed = 3,
  Cancelled = 4,
  Expired = 5,
}

export interface BlockchainEscrowData {
  agreementId: bigint;
  initiator: string;
  participant: string;
  ethAmount: bigint;
  valueHash: string;
  proofHash: string;
  deliverableType: DeliverableType;
  initiatorConfirmed: boolean;
  participantConfirmed: boolean;
  initiatorProofSubmitted: boolean;
  participantProofSubmitted: boolean;
  disputed: boolean;
  proposedArbiter: string;
  initiatorApprovedArbiter: boolean;
  participantApprovedArbiter: boolean;
  activeArbiter: string;
  createdAt: bigint;
  expiresAt: bigint;
  status: EscrowStatus;
}

// declare window.ethereum on the global Window type so we don't need to cast to `any`
declare global {
  // lightweight provider interface avoiding `any`
  interface EthereumProvider {
    request?: (args: { method: string; params?: unknown }) => Promise<unknown>;
    on?: (
      eventName: string | symbol,
      listener: (...args: unknown[]) => void
    ) => void;
    removeListener?: (
      eventName: string | symbol,
      listener?: (...args: unknown[]) => void
    ) => void;
  }
  interface Window {
    ethereum?: EthereumProvider;
  }
}

/**
 * Get a signer from the browser wallet
 */
async function getSigner(): Promise<ethers.Signer> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum wallet detected');
  }

  const provider = new BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  return provider.getSigner();
}

/**
 * Get the contract instance
 */
async function getContract(): Promise<Contract> {
  const signer = await getSigner();
  return new Contract(CONTRACT_ADDRESS, AgreementLedgerABI, signer);
}

/**
 * Get read-only contract instance
 */
async function getContractReadOnly(): Promise<Contract> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No Ethereum wallet detected');
  }

  const provider = new BrowserProvider(window.ethereum);
  return new Contract(CONTRACT_ADDRESS, AgreementLedgerABI, provider);
}

/**
 * Create a blockchain escrow
 * @param agreementId - The on-chain agreement ID
 * @param valueHash - Hash of deliverable details (use ethers.keccak256(ethers.toUtf8Bytes(description)))
 * @param deliverableType - Type of deliverable
 * @param expirationDays - Number of days until expiration
 * @param ethAmount - Amount of ETH to lock (for crypto/hybrid types)
 */
export async function createBlockchainEscrow(
  agreementId: number,
  valueHash: string,
  deliverableType: DeliverableType,
  expirationDays: number,
  ethAmount?: string
): Promise<{ escrowId: number; txHash: string }> {
  const contract = await getContract();

  const options: { value?: bigint } = {};
  if (
    ethAmount &&
    (deliverableType === DeliverableType.Crypto ||
      deliverableType === DeliverableType.Hybrid)
  ) {
    options.value = ethers.parseEther(ethAmount);
  }

  const tx = await contract.createEscrow(
    agreementId,
    valueHash,
    deliverableType,
    expirationDays,
    options
  );

  const receipt = await tx.wait();

  // Find the EscrowCreated event to get the escrow ID
  const event = receipt.logs.find((log: Log) => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed?.name === 'EscrowCreated';
    } catch {
      return false;
    }
  });

  let escrowId = 0;
  if (event) {
    const parsed = contract.interface.parseLog(event);
    escrowId = Number(parsed?.args?.escrowId || 0);
  }

  return {
    escrowId,
    txHash: receipt.hash,
  };
}

/**
 * Join an existing escrow as participant
 * @param escrowId - The blockchain escrow ID
 */
export async function joinBlockchainEscrow(escrowId: number): Promise<string> {
  const contract = await getContract();
  const tx = await contract.joinEscrow(escrowId);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Submit proof of delivery/completion
 * @param escrowId - The blockchain escrow ID
 * @param proofHash - Hash of proof (bank receipt, file CID, etc.)
 */
export async function submitBlockchainProof(
  escrowId: number,
  proofHash: string
): Promise<string> {
  const contract = await getContract();
  const tx = await contract.submitProof(escrowId, proofHash);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Confirm escrow completion
 * @param escrowId - The blockchain escrow ID
 */
export async function confirmBlockchainEscrow(
  escrowId: number
): Promise<string> {
  const contract = await getContract();
  const tx = await contract.confirmCompletion(escrowId);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Raise a dispute for an escrow
 * @param escrowId - The blockchain escrow ID
 */
export async function raiseBlockchainDispute(
  escrowId: number
): Promise<string> {
  const contract = await getContract();
  const tx = await contract.raiseDispute(escrowId);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Propose an arbiter for a disputed escrow
 * @param escrowId - The blockchain escrow ID
 * @param arbiterAddress - The arbiter's wallet address
 */
export async function proposeBlockchainArbiter(
  escrowId: number,
  arbiterAddress: string
): Promise<string> {
  const contract = await getContract();
  const tx = await contract.proposeArbiter(escrowId, arbiterAddress);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Approve a proposed arbiter
 * @param escrowId - The blockchain escrow ID
 */
export async function approveBlockchainArbiter(
  escrowId: number
): Promise<string> {
  const contract = await getContract();
  const tx = await contract.approveArbiter(escrowId);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Resolve a dispute (arbiter only)
 * @param escrowId - The blockchain escrow ID
 * @param decision - "release", "refund", or "split"
 */
export async function resolveBlockchainDispute(
  escrowId: number,
  decision: 'release' | 'refund' | 'split'
): Promise<string> {
  const contract = await getContract();
  const tx = await contract.resolveDispute(escrowId, decision);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Cancel a pending escrow (initiator only)
 * @param escrowId - The blockchain escrow ID
 */
export async function cancelBlockchainEscrow(
  escrowId: number
): Promise<string> {
  const contract = await getContract();
  const tx = await contract.cancelEscrow(escrowId);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Handle an expired escrow (anyone can call)
 * @param escrowId - The blockchain escrow ID
 */
export async function handleExpiredBlockchainEscrow(
  escrowId: number
): Promise<string> {
  const contract = await getContract();
  const tx = await contract.handleExpiredEscrow(escrowId);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Get escrow details from blockchain
 * @param escrowId - The blockchain escrow ID
 */
export async function getBlockchainEscrow(
  escrowId: number
): Promise<BlockchainEscrowData> {
  const contract = await getContractReadOnly();
  const escrow = await contract.getEscrow(escrowId);

  return {
    agreementId: escrow.agreementId,
    initiator: escrow.initiator,
    participant: escrow.participant,
    ethAmount: escrow.ethAmount,
    valueHash: escrow.valueHash,
    proofHash: escrow.proofHash,
    deliverableType: Number(escrow.deliverableType) as DeliverableType,
    initiatorConfirmed: escrow.initiatorConfirmed,
    participantConfirmed: escrow.participantConfirmed,
    initiatorProofSubmitted: escrow.initiatorProofSubmitted,
    participantProofSubmitted: escrow.participantProofSubmitted,
    disputed: escrow.disputed,
    proposedArbiter: escrow.proposedArbiter,
    initiatorApprovedArbiter: escrow.initiatorApprovedArbiter,
    participantApprovedArbiter: escrow.participantApprovedArbiter,
    activeArbiter: escrow.activeArbiter,
    createdAt: escrow.createdAt,
    expiresAt: escrow.expiresAt,
    status: Number(escrow.status) as EscrowStatus,
  };
}

/**
 * Get all escrow IDs for a user
 * @param userAddress - The user's wallet address
 */
export async function getEscrowsByUser(userAddress: string): Promise<number[]> {
  const contract = await getContractReadOnly();
  const escrowIds = await contract.getEscrowsByUser(userAddress);
  return escrowIds.map((id: bigint) => Number(id));
}

/**
 * Get all escrow IDs for an agreement
 * @param agreementId - The on-chain agreement ID
 */
export async function getEscrowsForAgreement(
  agreementId: number
): Promise<number[]> {
  const contract = await getContractReadOnly();
  const escrowIds = await contract.getEscrowsForAgreement(agreementId);
  return escrowIds.map((id: bigint) => Number(id));
}

/**
 * Check if an escrow is expired
 * @param escrowId - The blockchain escrow ID
 */
export async function isEscrowExpired(escrowId: number): Promise<boolean> {
  const contract = await getContractReadOnly();
  return contract.isEscrowExpired(escrowId);
}

/**
 * Create a hash for a deliverable description
 * @param description - The deliverable description
 */
export function createValueHash(description: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(description));
}

/**
 * Create a hash for proof (bank receipt, file CID, etc.)
 * @param proof - The proof data
 */
export function createProofHash(proof: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(proof));
}

/**
 * Listen for escrow events
 * @param eventName - Name of the event to listen for
 * @param callback - Callback function to handle the event
 */
export async function listenToEscrowEvents(
  eventName:
    | 'EscrowCreated'
    | 'EscrowJoined'
    | 'EscrowConfirmed'
    | 'EscrowReleased'
    | 'EscrowDisputed'
    | 'ArbiterProposed'
    | 'ArbiterApproved'
    | 'ArbiterActivated'
    | 'EscrowResolved'
    | 'EscrowCancelled'
    | 'ProofSubmitted',
  callback: (...args: unknown[]) => void
): Promise<void> {
  const contract = await getContractReadOnly();

  // Wrap the user callback in a typed listener that accepts unknown[].
  // This avoids using `any` while remaining compatible with ethers' dynamic args.
  const listener = (...args: unknown[]) => {
    try {
      callback(...args);
    } catch (err) {
      // swallow or log — keep behavior safe in production
      console.error('Escrow event callback error:', err);
    }
  };
  /* eslint-enable no-console */

  contract.on(eventName, listener);
}

/**
 * Stop listening to escrow events
 * @param eventName - Name of the event to stop listening for
 */
export async function stopListeningToEscrowEvents(
  eventName:
    | 'EscrowCreated'
    | 'EscrowJoined'
    | 'EscrowConfirmed'
    | 'EscrowReleased'
    | 'EscrowDisputed'
    | 'ArbiterProposed'
    | 'ArbiterApproved'
    | 'ArbiterActivated'
    | 'EscrowResolved'
    | 'EscrowCancelled'
    | 'ProofSubmitted'
): Promise<void> {
  const contract = await getContractReadOnly();
  contract.removeAllListeners(eventName);
}

/**
 * Get the current user's wallet address
 */
export async function getCurrentWalletAddress(): Promise<string> {
  const signer = await getSigner();
  return signer.getAddress();
}

/**
 * Format ETH amount for display
 * @param weiAmount - Amount in wei
 */
export function formatEthAmount(weiAmount: bigint): string {
  return ethers.formatEther(weiAmount);
}

/**
 * Parse ETH amount from string to wei
 * @param ethAmount - Amount in ETH as string
 */
export function parseEthAmount(ethAmount: string): bigint {
  return ethers.parseEther(ethAmount);
}
