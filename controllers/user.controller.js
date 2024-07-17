import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
import Transaction from "../model/transact.model.js";

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const registerUser = async (req, res) => {
  const { name, pin, mobileNumber, email, role } = req.body;

  const userExists = await User.findOne({ email });
  const mobileExists = await User.findOne({ mobileNumber });

  if (userExists) {
    return res.status(400).json({ message: "User already exists with email" });
  }

  if (mobileExists) {
    return res
      .status(400)
      .json({ message: "User already exists with mobile number" });
  }

  const user = await User.create({
    name,
    pin,
    mobileNumber,
    email,
    role,
  });

  if (user) {
    res.status(201).json({
      message: "User created Successfully",
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

export const loginUser = async (req, res) => {
  const { identifier, pin } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { mobileNumber: identifier }],
    });

    if (user && (await user.matchPin(pin))) {
      const token = generateToken(user._id);
      res.cookie("quickToken", token, {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        secure: false,
        httpOnly: true,
      });
      return res.status(200).json({
        user,
        message: "User logged in successfully",
      });
    } else {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  const users = await User.find({ $nor: [{ role: "Admin" }] }).sort({createdAt: -1});

  res.status(200).json({ users });
};

export const activateUser = async (req, res) => {
  const { userId, role } = req.body; // Assuming userId and role are passed as parameters

  try {
    let bonusAmount = 0;

    // Check user type and assign bonus accordingly
    if (role === "Agent") {
      bonusAmount = 10000; // Agent bonus amount
    } else if (role === "User") {
      bonusAmount = 40; // User bonus amount
    } else {
      return res.status(400).json({ message: "Invalid user type" });
    }

    // Update user status to active and assign bonus
    let updatedUser;
    if (await User.findOne({ _id: userId, gotBonus: true })) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { status: "active" },
        { new: true }
      );
    } else {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { status: "active", $inc: { balance: bonusAmount }, gotBonus: true },
        { new: true }
      );
    }

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "User activated successfully", user: updatedUser });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error activating user", error: error.message });
  }
};

export const blockUser = async (req, res) => {
  const { userId } = req.body; // Assuming userId is passed as a parameter


  try {
    // Block the user
    const blockedUser = await User.findByIdAndUpdate(
      userId,
      { status: "blocked" },
      { new: true }
    );

    if (!blockedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "User blocked successfully", user: blockedUser });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error blocking user", error: error.message });
  }
};



export const allTransaction = async (req, res) => {

  let query = req.user.role === "Admin" ? {} : { user: req.user._id };
  try {
    // Ensure the user is authenticated and you have their ID
    // Query transactions for the user
    const transactions = await Transaction.find(query)
      .populate('recipient', 'name mobileNumber') // Populate recipient details if needed
      .sort({ createdAt: -1 }) // Sort by createdAt descending to get latest transactions first

    console.log(req.user.role, req.user._id);
      console.log(transactions);

    return res.status(200).json({ transactions });
  } catch (error) {
    // Handle errors
    console.error('Error fetching transaction history:', error);
    return res.status(500).json({ message: 'Failed to fetch transaction history', error: error.message });
  }
}

export const getUserDataAndTransactions = async (req, res) => {
  try {
    // Ensure the user is authenticated and you have their ID
    const userId = req.user._id;

    // Query user details
    const user = await User.findById(userId).select('-pin'); // Exclude sensitive fields like PIN

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Query recent transactions for the user
    const transactions = await Transaction.find({ user: userId })
      .populate('recipient', 'name mobileNumber') // Populate recipient details if needed
      .sort({ createdAt: -1 }) // Sort by createdAt descending to get latest transactions first
      .limit(10); // Limit to 10 transactions, adjust as needed

    // Format createdAt to local time and date for each transaction
    const formattedTransactions = transactions.map(transaction => ({
      ...transaction.toObject(),
      createdAt: transaction.createdAt.toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata', // Adjust to your timezone
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      })
    }));

    // Return user data and formatted transactions as JSON response
    return res.status(200).json({ user, transactions: formattedTransactions });
  } catch (error) {
    // Handle errors
    console.error('Error fetching user data and transactions:', error);
    return res.status(500).json({ message: 'Failed to fetch user data and transactions', error: error.message });
  }
};