# C4GT Hub Attendance

Attendance tracking application for C4GT Hub — 81 members (36 junior
developer interns, 36 senior developer interns, 9 team leads). Built as part
of the C4GT Hub @ KIET four-week learning task (MERN + shadcn/ui + Recharts).

## Project goal

Three dashboards — Overall Attendance, Junior Developer Intern, Senior
Developer Intern — backed by a CRUD REST API, with per-member Recharts
visualizations on click.

## Structure

```
c4gt-hub-attendance/
├── backend/              ← build this fully in Week 1
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── config/
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/             ← empty/placeholder for now, fill in Week 2
├── .gitignore
└── README.md             ← top-level project overview
```

| Week | What happens to this structure |
|---|---|
| 1 | `backend/` gets fully built — models, routes, controllers, middleware, config for the Member Management API |
| 2 | `frontend/` stops being a placeholder — React + shadcn/ui components go in, connected to the Week 1 API |
| 3 | Chart components (Recharts) get added inside `frontend/` — no new top-level folders needed |
| 4 | Both `backend/` and `frontend/` get extended into the real attendance app — attendance endpoints, 3 dashboards, Recharts on click |

## Weekly plan

| Week | Focus | Output |
|---|---|---|
| 1 | MERN foundations | Member Management API |
| 2 | React + shadcn/ui | Member Management UI |
| 3 | Recharts | Analytics dashboard |
| 4 | Integration | Full 3-dashboard attendance app |

## Branching

- `main` — stable, reviewed code only
- `develop` — integration branch
- `feature/<area>-<task>` — one branch per task, merged into `develop` via PR

See `backend/README.md` for setup instructions and API documentation.
