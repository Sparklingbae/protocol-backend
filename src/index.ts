import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import accountRoutes from './routes/accountRoutes';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/account', accountRoutes);

app.get('/', (req, res) => {
  res.send('🔥 Protocol Backend dey run ooo!');
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('✅ DB Connected');
    app.listen(PORT, () => console.log(`🚀 Server dey run for port ${PORT}`));
  })
  .catch(err => console.error('❌ DB Error:', err));