import express from 'express';
import { createAccount } from '../controllers/accountController';
import { listAccounts } from '../controllers/accountController';
import { decryptFields } from '../controllers/accountController';


const router = express.Router();

router.post('/create', createAccount);

router.get('/accounts', listAccounts);

router.post('/decrypt', decryptFields);

export default router;