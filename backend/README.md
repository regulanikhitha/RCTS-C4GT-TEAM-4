# C4GT Hub Attendance — Backend (Week 1)

This is a **file skeleton only** — folders and empty files matching each
person's assigned task, so everyone knows exactly where their code goes.
No implementation is included; each person writes their own code per the
Week 1 Task Assignment doc.

## Setup

```
cd backend
npm install
cp .env.example .env
```
Fill in `MONGO_URI` in `.env` with your MongoDB connection string.

## Folder structure

```
backend/
├── src/
│   ├── config/db.js               Akhil — MongoDB connection (Mongoose)
│   ├── models/Member.js            Nikitha — Member schema + validation
│   ├── routes/members.js            Devi + Lithika Sraya — route definitions
│   ├── controllers/
│   │   └── memberController.js       Devi + Lithika Sraya — CRUD handler logic
│   ├── middleware/
│   │   ├── errorHandler.js            Sai Teja — centralized error handler
│   │   └── notFound.js                 Sai Teja — 404 fallback
│   ├── seed.js                          Nikitha — sample data seeder
│   └── server.js                         Akhil — app entry point
├── .env.example
├── package.json
└── README.md
```

## Who builds what

| File | Owner | Task |
|---|---|---|
| `src/server.js`, `src/config/db.js` | Akhil (Lead) | Express setup, MongoDB connection, folder structure, branch strategy |
| `src/models/Member.js`, `src/seed.js` | Nikitha (A) | Schema design, validation, seed script with sample records |
| `src/routes/members.js`, `src/controllers/memberController.js` | Devi (B) | GET `/members`, GET `/members/:id`, POST `/members` |
| `src/routes/members.js`, `src/controllers/memberController.js` | Lithika Sraya (C) | PUT/PATCH `/members/:id`, DELETE `/members/:id` |
| `src/middleware/errorHandler.js`, `src/middleware/notFound.js` | Sai Teja (D) | Centralized error handling, 404 fallback, Postman collection, QA |

## Member schema (target — to be implemented by Nikitha)

```
{
  name: String,
  email: String,
  role: "junior" | "senior" | "lead",
  team: String,
  joinDate: Date,
  status: "active" | "inactive"
}
```

## API endpoints (target — to be implemented by Devi + Lithika Sraya)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/members` | List all members (`?role=` filter) |
| GET | `/members/:id` | Get one member |
| POST | `/members` | Create a member |
| PUT/PATCH | `/members/:id` | Update a member |
| DELETE | `/members/:id` | Delete a member |

See the Week 1 Task Assignment doc for full per-person task details, test
cases, and submission checklists.
