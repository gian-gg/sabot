'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Copy } from 'lucide-react';

// Define a type for the wallet state to improve type safety
interface WalletDetails {
  mnemonic: string;
  address: string;
  privateKey: string;
}

// This is a client component for the one-time wallet setup screen.
const WalletSetup = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Initialize wallet state with the defined interface or null
  const [wallet, setWallet] = useState<WalletDetails | null>(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const mnemonic = searchParams.get('mnemonic');
    const address = searchParams.get('address');
    const privateKey = searchParams.get('privateKey');

    if (mnemonic && address && privateKey) {
      // Ensure the wallet object conforms to the defined interface
      setWallet({ mnemonic, address, privateKey } as WalletDetails);
    } else {
      // If parameters are missing, redirect away as this page is not meant for direct access.
      router.push('/home');
    }
    // searchParams and router are included as dependencies for Next.js context
  }, [searchParams, router]);

  const handleCopy = (textToCopy: string, field: string) => {
    // A simple copy-to-clipboard implementation using execCommand for better iframe compatibility
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      // document.execCommand('copy') is deprecated but used here for cross-browser/iframe support
      document.execCommand('copy');
      setCopied(field);
      setTimeout(() => setCopied(''), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
    document.body.removeChild(textArea);
  };

  const handleContinue = () => {
    // Navigate to the main dashboard after the user acknowledges saving their details.
    router.push('/home');
  };

  if (!wallet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p className="animate-pulse">Loading wallet details...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4 font-sans text-white">
      <div className="w-full max-w-2xl space-y-6 rounded-2xl bg-gray-800 p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-cyan-400">
            Secure Your New Wallet
          </h1>
          <p className="mt-2 text-gray-300">
            Your wallet has been created. Save these details in a secure,
            offline password manager.
          </p>
          <p className="mt-2 text-lg font-semibold text-red-400">
            This is the ONLY time you will see this information.
          </p>
        </div>

        <div className="space-y-5 rounded-lg bg-gray-700 p-6">
          {/* Wallet Address */}
          <div>
            <label className="text-sm font-medium text-gray-400">
              Public Address
            </label>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-md flex-1 rounded-md bg-gray-900 p-3 font-mono break-words">
                {wallet.address}
              </p>
              <button
                onClick={() => handleCopy(wallet.address, 'address')}
                className="rounded-md bg-gray-600 p-2 transition-colors hover:bg-gray-500"
              >
                <Copy size={18} />
              </button>
            </div>
            {copied === 'address' && (
              <p className="mt-1 text-xs text-green-400">Copied!</p>
            )}
          </div>

          {/* Private Key */}
          <div>
            <label className="text-sm font-medium text-gray-400">
              Private Key
            </label>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-md flex-1 rounded-md bg-gray-900 p-3 font-mono break-words">
                {wallet.privateKey}
              </p>
              <button
                onClick={() => handleCopy(wallet.privateKey, 'privateKey')}
                className="rounded-md bg-gray-600 p-2 transition-colors hover:bg-gray-500"
              >
                <Copy size={18} />
              </button>
            </div>
            {copied === 'privateKey' && (
              <p className="mt-1 text-xs text-green-400">Copied!</p>
            )}
            <p className="mt-2 text-xs font-semibold text-red-400">
              WARNING: Never share your private key. It provides full access to
              your funds.
            </p>
          </div>

          {/* Mnemonic Phrase */}
          <div>
            <label className="text-sm font-medium text-gray-400">
              Secret Recovery Phrase (12 Words)
            </label>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-md flex-1 rounded-md bg-gray-900 p-3 font-mono leading-relaxed break-words">
                {wallet.mnemonic}
              </p>
              <button
                onClick={() => handleCopy(wallet.mnemonic, 'mnemonic')}
                className="rounded-md bg-gray-600 p-2 transition-colors hover:bg-gray-500"
              >
                <Copy size={18} />
              </button>
            </div>
            {copied === 'mnemonic' && (
              <p className="mt-1 text-xs text-green-400">Copied!</p>
            )}
          </div>

          <button
            onClick={handleContinue}
            className="mt-6 w-full transform rounded-lg bg-indigo-600 px-4 py-3 font-bold text-white transition duration-300 hover:scale-105 hover:bg-indigo-700"
          >
            I&apos;ve Secured My Details, Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletSetup;
