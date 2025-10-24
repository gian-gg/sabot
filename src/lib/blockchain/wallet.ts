import { ethers } from 'ethers';
import { NewWalletData } from '@/types/blockchain';
import { encryptPrivateKey } from './helper';

export function createWallet(secretKey: string): NewWalletData | null {
  const newWallet = ethers.Wallet.createRandom();

  if (!newWallet.mnemonic) {
    console.error('Wallet creation failed to generate a mnemonic.');
    return null;
  }

  const publicAddress = newWallet.address;
  const privateKey = newWallet.privateKey;
  const mnemonic = newWallet.mnemonic.phrase;
  const encryptedKey = encryptPrivateKey(privateKey, secretKey);

  return {
    address: publicAddress,
    privateKey,
    mnemonic,
    encryptedKey,
  };
}
