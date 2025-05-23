import { encrypt } from '../src/utils/encryption';
const sampleCvv = '123';
const encrypted = encrypt(sampleCvv);
console.log('Encrypted CVV:', encrypted);
