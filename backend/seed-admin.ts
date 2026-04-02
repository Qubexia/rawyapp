import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/rawy';
const email = 'admin@rawyapp.com';
const password = 'admin';

async function seed() {
  console.log(`Connecting to ${url}...`);
  await mongoose.connect(url);
  console.log('Connected.');

  const db = mongoose.connection.db;
  if (!db) {
    console.log('Failed to get db');
    return;
  }

  const usersCollection = db.collection('users');

  const existingAdmin = await usersCollection.findOne({ email });
  if (existingAdmin) {
    console.log('Admin already exists! Updating password and role just in case...');
    const hash = await bcrypt.hash(password, 10);
    await usersCollection.updateOne({ email }, { $set: { passwordHash: hash, role: 'ADMIN', isActive: true } });
    console.log('Admin updated!');
  } else {
    console.log('Creating new admin user...');
    const hash = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({
      name: 'Super Admin',
      email: email.toLowerCase(),
      passwordHash: hash,
      role: 'ADMIN',
      isActive: true,
      pushEnabled: true,
      deviceTokens: [],
      followerCount: 0,
      followingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Admin user created successfully!');
  }

  await mongoose.disconnect();
}

seed().catch(console.error);
