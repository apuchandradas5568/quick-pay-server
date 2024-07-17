import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.DATABASE_URL ;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
};

export default connectDB;
