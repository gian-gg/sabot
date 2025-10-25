import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32;
const ITERATIONS = 100000;
const DIGEST = 'sha512';

export function encryptPrivateKey(privateKey: string, secret: string): string {
  const salt = crypto.randomBytes(16);

  const key = crypto.pbkdf2Sync(secret, salt, ITERATIONS, KEY_LENGTH, DIGEST);

  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}`;
}

export function decryptPrivateKey(encrypted: string, secret: string): string {
  const parts = encrypted.split(':');

  // Handle backwards compatibility: if the key is not in encrypted format (no colons),
  // it's likely a raw private key stored before encryption was implemented
  if (parts.length === 1) {
    console.warn(
      'decryptPrivateKey: Found unencrypted private key in database. This is a security risk.'
    );
    console.warn('Consider re-encrypting this key.');
    // Return the key as-is (already in hex format, possibly with 0x prefix)
    return encrypted.startsWith('0x') ? encrypted.slice(2) : encrypted;
  }

  if (parts.length !== 3) {
    console.error(
      `Encrypted key format error. Expected 3 parts separated by ':', got ${parts.length} parts`
    );
    console.error(`Encrypted key preview: ${encrypted.substring(0, 100)}...`);
    console.error(`Total key length: ${encrypted.length} characters`);
    console.error(`Part lengths: ${parts.map((p) => p.length).join(', ')}`);
    throw new Error('Invalid encrypted data format');
  }

  const [saltHex, ivHex, data] = parts;

  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');

  const key = crypto.pbkdf2Sync(secret, salt, ITERATIONS, KEY_LENGTH, DIGEST);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

export function sortObjectKeys<T>(obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys) as T;
  }
  return Object.keys(obj)
    .sort()
    .reduce(
      (acc: Record<string, unknown>, key) => {
        acc[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
        return acc;
      },
      {} as Record<string, unknown>
    ) as T;
}
