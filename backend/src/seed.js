const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Member = require('./models/Member');
const connectDB = require('./config/db');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Sample records covering all 3 roles: junior, senior, and lead
const sampleMembers = [
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    role: 'lead',
    team: 'Backend Engineering',
    joinDate: new Date('2024-01-15'),
    status: 'active',
  },
  {
    name: 'Bob Smith',
    email: 'bob.smith@example.com',
    role: 'senior',
    team: 'Backend Engineering',
    joinDate: new Date('2024-03-01'),
    status: 'active',
  },
  {
    name: 'Charlie Davis',
    email: 'charlie.davis@example.com',
    role: 'junior',
    team: 'Backend Engineering',
    joinDate: new Date('2024-06-10'),
    status: 'active',
  },
  {
    name: 'Diana Prince',
    email: 'diana.prince@example.com',
    role: 'senior',
    team: 'DevOps',
    joinDate: new Date('2024-02-20'),
    status: 'active',
  },
  {
    name: 'Evan Wright',
    email: 'evan.wright@example.com',
    role: 'junior',
    team: 'QA & Testing',
    joinDate: new Date('2024-07-01'),
    status: 'inactive',
  },
];

/**
 * Seeds the database with sample member records.
 */
const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing member records
    console.log('🧹 Clearing existing members...');
    await Member.deleteMany();

    // Insert sample records
    console.log('🌱 Seeding sample member records...');
    const createdMembers = await Member.insertMany(sampleMembers);
    console.log(`✅ Successfully seeded ${createdMembers.length} members:`);
    createdMembers.forEach((member) => {
      console.log(`   - [${member.role.toUpperCase()}] ${member.name} (${member.email}) - Team: ${member.team} [${member.status}]`);
    });

    // Close database connection
    await mongoose.connection.close();
    console.log('🔒 Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding database: ${error.message}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedDatabase();
