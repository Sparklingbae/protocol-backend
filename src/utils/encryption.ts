import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('Missing ENCRYPTION_KEY environment variable!');
}

const iv = Buffer.alloc(16, 0); // Initialization vector - use fixed for now or better generate random per encryption
const key = Buffer.from(ENCRYPTION_KEY, 'hex');

export function encrypt(text: string): string {
  if (!text) throw new Error('No text provided to encrypt!');
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) throw new Error('No encrypted text provided to decrypt!');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}