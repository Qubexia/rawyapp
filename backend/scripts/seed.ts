import mongoose, { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env
dotenv.config({ path: resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rawy';

// Helper: random date within the last N days
function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86_400_000);
}

async function seed() {
  console.log('🔗 Connecting to MongoDB at', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db;
  if (!db) throw new Error('No database connection');

  // ── Clear existing data ────────────────────────────────────────────────
  console.log('🗑️  Clearing existing data...');
  const collections = await db.collections();
  for (const col of collections) {
    await col.deleteMany({});
  }

  // ── Collections ────────────────────────────────────────────────────────
  const usersCol      = db.collection('users');
  const creatorsCol   = db.collection('creatorprofiles');
  const podcastsCol   = db.collection('podcasts');
  const episodesCol   = db.collection('episodes');
  const commentsCol   = db.collection('comments');
  const likesCol      = db.collection('likes');
  const viewsCol      = db.collection('views');
  const followsCol    = db.collection('follows');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // ── IDs ────────────────────────────────────────────────────────────────
  const adminId    = new Types.ObjectId();
  const c1Id       = new Types.ObjectId(); // Layla Al-Amin   – Tech creator
  const c2Id       = new Types.ObjectId(); // Omar Khalid     – Business creator
  const c3Id       = new Types.ObjectId(); // Nora Haddad     – Culture creator
  const u1Id       = new Types.ObjectId(); // Ahmed Listener
  const u2Id       = new Types.ObjectId(); // Fatimah Nasser
  const u3Id       = new Types.ObjectId(); // Youssef Samir
  const u4Id       = new Types.ObjectId(); // Rania Mostafa

  // ── USERS ──────────────────────────────────────────────────────────────
  console.log('👤 Inserting Users...');
  await usersCol.insertMany([
    {
      _id: adminId,
      name: 'Admin',
      email: 'admin@rawy.com',
      passwordHash,
      role: 'ADMIN',
      isActive: true,
      deviceTokens: [],
      createdAt: daysAgo(60),
      updatedAt: daysAgo(1),
    },
    {
      _id: c1Id,
      name: 'Layla Al-Amin',
      email: 'layla@rawy.com',
      passwordHash,
      role: 'CREATOR',
      isActive: true,
      deviceTokens: [],
      createdAt: daysAgo(55),
      updatedAt: daysAgo(2),
    },
    {
      _id: c2Id,
      name: 'Omar Khalid',
      email: 'omar@rawy.com',
      passwordHash,
      role: 'CREATOR',
      isActive: true,
      deviceTokens: [],
      createdAt: daysAgo(50),
      updatedAt: daysAgo(3),
    },
    {
      _id: c3Id,
      name: 'Nora Haddad',
      email: 'nora@rawy.com',
      passwordHash,
      role: 'CREATOR',
      isActive: true,
      deviceTokens: [],
      createdAt: daysAgo(45),
      updatedAt: daysAgo(1),
    },
    {
      _id: u1Id,
      name: 'Ahmed Listener',
      email: 'ahmed@rawy.com',
      passwordHash,
      role: 'USER',
      isActive: true,
      deviceTokens: [],
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      _id: u2Id,
      name: 'Fatimah Nasser',
      email: 'fatimah@rawy.com',
      passwordHash,
      role: 'USER',
      isActive: true,
      deviceTokens: [],
      createdAt: daysAgo(28),
      updatedAt: daysAgo(2),
    },
    {
      _id: u3Id,
      name: 'Youssef Samir',
      email: 'youssef@rawy.com',
      passwordHash,
      role: 'USER',
      isActive: true,
      deviceTokens: [],
      createdAt: daysAgo(20),
      updatedAt: daysAgo(3),
    },
    {
      _id: u4Id,
      name: 'Rania Mostafa',
      email: 'rania@rawy.com',
      passwordHash,
      role: 'USER',
      isActive: true,
      deviceTokens: [],
      createdAt: daysAgo(15),
      updatedAt: daysAgo(1),
    },
  ]);

  // ── CREATOR PROFILES ───────────────────────────────────────────────────
  console.log('🎙️  Inserting Creator Profiles...');
    await creatorsCol.insertMany([
    {
      _id: new Types.ObjectId(),
      userId: c1Id,
      bio: 'Software engineer and AI enthusiast. I share the latest tech trends every week.',
      showName: 'Tech Horizons',
      avatarUrl: 'https://i.pravatar.cc/150?u=layla',
      socialLinks: {
        twitter: '@layla_tech',
        instagram: '@layla.codes',
        website: 'https://laylatech.dev',
      },
      followerCount: 4820,
      podcastCount: 2,
      createdAt: daysAgo(55),
      updatedAt: daysAgo(1),
    },
    {
      _id: new Types.ObjectId(),
      userId: c2Id,
      bio: 'Serial entrepreneur and decision-maker. I tell stories of startup successes and failures in the Middle East.',
      showName: 'Entrepreneurship',
      avatarUrl: 'https://i.pravatar.cc/150?u=omar',
      socialLinks: {
        twitter: '@omar_biz',
        youtube: 'https://youtube.com/@omarbiz',
      },
      followerCount: 8300,
      podcastCount: 2,
      createdAt: daysAgo(50),
      updatedAt: daysAgo(2),
    },
    {
      _id: new Types.ObjectId(),
      userId: c3Id,
      bio: 'Writer and researcher on Arab culture and identity. I aim to revive intellectual dialogue through podcasting.',
      showName: 'Tales & Culture',
      avatarUrl: 'https://i.pravatar.cc/150?u=nora',
      socialLinks: {
        instagram: '@nora.culture',
        website: 'https://norahaddad.com',
      },
      followerCount: 3150,
      podcastCount: 1,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(1),
    },
  ]);

  // ── PODCASTS ───────────────────────────────────────────────────────────
  console.log('🎧 Inserting Podcasts...');
  const p1Id = new Types.ObjectId(); // Tech Horizons – Layla
  const p2Id = new Types.ObjectId(); // The Future of AI – Layla
  const p3Id = new Types.ObjectId(); // Entrepreneurship – Omar
  const p4Id = new Types.ObjectId(); // Market Secrets – Omar
  const p5Id = new Types.ObjectId(); // Tales & Culture – Nora

  await podcastsCol.insertMany([
    {
      _id: p1Id,
      title: 'Tech Horizons',
      description: 'A weekly podcast diving into modern technology: AI, cloud, security, and tech entrepreneurship.',
      coverImageUrl: 'https://picsum.photos/seed/p1/400/400',
      creatorId: c1Id,
      episodeCount: 5,
      createdAt: daysAgo(50),
      updatedAt: daysAgo(2),
    },
    {
      _id: p2Id,
      title: 'The Future of AI',
      description: 'Exploring how AI is reshaping the world around us, from healthcare and education to arts and the economy.',
      coverImageUrl: 'https://picsum.photos/seed/p2/400/400',
      creatorId: c1Id,
      episodeCount: 3,
      createdAt: daysAgo(35),
      updatedAt: daysAgo(5),
    },
    {
      _id: p3Id,
      title: 'Entrepreneurship',
      description: 'Candid conversations with startup founders—both successful and failed—from the MENA region.',
      coverImageUrl: 'https://picsum.photos/seed/p3/400/400',
      creatorId: c2Id,
      episodeCount: 4,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(1),
    },
    {
      _id: p4Id,
      title: 'Market Secrets',
      description: 'In-depth analyses of stock markets, cryptocurrencies, and investment opportunities in the Arab region.',
      coverImageUrl: 'https://picsum.photos/seed/p4/400/400',
      creatorId: c2Id,
      episodeCount: 3,
      createdAt: daysAgo(25),
      updatedAt: daysAgo(3),
    },
    {
      _id: p5Id,
      title: 'Tales & Culture',
      description: 'A journey through Arabic literature, cinema, and thought. We host writers and intellectuals to revive cultural dialogue.',
      coverImageUrl: 'https://picsum.photos/seed/p5/400/400',
      creatorId: c3Id,
      episodeCount: 4,
      createdAt: daysAgo(40),
      updatedAt: daysAgo(1),
    },
  ]);

  // ── EPISODES ───────────────────────────────────────────────────────────
  console.log('🎵 Inserting Episodes...');

  const ep1  = new Types.ObjectId();
  const ep2  = new Types.ObjectId();
  const ep3  = new Types.ObjectId();
  const ep4  = new Types.ObjectId();
  const ep5  = new Types.ObjectId();
  const ep6  = new Types.ObjectId();
  const ep7  = new Types.ObjectId();
  const ep8  = new Types.ObjectId();
  const ep9  = new Types.ObjectId();
  const ep10 = new Types.ObjectId();
  const ep11 = new Types.ObjectId();
  const ep12 = new Types.ObjectId();
  const ep13 = new Types.ObjectId();
  const ep14 = new Types.ObjectId();
  const ep15 = new Types.ObjectId();
  const ep16 = new Types.ObjectId();
  const ep17 = new Types.ObjectId();
  const ep18 = new Types.ObjectId();
  const ep19 = new Types.ObjectId();

  const audioUrls = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  ];

    await episodesCol.insertMany([
    // ── Tech Horizons (p1, c1) ─────────────────────────────────
    {
      _id: ep1,
      title: 'Rise of AI Agents',
      description: 'How autonomous agents are changing software development. We review the leading frameworks and tools in 2026.',
      audioFileUrl: audioUrls[0],
      duration: 2640,
      podcastId: p1Id,
      creatorId: c1Id,
      viewsCount: 12400,
      likesCount: 1850,
      commentsCount: 93,
      createdAt: daysAgo(48),
      updatedAt: daysAgo(2),
    },
    {
      _id: ep2,
      title: 'Building Scalable NestJS Backends',
      description: 'Tips and tricks to scale a NestJS application to serve millions of users while maintaining reliability.',
      audioFileUrl: audioUrls[1],
      duration: 3120,
      podcastId: p1Id,
      creatorId: c1Id,
      viewsCount: 8900,
      likesCount: 720,
      commentsCount: 45,
      createdAt: daysAgo(40),
      updatedAt: daysAgo(5),
    },
    {
      _id: ep3,
      title: 'Cloud Security in 2026',
      description: 'Top security threats facing companies in cloud environments and how to protect your infrastructure.',
      audioFileUrl: audioUrls[2],
      duration: 2840,
      podcastId: p1Id,
      creatorId: c1Id,
      viewsCount: 6700,
      likesCount: 540,
      commentsCount: 28,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(8),
    },
    {
      _id: ep4,
      title: 'React Native vs Flutter: The Big Battle',
      description: 'A comprehensive comparison of the leading cross-platform mobile frameworks in 2026.',
      audioFileUrl: audioUrls[3],
      duration: 2400,
      podcastId: p1Id,
      creatorId: c1Id,
      viewsCount: 9350,
      likesCount: 1100,
      commentsCount: 64,
      createdAt: daysAgo(20),
      updatedAt: daysAgo(2),
    },
    {
      _id: ep5,
      title: 'The Future of Databases',
      description: 'From SQL to NoSQL to NewSQL: how to choose the right database for your project?',
      audioFileUrl: audioUrls[4],
      duration: 1980,
      podcastId: p1Id,
      creatorId: c1Id,
      viewsCount: 5200,
      likesCount: 380,
      commentsCount: 19,
      createdAt: daysAgo(10),
      updatedAt: daysAgo(1),
    },
    // ── The Future of AI (p2, c1) ────────────────────
    {
      _id: ep6,
      title: 'AI in Filmmaking',
      description: 'How directors and major studios use AI to generate visual content.',
      audioFileUrl: audioUrls[5],
      duration: 3360,
      podcastId: p2Id,
      creatorId: c1Id,
      viewsCount: 7800,
      likesCount: 910,
      commentsCount: 55,
      createdAt: daysAgo(32),
      updatedAt: daysAgo(4),
    },
    {
      _id: ep7,
      title: 'GPT-5 and Beyond',
      description: 'A review of the latest large language models and their impact on work, education, and creativity.',
      audioFileUrl: audioUrls[6],
      duration: 2880,
      podcastId: p2Id,
      creatorId: c1Id,
      viewsCount: 15600,
      likesCount: 2300,
      commentsCount: 112,
      createdAt: daysAgo(22),
      updatedAt: daysAgo(3),
    },
    {
      _id: ep8,
      title: 'AI and Diagnostic Medicine',
      description: 'Doctors and researchers explain how deep learning algorithms help detect diseases early.',
      audioFileUrl: audioUrls[0],
      duration: 3600,
      podcastId: p2Id,
      creatorId: c1Id,
      viewsCount: 11200,
      likesCount: 1650,
      commentsCount: 78,
      createdAt: daysAgo(12),
      updatedAt: daysAgo(1),
    },
    // ── Entrepreneurship (p3, c2) ───────────────────────────────
    {
      _id: ep9,
      title: 'Interview with a YC Founder from the Middle East',
      description: "A candid story about an Egyptian startup's journey from idea to Y Combinator acceptance.",
      audioFileUrl: audioUrls[1],
      duration: 4200,
      podcastId: p3Id,
      creatorId: c2Id,
      viewsCount: 23500,
      likesCount: 4100,
      commentsCount: 230,
      createdAt: daysAgo(43),
      updatedAt: daysAgo(5),
    },
    {
      _id: ep10,
      title: 'Failure Is the Best Teacher: Entrepreneur Stories',
      description: 'Three entrepreneurs share their failure stories and what they learned during and after rebuilding.',
      audioFileUrl: audioUrls[2],
      duration: 3840,
      podcastId: p3Id,
      creatorId: c2Id,
      viewsCount: 18200,
      likesCount: 3200,
      commentsCount: 185,
      createdAt: daysAgo(33),
      updatedAt: daysAgo(3),
    },
    {
      _id: ep11,
      title: 'Raising Capital in Times of Crisis',
      description: 'How to convince investors to fund your company even during high rates and market contraction.',
      audioFileUrl: audioUrls[3],
      duration: 2760,
      podcastId: p3Id,
      creatorId: c2Id,
      viewsCount: 9800,
      likesCount: 1450,
      commentsCount: 67,
      createdAt: daysAgo(18),
      updatedAt: daysAgo(2),
    },
    {
      _id: ep12,
      title: 'Building a Global Remote Team',
      description: 'Experts share best practices for building and managing distributed teams worldwide.',
      audioFileUrl: audioUrls[4],
      duration: 3000,
      podcastId: p3Id,
      creatorId: c2Id,
      viewsCount: 7600,
      likesCount: 980,
      commentsCount: 43,
      createdAt: daysAgo(8),
      updatedAt: daysAgo(1),
    },
    // ── Market Secrets (p4, c2) ────────────────────────────────
    {
      _id: ep13,
      title: 'Bitcoin in 2026: Have We Peaked?',
      description: 'Analysts discuss crypto market expectations and what 2026 holds for investors.',
      audioFileUrl: audioUrls[5],
      duration: 2520,
      podcastId: p4Id,
      creatorId: c2Id,
      viewsCount: 31000,
      likesCount: 5600,
      commentsCount: 320,
      createdAt: daysAgo(23),
      updatedAt: daysAgo(2),
    },
    {
      _id: ep14,
      title: 'Investing in Saudi Stocks in 2026',
      description: 'A comprehensive look at the Saudi stock market performance and the best sectors to invest in.',
      audioFileUrl: audioUrls[6],
      duration: 2160,
      podcastId: p4Id,
      creatorId: c2Id,
      viewsCount: 14500,
      likesCount: 2100,
      commentsCount: 98,
      createdAt: daysAgo(13),
      updatedAt: daysAgo(1),
    },
    {
      _id: ep15,
      title: 'How to Build a Smart Investment Portfolio',
      description: 'A certified financial advisor explains diversification and risk management principles for building sustainable wealth.',
      audioFileUrl: audioUrls[0],
      duration: 1800,
      podcastId: p4Id,
      creatorId: c2Id,
      viewsCount: 8700,
      likesCount: 1200,
      commentsCount: 52,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
    },
    // ── Tales & Culture (p5, c3) ───────────────────────────────
    {
      _id: ep16,
      title: 'Naguib Mahfouz: Genius of Cairo',
      description: "A journey through Naguib Mahfouz's works and the Nobel Prize's impact on the Arabic literary scene.",
      audioFileUrl: audioUrls[1],
      duration: 4800,
      podcastId: p5Id,
      creatorId: c3Id,
      viewsCount: 6300,
      likesCount: 890,
      commentsCount: 72,
      createdAt: daysAgo(38),
      updatedAt: daysAgo(4),
    },
    {
      _id: ep17,
      title: 'Moroccan Cinema: A Voice Across Borders',
      description: 'Moroccan directors tell us about their careers and the challenges of making films with a distinct Arab identity.',
      audioFileUrl: audioUrls[2],
      duration: 3960,
      podcastId: p5Id,
      creatorId: c3Id,
      viewsCount: 4800,
      likesCount: 630,
      commentsCount: 38,
      createdAt: daysAgo(28),
      updatedAt: daysAgo(3),
    },
    {
      _id: ep18,
      title: 'Arab Identity in an Age of Globalization',
      description: 'An intellectual discussion on preserving cultural particularity in the face of global culture.',
      audioFileUrl: audioUrls[3],
      duration: 5040,
      podcastId: p5Id,
      creatorId: c3Id,
      viewsCount: 9100,
      likesCount: 1320,
      commentsCount: 95,
      createdAt: daysAgo(15),
      updatedAt: daysAgo(2),
    },
    {
      _id: ep19,
      title: 'Modern Arabic Poetry: Renewal or Rooting?',
      description: 'Poets from different generations discuss the future of Arabic poetry between heritage and modernity.',
      audioFileUrl: audioUrls[4],
      duration: 4320,
      podcastId: p5Id,
      creatorId: c3Id,
      viewsCount: 5500,
      likesCount: 740,
      commentsCount: 60,
      createdAt: daysAgo(5),
      updatedAt: daysAgo(1),
    },
  ]);

  // ── COMMENTS ───────────────────────────────────────────────────────────
  console.log('💬 Inserting Comments...');
  const commentData: { text: string; userId: Types.ObjectId; episodeId: Types.ObjectId; dAgo: number }[] = [
    { text: 'Great episode! I learned a lot from the discussion on autonomous agents.', userId: u1Id, episodeId: ep1,  dAgo: 46 },
    { text: 'Thanks for this valuable content — looking forward to more questions in the comments.', userId: u2Id, episodeId: ep1, dAgo: 45 },
    { text: 'Could you share the links and resources mentioned in the episode?', userId: u3Id, episodeId: ep1, dAgo: 44 },
    { text: 'NestJS is very powerful — how do you handle microservices at large scale?', userId: u4Id, episodeId: ep2, dAgo: 38 },
    { text: "This is exactly what I was looking for. Thank you!", userId: u1Id, episodeId: ep2, dAgo: 37 },
    { text: 'Cybersecurity is very important. We would love an episode focused on Zero Trust.', userId: u2Id, episodeId: ep3, dAgo: 29 },
    { text: 'I’m team Flutter for performance and beautiful design.', userId: u3Id, episodeId: ep4, dAgo: 18 },
    { text: 'React Native is better for developers who already know JavaScript.', userId: u4Id, episodeId: ep4, dAgo: 17 },
    { text: 'The Egyptian startup YC story is very inspiring — I hope for more of these stories!', userId: u1Id, episodeId: ep9, dAgo: 41 },
    { text: 'The best part of this episode is the honesty in sharing rejection details before acceptance.', userId: u2Id, episodeId: ep9, dAgo: 40 },
    { text: 'Failure stories are sometimes more important than success stories — thanks for your courage.', userId: u3Id, episodeId: ep10, dAgo: 31 },
    { text: 'Bitcoin is always controversial and interesting at the same time.', userId: u4Id, episodeId: ep13, dAgo: 21 },
    { text: 'Excellent analysis, but we should always remember the high risks in this market.', userId: u1Id, episodeId: ep13, dAgo: 20 },
    { text: 'Naguib Mahfouz is a true genius — outstanding episode of the podcast.', userId: u2Id, episodeId: ep16, dAgo: 36 },
    { text: 'Arab identity in the age of globalization deserves more than one episode.', userId: u3Id, episodeId: ep18, dAgo: 13 },
    { text: 'I wish to see this cultural discussion at literary festivals.', userId: u4Id, episodeId: ep18, dAgo: 12 },
    { text: 'GPT-5 has radically changed how I work.', userId: u1Id, episodeId: ep7, dAgo: 20 },
    { text: 'AI in medicine will bring a real revolution in the coming years.', userId: u2Id, episodeId: ep8, dAgo: 10 },
    { text: 'Building a remote team is a real challenge, but these tips are golden.', userId: u3Id, episodeId: ep12, dAgo: 7 },
    { text: 'Arabic poetry does not die — it renews with each generation.', userId: u4Id, episodeId: ep19, dAgo: 4 },
  ];

  await commentsCol.insertMany(
    commentData.map(({ text, userId, episodeId, dAgo }) => ({
      _id: new Types.ObjectId(),
      text,
      userId,
      episodeId,
      createdAt: daysAgo(dAgo),
      updatedAt: daysAgo(dAgo),
    })),
  );

  // ── LIKES ──────────────────────────────────────────────────────────────
  console.log('❤️  Inserting Likes...');
  const likeData: { userId: Types.ObjectId; episodeId: Types.ObjectId; dAgo: number }[] = [
    { userId: u1Id, episodeId: ep1,  dAgo: 46 },
    { userId: u2Id, episodeId: ep1,  dAgo: 45 },
    { userId: u3Id, episodeId: ep1,  dAgo: 44 },
    { userId: u4Id, episodeId: ep1,  dAgo: 43 },
    { userId: u1Id, episodeId: ep2,  dAgo: 38 },
    { userId: u2Id, episodeId: ep2,  dAgo: 37 },
    { userId: u3Id, episodeId: ep4,  dAgo: 18 },
    { userId: u4Id, episodeId: ep4,  dAgo: 17 },
    { userId: u1Id, episodeId: ep6,  dAgo: 30 },
    { userId: u2Id, episodeId: ep7,  dAgo: 20 },
    { userId: u3Id, episodeId: ep7,  dAgo: 19 },
    { userId: u4Id, episodeId: ep8,  dAgo: 10 },
    { userId: u1Id, episodeId: ep9,  dAgo: 41 },
    { userId: u2Id, episodeId: ep9,  dAgo: 40 },
    { userId: u3Id, episodeId: ep9,  dAgo: 39 },
    { userId: u4Id, episodeId: ep10, dAgo: 31 },
    { userId: u1Id, episodeId: ep13, dAgo: 21 },
    { userId: u2Id, episodeId: ep13, dAgo: 20 },
    { userId: u3Id, episodeId: ep13, dAgo: 19 },
    { userId: u4Id, episodeId: ep13, dAgo: 18 },
    { userId: u1Id, episodeId: ep16, dAgo: 36 },
    { userId: u2Id, episodeId: ep18, dAgo: 13 },
    { userId: u3Id, episodeId: ep18, dAgo: 12 },
    { userId: u4Id, episodeId: ep19, dAgo: 4  },
  ];

  await likesCol.insertMany(
    likeData.map(({ userId, episodeId, dAgo }) => ({
      _id: new Types.ObjectId(),
      userId,
      episodeId,
      createdAt: daysAgo(dAgo),
      updatedAt: daysAgo(dAgo),
    })),
  );

  // ── VIEWS ──────────────────────────────────────────────────────────────
  console.log('👁️  Inserting Views...');
  const allEpisodes = [ep1,ep2,ep3,ep4,ep5,ep6,ep7,ep8,ep9,ep10,ep11,ep12,ep13,ep14,ep15,ep16,ep17,ep18,ep19];
  const allUsers    = [u1Id, u2Id, u3Id, u4Id];
  const viewDocs: object[] = [];
  const viewSeen  = new Set<string>();

  for (const ep of allEpisodes) {
    for (const uid of allUsers) {
      const key = `${uid}-${ep}`;
      if (!viewSeen.has(key)) {
        viewSeen.add(key);
        viewDocs.push({
          _id: new Types.ObjectId(),
          userId: uid,
          episodeId: ep,
          createdAt: daysAgo(Math.floor(Math.random() * 40) + 1),
          updatedAt: new Date(),
        });
      }
    }
  }
  await viewsCol.insertMany(viewDocs);

  // ── FOLLOWS ────────────────────────────────────────────────────────────
  console.log('➕ Inserting Follows...');
  await followsCol.insertMany([
    { _id: new Types.ObjectId(), followerId: u1Id, creatorId: c1Id, createdAt: daysAgo(29), updatedAt: daysAgo(29) },
    { _id: new Types.ObjectId(), followerId: u1Id, creatorId: c2Id, createdAt: daysAgo(28), updatedAt: daysAgo(28) },
    { _id: new Types.ObjectId(), followerId: u2Id, creatorId: c1Id, createdAt: daysAgo(25), updatedAt: daysAgo(25) },
    { _id: new Types.ObjectId(), followerId: u2Id, creatorId: c3Id, createdAt: daysAgo(24), updatedAt: daysAgo(24) },
    { _id: new Types.ObjectId(), followerId: u3Id, creatorId: c2Id, createdAt: daysAgo(19), updatedAt: daysAgo(19) },
    { _id: new Types.ObjectId(), followerId: u3Id, creatorId: c3Id, createdAt: daysAgo(18), updatedAt: daysAgo(18) },
    { _id: new Types.ObjectId(), followerId: u4Id, creatorId: c1Id, createdAt: daysAgo(14), updatedAt: daysAgo(14) },
    { _id: new Types.ObjectId(), followerId: u4Id, creatorId: c2Id, createdAt: daysAgo(13), updatedAt: daysAgo(13) },
    { _id: new Types.ObjectId(), followerId: u4Id, creatorId: c3Id, createdAt: daysAgo(12), updatedAt: daysAgo(12) },
  ]);

  console.log('\n✅ Seeding complete!');
  console.log('─────────────────────────────────────────');
  console.log('  Users:    8 (1 admin, 3 creators, 4 listeners)');
  console.log('  Creators: 3 profiles');
  console.log('  Podcasts: 5');
  console.log('  Episodes: 19');
  console.log('  Comments: 20');
  console.log('  Likes:    24');
  console.log(`  Views:    ${viewDocs.length}`);
  console.log('  Follows:  9');
  console.log('─────────────────────────────────────────');
  console.log('\n  🔑 Login credentials (all users):');
  console.log('     password: Password123!');
  console.log('     admin:    admin@rawy.com');
  console.log('     creator1: layla@rawy.com');
  console.log('     creator2: omar@rawy.com');
  console.log('     creator3: nora@rawy.com');
  console.log('     user1:    ahmed@rawy.com');
  console.log('     user2:    fatimah@rawy.com');
  console.log('     user3:    youssef@rawy.com');
  console.log('     user4:    rania@rawy.com');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Failed to seed:', err);
  process.exit(1);
});
