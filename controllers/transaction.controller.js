

import bcrypt from 'bcryptjs';
import Transaction from "../model/transact.model.js";
import User from "../model/user.model.js";

export const userTransaction = async (req, res) => {
    const { amount, receiverNumber, pin, type } = req.body;
    const user = req.user;

    const MINIMUM_SEND_AMOUNT = 50;
    const TRANSACTION_FEE = 5;
    const CASH_OUT_FEE_PERCENTAGE = 1.5;
    let totalAmount = amount;

    try {
        if (!pin) {
            return res.status(400).json({ message: "PIN is required" });
        }

        const userPin = await User.findOne({ email: user.email });

        console.log(userPin);

        if(userPin.status === 'pending') {
            return res.status(400).json({ message: "Your account is not active  yet. Please wait for the admin to approve." });
        }

        const isPinMatch = await bcrypt.compare(pin, userPin.pin);

        if (!isPinMatch) {
            return res.status(401).json({ message: "Invalid PIN" });
        }

        if (type === "sendMoney" && amount < MINIMUM_SEND_AMOUNT) {
            return res.status(400).json({ message: `Minimum send amount is ${MINIMUM_SEND_AMOUNT} Taka` });
        }

        const recipient = await User.findOne({ mobileNumber: receiverNumber });

        if (!recipient) {
            return res.status(400).json({ message: "Recipient not found" });
        }

        if (type === "sendMoney" && amount >= 100) {
            totalAmount = amount + TRANSACTION_FEE;
        }

        if (type === "cashOut") {
            totalAmount = amount + (amount * CASH_OUT_FEE_PERCENTAGE / 100);
        }

        if (user.balance <= totalAmount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const transaction = new Transaction({
            user: user._id,
            type,
            amount,
            recipient: recipient._id,
            status: "completed",
        });

        await transaction.save();

        if (type === "sendMoney") {
            await user.updateOne({ $inc: { balance: -totalAmount } });
            await recipient.updateOne({ $inc: { balance: amount } });
        } else if (type === "cashOut") {
            const fee = amount * CASH_OUT_FEE_PERCENTAGE / 100;
            await user.updateOne({ $inc: { balance: -(amount + fee) } });
            await recipient.updateOne({ $inc: { balance: amount + fee } });
        } else {
            await user.updateOne({ $inc: { balance: -amount } });
        }

        return res.status(200).json({ message: "Transaction created successfully", transaction });

    } catch (error) {
        return res.status(500).json({ message: "An error occurred while creating the transaction", error: error.message });
    }
};
