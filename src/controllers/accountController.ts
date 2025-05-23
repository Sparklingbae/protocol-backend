import { Request, Response } from 'express';
import Account from '../models/Account';
import Card from '../models/Card';
import { generateAccountNumber } from '../utils/accountUtils';
import { normalizePhoneNumber } from '../utils/normalizePhoneNumber';
import { createCard } from './cardController';
import { encrypt, decrypt } from '../utils/encryption';

export const createAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, surname, email, phoneNumber, dateOfBirth } = req.body;

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const encryptedPhone = encrypt(normalizedPhone);
    const encryptedDOB = encrypt(dateOfBirth);

    // Check if email already exists
    const existing = await Account.findOne({ email });
    if (existing) {
      res.status(400).json({ message: 'Email don already register' });
      return;
    }

    // Check if encrypted phone already exists
    const existingPhone = await Account.findOne({ phoneNumber: encryptedPhone });
    if (existingPhone) {
      res.status(400).json({ message: 'Phone number don already register' });
      return;
    }

    // Generate unique account number
    let accountNumber = generateAccountNumber();
    let exists = await Account.findOne({ accountNumber });
    while (exists) {
      accountNumber = generateAccountNumber();
      exists = await Account.findOne({ accountNumber });
    }

    // Create the account with encrypted fields
    const newAccount = await Account.create({
      firstName,
      surname,
      email,
      phoneNumber: encryptedPhone,
      dateOfBirth: encryptedDOB,
      accountNumber,
    });

    // Create virtual card (encrypt inside createCard)
    const newCard = await createCard(newAccount._id.toString());

    // Prepare decrypted card info for testing
    const cardResponse = {
  accountId: newCard.accountId,
  cardNumber: newCard._decrypted.cardNumber,
  expiryDate: newCard._decrypted.expiryDate,
  cvv: newCard._decrypted.cvv,
};

   
    // Decrypt sensitive account fields for testing
    const accountResponse = {
      ...newAccount.toObject(),
      phoneNumber: decrypt(newAccount.phoneNumber),
      dateOfBirth: decrypt(newAccount.dateOfBirth),
    };

    // Respond with decrypted info (only for testing purposes)
    res.status(201).json({
  message: 'Account and virtual card created',
  encrypted: {
    phoneNumber: newAccount.phoneNumber,
    dateOfBirth: newAccount.dateOfBirth,
    cardNumber: newCard.cardNumber,
    expiryDate: newCard.expiryDate,
    cvv: newCard.cvv
  },
  decrypted: {
    account: accountResponse,
    card: cardResponse,
  }
});

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server wahala' });
  }
};

export const listAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const accounts = await Account.find();

    const response = await Promise.all(
      accounts.map(async (account) => {
        const card = await Card.findOne({ accountId: account._id });

        return {
          accountNumber: account.accountNumber,
          fullName: `${account.firstName} ${account.surname}`,
          encrypted: {
            phoneNumber: account.phoneNumber,
            dateOfBirth: account.dateOfBirth,
            email: account.email,
            cardNumber: card?.cardNumber || null,
            expiryDate: card?.expiryDate || null,
            cvv: card?.cvv || null,
          },
          decrypted: {
            phoneNumber: decrypt(account.phoneNumber),
            dateOfBirth: decrypt(account.dateOfBirth),
            email: account.email,
            cardNumber: card ? decrypt(card.cardNumber) : null,
            expiryDate: card ? decrypt(card.expiryDate) : null,
            cvv: card ? decrypt(card.cvv) : null, // ⚠️ Remove or obfuscate in production
          },
        };
      })
    );

    res.status(200).json({ accounts: response });
  } catch (error) {
    console.error('Error listing accounts:', error);
    res.status(500).json({ error: 'An error occurred while listing accounts.' });
  }
};

export const decryptFields = (req: Request, res: Response): void => {
  try {
    const encryptedFields = req.body;

    const decrypted: Record<string, string> = {};

    for (const key in encryptedFields) {
      if (Object.prototype.hasOwnProperty.call(encryptedFields, key)) {
        decrypted[key] = decrypt(encryptedFields[key]);
      }
    }

    res.status(200).json({ decrypted });
  } catch (error) {
  const err = error as Error;
  res.status(400).json({ message: 'Decryption don failed', error: err.message });
}
};