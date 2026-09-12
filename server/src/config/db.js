import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lufo_clothing_crm';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`✨ [MongoDB] Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ [MongoDB] Connection to ${uri} failed: ${error.message}`);
    console.warn(`ℹ️ [Database] Running in Fallback Resilient Mode (Data served with in-memory persistence fallback).`);
    isConnected = false;
    return false;
  }
};

export const getDBStatus = () => isConnected;
