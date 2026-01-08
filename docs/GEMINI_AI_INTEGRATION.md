# Direct Gemini AI Integration for Agreement Generation

This feature enhances the project questionnaire component to use Gemini AI for generating structured agreement content by directly combining user inputs in real-time.

## How It Works

1. **User Input Collection**: Both users submit their project descriptions/requirements via the project questionnaire
2. **In-Memory Coordination**: User inputs are temporarily stored in server memory (not database)
3. **Real-Time AI Generation**: Once both prompts are received, they're immediately combined and sent to Google Gemini AI
4. **Direct Content Generation**: Gemini generates structured idea blocks containing:
   - Purpose & Scope
   - Roles & Responsibilities
   - Timeline & Deliverables
   - Payment/Compensation Terms
   - Legal Framework & Risk Management
5. **Immediate Editor Population**: Generated content is directly submitted to the agreement editor

## Key Components Modified

### Frontend (`project-questionnaire.tsx`)

- Enhanced to collect and submit user prompts
- Added waiting states for other party's input
- Updated UI messaging for instant AI-powered generation
- Real-time status updates via broadcast events

### Backend API

- **`/api/agreement/[id]/generate-with-prompts`**: Single endpoint that:
  - Receives user prompts
  - Stores them temporarily in memory
  - Combines both prompts when available
  - Generates AI content immediately
  - Returns structured idea blocks

### Real-time Coordination

- **In-Memory Storage**: Uses `Map<string, Prompt[]>` for temporary prompt storage
- **Auto-Cleanup**: Removes prompts older than 30 minutes
- **Broadcast Events**:
  - `prompt_submitted` - When one user submits
  - `ai_generation_complete` - When AI generation finishes

## Benefits of This Approach

### ✅ Advantages

- **No Database Storage**: No persistent storage of potentially sensitive input data
- **Instant Processing**: AI generation happens immediately when both prompts received
- **Memory Efficient**: Automatic cleanup prevents memory leaks
- **Privacy Focused**: Prompts exist only temporarily during processing
- **Simplified Architecture**: Single API endpoint handles the entire flow

### 🔒 Security Features

- **Temporary Storage**: Prompts automatically expire after 30 minutes
- **User Verification**: Full authentication and authorization checks
- **Agreement Validation**: Ensures users can only access their own agreements

## Environment Setup

Ensure you have `GEMINI_API_KEY` in your environment variables:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

## Flow

1. User A submits their project description
2. System stores prompt in memory and shows "waiting for other party"
3. User B submits their project description
4. System immediately:
   - Combines both prompts
   - Sends to Gemini AI
   - Generates structured content
   - Submits to agreement editor
   - Cleans up memory storage
5. Both users see AI-generated content in the editor instantly
6. Users can collaborate on the AI-generated content

## Technical Details

- **Memory Management**: Automatic cleanup prevents server memory issues
- **Fallback Handling**: If Gemini fails, uses template-based generation
- **Error Recovery**: Robust error handling with user-friendly messages
- **Real-time Updates**: Broadcast events keep both users synchronized
