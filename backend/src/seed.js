const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

const Member = require('./models/Member');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
const AuditLog = require('./models/AuditLog');
const Coordinator = require('./models/Coordinator');
const Otp = require('./models/Otp');
const { hashPassword } = require('./utils/password');

dotenv.config({ path: path.join(__dirname, '../.env') });

// ─────────────────────────────────────────────────────────────────────────────
// ACTUAL C4GT Hub Members sourced from the official attendance spreadsheet
// Roles: LEAD & SD → 'Senior Developer' | JD → 'Junior Developer'
// ─────────────────────────────────────────────────────────────────────────────
const C4GT_MEMBERS = [
  // ── TEAM 1 ──────────────────────────────────────────────────────────────
  { team: 'TEAM-1', name: 'Bhavani Sankar Davuluri',               rollNo: '23B21A4268', branch: 'CSM',   email: 'bhavanisanakrdavuluri1094@gmail.com', phone: '7995911766', role: 'LEAD' },
  { team: 'TEAM-1', name: 'Kolamuri Bhavya Sri',                   rollNo: '23JN1A4596', branch: 'AID',   email: 'bhavyasrikolamuri@gmail.com',         phone: '8500475677', role: 'SD'   },
  { team: 'TEAM-1', name: 'Mamidala Govind',                       rollNo: '23B21A4541', branch: 'AID',   email: 'avinashalapati11@gmail.com',           phone: '9391118215', role: 'SD'   },
  { team: 'TEAM-1', name: 'Bolisetti Jyothi Swarupa',              rollNo: '23B21A4516', branch: 'AID',   email: 'swaroopa880621@gmail.com',             phone: '8019332688', role: 'SD'   },
  { team: 'TEAM-1', name: 'Panasa Rajini',                         rollNo: '23JN1A4331', branch: 'CAI',   email: 'rajini1788@gmail.com',                 phone: '8184972788', role: 'SD'   },
  { team: 'TEAM-1', name: 'Dasari Naveen Kumar',                   rollNo: '24B21A4419', branch: 'CSD',   email: 'dasarinaveenkumar277@gmail.com',        phone: '9959305514', role: 'JD'   },
  { team: 'TEAM-1', name: 'Mallipudi Satya Krupa',                 rollNo: '24B21A4213', branch: 'CSM',   email: 'satyakrupamallipudi@gmail.com',         phone: '9391546652', role: 'JD'   },
  { team: 'TEAM-1', name: 'S. Siri Bhuvaneswari',                  rollNo: '24JN1A4513', branch: 'AID',   email: 'somarouthusiri26@gmail.com',            phone: '6281414574', role: 'JD'   },
  { team: 'TEAM-1', name: 'Sabbisetty Anjana Lakshmi Asritha',     rollNo: '24JN1A4591', branch: 'AID',   email: 'asrithasabbisetty07@gmail.com',         phone: '8328107148', role: 'JD'   },

  // ── TEAM 2 ──────────────────────────────────────────────────────────────
  { team: 'TEAM-2', name: 'Ashwini B Durga',                       rollNo: '23JN1A4534', branch: 'AID',   email: 'bashwinidurga@gmail.com',              phone: '8019664599', role: 'LEAD' },
  { team: 'TEAM-2', name: 'Devaguptapu Venkata Surya Shanmukha',   rollNo: '23JN1A4215', branch: 'CSM',   email: 'shanmukha2775@gmail.com',              phone: '7981353557', role: 'SD'   },
  { team: 'TEAM-2', name: 'Giridhar Shyam Samsani',                rollNo: '23B21A4269', branch: 'CSM',   email: 'giridharsyamsamsani@gmail.com',         phone: '9705384535', role: 'SD'   },
  { team: 'TEAM-2', name: 'Peddapalli Satya Venkata Siva Durga Prasad', rollNo: '23B21A4591', branch: 'AID', email: 'psivadurgaprasad88@gmail.com',      phone: '9030512334', role: 'SD'   },
  { team: 'TEAM-2', name: 'Gandham Sri Lakshmi',                   rollNo: '23JN1A4533', branch: 'AID',   email: 'gandhamsrilakshmi9999@gmail.com',       phone: '6304569046', role: 'SD'   },
  { team: 'TEAM-2', name: 'Balukula Sampath',                      rollNo: '24B21A4345', branch: 'CAI',   email: 'sampaths3877@gmail.com',               phone: '9390536794', role: 'JD'   },
  { team: 'TEAM-2', name: 'Yuvaraju Bondada',                      rollNo: '246Q1A4307', branch: 'CAI',   email: 'yuvarajubondada111@gmail.com',          phone: '7989280510', role: 'JD'   },
  { team: 'TEAM-2', name: 'Monika Kona',                           rollNo: '24JN1A4306', branch: 'CAI',   email: 'k.monikaa10@gmail.com',                phone: '8374129365', role: 'JD'   },
  { team: 'TEAM-2', name: 'Chintada Ramya Sri',                    rollNo: '24JN1A4502', branch: 'AID',   email: 'ramyasri15007@gmail.com',              phone: '6302340514', role: 'JD'   },

  // ── TEAM 3 ──────────────────────────────────────────────────────────────
  { team: 'TEAM-3', name: 'Karthik',                               rollNo: '23B21A4661', branch: 'CYBER', email: 'karthik939075@gmail.com',              phone: '9390759591', role: 'LEAD' },
  { team: 'TEAM-3', name: 'Nithin Kumar Mancheela',                rollNo: '23B21A4225', branch: 'CSM',   email: 'nithinmancheela@gmail.com',            phone: '7670924723', role: 'SD'   },
  { team: 'TEAM-3', name: 'Laxmi Visalya Sabbisetti',              rollNo: '23JN1A4543', branch: 'AID',   email: 'lakshmivisalyasabbisetti@gmail.com',    phone: '8639478859', role: 'SD'   },
  { team: 'TEAM-3', name: 'Masaa Keerthi',                         rollNo: '23JN1A45A1', branch: 'AID',   email: 'keerthimasaa@gmail.com',               phone: '7207078483', role: 'SD'   },
  { team: 'TEAM-3', name: 'Pechetti Sri Rama Chandra Murthi',      rollNo: '23B21A4538', branch: 'AID',   email: 'srirampechetti251@gmail.com',           phone: '8886295990', role: 'SD'   },
  { team: 'TEAM-3', name: 'K Hema Supriya',                        rollNo: '24JN1A4316', branch: 'CAI',   email: 'hemasupriyakarri@gmail.com',            phone: '9948421999', role: 'JD'   },
  { team: 'TEAM-3', name: 'Achanta Siva Rama Krishna',             rollNo: '24B21A4576', branch: 'AID',   email: 'asivaramakrishna018@gmail.com',         phone: '7981239582', role: 'JD'   },
  { team: 'TEAM-3', name: 'Beela Vivek',                           rollNo: '24B21A43A1', branch: 'CAI',   email: 'beelavivek730@gmail.com',              phone: '7207261834', role: 'JD'   },
  { team: 'TEAM-3', name: 'Bevara Anjili Rani',                    rollNo: '24B21A4209', branch: 'CSM',   email: 'anjiliranibevara@gmail.com',            phone: '8688754397', role: 'JD'   },

  // ── TEAM 4 ──────────────────────────────────────────────────────────────
  { team: 'TEAM-4', name: 'Akhil Vanama',                          rollNo: '23B21A45B4', branch: 'AID',   email: 'akhilvanama19@gmail.com',              phone: '9515233587', role: 'LEAD' },
  { team: 'TEAM-4', name: 'R. Bala Nikhitha',                      rollNo: '23JN1A4581', branch: 'AID',   email: 'nikhithan172@gmail.com',               phone: '9963508675', role: 'SD'   },
  { team: 'TEAM-4', name: 'Paidikondala Devi',                     rollNo: '23B21A4506', branch: 'AID',   email: 'devipaidikondala3@gmail.com',           phone: '7569830629', role: 'SD'   },
  { team: 'TEAM-4', name: 'Lithikasraya C',                        rollNo: '23B21A4618', branch: 'CYBER', email: 'lithikasrayac@gmail.com',              phone: '8122600858', role: 'SD'   },
  { team: 'TEAM-4', name: 'Sai Teja Revuri',                       rollNo: '24B25A4305', branch: 'CAI',   email: 'steja9759@gmail.com',                  phone: '9154122026', role: 'SD'   },
  { team: 'TEAM-4', name: 'Arigela Durga Sai Manikanta',           rollNo: '25B25A4516', branch: 'AID',   email: 'arigelamanikanta2005@gmail.com',        phone: '9515667677', role: 'JD'   },
  { team: 'TEAM-4', name: 'Goluguri Keerthi Sri Jyothi',           rollNo: '24JN1A4269', branch: 'CSM',   email: 'ksri01437@gmail.com',                  phone: '7702132788', role: 'JD'   },
  { team: 'TEAM-4', name: 'Neelam Mounika',                        rollNo: '24JN1A4526', branch: 'AID',   email: 'mounika.neelam03@gmail.com',            phone: '8465999085', role: 'JD'   },
  { team: 'TEAM-4', name: 'Marni Harish Jayaram',                  rollNo: '24B21A4281', branch: 'CSM',   email: 'mharishjayram77@gmail.com',             phone: '6305233077', role: 'JD'   },

  // ── TEAM 5 ──────────────────────────────────────────────────────────────
  { team: 'TEAM-5', name: 'Meena Chittuluri',                      rollNo: '23JN1A45C0', branch: 'AID',   email: 'meenachittuluri@gmail.com',             phone: '8919002723', role: 'LEAD' },
  { team: 'TEAM-5', name: 'Mandadi Nagaratnakar',                  rollNo: '23B21A45A6', branch: 'AID',   email: 'nagaratnakarmandadi@gmail.com',          phone: '7981224969', role: 'SD'   },
  { team: 'TEAM-5', name: 'Chellumahanthi Karthik',                rollNo: '23B21A4532', branch: 'AID',   email: 'karthikch834@gmail.com',               phone: '8121407838', role: 'SD'   },
  { team: 'TEAM-5', name: 'Kola Sri Ramaraju',                     rollNo: '23B21A4262', branch: 'CSM',   email: 'sriramkola153@gmail.com',              phone: '9666394628', role: 'SD'   },
  { team: 'TEAM-5', name: 'Bindusri Talakonda',                    rollNo: '23JN1A4565', branch: 'AID',   email: 'bindusri2294@gmail.com',               phone: '8019978118', role: 'SD'   },
  { team: 'TEAM-5', name: 'Guntamukkala Bharathi',                 rollNo: '25JN5A4204', branch: 'CSM',   email: 'bharathiguntamukkala123@gmail.com',      phone: '7981251235', role: 'JD'   },
  { team: 'TEAM-5', name: 'Siripurapu Deekshitha',                 rollNo: '24B21A4410', branch: 'CSD',   email: 'sdeekshitha73@gmail.com',              phone: '7288820073', role: 'JD'   },
  { team: 'TEAM-5', name: 'Tadikala Yaswanth Kumar',               rollNo: '24B21A4567', branch: 'AID',   email: 'tadikalayaswanthkumar@gmail.com',        phone: '9177031935', role: 'JD'   },
  { team: 'TEAM-5', name: 'Moturi Teja Ganesh',                    rollNo: '24B21A45C4', branch: 'AID',   email: 'moturitejaganesh@gmail.com',            phone: '9032237429', role: 'JD'   },

  // ── TEAM 6 ──────────────────────────────────────────────────────────────
  { team: 'TEAM-6', name: 'Rahul Dravid Palani',                   rollNo: '23B21A4546', branch: 'AID',   email: 'rahuldravidpalani2005@gmail.com',        phone: '9059074389', role: 'LEAD' },
  { team: 'TEAM-6', name: 'Rayudu Veera Venkata Swamy',            rollNo: '23B21A4595', branch: 'AID',   email: 'swamyrayudu7288@gmail.com',             phone: '7288819391', role: 'SD'   },
  { team: 'TEAM-6', name: 'Chinthalapudi Venkata Satya Sai Abhishek', rollNo: '23B21A4565', branch: 'AID', email: 'abhi31mahi@gmail.com',                phone: '6302015687', role: 'SD'   },
  { team: 'TEAM-6', name: 'Palivela Lakshmi Tarun',                rollNo: '23B21A4558', branch: 'AID',   email: 'lakshmitaruntarun@gmail.com',           phone: '6303474889', role: 'SD'   },
  { team: 'TEAM-6', name: 'Gattem Aruna',                          rollNo: '23JN1A4314', branch: 'CAI',   email: 'gattemaruna68@gmail.com',              phone: '8008394924', role: 'SD'   },
  { team: 'TEAM-6', name: 'Malla Harsha Vardhan',                  rollNo: '24B21A4260', branch: 'CSM',   email: 'mallaharshavardhannaidu@gmail.com',      phone: '6281511653', role: 'JD'   },
  { team: 'TEAM-6', name: 'Chennamalli Surendra',                  rollNo: '24B21A43A5', branch: 'CAI',   email: 'surendrachennamalli177@gmail.com',       phone: '9652077964', role: 'JD'   },
  { team: 'TEAM-6', name: 'Roopa Sri Yenugu',                      rollNo: '24B21A4310', branch: 'CAI',   email: 'yroopasri6@gmail.com',                 phone: '9390093667', role: 'JD'   },
  { team: 'TEAM-6', name: 'Tharun Bole',                           rollNo: '25B25A4420', branch: 'CSD',   email: 'gowdatharun692@gmail.com',             phone: '7780388517', role: 'JD'   },

  // ── TEAM 7 ──────────────────────────────────────────────────────────────
  { team: 'TEAM-7', name: 'Charan Naidukumpatla',                  rollNo: '23B21A4311', branch: 'CAI',   email: 'charannaidukumpatla104@gmail.com',       phone: '9182242104', role: 'LEAD' },
  { team: 'TEAM-7', name: 'Kalepu Mohan Veera Manikanta',          rollNo: '23B21A4316', branch: 'CAI',   email: 'mvmanikanta98851@gmail.com',            phone: '9885149609', role: 'SD'   },
  { team: 'TEAM-7', name: 'Tammana Sri Lakshmi Vasanthi',          rollNo: '23B21A4202', branch: 'CSM',   email: 'vasanthitammana56@gmail.com',           phone: '8374149515', role: 'SD'   },
  { team: 'TEAM-7', name: 'Gopisetti Hema Sai Deepthi',            rollNo: '23JN1A4550', branch: 'AID',   email: 'gopisettideepu@gmail.com',             phone: '9618512758', role: 'SD'   },
  { team: 'TEAM-7', name: 'Moka Divya',                            rollNo: '23B21A4301', branch: 'CAI',   email: 'divyamoka7511@gmail.com',              phone: '8885193525', role: 'SD'   },
  { team: 'TEAM-7', name: 'Bepala Purnima',                        rollNo: '24JN1A4506', branch: 'AID',   email: 'purnimareddy0026@gmail.com',            phone: '8074376562', role: 'JD'   },
  { team: 'TEAM-7', name: 'Pilla Sanjay Raj',                      rollNo: '24B21A4280', branch: 'CSM',   email: 'sanjayrishipranav11@gmail.com',         phone: '9392405231', role: 'JD'   },
  { team: 'TEAM-7', name: 'Moturi Lalitha Sowjanya',               rollNo: '25B25A4205', branch: 'CSM',   email: 'moturilalithasowjanya@gmail.com',        phone: '9989677166', role: 'JD'   },
  { team: 'TEAM-7', name: 'Kadiyala Mani Naga Venkatesh',          rollNo: '24B21A4494', branch: 'CSD',   email: 'kadiyalamani5678@gmail.com',            phone: '8106916455', role: 'JD'   },

  // ── TEAM 8 ──────────────────────────────────────────────────────────────
  { team: 'TEAM-8', name: 'Sanjeetha',                             rollNo: '23B21A4304', branch: 'CAI',   email: 'sanjusanjeetha18@gmail.com',            phone: '8977621830', role: 'LEAD' },
  { team: 'TEAM-8', name: 'Katteboina Ravi Teja',                  rollNo: '23B21A4348', branch: 'CAI',   email: 'katteboinaraviteja21@gmail.com',         phone: '6305730848', role: 'SD'   },
  { team: 'TEAM-8', name: 'Achanta Veera Kumari',                  rollNo: '23JN1A4510', branch: 'AID',   email: 'vkachanta9346@gmail.com',              phone: '9346136606', role: 'SD'   },
  { team: 'TEAM-8', name: 'Narukula Devi',                         rollNo: '23JN1A45E0', branch: 'AID',   email: 'devivarshininarukula2005@gmail.com',     phone: '9849069626', role: 'SD'   },
  { team: 'TEAM-8', name: 'Yandapalli Sai Varshitha',              rollNo: '23B21A4205', branch: 'CSM',   email: 'saivarshithayandapalli@gmail.com',       phone: '9989096389', role: 'SD'   },
  { team: 'TEAM-8', name: 'Akshaya Joga',                          rollNo: '24JN1A4505', branch: 'AID',   email: 'akshayajoga28@gmail.com',              phone: '6305643561', role: 'JD'   },
  { team: 'TEAM-8', name: 'D. Ganga Bhavani',                      rollNo: '25JN5A4202', branch: 'CSM',   email: 'dasamgangabhavani81@gmail.com',          phone: '9502224398', role: 'JD'   },
  { team: 'TEAM-8', name: 'Harsha Vardhan Aripaka',                rollNo: '24B21A4256', branch: 'CSM',   email: 'aripakaharshavardhan09@gmail.com',       phone: '9701368489', role: 'JD'   },
  { team: 'TEAM-8', name: 'Raparthi Durga Venkata Manikanta',      rollNo: '25B25A4238', branch: 'CSM',   email: 'manikantaraparthi71@gmail.com',          phone: '9866655334', role: 'JD'   },

  // ── TEAM 9 ──────────────────────────────────────────────────────────────
  { team: 'TEAM-9', name: 'Aditya Nadipilli',                      rollNo: '23B21A4368', branch: 'CAI',   email: 'nadipilliaditya7@gmail.com',            phone: '8121124042', role: 'LEAD' },
  { team: 'TEAM-9', name: 'Yellapu Jayasree',                      rollNo: '23JN1A4211', branch: 'CSM',   email: 'jayasreeyellapu6475@gmail.com',          phone: '7842845423', role: 'SD'   },
  { team: 'TEAM-9', name: 'Kotikalapudi Srinagadurga',             rollNo: '23B21A4409', branch: 'CSD',   email: 'srinagadurgakotikalapudi@gmail.com',     phone: '9381134384', role: 'SD'   },
  { team: 'TEAM-9', name: 'Alapati Avinash',                       rollNo: '23B21A4378', branch: 'CAI',   email: 'mamidalagovind5599@gmail.com',           phone: '7780139348', role: 'SD'   },
  { team: 'TEAM-9', name: 'Kucharlapati Hari Rammohan Raju',       rollNo: '23B21A4540', branch: 'AID',   email: 'harirammohanraju@gmail.com',            phone: '9392549789', role: 'SD'   },
  { team: 'TEAM-9', name: 'Ankamreddi Tejasri',                    rollNo: '25JN5A4201', branch: 'CSM',   email: 'ankamredditejasri05@gmail.com',          phone: '7995304085', role: 'JD'   },
  { team: 'TEAM-9', name: 'Kambhampati Naveen',                    rollNo: '25B25A4512', branch: 'AID',   email: 'kambhampatinaveen5@gmail.com',           phone: '6281841399', role: 'JD'   },
  { team: 'TEAM-9', name: 'Seelamreddi Mugdha Mohana Siva Priya',  rollNo: '25B25A4203', branch: 'CSM',   email: 'sivapriyaseelamreddy@gmail.com',          phone: '9493392395', role: 'JD'   },
  { team: 'TEAM-9', name: 'Gummadidala Uma Devi',                  rollNo: '25B25A4202', branch: 'CSM',   email: 'umadevigummadidala@gmail.com',           phone: '8985913868', role: 'JD'   },
];

// Map spreadsheet role codes → system Member role & department label
const roleMap = {
  LEAD: { memberRole: 'Senior Developer', department: 'Team Lead' },
  SD:   { memberRole: 'Senior Developer', department: 'Senior Developer' },
  JD:   { memberRole: 'Junior Developer', department: 'Junior Developer' },
};

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
      Otp.deleteMany(),
    ]);

    // ── 1. Seed Admin User ────────────────────────────────────────────────
    console.log('👑 Seeding Admin Account...');
    const adminPassword = hashPassword('Admin@123');
    await User.create({
      name: 'System Administrator',
      email: 'admin@c4gt.com',
      password: adminPassword,
      role: 'admin',
      isActive: true,
    });

    // ── 2. Seed Coordinators (Whitelist) ──────────────────────────────────
    console.log('📋 Seeding Coordinators & Whitelist...');
    const coordinatorData = [
      {
        name: 'Chittuluri Meena',
        email: 'meenachittuluri@gmail.com',
        rollNo: '23JN1A45C0',
        phone: '8919002723',
        department: 'TEAM-5 & Program Coordination',
        isActive: true,
      },
      {
        name: 'Gadam Sai Krupa Sanjeetha',
        email: 'sanjusanjeetha18@gmail.com',
        rollNo: '23B21A4304',
        phone: '8977621830',
        department: 'TEAM-8 & Program Coordination',
        isActive: true,
      },
    ];

    const coordEmails = coordinatorData.map(c => c.email.toLowerCase().trim());

    for (const coord of coordinatorData) {
      await Coordinator.create({
        name: coord.name,
        email: coord.email.toLowerCase().trim(),
        rollNo: coord.rollNo,
        phone: coord.phone,
        department: coord.department,
        isActive: true,
      });
    }

    // ── 3. Seed all 81 actual C4GT Members & User accounts ─────────────────
    console.log('👥 Seeding 81 C4GT Members & User Accounts...');
    const memberDocs = [];
    const userDocs   = [];

    C4GT_MEMBERS.forEach((m, idx) => {
      const memberId = `C4GT-${String(idx + 1).padStart(3, '0')}`;
      const { memberRole, department } = roleMap[m.role] || roleMap['JD'];

      // Initial password = roll number (student/coordinator can change after first login)
      const initialPassword = hashPassword(m.rollNo);
      const isCoordinator = coordEmails.includes(m.email.toLowerCase().trim());

      memberDocs.push({
        memberId,
        name:       m.name,
        email:      m.email.toLowerCase().trim(),
        role:       memberRole,
        department: `${m.team} – ${department}`,
        team:       m.team,
        rollNo:     m.rollNo,
        branch:     m.branch,
        phone:      m.phone,
        isActive:   true,
        status:     'active',
      });

      userDocs.push({
        name:     m.name,
        email:    m.email.toLowerCase().trim(),
        password: initialPassword,
        role:     isCoordinator ? 'coordinator' : 'student',
        memberId,
        rollNo:   m.rollNo,
        isActive: true,
      });
    });

    await Member.insertMany(memberDocs);
    await User.insertMany(userDocs);
    console.log(`✅ Seeded ${memberDocs.length} Members & ${userDocs.length} User accounts (${coordinatorData.length} Coordinators, ${userDocs.length - coordinatorData.length} Students).`);

    // ── 4. Seed Initial Attendance Records for Today ──────────────────────
    console.log('📅 Seeding Initial Attendance Records for Today...');
    const today = new Date().toISOString().split('T')[0];
    const attendanceRecords = [];
    const auditLogs = [];

    memberDocs.forEach((m, index) => {
      const status     = index < 65 ? 'Present' : 'Absent';
      const markedTime = new Date();
      const markedBy   = 'meenachittuluri@gmail.com';

      attendanceRecords.push({ memberId: m.memberId, date: today, status, markedTime, markedBy });
    });

    const createdAttendance = await Attendance.insertMany(attendanceRecords);

    createdAttendance.forEach((att) => {
      auditLogs.push({
        attendanceId: att._id,
        memberId:     att.memberId,
        action:       'CREATE',
        oldStatus:    null,
        newStatus:    att.status,
        performedBy:  att.markedBy,
        performedAt:  att.markedTime,
      });
    });

    await AuditLog.insertMany(auditLogs);
    console.log(`✅ Seeded ${createdAttendance.length} Attendance records & ${auditLogs.length} Audit logs for ${today}.`);

    console.log('\n=============================================');
    console.log('🎉 SEEDING COMPLETE!');
    console.log('=============================================');
    console.log('🔑 CREDENTIALS FOR TESTING:');
    console.log('1. Admin:        admin@c4gt.com              / Admin@123');
    console.log('');
    console.log('2. Authorized Coordinators (Real Email + Roll Number):');
    console.log('   • Chittuluri Meena:            meenachittuluri@gmail.com / 23JN1A45C0');
    console.log('   • Gadam Sai Krupa Sanjeetha:   sanjusanjeetha18@gmail.com / 23B21A4304');
    console.log('');
    console.log('3. Students (Real Email + Roll Number):');
    console.log('   • Bhavani Sankar Davuluri:     bhavanisanakrdavuluri1094@gmail.com / 23B21A4268');
    console.log('   • Akhil Vanama:                akhilvanama19@gmail.com / 23B21A45B4');
    console.log('   • ...(all 79 other students login with their Real Email + Roll Number)');
    console.log('=============================================');
    console.log('\n📝 TEAM SUMMARY:');
    const teams = [...new Set(C4GT_MEMBERS.map(m => m.team))];
    teams.forEach(team => {
      const members = C4GT_MEMBERS.filter(m => m.team === team);
      const lead = members.find(m => m.role === 'LEAD');
      console.log(`  ${team}: ${members.length} members | Lead: ${lead ? lead.name : 'N/A'}`);
    });
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
