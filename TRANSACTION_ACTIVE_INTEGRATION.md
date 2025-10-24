# Transaction Active Page Integration

## Overview

The Transaction Active Page has been fully integrated with comprehensive deliverable status tracking, escrow protection, and oracle verification. This document outlines the complete integration and how all components work together.

## Key Features

### 1. Enhanced Data Flow

- **User Data**: Real-time user authentication and profile data
- **Transaction Data**: Complete transaction details with participant information
- **Escrow Data**: Full escrow protection with deliverable tracking
- **Oracle Verifications**: Automatic verification results and status

### 2. Deliverable Status Tracking

- **Status Types**: `pending`, `in_progress`, `completed`, `verified`, `failed`
- **Progress Tracking**: Real-time progress calculation across all deliverables
- **Party Responsibility**: Clear indication of who is responsible for each deliverable
- **Oracle Integration**: Automatic verification for applicable deliverable types

### 3. Oracle Verification System

- **IPFS Verification**: For digital files and documents
- **AI Verification**: For service deliverables using Gemini AI
- **Manual Verification**: Fallback for non-automatable deliverables
- **Confidence Scoring**: 0-100% confidence scores for AI verifications

## Architecture

### Components

#### 1. Transaction Active Page (`src/app/transaction/[id]/active/page.tsx`)

- Main page component with comprehensive data integration
- Real-time status updates and progress tracking
- Enhanced UI with deliverable status cards
- Oracle verification status display

#### 2. Deliverable Status Component (`src/components/escrow/deliverable-status.tsx`)

- Individual deliverable status tracking
- Action buttons for proof submission
- Oracle verification indicators
- Progress visualization

#### 3. API Endpoints

- **Oracle Verification** (`/api/oracle/verify`): Handles automatic verification
- **Proof Submission** (`/api/escrow/submit-proof`): Manages proof submissions
- **Transaction Status** (`/api/transaction/[id]/status`): Real-time transaction data

### Database Schema

#### Tables

- `escrows`: Main escrow records
- `deliverables`: Individual deliverable items
- `oracle_verifications`: Oracle verification results
- `escrow_proofs`: Proof submissions

#### Key Relationships

```sql
escrows (1) -> (many) deliverables
escrows (1) -> (many) oracle_verifications
deliverables (1) -> (many) escrow_proofs
```

## Data Flow

### 1. Initial Load

```
User visits /transaction/[id]/active
    ↓
Fetch transaction data via useTransactionStatus hook
    ↓
Fetch escrow data with deliverables
    ↓
Fetch oracle verifications
    ↓
Calculate deliverable statuses
    ↓
Render enhanced UI
```

### 2. Proof Submission

```
User clicks "Submit Proof"
    ↓
Call /api/escrow/submit-proof
    ↓
Store proof in escrow_proofs table
    ↓
Determine oracle type (IPFS/AI/Manual)
    ↓
Trigger /api/oracle/verify if applicable
    ↓
Update deliverable status
    ↓
Refresh UI
```

### 3. Oracle Verification

```
Proof submitted
    ↓
Oracle determines verification type
    ↓
IPFS: Check file accessibility
AI: Analyze with Gemini
Manual: Mark for manual review
    ↓
Store result in oracle_verifications
    ↓
Auto-confirm party if verified
    ↓
Update UI with verification status
```

## Status Calculation Logic

### Deliverable Status Priority

1. **Oracle Verification** (highest priority)
   - If oracle verification exists and is verified → `verified`
   - If oracle verification exists and failed → `failed`
2. **Manual Confirmation** (fallback)
   - If party confirmed → `completed`
   - Otherwise → `pending`

### Progress Calculation

```typescript
const getOverallProgress = () => {
  const totalDeliverables = escrowData.deliverables.length;
  const completedDeliverables = escrowData.deliverables.filter(
    (deliverable) => {
      const status = getDeliverableStatus(
        deliverable,
        deliverable.party_responsible
      );
      return status === 'completed' || status === 'verified';
    }
  ).length;

  return totalDeliverables > 0
    ? (completedDeliverables / totalDeliverables) * 100
    : 0;
};
```

## Oracle Types

### 1. IPFS Verification

- **Use Case**: Digital files, documents
- **Process**: Check file accessibility on IPFS gateway
- **Confidence**: Binary (accessible/not accessible)
- **Timeout**: 10 seconds

### 2. AI Verification

- **Use Case**: Service deliverables
- **Process**: Gemini AI analysis of proof against requirements
- **Confidence**: 0-100% based on AI analysis
- **Threshold**: 80% minimum for verification

### 3. Manual Verification

- **Use Case**: Physical items, complex services
- **Process**: Human review required
- **Confidence**: N/A (manual confirmation)

## UI Enhancements

### 1. Enhanced Escrow Card

- Overall progress bar
- Refresh button for real-time updates
- Oracle verification status summary
- Individual deliverable status cards

### 2. Deliverable Status Cards

- Visual status indicators
- Oracle type badges (IPFS/AI/Manual)
- Confidence scores for AI verifications
- Action buttons for proof submission
- Progress bars for individual deliverables

### 3. Oracle Status Summary

- List of all oracle verifications
- Success/failure indicators
- Confidence scores
- Verification timestamps

## Error Handling

### 1. API Errors

- Graceful fallback for failed API calls
- User-friendly error messages
- Retry mechanisms for transient failures

### 2. Oracle Failures

- Oracle failures don't block escrow transactions
- Manual confirmation always available
- Clear indication of oracle status

### 3. Data Consistency

- Real-time data refresh capabilities
- Optimistic UI updates
- Conflict resolution for concurrent updates

## Security Considerations

### 1. Authentication

- All API endpoints require authentication
- User can only access their own escrows
- RLS policies enforce data access control

### 2. Oracle Security

- Oracle private keys stored securely
- IPFS gateway timeouts prevent abuse
- AI verification prompts sanitized

### 3. Data Privacy

- Oracle verification data only visible to parties
- Proof hashes are opaque
- Sensitive data not included in AI prompts

## Testing

### Integration Tests

- Complete data flow testing
- API endpoint validation
- Oracle verification scenarios
- Error handling verification

### Test Scenarios

1. **Basic Transaction Loading**: Verify transaction data loads correctly
2. **Escrow Integration**: Test escrow data with deliverables
3. **Oracle Verification**: Test IPFS and AI verification flows
4. **Proof Submission**: Test proof submission and storage
5. **Status Tracking**: Verify deliverable status calculations
6. **Progress Calculation**: Test overall progress computation

## Performance Optimizations

### 1. Data Fetching

- Parallel API calls where possible
- Efficient database queries with proper indexing
- Real-time updates via Supabase subscriptions

### 2. UI Updates

- Optimistic updates for better UX
- Debounced refresh operations
- Efficient re-rendering with proper React keys

### 3. Oracle Operations

- Asynchronous oracle verification
- Timeout handling for external services
- Caching of verification results

## Future Enhancements

### 1. Blockchain Integration

- Submit verified results to blockchain
- Smart contract escrow integration
- Decentralized oracle network

### 2. Advanced AI Features

- Multi-modal verification (text + images)
- Confidence score explanations
- Learning from verification patterns

### 3. Enhanced UI

- Real-time notifications
- Advanced filtering and sorting
- Mobile-optimized interfaces

## Troubleshooting

### Common Issues

1. **Oracle Verification Not Triggering**
   - Check deliverable type matches oracle type
   - Verify API endpoint configuration
   - Check network connectivity

2. **Status Not Updating**
   - Refresh data using refresh button
   - Check for API errors in console
   - Verify database permissions

3. **Progress Calculation Issues**
   - Ensure all deliverables have proper status
   - Check for null/undefined values
   - Verify party responsibility assignments

### Debug Tools

- Browser console for API errors
- Network tab for request/response inspection
- Database queries for data verification
- Integration test suite for comprehensive validation
