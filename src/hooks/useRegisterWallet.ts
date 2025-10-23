'use client';

import { useEffect } from 'react';

let hasAttemptedRegistration = false;

export const useRegisterWallet = (shouldRun: boolean) => {
  useEffect(() => {
    if (!shouldRun) return;

    if (!hasAttemptedRegistration) {
      hasAttemptedRegistration = true;

      const checkAndRegister = async () => {
        try {
          const response = await fetch('/api/register-wallet', {
            method: 'POST',
          });

          if (!response.ok) {
            console.error(
              'Wallet registration failed on the server:',
              response.status,
              response.statusText
            );
          } else {
            console.log('Silent wallet registration check/complete.');
          }
        } catch (error) {
          console.error(
            'Network error during wallet registration attempt:',
            error
          );
        }
      };

      checkAndRegister();
    }
  }, [shouldRun]);
};
