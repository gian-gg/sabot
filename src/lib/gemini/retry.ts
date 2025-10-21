/**
 * Retry utility for handling transient API errors
 * Implements exponential backoff for rate limiting (429) and server errors (503)
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, initialDelayMs = 1000, maxDelayMs = 8000 } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable (503, 429, or timeout)
      const isRetryable =
        error instanceof Error &&
        (error.message.includes('503') ||
          error.message.includes('429') ||
          error.message.includes('overloaded') ||
          error.message.includes('rate_limit') ||
          error.message.includes('UNAVAILABLE'));

      if (!isRetryable || attempt === maxRetries - 1) {
        throw error;
      }

      // Calculate exponential backoff with jitter
      const delayMs = Math.min(
        initialDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelayMs
      );

      console.warn(
        `API request failed (attempt ${attempt + 1}/${maxRetries}). Retrying in ${Math.round(delayMs)}ms...`,
        error
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new Error('Max retries exceeded');
}
