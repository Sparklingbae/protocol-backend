import mongoose, { Schema, Document } from 'mongoose';

export interface ICard extends Document {
  accountId: mongoose.Types.ObjectId;
  cardNumber: string;
  cvv: string;
  expiryDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema: Schema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    cardNumber: { type: String, required: true, unique: true },
    cvv: { type: String, required: true, unique: true },
    expiryDate: { type: String, required: true }, // format MM/YY
  },
  { timestamps: true }
);

const Card = mongoose.model<ICard>('Card', CardSchema);

export default Card;