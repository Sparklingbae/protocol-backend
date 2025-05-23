import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  dateOfBirth: { type: String, required: true },
  accountNumber: { type: String, required: true, unique: true }
}, { timestamps: true });

const Account = mongoose.model('Account', accountSchema);
export default Account;