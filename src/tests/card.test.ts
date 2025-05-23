import mongoose from 'mongoose';
import request from 'supertest';
import app from '../index'; // Ensure this is your Express app
import Card from '../models/Card';
import Account from '../models/Account';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST as string);
});

afterAll(async () => {
  await mongoose.connection.close();
});

afterEach(async () => {
  await Card.deleteMany({});
  await Account.deleteMany({});
});

describe('🔐 Encryption Verification', () => {
  it('should not store cardNumber, cvv, expiryDate, phoneNumber, and dateOfBirth in plain text', async () => {
    const res = await request(app)
      .post('/api/accounts') // your endpoint
      .send({
        firstName: 'Jane',
        surname: 'Doe',
        email: 'jane.doe@example.com',
        phoneNumber: '08012345678',
        dateOfBirth: '1990-05-20',
      });

    expect(res.statusCode).toBe(201);
    const { account, card } = res.body;

    // Fetch saved card directly from DB
    const storedCard = await Card.findOne({ accountId: account._id });
    expect(storedCard).toBeTruthy();

    // Card fields must not match raw data
    expect(storedCard?.cardNumber).not.toBe(card.cardNumber);
    expect(storedCard?.cvv).not.toBeDefined(); // should not return CVV at all
    expect(storedCard?.expiryDate).not.toBe(card.expiryDate);

    // Check account sensitive fields
    const storedAccount = await Account.findById(account._id);
    expect(storedAccount?.phoneNumber).not.toBe('08012345678');
    expect(storedAccount?.dateOfBirth).not.toBe('1990-05-20');
  });
});