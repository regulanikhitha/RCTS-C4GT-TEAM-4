# C4GT Hub Attendance

A full-stack attendance management project for the C4GT Hub learning initiative. The application is designed to manage member records and visualize attendance data across different participant groups.

## Overview

This repository contains the foundation for a MERN stack attendance application with:

- a backend API for member management,
- a frontend dashboard for attendance insights,
- role-based grouping for junior interns, senior interns, and team leads,
- future analytics views built with charts and dashboard components.

The project is structured as a multi-week implementation plan, with the backend being developed first and the frontend dashboard layers added later.

## Project Goals

- Maintain a central member database for C4GT Hub participants
- Support attendance-related member operations through REST APIs
- Provide dashboards for:
  - overall attendance,
  - junior developer interns,
  - senior developer interns
- Enable future UI-based analytics with chart visualizations

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- dotenv
- CORS

### Frontend
- React
- Vite or similar React setup
- shadcn/ui
- Recharts

## Repository Structure

```bash
c4gt-hub-attendance/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seed.js
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/
│   └── .gitkeep
├── .gitignore
├── README.md
└── package-lock.json
```

## Current Status

This repository currently includes the project skeleton and backend setup files. The backend foundation is being prepared for member CRUD APIs, validation, middleware, and database integration.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/regulanikhitha/RCTS-C4GT-TEAM-4.git
cd RCTS-C4GT-TEAM-4
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

Copy the example environment file and add your MongoDB connection string:

```bash
cp .env.example .env
```

Then update `.env` with:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

### 4. Run the backend

```bash
npm run dev
```

Or start the server directly:

```bash
npm start
```

## Backend API Scope

The backend is intended to expose member management routes such as:

- `GET /members`
- `GET /members/:id`
- `POST /members`
- `PUT /members/:id`
- `PATCH /members/:id`
- `DELETE /members/:id`

## Member Model

Each member may include fields such as:

- name
- email
- role
- team
- joinDate
- status

## Development Workflow

This repository follows a simple development flow:

- `main` for stable code
- feature branches for task-specific work
- pull requests for review and merge

## Contribution

Contributions are welcome. Please:

1. create a feature branch,
2. make focused changes,
3. test locally,
4. open a pull request with a clear summary.

## Credits

This project is part of the C4GT Hub learning initiative and is being developed as a multi-week MERN application for attendance tracking and data visualization.

## License

This project is currently unlicensed unless otherwise specified by the team.

## Related Documentation

- [backend/README.md](backend/README.md)
