import { Router } from "express";
import verifyToken from "../utils/verifyToken.js";
import { activateUser, allTransaction, blockUser, getAllUsers, getUserDataAndTransactions, loginUser, registerUser } from "../controllers/user.controller.js";
import {  userTransaction } from "../controllers/transaction.controller.js";


const router = Router();

router.route('/register').post(registerUser);
router.post('/login', loginUser);
router.get('/all',verifyToken, getAllUsers);
router.patch('/active',verifyToken, activateUser);
router.patch('/block', verifyToken, blockUser);
router.get('/transaction', verifyToken, allTransaction);
router.get('/data-transaction', verifyToken, getUserDataAndTransactions)

router.post('/transact', verifyToken, userTransaction);

export default router;