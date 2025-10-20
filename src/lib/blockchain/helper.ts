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
  if (parts.length !== 3) {
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
