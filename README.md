# CRM System

A full-stack CRM application with React frontend and Node/Express backend.

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MySQL
- **Auth:** JWT + bcrypt

## Prerequisites

- Node.js (v18+)
- MySQL (v8.0+)

## Setup

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run the schema (creates database and tables with sample data)
source schema.sql
```

Or from terminal:
```bash
mysql -u root -p < backend/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
```

**Configuration:** Edit `.env` file with your MySQL credentials:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=crm_db
JWT_SECRET=your-secret-key
PORT=3001
```

**Start backend:**
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## Test Accounts

All passwords: `password123`

| Email | Role | Name |
|-------|------|------|
| admin@supportdesk.com | ADMIN | Admin User |
| sarah.miller@supportdesk.com | TL | Sarah Miller |
| mike.johnson@supportdesk.com | TL | Mike Johnson |
| john.doe@supportdesk.com | AGENT | John Doe |
| emily.wilson@supportdesk.com | AGENT | Emily Wilson |

## Features

- **Agent:** Create tickets, view own tickets, update profile
- **Team Lead:** View team tickets, escalate tickets, manage agents, view escalations
- **Admin:** Manage all users, view all tickets, assign tickets to TLs

## API Endpoints

- `POST /api/auth/login` - Login
- `GET /api/tickets/all` - Admin: all tickets
- `GET /api/tickets/team` - TL: assigned tickets
- `GET /api/tickets/my` - Agent: own tickets
- `POST /api/tickets` - Create ticket
- `PATCH /api/tickets/:id/escalate` - Escalate ticket
- `GET /api/users` - Admin: all users
- `GET /api/users/agents` - TL/Admin: all agents
- `GET /api/users/tls` - TL/Admin: all TLs