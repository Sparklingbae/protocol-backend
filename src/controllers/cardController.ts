import Card from '../models/Card';
import { generateCardNumber, generateCVV, generateExpiryDate } from '../utils/cardUtils';
import { encrypt } from '../utils/encryption';

export async function createCard(accountId: string) {
  // Make sure cardNumber is unique
  let cardNumber = generateCardNumber();
  let exists = await Card.findOne({ cardNumber: encrypt(cardNumber) });
  while (exists) {
    cardNumber = generateCardNumber();
    exists = await Card.findOne({ cardNumber: encrypt(cardNumber) });
  }

  const cvv = generateCVV();
  const expiryDate = generateExpiryDate();

  // Encrypt sensitive fields
  const encryptedCardNumber = encrypt(cardNumber);
  const encryptedCvv = encrypt(cvv);
  const encryptedExpiryDate = encrypt(expiryDate);

  const newCard = await Card.create({
    accountId,
    cardNumber: encryptedCardNumber,
    cvv: encryptedCvv,
    expiryDate: encryptedExpiryDate,
  });

 // Return both encrypted and decrypted versions for testing
  return {
    accountId,
    cardNumber: encryptedCardNumber,
    expiryDate: encryptedExpiryDate,
    cvv: encryptedCvv,

    // Decrypted (for testing only)
    _decrypted: {
      cardNumber,
      cvv,
      expiryDate,
    },
  };
}