import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pin: { type: String, required: true },
    mobileNumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    status: {
      type: String,
      default: "pending",
      enum: ["active", "blocked", "pending"],
    },
    role: { type: String },
    gotBonus: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("pin")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.pin = await bcrypt.hash(this.pin, salt);
  next();
});

userSchema.methods.matchPin = async function (enteredPin) {
  return await bcrypt.compare(enteredPin, this.pin);
};

const User = mongoose.model("User", userSchema);

export default User;
