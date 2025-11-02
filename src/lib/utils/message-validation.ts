/**
 * Message Validation Utilities
 *
 * Runtime validation for WebSocket messages to prevent crashes
 * from malformed or malicious messages.
 */

import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('MessageValidation');

// Valid message types
const VALID_MESSAGE_TYPES = [
  'field_selected',
  'sync_request',
  'sync_response',
  'user_joined',
  'user_ready',
  'user_left',
  'room_full',
  'ack',
  'ping',
  'pong',
] as const;

type ValidMessageType = (typeof VALID_MESSAGE_TYPES)[number];

/**
 * Check if a value is a valid message type
 */
function isValidMessageType(type: unknown): type is ValidMessageType {
  return (
    typeof type === 'string' &&
    VALID_MESSAGE_TYPES.includes(type as ValidMessageType)
  );
}

/**
 * Validate basic message structure
 */
export function validateMessage(data: unknown): {
  valid: boolean;
  error?: string;
  message?: {
    type: ValidMessageType;
    [key: string]: unknown;
  };
} {
  // Must be an object
  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      error: 'Message must be an object',
    };
  }

  const msg = data as Record<string, unknown>;

  // Must have a type field
  if (!msg.type) {
    return {
      valid: false,
      error: 'Message missing required field: type',
    };
  }

  // Type must be valid
  if (!isValidMessageType(msg.type)) {
    return {
      valid: false,
      error: `Invalid message type: ${msg.type}`,
    };
  }

  // Type-specific validation
  switch (msg.type) {
    case 'field_selected':
      if (!msg.selection || typeof msg.selection !== 'object') {
        return {
          valid: false,
          error: 'field_selected message missing selection object',
        };
      }
      break;

    case 'sync_response':
      if (!msg.selections || typeof msg.selections !== 'object') {
        return {
          valid: false,
          error: 'sync_response message missing selections object',
        };
      }
      break;

    case 'user_joined':
    case 'user_ready':
      if (!msg.userId || typeof msg.userId !== 'string') {
        return {
          valid: false,
          error: `${msg.type} message missing userId string`,
        };
      }
      break;

    case 'ack':
      if (!msg.ackFor || typeof msg.ackFor !== 'string') {
        return {
          valid: false,
          error: 'ack message missing ackFor string',
        };
      }
      break;

    // Other message types don't require specific validation
    case 'sync_request':
    case 'user_left':
    case 'room_full':
    case 'ping':
    case 'pong':
      break;

    default:
      // TypeScript ensures exhaustive checking
      const _exhaustive: never = msg.type;
      return {
        valid: false,
        error: `Unhandled message type: ${_exhaustive}`,
      };
  }

  return {
    valid: true,
    message: msg as { type: ValidMessageType; [key: string]: unknown },
  };
}

/**
 * Parse and validate incoming message
 */
export function parseAndValidateMessage(data: string): {
  valid: boolean;
  error?: string;
  message?: {
    type: ValidMessageType;
    [key: string]: unknown;
  };
} {
  // Parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch (error) {
    logger.error('JSON parse error:', error);
    return {
      valid: false,
      error: 'Invalid JSON',
    };
  }

  // Validate structure
  return validateMessage(parsed);
}
