import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import accountRoutes from './routes/accountRoutes';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);
app.use(express.json());
app.use('/api/account', accountRoutes);

app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: '🌍 Finable A system reborn. A standard redefined',
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('✅ DB Connected');
    app.listen(PORT, () => console.log(`🚀 Server dey run for port ${PORT}`));
  })
  .catch(err => console.error('❌ DB Error:', err));