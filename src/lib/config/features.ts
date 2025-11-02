/**
 * Feature Flags Configuration
 *
 * Centralized configuration for enabling/disabling features.
 * Set flags in .env.local file.
 */

export const featureFlags = {
  /**
   * Disconnect Warning System
   *
   * When enabled, shows warnings and blocks transaction when other party disconnects.
   * Disable this for testing or to allow continuing transactions despite disconnects.
   *
   * Default: true
   * Environment Variable: NEXT_PUBLIC_ENABLE_DISCONNECT_WARNING
   */
  enableDisconnectWarning:
    process.env.NEXT_PUBLIC_ENABLE_DISCONNECT_WARNING !== 'false',

  /**
   * Debug Logging
   *
   * When enabled, shows detailed console logs for development/debugging.
   * Should be disabled in production for performance and security.
   *
   * Default: false (only in development)
   * Environment Variable: NEXT_PUBLIC_ENABLE_DEBUG_LOGS
   */
  enableDebugLogs:
    process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === 'true' ||
    process.env.NODE_ENV === 'development',
} as const;

/**
 * Helper function to check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
  return featureFlags[feature];
}
