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

    const existing = await Account.findOne({ email });
    if (existing) {
      res.status(400).json({ message: 'Email don already register' });
      return;
    }

    const existingPhone = await Account.findOne({ phoneNumber: encryptedPhone });
    if (existingPhone) {
      res.status(400).json({ message: 'Phone number don already register' });
      return;
    }

    let accountNumber = generateAccountNumber();
    let exists = await Account.findOne({ accountNumber });
    while (exists) {
      accountNumber = generateAccountNumber();
      exists = await Account.findOne({ accountNumber });
    }

    const newAccount = await Account.create({
      firstName,
      surname,
      email,
      phoneNumber: encryptedPhone,
      dateOfBirth: encryptedDOB,
      accountNumber,
    });

    const newCard = await createCard(newAccount._id.toString());

    // Prepare encrypted response
    const responsePayload: any = {
      message: 'Account and virtual card created',
      encrypted: {
        phoneNumber: newAccount.phoneNumber,
        dateOfBirth: newAccount.dateOfBirth,
        cardNumber: newCard.cardNumber,
        expiryDate: newCard.expiryDate,
        cvv: newCard.cvv
      }
    };

    // Include decrypted data only in development/testing
    if (process.env.NODE_ENV !== 'production' && newCard._decrypted ) {
      responsePayload.decrypted = {
        account: {
          ...newAccount.toObject(),
          phoneNumber: decrypt(newAccount.phoneNumber),
          dateOfBirth: decrypt(newAccount.dateOfBirth),
        },
        card: {
          accountId: newCard.accountId,
          cardNumber: newCard._decrypted.cardNumber,
          expiryDate: newCard._decrypted.expiryDate,
          cvv: newCard._decrypted.cvv,
        }
      };
    }

    res.status(201).json(responsePayload);

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

        const baseData: any = {
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
        };

        if (process.env.NODE_ENV !== 'production') {
          baseData.decrypted = {
            phoneNumber: decrypt(account.phoneNumber),
            dateOfBirth: decrypt(account.dateOfBirth),
            email: account.email,
            cardNumber: card ? decrypt(card.cardNumber) : null,
            expiryDate: card ? decrypt(card.expiryDate) : null,
            cvv: card ? decrypt(card.cvv) : null,
          };
        }

        return baseData;
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
    res.status(400).json({ message: 'Decryption don fail', error: err.message });
  }
};