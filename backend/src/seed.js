const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

const Member = require('./models/Member');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const AuditLog = require('./models/AuditLog');
const Coordinator = require('./models/Coordinator');
const { hashPassword } = require('./utils/password');

dotenv.config({ path: path.join(__dirname, '../.env') });

// Indian & global common developer first & last names for 81 realistic members
const firstNames = [
  'Aarav', 'Aditi', 'Akash', 'Ananya', 'Arjun', 'Bhavya', 'Chetan', 'Deepika',
  'Dhruv', 'Divya', 'Gaurav', 'Harini', 'Ishaan', 'Kavya', 'Karan', 'Meera',
  'Nikhil', 'Pooja', 'Pranav', 'Priya', 'Rahul', 'Rhea', 'Rohan', 'Sakshi',
  'Sameer', 'Shreya', 'Siddharth', 'Sneha', 'Tanvi', 'Utkarsh', 'Varun', 'Vidya',
  'Yash', 'Zoya', 'Abhishek', 'Aishwarya', 'Amit', 'Anjali', 'Ashwin', 'Devi',
  'Harsh', 'Ishita', 'Kartik', 'Lavanya', 'Manish', 'Neha', 'Naveen', 'Pavithra',
  'Rajesh', 'Ritu', 'Sachin', 'Sanya', 'Saurabh', 'Shruti', 'Suresh', 'Swati',
  'Tejas', 'Trisha', 'Vaibhav', 'Vandana', 'Vikas', 'Vinay', 'Yamini', 'Aakash',
  'Amrita', 'Aniket', 'Charu', 'Deepak', 'Gitanjali', 'Hemant', 'Kalyani', 'Kishore',
  'Madhuri', 'Manoj', 'Nandini', 'Pankaj', 'Radhika', 'Rakesh', 'Rohit', 'Sonal', 'Tarun'
];

const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Reddy', 'Rao', 'Iyer', 'Nair', 'Mehta',
  'Gupta', 'Singh', 'Kumar', 'Joshi', 'Chopra', 'Kapoor', 'Bhat', 'Kulkarni',
  'Deshmukh', 'Choudhury', 'Banerjee', 'Chatterjee', 'Das', 'Sen', 'Pillai', 'Menon'
];

const departments = [
  'Backend Engineering',
  'Frontend Architecture',
  'Cloud & DevOps',
  'Data & Analytics',
  'AI/ML Systems',
  'Quality Assurance',
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🌱 Connected to database for seeding...');

    // Clear existing records
    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      Member.deleteMany(),
      User.deleteMany(),
      Attendance.deleteMany(),
      AuditLog.deleteMany(),
      Coordinator.deleteMany(),
    ]);

    // 1. Seed Admin User
    console.log('👑 Seeding Admin Account...');
    const adminPassword = hashPassword('Admin@123');
    await User.create({
      name: 'System Administrator',
      email: 'admin@c4gt.com',
      password: adminPassword,
      role: 'admin',
      isActive: true,
    });

    // 2. Seed Coordinators (Whitelist + User login)
    console.log('📋 Seeding Coordinators & Whitelist...');
    const coordPassword = hashPassword('Coord@123');

    const coordinatorData = [
      {
        name: 'Priya Sharma (Coordinator)',
        email: 'coordinator1@c4gt.com',
        department: 'Program Operations',
      },
      {
        name: 'Rahul Verma (Coordinator)',
        email: 'coordinator2@c4gt.com',
        department: 'Technical Mentorship',
      },
    ];

    for (const coord of coordinatorData) {
      await Coordinator.create({
        name: coord.name,
        email: coord.email,
        department: coord.department,
        isActive: true,
      });

      await User.create({
        name: coord.name,
        email: coord.email,
        password: coordPassword,
        role: 'coordinator',
        isActive: true,
      });
    }

    // 3. Generate 81 C4GT Members and Student User accounts
    console.log('👥 Generating 81 C4GT Members & Student User Accounts...');
    const memberDocs = [];
    const userDocs = [];
    const studentPassword = hashPassword('Student@123');

    for (let i = 1; i <= 81; i++) {
      const memberId = `C4GT-${String(i).padStart(3, '0')}`;
      const firstName = firstNames[i - 1] || `Student${i}`;
      const lastName = lastNames[(i - 1) % lastNames.length];
      const fullName = `${firstName} ${lastName}`;
      const email = `member${String(i).padStart(3, '0')}@c4gt.com`.toLowerCase();

      // 46 Junior Developers, 35 Senior Developers
      const role = i <= 46 ? 'Junior Developer' : 'Senior Developer';
      const department = departments[(i - 1) % departments.length];

      memberDocs.push({
        memberId,
        name: fullName,
        email,
        role,
        department,
        team: department,
        isActive: true,
        status: 'active',
      });

      userDocs.push({
        name: fullName,
        email,
        password: studentPassword,
        role: 'student',
        memberId,
        isActive: true,
      });
    }

    await Member.insertMany(memberDocs);
    await User.insertMany(userDocs);
    console.log(`✅ Successfully seeded 81 Members & 81 Student User accounts.`);

    // 4. Seed Initial Attendance Records for Today
    console.log('📅 Seeding Initial Attendance Records for Today...');
    const today = new Date().toISOString().split('T')[0];
    const attendanceRecords = [];
    const auditLogs = [];

    // Mark 65 Present, 16 Absent
    memberDocs.forEach((m, index) => {
      const isPresent = index < 65;
      const status = isPresent ? 'Present' : 'Absent';
      const markedTime = new Date();
      const markedBy = 'coordinator1@c4gt.com';

      attendanceRecords.push({
        memberId: m.memberId,
        date: today,
        status,
        markedTime,
        markedBy,
      });
    });

    const createdAttendance = await Attendance.insertMany(attendanceRecords);

    createdAttendance.forEach((att) => {
      auditLogs.push({
        attendanceId: att._id,
        memberId: att.memberId,
        action: 'CREATE',
        oldStatus: null,
        newStatus: att.status,
        performedBy: att.markedBy,
        performedAt: att.markedTime,
      });
    });

    await AuditLog.insertMany(auditLogs);
    console.log(`✅ Seeded ${createdAttendance.length} Attendance records & ${auditLogs.length} Audit logs for ${today}.`);

    console.log('\n=============================================');
    console.log('🎉 SEEDING COMPLETE!');
    console.log('=============================================');
    console.log('🔑 CREDENTIALS FOR TESTING:');
    console.log('1. Admin:        admin@c4gt.com        / Admin@123');
    console.log('2. Coordinator:  coordinator1@c4gt.com  / Coord@123');
    console.log('3. Coordinator:  coordinator2@c4gt.com  / Coord@123');
    console.log('4. Students:     member001@c4gt.com to member081@c4gt.com / Student@123');
    console.log('=============================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seedDatabase();
