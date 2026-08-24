# C4GT Hub Attendance — Production Backend API

RESTful API backend for the **C4GT Hub Attendance** application supporting 3-tier Role-Based Access Control (**Admin**, **Coordinator**, **Student**), complete 81-member dataset, attendance tracking (single & bulk), audit logging, analytics, and downloadable PDF reports.

---

## 🛠️ Tech Stack & Architecture

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB via Mongoose ODM
- **Security & Cryptography**: Standard JWT (HMAC-SHA256), `crypto.scryptSync` password hashing, RBAC middleware, CORS
- **Reporting**: Native PDF Report Generator (Standard PDF 1.4 streaming)
- **Architecture**: Layered MVC (Routes $\rightarrow$ Middleware $\rightarrow$ Controllers $\rightarrow$ Services/Utils $\rightarrow$ Models)

---

## 🚀 Setup & Installation

### 1. Install & Configure
```bash
cd backend
cp .env.example .env
```

Ensure your `.env` contains:
```env
MONGO_URI=mongodb+srv://...
PORT=5000
JWT_SECRET=c4gt_super_secret_jwt_key_2026_secure
JWT_EXPIRES_IN=86400
NODE_ENV=development
```

### 2. Seed 81 Members & Initial Accounts
Populate the database with the **System Admin**, **2 Authorized Coordinators**, all **81 C4GT Members**, and today's initial attendance & audit logs:
```bash
npm run seed
```

### 3. Start the Server
```bash
npm start
# or with nodemon for development:
npm run dev
```

---

## 🔑 Default Testing Credentials

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@c4gt.com` | `Admin@123` | Full member & coordinator management, all attendance, system audit logs |
| **Coordinator 1** | `coordinator1@c4gt.com` | `Coord@123` | Whitelisted login, view 81 members, mark single/bulk attendance, update, download PDF |
| **Coordinator 2** | `coordinator2@c4gt.com` | `Coord@123` | Whitelisted coordinator login |
| **Students (81)** | `member001@c4gt.com` to `member081@c4gt.com` | `Student@123` | View personal attendance history & stats only (strict read-only) |

---

## 📊 Database Models & Collections

1. **`User`**: Authentication accounts (`name`, `email`, `password` hashed, `role`: `'admin'` \| `'coordinator'` \| `'student'`, `memberId`, `isActive`).
2. **`Member`**: Core 81 member profiles (`memberId`: `'C4GT-001'`..`'C4GT-081'`, `name`, `email`, `role`: `'Junior Developer'` \| `'Senior Developer'`, `department`, `isActive`).
3. **`Attendance`**: Daily status logs (`memberId`, `date`: `'YYYY-MM-DD'`, `status`: `'Present'` \| `'Absent'`, `markedTime`, `markedBy`). **Compound Unique Index**: `(memberId + date)`.
4. **`AuditLog`**: Modification history (`attendanceId`, `memberId`, `action`: `'CREATE'` \| `'UPDATE'`, `oldStatus`, `newStatus`, `performedBy`, `performedAt`).
5. **`Coordinator`**: Authorized coordinator whitelist (`name`, `email`, `department`, `isActive`).

---

## 🌐 Complete API Endpoints

Base URL: `http://localhost:5000/api`

### 1. Authentication (`/api/auth`)
* `POST /api/auth/login`: Authenticates credentials (with coordinator whitelist check) & returns JWT.
* `GET /api/auth/me`: Returns current user profile (requires `Bearer <token>`).
* `POST /api/auth/register`: Admin-only registration of new users.

### 2. Member Management (`/api/members`)
* `GET /api/members`: Lists all 81 members (supports `?role=Junior%20Developer`, `?department=`, `?isActive=true`). *(Admin, Coordinator)*
* `GET /api/members/:memberId`: Retrieves single member details. *(Admin, Coordinator)*
* `POST /api/members`: Creates a new member. *(Admin only)*
* `PUT /api/members/:memberId`: Updates member info. *(Admin only)*
* `DELETE /api/members/:memberId`: Deletes/deactivates member. *(Admin only)*

### 3. Attendance Operations (`/api/attendance`)
* `POST /api/attendance`: Marks single member attendance (`{ memberId, date, status }`) + writes Audit Log. *(Admin, Coordinator)*
* `POST /api/attendance/bulk`: Marks attendance in batch (`{ date, records: [{ memberId, status }] }`). *(Admin, Coordinator)*
* `PUT /api/attendance/:attendanceId`: Updates attendance record + writes Audit Log. *(Admin, Coordinator)*
* `GET /api/attendance?date=YYYY-MM-DD`: Returns daily attendance for all 81 members (merging marked & unmarked members). *(Admin, Coordinator)*
* `GET /api/attendance/stats?date=YYYY-MM-DD`: Returns overall stats (total, present, absent, %) and breakdown for Junior & Senior Developers. *(Admin, Coordinator)*
* `GET /api/attendance/member/:memberId`: View attendance history for a single member. *(Students view own; Admins/Coordinators view any)*
* `GET /api/attendance/report/:date`: Generates and streams a downloadable attendance PDF report. *(Admin, Coordinator)*

### 4. Coordinator Whitelist Management (`/api/coordinators`)
* `GET /api/coordinators`: List all authorized coordinators. *(Admin only)*
* `POST /api/coordinators`: Add coordinator to whitelist. *(Admin only)*
* `PUT /api/coordinators/:id`: Update coordinator details. *(Admin only)*
* `DELETE /api/coordinators/:id`: Remove coordinator from whitelist. *(Admin only)*

---

## 📬 Postman Testing

Import [`backend/c4gt-hub-attendance.postman_collection.json`](file:///c:/Users/Lenovo/OneDrive/Desktop/c4gt-hub-attendance%20%281%29/c4gt-hub-attendance/backend/c4gt-hub-attendance.postman_collection.json) into Postman:
1. Run **1.1 Admin Login** $\rightarrow$ Automatically sets `adminToken`.
2. Run **1.2 Coordinator Login** $\rightarrow$ Automatically sets `coordToken`.
3. Run **1.3 Student Login** $\rightarrow$ Automatically sets `studentToken`.
4. Execute any of the 21 pre-configured requests across Member, Attendance, Stats, PDF, and Coordinator modules.
