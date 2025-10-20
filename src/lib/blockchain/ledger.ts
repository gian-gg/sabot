import { ethers } from 'ethers';
import AgreementLedgerABI from './AgreementLedger.json';

import { decryptPrivateKey } from './helper';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;
let ledger: ethers.Contract | null = null;

export async function getLedgerContract(
  encrypted_private_key: string
): Promise<ethers.Contract> {
  if (ledger) return ledger;

  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const signer = new ethers.Wallet(
    decryptPrivateKey(encrypted_private_key),
    provider
  );

  ledger = new ethers.Contract(
    CONTRACT_ADDRESS,
    AgreementLedgerABI.abi,
    signer
  );

  return ledger;
}
