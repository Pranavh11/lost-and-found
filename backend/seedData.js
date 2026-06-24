const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Item = require('./models/Item');
const Claim = require('./models/Claim');
require('dotenv').config();

// Hash for 'password123'
const PASSWORD_HASH = bcrypt.hashSync('password123', 10);

const seed = async (shouldExit = true) => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lost_and_found';
    
    // Connect if not already connected
    if (mongoose.connection.readyState === 0) {
      console.log(`Connecting to MongoDB at ${mongoUri}...`);
      await mongoose.connect(mongoUri);
    }
    
    console.log('🔄 Cleaning existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Item.deleteMany({}),
      Claim.deleteMany({})
    ]);

    console.log('✅ Collections cleared.');

    // 1. Seed Users
    console.log('👤 Seeding Users...');
    const users = await User.create([
      { username: 'john_doe', email: 'john@gmail.com', password: PASSWORD_HASH, phone: '+1 (555) 123-4567', profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' },
      { username: 'jane_smith', email: 'jane@gmail.com', password: PASSWORD_HASH, phone: '+1 (555) 987-6543', profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
      { username: 'alice_green', email: 'alice@gmail.com', password: PASSWORD_HASH, phone: '+1 (555) 246-8135', profilePic: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80' },
      { username: 'bob_brown', email: 'bob@gmail.com', password: PASSWORD_HASH, phone: '+1 (555) 369-2580', profilePic: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80' }
    ]);

    console.log('📦 Seeding Items...');
    const itemsData = [
      {
        title: 'iPhone 15 Pro (Titanium Gray)',
        description: 'Lost my iPhone 15 Pro in a black Spigen case. It has a lock screen wallpaper of a husky dog. Probably slipped out of my pocket while sitting in the library study lounge.',
        category: 'Electronics',
        type: 'lost',
        location: 'University Main Library, 3rd Floor study rooms',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
        status: 'active',
        reportedBy: users[0]._id // John
      },
      {
        title: 'Golden Retriever (Named Max)',
        description: 'Max ran away near the east gate of Central Park. He is wearing a red collar with an ID tag, very friendly, responds to his name. Please contact if spotted!',
        category: 'Pets',
        type: 'lost',
        location: 'Central Park East Gate Entrance',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
        status: 'active',
        reportedBy: users[1]._id // Jane
      },
      {
        title: 'Brown Leather Fossil Wallet',
        description: 'Found a brown leather Fossil wallet on the cafeteria table. It contains a transit card, some cash, and a membership card. No driver license. Keeping it safe in my locker.',
        category: 'Wallets',
        type: 'found',
        location: 'Student Union Cafeteria, near Subway counter',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        image: 'https://thfvnext.bing.com/th/id/OIP.v3_2lDKLaxi3QIOKETrd0wHaEK?r=0&o=7&cb=thfvnextfalcon2rm=3&rs=1&pid=ImgDetMain&o=7&rm=3',
        status: 'active',
        reportedBy: users[2]._id // Alice
      },
      {
        title: 'Keychain with car key & Blue lanyard',
        description: 'Found a set of keys containing a Honda car fob and 3 house keys attached to a blue lanyard with "CS Dept" printed on it.',
        category: 'Keys',
        type: 'found',
        location: 'Science Building Corridor B, near room 204',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
        status: 'active',
        reportedBy: users[0]._id // John
      },
      {
        title: 'Sony WH-1000XM4 Headphones',
        description: 'Left my black Sony noise-canceling headphones in the computer science lab last night. They were in a dark gray hard case.',
        category: 'Electronics',
        type: 'lost',
        location: 'CS Lab 102, Desk Row C',
        date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        status: 'active',
        reportedBy: users[3]._id // Bob
      },
      {
        title: 'US Passport - Jane Smith',
        description: 'Lost my passport while traveling near the transit center. Blue color cover.',
        category: 'Documents',
        type: 'lost',
        location: 'Downtown Transit Center Terminal 2',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        status: 'claimed',
        reportedBy: users[1]._id, // Jane
        claimedBy: users[2]._id // Alice green returned/found it
      }
    ];

    const items = await Item.create(itemsData);
    console.log('✅ Items seeded.');

    // 3. Seed Claims
    console.log('📝 Seeding Claims...');
    // Jane claims her wallet that Alice green found
    await Claim.create({
      item: items[2]._id, // Brown Leather Fossil Wallet
      claimer: users[1]._id, // Jane Smith
      proofDescription: 'I lost my brown leather Fossil wallet yesterday in the cafeteria. It has my transit card inside and a gym membership card with the name Jane Smith.',
      verificationAnswer: 'Fossil brand, contains transit card, gym membership under Jane Smith.',
      status: 'pending'
    });

    // John claims keys that he found
    await Claim.create({
      item: items[3]._id, // Keys
      claimer: users[3]._id, // Bob Brown
      proofDescription: 'Those are my keys! They have a Honda fob (the lock button is slightly worn out) and a small silver library barcode on the back.',
      verificationAnswer: 'Honda fob, worn out lock button, silver key ring.',
      status: 'pending'
    });

    console.log('✅ Claims seeded.');
    console.log('\n🌟 MongoDB Database Seeded Successfully!');
    
    if (shouldExit) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    if (shouldExit) {
      process.exit(1);
    }
    throw error;
  }
};

// Check if run directly
if (require.main === module) {
  seed(true);
}

module.exports = seed;
