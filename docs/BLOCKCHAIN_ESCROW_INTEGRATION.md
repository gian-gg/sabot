# Blockchain Escrow Integration Guide

Complete guide for integrating blockchain-backed escrow functionality into the Sabot platform.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Smart Contract Integration](#smart-contract-integration)
4. [Frontend Integration](#frontend-integration)
5. [Backend Integration](#backend-integration)
6. [Usage Examples](#usage-examples)
7. [Event Handling](#event-handling)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Overview

The blockchain escrow system integrates with the existing AgreementLedger smart contract to provide:

- **Trustless fund management** for crypto transactions
- **On-chain proof storage** for non-crypto deliverables (bank transfers, files, physical items, services)
- **Dual confirmation** mechanism
- **Dispute resolution** with mutual arbiter selection
- **Automatic refunds** for expired escrows

### Key Features

✅ Multiple deliverable types (Crypto, BankTransfer, FileDeliverable, PhysicalItem, Service, Hybrid)  
✅ ETH locking for crypto escrows  
✅ Hash-based verification for non-crypto deliverables  
✅ 2% platform fee on completion  
✅ 1% arbiter fee for dispute resolution  
✅ ReentrancyGuard security  
✅ Expiration handling

---

## Architecture

### Data Flow

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   Frontend  │─────▶│   Backend    │─────▶│   Supabase DB   │
│  (Next.js)  │◀─────│   (API)      │◀─────│  (PostgreSQL)   │
└─────────────┘      └──────────────┘      └─────────────────┘
       │                                              │
       │                                              │
       ▼                                              ▼
┌─────────────────────────────────────────────────────────────┐
│            Blockchain (Lisk Sepolia)                        │
│  ┌──────────────────────────────────────────────┐           │
│  │  AgreementLedger Smart Contract               │           │
│  │  - Agreements                                 │           │
│  │  - Escrows                                    │           │
│  │  - SBT Token                                  │           │
│  └──────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### Hybrid Approach

- **Off-chain (Supabase)**: UI state, metadata, user profiles, notifications
- **On-chain (Blockchain)**: Fund custody, immutable proof, status verification
- **Synchronization**: Blockchain events trigger Supabase updates

---

## Smart Contract Integration

### Prerequisites

1. **Deploy the contract** to Lisk Sepolia testnet
2. **Save the contract address** in environment variables
3. **Export the ABI** to the frontend

### Deployment Steps

```bash
cd SabotBlockchain/transaction-smart-contract

# Compile
pnpm hardhat compile

# Run tests
pnpm hardhat test

# Deploy to Lisk Sepolia
pnpm hardhat run scripts/deploy.ts --network sepolia
```

### Environment Configuration

Add to `.env.local` in the Next.js project:

```env
NEXT_PUBLIC_AGREEMENT_LEDGER_ADDRESS=0x...  # Contract address from deployment
NEXT_PUBLIC_CHAIN_ID=4202                   # Lisk Sepolia chain ID
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia-api.lisk.com
```

### Export Contract ABI

After compilation, copy the ABI:

```bash
# From: SabotBlockchain/transaction-smart-contract/artifacts/contracts/AgreementLedger.sol/AgreementLedger.json
# To: sabot/src/lib/blockchain/AgreementLedger.json
```

---

## Frontend Integration

### Installation

The blockchain integration library is located at `src/lib/blockchain/escrow.ts`.

### Basic Usage

```typescript
import {
  createBlockchainEscrow,
  joinBlockchainEscrow,
  confirmBlockchainEscrow,
  DeliverableType,
  createValueHash,
} from '@/lib/blockchain/escrow';

// Create a crypto escrow
const { escrowId, txHash } = await createBlockchainEscrow(
  agreementId, // On-chain agreement ID
  createValueHash('Laptop purchase - MacBook Pro 16"'),
  DeliverableType.Crypto,
  30, // 30 days expiration
  '1.0' // 1 ETH
);

// Join the escrow as participant
await joinBlockchainEscrow(escrowId);

// Confirm completion
await confirmBlockchainEscrow(escrowId);
```

### Deliverable Types

```typescript
enum DeliverableType {
  Crypto = 0, // ETH/crypto funds
  BankTransfer = 1, // Digital bank transfer (proof hash)
  FileDeliverable = 2, // File delivery (IPFS CID)
  PhysicalItem = 3, // Physical item (tracking number)
  Service = 4, // Service delivery (completion proof)
  Hybrid = 5, // Multiple types combined
}
```

### Creating Hash References

```typescript
import { createValueHash, createProofHash } from '@/lib/blockchain/escrow';
import { ethers } from 'ethers';

// For bank transfer escrow
const transferDetails = 'Transfer of $5000 to account ****1234';
const valueHash = createValueHash(transferDetails);

// For file deliverable
const fileCID = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';
const valueHash = createValueHash(`File: ${fileCID}`);

// Later, submit proof
const bankReceipt = 'Receipt ID: RCP-20251021-1234, Confirmed';
const proofHash = createProofHash(bankReceipt);
await submitBlockchainProof(escrowId, proofHash);
```

---

## Backend Integration

### Database Schema

The migration `009_add_blockchain_escrow_integration.sql` adds:

**Fields added to `escrows` table:**

- `blockchain_escrow_id` - Contract escrow ID
- `blockchain_tx_hash` - Creation transaction hash
- `blockchain_agreement_id` - On-chain agreement ID
- `blockchain_created_at` - Blockchain creation timestamp
- `blockchain_updated_at` - Last blockchain update
- `is_blockchain_escrow` - Boolean flag
- `blockchain_status` - Status from blockchain
- `blockchain_value_hash` - Deliverable hash
- `blockchain_proof_hash` - Proof hash

**New table: `blockchain_escrow_events`**

- Tracks all blockchain events
- Links to Supabase escrows
- Stores transaction hashes and event data

### API Endpoint Updates

#### Create Escrow with Blockchain

```typescript
// POST /api/escrow/create
const response = await fetch('/api/escrow/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Laptop Purchase',
    deliverables: [
      {
        type: 'cash',
        description: 'Payment for MacBook Pro',
        value: 1.0,
        currency: 'ETH',
        party_responsible: 'participant',
      },
    ],
    // Blockchain fields
    blockchain_escrow_id: escrowId,
    blockchain_tx_hash: txHash,
    blockchain_agreement_id: agreementId,
    blockchain_value_hash: valueHash,
    blockchain_created_at: new Date().toISOString(),
  }),
});
```

#### Confirm Escrow with Blockchain

```typescript
// POST /api/escrow/confirm
await fetch('/api/escrow/confirm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    escrow_id: supabaseEscrowId,
    blockchain_tx_hash: confirmTxHash, // Transaction hash from blockchain
    confirmation_notes: 'Received as described',
  }),
});
```

---

## Usage Examples

### Example 1: Crypto Escrow (ETH Payment)

```typescript
'use client';

import { useState } from 'react';
import { createBlockchainEscrow, confirmBlockchainEscrow, DeliverableType, createValueHash } from '@/lib/blockchain/escrow';

export default function CryptoEscrowExample() {
  const [escrowId, setEscrowId] = useState<number | null>(null);

  const handleCreate = async () => {
    try {
      const { escrowId, txHash } = await createBlockchainEscrow(
        0,  // agreementId
        createValueHash('Payment for freelance work'),
        DeliverableType.Crypto,
        30,
        '0.5'  // 0.5 ETH
      );

      setEscrowId(escrowId);

      // Create in Supabase
      await fetch('/api/escrow/create', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Freelance Payment',
          blockchain_escrow_id: escrowId,
          blockchain_tx_hash: txHash,
          // ... other fields
        }),
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleConfirm = async () => {
    if (!escrowId) return;

    const txHash = await confirmBlockchainEscrow(escrowId);

    // Update Supabase
    await fetch('/api/escrow/confirm', {
      method: 'POST',
      body: JSON.stringify({
        escrow_id: 'supabase-uuid',
        blockchain_tx_hash: txHash,
      }),
    });
  };

  return (
    <div>
      <button onClick={handleCreate}>Create Escrow</button>
      {escrowId && <button onClick={handleConfirm}>Confirm</button>}
    </div>
  );
}
```

### Example 2: Bank Transfer Escrow

```typescript
import {
  DeliverableType,
  createValueHash,
  submitBlockchainProof,
  createProofHash,
} from '@/lib/blockchain/escrow';

async function createBankTransferEscrow() {
  // Create without ETH
  const transferDescription = 'Wire transfer of $10,000 USD to account ***4567';
  const valueHash = createValueHash(transferDescription);

  const { escrowId } = await createBlockchainEscrow(
    agreementId,
    valueHash,
    DeliverableType.BankTransfer,
    7 // 7 days
    // No ETH amount
  );

  // Later, submit proof of transfer
  const bankReceipt = 'Swift: BOFAUS3N, Ref: TXN-20251021-9876, Confirmed';
  const proofHash = createProofHash(bankReceipt);

  await submitBlockchainProof(escrowId, proofHash);
}
```

### Example 3: File Deliverable (IPFS)

```typescript
async function createFileEscrow() {
  // Upload file to IPFS first, get CID
  const fileCID = 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG';

  const valueHash = createValueHash(`Design files: ${fileCID}`);

  const { escrowId } = await createBlockchainEscrow(
    agreementId,
    valueHash,
    DeliverableType.FileDeliverable,
    14 // 14 days
  );

  // Submit proof that files were delivered
  const proofHash = createProofHash(
    `Delivered: ${fileCID}, Downloaded by participant`
  );
  await submitBlockchainProof(escrowId, proofHash);
}
```

---

## Event Handling

### Listening to Blockchain Events

```typescript
import { listenToEscrowEvents } from '@/lib/blockchain/escrow';

// Listen for escrow completion
await listenToEscrowEvents(
  'EscrowReleased',
  (escrowId, recipient, amount, event) => {
    console.log(
      `Escrow ${escrowId} completed! ${amount} wei sent to ${recipient}`
    );

    // Update UI or trigger notification
    updateEscrowStatus(escrowId, 'completed');
  }
);

// Listen for disputes
await listenToEscrowEvents('EscrowDisputed', (escrowId, disputer, event) => {
  console.log(`Escrow ${escrowId} disputed by ${disputer}`);

  // Notify arbiters
  notifyArbitersPool(escrowId);
});
```

### Event-Driven Updates

Create a background service to sync blockchain events:

```typescript
// src/services/blockchain-sync.ts
import { listenToEscrowEvents } from '@/lib/blockchain/escrow';
import { createClient } from '@/lib/supabase/server';

export async function startBlockchainSync() {
  const supabase = createClient();

  // Sync escrow confirmations
  await listenToEscrowEvents(
    'EscrowConfirmed',
    async (escrowId, confirmer, isInitiator) => {
      await supabase.from('blockchain_escrow_events').insert({
        blockchain_escrow_id: escrowId,
        event_type: 'EscrowConfirmed',
        event_data: { confirmer, isInitiator },
      });
    }
  );

  // Sync completions
  await listenToEscrowEvents(
    'EscrowReleased',
    async (escrowId, recipient, amount) => {
      await supabase
        .from('escrows')
        .update({
          status: 'completed',
          blockchain_status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('blockchain_escrow_id', escrowId);
    }
  );
}
```

---

## Testing

### Unit Tests

```typescript
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Blockchain Escrow Integration', () => {
  it('should create and complete crypto escrow', async () => {
    const [initiator, participant] = await ethers.getSigners();

    // Create escrow with 1 ETH
    const tx = await contract.createEscrow(
      0, // agreementId
      ethers.keccak256(ethers.toUtf8Bytes('Test deliverable')),
      0, // Crypto type
      30,
      { value: ethers.parseEther('1.0') }
    );

    await tx.wait();

    // Participant joins
    await contract.connect(participant).joinEscrow(0);

    // Both confirm
    await contract.connect(initiator).confirmCompletion(0);
    await contract.connect(participant).confirmCompletion(0);

    // Check status
    const escrow = await contract.getEscrow(0);
    expect(escrow.status).to.equal(2); // Completed
  });
});
```

### Integration Tests

Test the full stack (frontend → backend → blockchain):

```typescript
describe('Full Stack Escrow Flow', () => {
  it('should create escrow in both Supabase and blockchain', async () => {
    // 1. Create on blockchain
    const { escrowId, txHash } = await createBlockchainEscrow(...);

    // 2. Create in Supabase
    const response = await fetch('/api/escrow/create', {
      method: 'POST',
      body: JSON.stringify({ blockchain_escrow_id: escrowId, ... }),
    });

    const { escrow } = await response.json();

    // 3. Verify both exist
    expect(escrow.blockchain_escrow_id).to.equal(escrowId);
    const blockchainEscrow = await getBlockchainEscrow(escrowId);
    expect(blockchainEscrow.status).to.equal(EscrowStatus.Pending);
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. "No Ethereum wallet detected"

**Solution:** Ensure MetaMask or another Web3 wallet is installed and connected.

```typescript
if (typeof window.ethereum === 'undefined') {
  alert('Please install MetaMask to use blockchain features');
  return;
}
```

#### 2. Wrong network

**Solution:** Check the user is on Lisk Sepolia (Chain ID: 4202)

```typescript
const chainId = await window.ethereum.request({ method: 'eth_chainId' });
if (chainId !== '0x106a') {
  // 4202 in hex
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x106a' }],
  });
}
```

#### 3. Insufficient gas

**Solution:** Ensure wallet has enough ETH for gas fees.

```typescript
const balance = await provider.getBalance(userAddress);
if (balance < ethers.parseEther('0.01')) {
  alert('Insufficient ETH for gas fees');
}
```

#### 4. Contract not deployed

**Solution:** Verify contract address in environment variables.

```bash
# Check .env.local
NEXT_PUBLIC_AGREEMENT_LEDGER_ADDRESS=0x...
```

#### 5. Transaction reverted

**Solution:** Check error message and contract requirements.

```typescript
try {
  await createBlockchainEscrow(...);
} catch (error) {
  if (error.reason) {
    console.error('Revert reason:', error.reason);
  }
  // Handle specific errors
  if (error.reason === 'ETH required for crypto deliverable') {
    alert('Please send ETH with this transaction');
  }
}
```

---

## Best Practices

1. **Always validate input** before calling blockchain functions
2. **Handle errors gracefully** with user-friendly messages
3. **Show loading states** during blockchain transactions
4. **Confirm transactions** before updating UI
5. **Use event listeners** for real-time updates
6. **Test thoroughly** on testnet before mainnet
7. **Keep ABIs updated** after contract upgrades
8. **Monitor gas prices** and warn users of high fees
9. **Implement retry logic** for failed transactions
10. **Log all blockchain interactions** for debugging

---

## Support

For issues or questions:

- Check the [main documentation](../README.md)
- Review [smart contract tests](../../SabotBlockchain/transaction-smart-contract/test/AgreementLedger.ts)
- Open an issue on GitHub
- Contact: dev@sabot.app

---

**Last Updated:** October 21, 2025  
**Version:** 1.0.0
