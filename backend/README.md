# C4GT Hub Attendance — Backend API (Week 1)

RESTful API backend for the **C4GT Hub Attendance** application built with Node.js, Express, and MongoDB (Mongoose).

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose ODM)
- **Tooling & Utilities**: dotenv, cors, nodemon

---

## 🚀 Setup & Installation

### 1. Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas cluster or local MongoDB instance

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the `backend` directory (copy from `.env.example`):
```bash
cp .env.example .env
```

Configure your variables in `.env`:
```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
```

### 4. Seed Sample Data
Populate the database with sample `junior`, `senior`, and `lead` member records:
```bash
npm run seed
```

### 5. Start the Server
- **Development mode** (auto-reload with nodemon):
  ```bash
  npm run dev
  ```
- **Production mode**:
  ```bash
  npm start
  ```
The server will run on `http://localhost:5000`.

---

## 📁 Architecture & File Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js                    # MongoDB connection via Mongoose
│   ├── models/
│   │   └── Member.js                # Mongoose Member schema & validation
│   ├── routes/
│   │   └── members.js               # Express route definitions
│   ├── controllers/
│   │   └── memberController.js      # CRUD handler logic (GET, POST, PUT/PATCH, DELETE)
│   ├── middleware/
│   │   ├── errorHandler.js          # Centralized error handling
│   │   ├── notFound.js              # 404 fallback handler for unmatched routes
│   │   └── logger.js                # Request logging middleware
│   ├── seed.js                      # Database seed script
│   └── server.js                    # Express app entry point
├── c4gt-hub-attendance.postman_collection.json # Postman test collection
├── .env.example
├── package.json
└── README.md
```

---

## 📊 Data Model: Member

| Field | Type | Required | Allowed Values / Validation | Default |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `String` | **Yes** | Non-empty string, trimmed | — |
| `email` | `String` | **Yes** | Valid email format, unique, lowercase | — |
| `role` | `String` | **Yes** | `'junior'`, `'senior'`, `'lead'` | — |
| `team` | `String` | **Yes** | Non-empty string, trimmed | — |
| `joinDate`| `Date` | No | Valid Date format | `Date.now` |
| `status` | `String` | No | `'active'`, `'inactive'` | `'active'` |
| `createdAt`/`updatedAt` | `Date` | Auto | Managed by Mongoose timestamps | Current timestamp |

---

## 🌐 API Endpoints

Base URL: `http://localhost:5000/api`

### 1. Health Check
* **Method**: `GET`
* **URL**: `/api/health`
* **Response** (`200 OK`):
  ```json
  {
    "status": "ok",
    "message": "C4GT Hub Attendance API is running",
    "timestamp": "2026-08-24T12:00:00.000Z"
  }
  ```

---

### 2. List Members
* **Method**: `GET`
* **URL**: `/api/members`
* **Query Parameters**:
  * `role` *(optional)*: Filter by role (`junior`, `senior`, `lead`) e.g., `/api/members?role=junior`
* **Response** (`200 OK`):
  ```json
  [
    {
      "_id": "65e9a1234567890abcdef123",
      "name": "Alice Johnson",
      "email": "alice.johnson@example.com",
      "role": "lead",
      "team": "Backend Engineering",
      "joinDate": "2024-01-15T00:00:00.000Z",
      "status": "active",
      "createdAt": "2026-08-24T10:00:00.000Z",
      "updatedAt": "2026-08-24T10:00:00.000Z"
    }
  ]
  ```

---

### 3. Get Single Member
* **Method**: `GET`
* **URL**: `/api/members/:id`
* **Response** (`200 OK`):
  ```json
  {
    "_id": "65e9a1234567890abcdef123",
    "name": "Alice Johnson",
    "email": "alice.johnson@example.com",
    "role": "lead",
    "team": "Backend Engineering",
    "joinDate": "2024-01-15T00:00:00.000Z",
    "status": "active"
  }
  ```
* **Error Responses**:
  * `404 Not Found`: `{"message": "Member not found"}`

---

### 4. Create Member
* **Method**: `POST`
* **URL**: `/api/members`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "name": "Bob Smith",
    "email": "bob.smith@example.com",
    "role": "senior",
    "team": "DevOps",
    "status": "active"
  }
  ```
* **Response** (`201 Created`):
  ```json
  {
    "_id": "65e9a9999999990abcdef456",
    "name": "Bob Smith",
    "email": "bob.smith@example.com",
    "role": "senior",
    "team": "DevOps",
    "status": "active",
    "joinDate": "2026-08-24T12:00:00.000Z"
  }
  ```
* **Error Responses**:
  * `400 Bad Request` (Missing field / invalid enum / invalid email): `{"message": "Name is required, Role is required"}`
  * `400 Bad Request` (Duplicate email): `{"message": "Email already exists. Please provide a unique email address."}`

---

### 5. Update Member
* **Method**: `PUT` / `PATCH`
* **URL**: `/api/members/:id`
* **Headers**: `Content-Type: application/json`
* **Request Body**:
  ```json
  {
    "role": "lead",
    "team": "Architecture & Core"
  }
  ```
* **Response** (`200 OK`):
  ```json
  {
    "_id": "65e9a9999999990abcdef456",
    "name": "Bob Smith",
    "email": "bob.smith@example.com",
    "role": "lead",
    "team": "Architecture & Core",
    "status": "active"
  }
  ```
* **Error Responses**:
  * `400 Bad Request` (Validation error): `{"message": "director is not a valid role. Allowed roles: junior, senior, lead"}`
  * `404 Not Found`: `{"message": "Member not found"}`

---

### 6. Delete Member
* **Method**: `DELETE`
* **URL**: `/api/members/:id`
* **Response** (`200 OK`):
  ```json
  {
    "message": "Member deleted successfully",
    "data": {
      "_id": "65e9a9999999990abcdef456",
      "name": "Bob Smith",
      "email": "bob.smith@example.com"
    }
  }
  ```
* **Error Responses**:
  * `404 Not Found`: `{"message": "Member not found"}`

---

## 🛡️ Error Handling & Status Codes

- **Centralized Error Middleware**: All errors pass through `middleware/errorHandler.js`.
- **404 Route Fallback**: `middleware/notFound.js` handles any undefined paths (`GET /api/unknown-path`).

| Status Code | Reason |
| :--- | :--- |
| **`200 OK`** | Request succeeded (GET, PUT, PATCH, DELETE) |
| **`201 Created`** | New member successfully created (POST) |
| **`400 Bad Request`** | Validation failure (missing required field, invalid regex/enum, duplicate email) |
| **`404 Not Found`** | Resource or route not found (invalid/nonexistent ID or unmatched endpoint) |
| **`500 Internal Server Error`** | Unhandled server exception |

---

## 📬 Postman Testing

Import [`c4gt-hub-attendance.postman_collection.json`](file:///c:/Users/Lenovo/OneDrive/Desktop/c4gt-hub-attendance%20%281%29/c4gt-hub-attendance/backend/c4gt-hub-attendance.postman_collection.json) into Postman or Thunder Client:
1. Open Postman / Thunder Client.
2. Click **Import** and choose `c4gt-hub-attendance.postman_collection.json`.
3. Set the `baseUrl` variable to `http://localhost:5000` (set by default).
4. Run the requests sequentially to test both valid operations and invalid error handling scenarios.
