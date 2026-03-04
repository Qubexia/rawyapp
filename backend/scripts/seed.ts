import mongoose, { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env
dotenv.config({ path: resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rawy';

async function seed() {
  console.log('Connecting to MongoDB at', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('No database connection');
  }

  // Clear existing data
  console.log('Clearing existing data...');
  const collections = await db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }

  // Collections
  const usersCollection = db.collection('users');
  const creatorsCollection = db.collection('creatorprofiles');
  const podcastsCollection = db.collection('podcasts');
  const episodesCollection = db.collection('episodes');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Users & Creators
  const adminId = new Types.ObjectId();
  const creator1Id = new Types.ObjectId();
  const creator2Id = new Types.ObjectId();
  const user1Id = new Types.ObjectId();
  
  console.log('Inserting Users...');
  await usersCollection.insertMany([
    {
      _id: adminId,
      name: 'Admin User',
      email: 'admin@rawy.com',
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      deviceTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: creator1Id,
      name: 'Sarah Rahman',
      email: 'sarah@example.com',
      passwordHash,
      role: 'CREATOR',
      isActive: true,
      deviceTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: creator2Id,
      name: 'Tariq Al-Fassi',
      email: 'tariq@example.com',
      passwordHash,
      role: 'CREATOR',
      isActive: true,
      deviceTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: user1Id,
      name: 'Ahmed Listener',
      email: 'ahmed@example.com',
      passwordHash,
      role: 'USER',
      isActive: true,
      deviceTokens: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  console.log('Inserting Creator Profiles...');
  await creatorsCollection.insertMany([
    {
      _id: new Types.ObjectId(),
      userId: creator1Id,
      bio: 'Tech enthusiast and storyteller. Let\'s explore the future of software.',
      showName: 'Tech Horizons',
      followerCount: 1520,
      podcastCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId(),
      userId: creator2Id,
      bio: 'Business strategies and entrepreneurial journeys in the MENA region.',
      showName: 'Mena Business Podcast',
      followerCount: 3400,
      podcastCount: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  console.log('Inserting Podcasts...');
  const podcast1Id = new Types.ObjectId();
  const podcast2Id = new Types.ObjectId();

  await podcastsCollection.insertMany([
    {
      _id: podcast1Id,
      title: 'Tech Horizons',
      description: 'A deep dive into the latest technologies, software development trends, and the future of AI. Join me for weekly episodes.',
      creatorId: creator1Id,
      episodeCount: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: podcast2Id,
      title: 'MENA Business Leaders',
      description: 'Conversations with top CEOs, founders, and innovators shaping the emerging startup ecosystem across the Middle East.',
      creatorId: creator2Id,
      episodeCount: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  console.log('Inserting Episodes...');
  await episodesCollection.insertMany([
    {
      _id: new Types.ObjectId(),
      title: 'The Rise of AI Agents',
      description: 'In this episode, we talk about how autonomous agents are changing the way software is built.',
      audioFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: 360,
      podcastId: podcast1Id,
      creatorId: creator1Id,
      viewsCount: 1200,
      likesCount: 350,
      commentsCount: 24,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: new Types.ObjectId(),
      title: 'Building Scalable Node.js Backends',
      description: 'Tips and tricks for scaling your NestJS application to millions of users.',
      audioFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      duration: 480,
      podcastId: podcast1Id,
      creatorId: creator1Id,
      viewsCount: 890,
      likesCount: 120,
      commentsCount: 15,
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      updatedAt: new Date(Date.now() - 86400000),
    },
    {
      _id: new Types.ObjectId(),
      title: 'Interview with a YC Founder',
      description: 'A candid conversation about getting into Y Combinator as an MENA startup.',
      audioFileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      duration: 1200,
      podcastId: podcast2Id,
      creatorId: creator2Id,
      viewsCount: 4500,
      likesCount: 980,
      commentsCount: 89,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]);

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Failed to seed:', err);
  process.exit(1);
});
