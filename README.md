<img width="1920" height="1080" alt="image_2026-05-19_01-15-38" src="https://github.com/user-attachments/assets/307e34db-fe65-4868-a66f-205551daa89a" />
<img width="1920" height="1080" alt="image_2026-05-19_01-17-11" src="https://github.com/user-attachments/assets/34c2335d-31f1-4370-8873-2f7be15d762e" />

<img width="1920" height="1080" alt="image_2026-05-19_01-17-27" src="https://github.com/user-attachments/assets/8fc9fdc4-b3ae-495a-8f16-580a232737bd" />

# CRM System

A Full-Stack CRM System with Role-Based Access Control



## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MySQL
- **Auth:** JWT + bcrypt

## 3 User Roles: Agent, Team Lead, Admin - each with tailored dashboards and permissions

## Key Features:
- Auto-assignment of tickets to least-loaded Team Leads
- Ticket escalation system with load balancing
- Ticket lifecycle management (create, resolve, escalate, close)
- User administration with activate/deactivate functionality
- Profile management with password changes

## Role Workflow:
- Agents: Create tickets (auto-assigned to TL)
- Team Leads: Manage team tickets, escalate to other TLs
- Admin: Full system visibility, user management, manual ticket assignment

## Highlights:
- Load-balancing ticket routing
- Clean RBAC architecture
- Vanilla CSS styling

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







