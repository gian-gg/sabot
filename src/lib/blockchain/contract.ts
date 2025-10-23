import { ethers } from 'ethers';
import AgreementLedgerABI from './AgreementLedger.json';

import { decryptPrivateKey } from './helper';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;

let writableLedgerContract: ethers.Contract | null = null;
let readOnlyLedgerContract: ethers.Contract | null = null;

export async function getWritableLedgerContract(
  encrypted_private_key: string
): Promise<ethers.Contract> {
  if (writableLedgerContract) return writableLedgerContract;
  const secretKey = process.env.PRIVATE_KEY_SECRET!;
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  const privateKey = decryptPrivateKey(secretKey, encrypted_private_key);
  const signer = new ethers.Wallet(privateKey, provider);

  writableLedgerContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    AgreementLedgerABI.abi,
    signer
  );

  return writableLedgerContract;
}

export async function getReadOnlyLedgerContract(): Promise<ethers.Contract> {
  if (readOnlyLedgerContract) return readOnlyLedgerContract;

  const provider = new ethers.JsonRpcProvider(RPC_URL);

  readOnlyLedgerContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    AgreementLedgerABI.abi,
    provider
  );

  return readOnlyLedgerContract;
}
