import dotenv from 'dotenv';
dotenv.config();  // <-- MUST be very first

import { encrypt, decrypt } from '../src/utils/encryption';

async function run() {
  try {
    const testData = '08023456789';
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);

    console.log('Original:', testData);
    console.log('Encrypted:', encrypted);
    console.log('Decrypted:', decrypted);
  } catch (error) {
    console.error('Error:', error);
  }
}

run();