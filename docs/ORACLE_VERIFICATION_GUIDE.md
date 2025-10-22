# Oracle Verification System

## Overview

The Sabot platform includes an automatic oracle verification system that verifies escrow deliverables without manual intervention. The oracle operates transparently alongside the existing escrow flow, providing additional trust and automation.

## Key Principles

1. **Automatic Operation** - Oracle verification runs automatically when proof is submitted for applicable escrow types
2. **Advisory Role** - Oracle verification assists but doesn't control escrow release
3. **Arbiter Supremacy** - Arbiter decisions always override oracle verification
4. **Fail-Safe Design** - Oracle failures never block escrow transactions
5. **No Admin Involvement** - Only parties and arbiter interact with escrows

## Supported Deliverable Types

### FileDeliverable
- **Verification Method**: IPFS accessibility check
- **How It Works**: When proof is submitted, the oracle verifies the file exists and is accessible on IPFS
- **Success Criteria**: HTTP 200 response from IPFS gateway
- **Confidence**: 100% (binary: accessible or not)

### Service
- **Verification Method**: AI analysis using Gemini
- **How It Works**: AI compares submitted proof against original service requirements
- **Success Criteria**: AI confidence ≥80% and positive verification
- **Confidence**: 0-100% based on AI analysis

## How It Works

### 1. Escrow Creation
When creating an escrow with FileDeliverable or Service type:
- Oracle verification is automatically enabled
- User sees an informational badge explaining oracle is active
- No manual configuration needed

### 2. Proof Submission
When a party submits proof:
```
User submits proof → API stores proof → Oracle triggered automatically
                                      ↓
                               Verification runs
                                      ↓
                          Result stored in database
                                      ↓
                     Blockchain submission (if verified)
                                      ↓
                        Auto-confirm submitting party
```

### 3. Verification Process

**For IPFS Files:**
1. Extract IPFS CID from proof hash
2. Query IPFS gateway with 10-second timeout
3. Return success if file is accessible
4. Store result in `oracle_verifications` table
5. Submit to blockchain if verified

**For Services:**
1. Extract proof text and requirements
2. Send to Gemini AI for analysis
3. Parse JSON response (verified, confidence, notes)
4. Only pass if verified AND confidence ≥80%
5. Store result and submit to blockchain if verified

### 4. Auto-Confirmation
If oracle verifies successfully:
- Automatically confirms completion for the submitting party
- If other party also confirms (manually or via oracle), escrow releases
- Emits `EscrowConfirmed` event on blockchain

## Architecture

### Smart Contract
```solidity
// Oracle state
mapping(address => bool) public authorizedOracles;
mapping(uint256 => bool) public oracleVerified;
mapping(uint256 => bytes32) public oracleVerificationHash;

// Oracle functions
function authorizeOracle(address oracle, bool authorized) external onlyOwner
function submitOracleVerification(uint256 escrowId, bool verified, bytes32 proofHash) external
```

### Backend Services
```
src/services/oracle/
├── index.ts              # Main coordinator
├── ipfs-verifier.ts      # IPFS file verification
├── ai-verifier.ts        # AI-based service verification
├── blockchain.ts         # Blockchain submission
└── types.ts              # TypeScript types
```

### Database Schema
```sql
CREATE TABLE oracle_verifications (
  id UUID PRIMARY KEY,
  escrow_id UUID REFERENCES escrows(id),
  blockchain_escrow_id INTEGER,
  oracle_type TEXT NOT NULL, -- 'ipfs' or 'ai'
  verified BOOLEAN NOT NULL,
  confidence_score INTEGER,  -- 0-100
  proof_hash TEXT NOT NULL,
  notes TEXT,
  blockchain_tx_hash TEXT,
  created_at TIMESTAMPTZ
);
```

## Arbiter Override

Arbiters have ultimate authority in disputes:

1. **Oracle says NO, Arbiter says YES** → Escrow releases (arbiter wins)
2. **Oracle says YES, Arbiter says NO** → Escrow refunds (arbiter wins)
3. **No arbiter assigned** → Oracle verification assists but parties must still confirm

Example scenario:
```javascript
// Oracle verification failed
oracle.submitOracleVerification(escrowId, false, proofHash);

// Party raises dispute
escrow.raiseDispute(escrowId);

// Arbiter assigned and reviews
escrow.proposeArbiter(escrowId, arbiterAddress);
escrow.approveArbiter(escrowId);

// Arbiter overrides oracle and releases funds
arbiter.resolveDispute(escrowId, "release"); // ✅ Arbiter decision final
```

## Environment Variables

Required environment variables for oracle service:

```env
# Oracle wallet private key (for blockchain submissions)
ORACLE_PRIVATE_KEY=<private_key>

# IPFS gateway URL
IPFS_GATEWAY=https://ipfs.io

# Blockchain RPC URL
RPC_URL=<rpc_url>

# Existing variables
GEMINI_API_KEY=<api_key>
NEXT_PUBLIC_CONTRACT_ADDRESS=<contract_address>
```

## Security Considerations

### Oracle Authorization
- Only owner can authorize oracle addresses
- Backend service wallet must be authorized before submitting verifications
- Multiple oracle addresses can be authorized for redundancy

### Fail-Safe Design
- Oracle failures never block escrow transactions
- Errors are logged but don't throw exceptions
- Database stores all verification attempts (successful and failed)
- Users can always proceed with manual confirmation

### Privacy
- Oracle verification data only visible to escrow parties and arbiter (RLS policies)
- Proof hashes are opaque unless user shares actual content
- AI verification prompts don't include sensitive personal information

## API Endpoints

### Submit Proof (with Oracle Trigger)
```typescript
POST /api/escrow/submit-proof
{
  "escrow_id": "uuid",
  "proof_hash": "ipfs://Qm...",
  "proof_description": "optional description"
}

Response:
{
  "success": true,
  "escrow": { ... },
  "message": "Proof submitted successfully",
  "oracle_triggered": true  // Indicates oracle verification started
}
```

## UI Integration

### Escrow Details Card
Shows oracle status badge for FileDeliverable and Service types:
```tsx
<Badge variant="secondary">
  <Bot className="h-3 w-3" />
  Oracle Verification Active
</Badge>
```

### Escrow Timeline
Displays oracle events in timeline:
- 🤖 Oracle verified deliverable automatically
- 🤖 Oracle verification failed

### Create Escrow Form
Shows informational alert for service and digital escrows:
```tsx
<Alert>
  <Bot className="h-4 w-4" />
  Automatic verification enabled: Files will be verified on IPFS
</Alert>
```

## Testing

### Smart Contract Tests
```bash
cd SabotBlockchain/transaction-smart-contract
pnpm hardhat test
```

Covers:
- Oracle authorization (owner only)
- Oracle verification submission
- Auto-confirmation on successful verification
- Arbiter override scenarios

### Integration Testing
Mock IPFS gateway and AI responses:
```typescript
// Mock successful IPFS verification
mockFetch.mockResolvedValueOnce({ ok: true, status: 200 });

// Mock AI verification
mockGenerateText.mockResolvedValueOnce(JSON.stringify({
  verified: true,
  confidence: 95,
  notes: "Service completed as described"
}));
```

## Monitoring and Debugging

### Database Queries
```sql
-- View all oracle verifications for an escrow
SELECT * FROM oracle_verifications 
WHERE escrow_id = '<escrow_id>'
ORDER BY created_at DESC;

-- Check verification success rate
SELECT 
  oracle_type,
  COUNT(*) as total,
  SUM(CASE WHEN verified THEN 1 ELSE 0 END) as successful,
  ROUND(AVG(confidence_score), 2) as avg_confidence
FROM oracle_verifications
GROUP BY oracle_type;

-- Find failed verifications
SELECT * FROM oracle_verifications
WHERE verified = false
ORDER BY created_at DESC
LIMIT 10;
```

### Logs
Oracle service logs key events:
```
Oracle verification for escrow 123 (FileDeliverable)
IPFS verification result: { verified: true, confidence: 100 }
Oracle verification submitted to blockchain: tx 0x...
```

## Troubleshooting

### Oracle Not Verifying
1. Check escrow type is FileDeliverable or Service
2. Verify `ORACLE_PRIVATE_KEY` is set and authorized
3. Check oracle service logs for errors
4. Confirm blockchain RPC is accessible

### IPFS Verification Fails
1. Verify IPFS CID format is valid
2. Check IPFS gateway is accessible
3. Ensure file is pinned on IPFS network
4. Try alternative gateway URLs

### AI Verification Inconsistent
1. Review Gemini API quota and limits
2. Check proof description quality (more detail = better verification)
3. Verify `GEMINI_API_KEY` is valid
4. Review AI confidence scores in database

### Blockchain Submission Fails
1. Ensure oracle wallet has gas/ETH for transactions
2. Verify contract address is correct
3. Check oracle is authorized in smart contract
4. Review blockchain RPC connectivity

## Future Enhancements

Potential improvements for future versions:

- **Multi-Oracle Consensus**: Require multiple oracles to agree
- **Specialized Verifiers**: Custom verification for specific industries
- **Machine Learning**: Improve AI accuracy with training data
- **External APIs**: Bank verification, shipping tracking integration
- **Reputation Scoring**: Track oracle accuracy over time
- **Cost Optimization**: Batch verification submissions

## Support

For issues or questions:
- Check logs in database and server console
- Review this documentation
- Test with mock data first
- Verify all environment variables are set
- Ensure wallet has sufficient gas

Remember: Oracle verification is advisory. If oracle fails, escrow can still proceed with manual confirmation.

