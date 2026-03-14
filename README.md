# ChronoHabit Backend

Node.js + Express + MongoDB REST API for ChronoHabit.

## Prerequisites

- Node.js 18+
- MongoDB running locally

### Start MongoDB on Windows
```
# Create data directory if it doesn't exist
mkdir C:\data\db

# Start MongoDB
mongod --dbpath C:\data\db
```

## Setup

```bash
cd chronohabit-backend
npm install
```

## Run

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Server starts at: **http://localhost:3000**

## Seed demo data (optional)

```bash
npm run seed
# Creates: demo@chronohabit.com / demo1234
```

## API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET  | /api/auth/me | Get current user (protected) |

### Habits (all protected)
| Method | Route | Description |
|--------|-------|-------------|
| GET    | /api/habits | Get all habits for user |
| POST   | /api/habits | Create habit |
| GET    | /api/habits/:id | Get single habit |
| PUT    | /api/habits/:id | Update habit |
| DELETE | /api/habits/:id | Delete habit + logs |
| PATCH  | /api/habits/:id/archive | Archive habit |
| PATCH  | /api/habits/reorder | Reorder habits |

### Logs (all protected)
| Method | Route | Description |
|--------|-------|-------------|
| GET    | /api/logs | Get logs (filter by habitId, startDate, endDate) |
| POST   | /api/logs/toggle | Toggle completion for a habit+date |
| PUT    | /api/logs/:id | Update mood/note on a log |
| GET    | /api/logs/stats/:habitId | Get stats for a habit |

## Auth

Include JWT in every protected request:
```
Authorization: Bearer <token>
```
