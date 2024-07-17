import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["sendMoney", "cashIn", "cashOut"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to update the updatedAt field on save
transactionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
