import mongoose from 'mongoose';
import request from 'supertest';
import app from '../index'; // use this to import the Express app
import Account from '../models/Account';
import Card from '../models/Card';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST as string);
});

afterAll(async () => {
  await mongoose.connection.close();
});

afterEach(async () => {
  await Account.deleteMany({});
  await Card.deleteMany({});
});

describe('🔐 Encryption - Sensitive Data Protection', () => {
  it('should store encrypted sensitive fields and return decrypted for testing', async () => {
    const res = await request(app).post('/api/accounts').send({
      firstName: 'Test',
      surname: 'User',
      email: 'test.user@example.com',
      phoneNumber: '08023456789',
      dateOfBirth: '1992-01-01',
    });

    expect(res.statusCode).toBe(201);
    const { account, card } = res.body;

    const savedAccount = await Account.findById(account._id);
    const savedCard = await Card.findOne({ accountId: account._id });

    expect(savedAccount).toBeTruthy();
    expect(savedCard).toBeTruthy();

    // Confirm encrypted values no match raw values
    expect(savedAccount?.phoneNumber).not.toBe('08023456789');
    expect(savedAccount?.dateOfBirth).not.toBe('1992-01-01');

    expect(savedCard?.cardNumber).not.toBe(card.cardNumber);
    expect(savedCard?.expiryDate).not.toBe(card.expiryDate);

    // CVV no suppose dey come out at all
    expect(savedCard?.cvv).not.toBe(card.cvv); // card.cvv should be undefined
  });
});