# Transaction Flow Diagrams

Visual reference for the real-time transaction invitation system.

## Complete User Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          TRANSACTION FLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

USER A (Creator)                                      USER B (Invitee)
═════════════════                                     ═════════════════

┌─────────────────┐
│ Navigate to     │
│ /transaction/new│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ API: POST       │
│ /create         │◄─── Automatically creates transaction
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Transaction     │
│ Created         │
│ Status: waiting │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Display Link    │
│ Copy/Share      │───────────────────┐
└─────────────────┘                   │
         │                            │
         │                            │ Share link via
         │                            │ external platform
         │                            │
         ▼                            ▼
┌─────────────────┐         ┌─────────────────┐
│ Realtime        │         │ Click Link      │
│ Subscription    │         │ /invite?id=xxx  │
│ Active          │         └────────┬────────┘
└─────────────────┘                  │
         │                           ▼
         │                  ┌─────────────────┐
         │                  │ Review Details  │
         │                  │ Accept/Decline  │
         │                  └────────┬────────┘
         │                           │
         │                           ▼
         │                  ┌─────────────────┐
         │                  │ API: POST       │
         │                  │ /join           │
         │                  └────────┬────────┘
         │                           │
         │◄──────────────────────────┘
         │      Realtime Event:
         │      Participant Added
         ▼
┌─────────────────┐         ┌─────────────────┐
│ Detect: Both    │         │ Detect: Both    │
│ Joined          │◄───────►│ Joined          │
└────────┬────────┘         └────────┬────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│ AUTO-NAVIGATE   │         │ AUTO-NAVIGATE   │
│ to Upload       │         │ to Upload       │
└────────┬────────┘         └────────┬────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│ Upload          │         │ Upload          │
│ Screenshot      │         │ Screenshot      │
└────────┬────────┘         └────────┬────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│ API: POST       │         │ API: POST       │
│ /upload         │         │ /upload         │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │◄──────────────────────────┘
         │      Realtime Event:
         │      Screenshots Uploaded
         ▼
┌─────────────────┐         ┌─────────────────┐
│ Detect: Both    │         │ Detect: Both    │
│ Uploaded        │◄───────►│ Uploaded        │
└────────┬────────┘         └────────┬────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│ AUTO-NAVIGATE   │         │ AUTO-NAVIGATE   │
│ to Details      │         │ to Details      │
└─────────────────┘         └─────────────────┘
```

## Transaction Status State Machine

```
                  ┌─────────────────────────────────────────┐
                  │         Transaction States              │
                  └─────────────────────────────────────────┘

                               START
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │       pending         │
                     │  (initial creation)   │
                     └───────────┬───────────┘
                                 │
                                 │ Creator added as participant
                                 ▼
                     ┌───────────────────────┐
                     │ waiting_for_participant│
                     │   (link shareable)    │
                     └───────────┬───────────┘
                                 │
                                 │ Invitee accepts
                                 ▼
                     ┌───────────────────────┐
                     │     both_joined       │
                     │  (ready for upload)   │◄──┐
                     └───────────┬───────────┘   │
                                 │                │
                                 │ Both upload    │ Auto-transition
                                 ▼                │
                     ┌───────────────────────┐   │
                     │  screenshots_uploaded │   │
                     │  (ready for review)   │───┘
                     └───────────┬───────────┘
                                 │
                                 │ Manual/Auto activation
                                 ▼
                     ┌───────────────────────┐
                     │        active         │
                     │  (transaction live)   │
                     └───────────┬───────────┘
                                 │
                                 │ Transaction complete
                                 ▼
                     ┌───────────────────────┐
                     │      completed        │
                     │        (final)        │
                     └───────────────────────┘

              Alternative paths:
              └───► cancelled (user cancellation)
              └───► disputed (conflict raised)
```

## Database Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                       Database Schema                            │
└─────────────────────────────────────────────────────────────────┘

    ┌───────────────────┐
    │   auth.users      │
    │  (Supabase Auth)  │
    └─────────┬─────────┘
              │
              │ creator_id (FK)
              ▼
    ┌───────────────────┐
    │   transactions    │
    ├───────────────────┤
    │ id (PK)          │
    │ creator_id (FK)  │──────┐
    │ status           │      │
    │ item_name        │      │
    │ price            │      │
    │ created_at       │      │
    └─────────┬─────────┘      │
              │                │
              │ transaction_id (FK)
              ▼                │
    ┌───────────────────┐      │
    │ transaction_      │      │
    │ participants      │      │
    ├───────────────────┤      │
    │ id (PK)          │      │
    │ transaction_id   │◄─────┘
    │ user_id (FK)     │──────┐
    │ role             │      │
    │ screenshot_      │      │
    │   uploaded       │      │
    └─────────┬─────────┘      │
              │                │
              │ transaction_id (FK)
              ▼                │
    ┌───────────────────┐      │
    │ transaction_      │      │
    │ screenshots       │      │
    ├───────────────────┤      │
    │ id (PK)          │      │
    │ transaction_id   │◄─────┘
    │ user_id (FK)     │
    │ file_path        │
    │ uploaded_at      │
    └───────────────────┘
              │
              │ Storage reference
              ▼
    ┌───────────────────┐
    │  Supabase Storage │
    │  (transaction-    │
    │   screenshots)    │
    └───────────────────┘
```

## Real-time Event Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Realtime Synchronization                     │
└─────────────────────────────────────────────────────────────────┘

CLIENT A                    SUPABASE                    CLIENT B
════════                    ════════                    ════════

┌──────────┐                                           ┌──────────┐
│Subscribe │                                           │Subscribe │
│to events │                                           │to events │
└────┬─────┘                                           └────┬─────┘
     │                                                       │
     │                   ┌─────────────┐                    │
     │                   │  Postgres   │                    │
     │                   │  Database   │                    │
     │                   └──────┬──────┘                    │
     │                          │                           │
     │  Action: Join            │                           │
     │  ─────────────────────►  │                           │
     │                          │                           │
     │                   ┌──────▼──────┐                    │
     │                   │  Realtime   │                    │
     │                   │  Broadcast  │                    │
     │                   └──────┬──────┘                    │
     │                          │                           │
     │  ◄───────────────────────┤                           │
     │  Event: participant_added│                           │
     │                          │                           │
     │                          └─────────────────────────► │
     │                           Event: participant_added   │
     │                                                      │
     │  Both receive event simultaneously                  │
     │  ◄──────────────────────────────────────────────►  │
     │                                                      │
     ▼                                                      ▼
┌──────────┐                                           ┌──────────┐
│Navigate  │                                           │Navigate  │
│to Upload │                                           │to Upload │
└──────────┘                                           └──────────┘
```

## API Request/Response Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      API Interaction                             │
└─────────────────────────────────────────────────────────────────┘

1. CREATE TRANSACTION
   ─────────────────
   Client                    Server                    Database
   ──────                    ──────                    ────────
     │                         │                          │
     │  POST /api/transaction/ │                          │
     │  create                 │                          │
     ├────────────────────────►│                          │
     │                         │  INSERT transactions     │
     │                         ├─────────────────────────►│
     │                         │                          │
     │                         │  ◄─────────────────────  │
     │                         │  Return transaction      │
     │                         │                          │
     │                         │  INSERT participant      │
     │                         ├─────────────────────────►│
     │                         │                          │
     │  ◄──────────────────────┤                          │
     │  { transaction, url }   │                          │
     │                         │                          │

2. JOIN TRANSACTION
   ────────────────
     │                         │                          │
     │  POST /api/transaction/ │                          │
     │  join                   │                          │
     ├────────────────────────►│                          │
     │                         │  SELECT transaction      │
     │                         ├─────────────────────────►│
     │                         │                          │
     │                         │  INSERT participant      │
     │                         ├─────────────────────────►│
     │                         │                          │
     │                         │  UPDATE status           │
     │                         ├─────────────────────────►│
     │                         │                          │
     │                         │  ◄─────────────────────  │
     │                         │  Triggers Realtime       │
     │  ◄──────────────────────┤                          │
     │  { participant, ... }   │                          │
     │                         │                          │

3. UPLOAD SCREENSHOT
   ─────────────────
     │                         │                          │
     │  POST /api/transaction/ │                          │
     │  [id]/upload            │                          │
     ├────────────────────────►│                          │
     │  FormData(file)         │                          │
     │                         │  Upload to Storage       │
     │                         ├─────────────────────────►│
     │                         │                          │
     │                         │  INSERT screenshot       │
     │                         ├─────────────────────────►│
     │                         │                          │
     │                         │  UPDATE participant      │
     │                         ├─────────────────────────►│
     │                         │                          │
     │                         │  CHECK both_uploaded     │
     │                         ├─────────────────────────►│
     │                         │                          │
     │                         │  UPDATE status if both   │
     │                         ├─────────────────────────►│
     │                         │                          │
     │  ◄──────────────────────┤                          │
     │  { screenshot, ... }    │                          │
     │                         │                          │
```

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                    Component Structure                           │
└─────────────────────────────────────────────────────────────────┘

App
└── TransactionFlow
    ├── CreateInvitationPage
    │   ├── useTransactionStatus (hook)
    │   ├── Card (UI)
    │   ├── Input (link display)
    │   ├── Button (copy/email)
    │   └── Dialog (email sender)
    │
    └── AcceptInvitationPage
        ├── useTransactionStatus (hook)
        ├── Card (UI)
        ├── ReviewTransactionInvitation
        │   ├── User info display
        │   ├── Accept button
        │   └── Decline button
        │
        ├── UploadScreenshotStep
        │   ├── File input
        │   ├── Preview
        │   └── Upload button
        │
        └── VerificationStep
            ├── Loading spinner
            └── Status message
```

---

**Note:** These diagrams represent the ideal flow. Always refer to the code for implementation details and current state.
