# Grand Romeo Hotel Management System
**DATAMA2 - Database Management 2 Finals Project**

A multi-portal hotel reservation and management system with role-based access control.

---

## 🏗️ Architecture

This system consists of **3 separate web applications**, each deployed independently:

| Portal | Folder | Default Port | User Role | Purpose |
|--------|--------|--------------|-----------|---------|
| **Admin Portal** | `hotel-admin/` | 3000 | `admin` | Full system management |
| **Front Desk Portal** | `hotel-staff/` | 3001 | `front_desk` | Daily operations |
| **Guest Portal** | `hotel-user/` | 3002 | `guest` | Book rooms, view reservations |

### Why 3 Separate Apps?
- **Security Isolation** - Each portal only contains code for its role
- **Independent Deployment** - Deploy to different URLs/servers
- **Minimal Code Exposure** - Guests can't see admin functionality
- **Role Enforcement** - Wrong credentials = access denied

---

## 📁 Project Structure

```
Finals Repo/
├── database/              # SQL scripts for Supabase setup
│   ├── setup.sql         # Complete setup (DDL + DML + seed data)
│   ├── DDL.sql           # Schema definition only
│   ├── DML.sql           # Seed data only
│   └── drop.sql          # Drop all tables
│
├── hotel-admin/          # Admin Portal
│   └── src/
│       ├── pages/        # Dashboard, Guests, Rooms, Reservations, Payments, Staff, Accounts
│       ├── components/   # UI components
│       ├── contexts/     # AuthContext
│       ├── lib/          # Supabase client, database services
│       └── types/        # TypeScript interfaces
│
├── hotel-staff/          # Front Desk Portal
│   └── src/
│       ├── pages/        # Dashboard, Guests, Rooms, Reservations, Payments
│       └── ...
│
└── hotel-user/           # Guest Portal
    └── src/
        ├── pages/        # Dashboard, Rooms, My Reservations
        └── ...
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/bun
- Supabase account (for PostgreSQL database)

### 1. Database Setup

#### Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Save your **Project URL** and **Anon Key**

#### Run Database Script
1. Go to Supabase Dashboard → SQL Editor
2. First run `database/drop.sql` (if resetting)
3. Then run `database/setup.sql`
4. This creates all tables and seed data

### 2. Configure Environment

Create `.env` file in **each** portal folder (`hotel-admin/`, `hotel-staff/`, `hotel-user/`):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=Your-key-here
```

### 3. Install & Run

```bash
# Admin Portal
cd hotel-admin
npm install
npm run dev

# Front Desk Portal (new terminal)
cd hotel-staff
npm install
npm run dev

# Guest Portal (new terminal)
cd hotel-user
npm install
npm run dev
```

---

## 🔐 Authentication

### How Login Works
This system uses **simple database authentication** (NOT Supabase Auth):

1. User enters **username** + **password**
2. Query the appropriate table (`admins`, `front_desk`, or `guests`)
3. If credentials match, user is logged in
4. Session stored in localStorage

### Login Credentials

#### Admin Portal
| Username | Password |
|----------|----------|
| marwin | Admin123 |
| romeo | Admin123 |
| nairb | Admin123 |
| johncarlo | Admin123 |

#### Front Desk Portal
| Username | Password |
|----------|----------|
| patricia | FrontDesk123 |
| roberto | FrontDesk123 |
| elena | FrontDesk123 |
| marco | FrontDesk123 |

#### Guest Portal
| Username | Password |
|----------|----------|
| juan | Guest123 |
| maria | Guest123 |
| carlos | Guest123 |
| ana | Guest123 |
| miguel | Guest123 |
| sofia | Guest123 |
| diego | Guest123 |
| isabella | Guest123 |
| gabriel | Guest123 |
| camila | Guest123 |

---

## 🗄️ Database Schema

### User Account Tables (for authentication)

```sql
-- Admins (Admin Portal)
CREATE TABLE admins (
  admin_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  contact_number VARCHAR(15),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Front Desk (Staff Portal)
CREATE TABLE front_desk (
  front_desk_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  contact_number VARCHAR(15),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guests (User Portal + Reservations)
CREATE TABLE guests (
  guest_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  email TEXT UNIQUE NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  contact_number VARCHAR(15),
  street VARCHAR(100),
  city VARCHAR(50),
  state_province VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Business Data Tables

```sql
-- Rooms
CREATE TABLE rooms (
  room_number VARCHAR(10) PRIMARY KEY,
  room_type VARCHAR(20) NOT NULL,  -- Standard, Deluxe, Suite, Presidential
  capacity INT NOT NULL,
  daily_rate DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'Available'  -- Available, Occupied, Reserved, Maintenance
);

-- Staff (Hotel Employees - NOT portal users)
CREATE TABLE staff (
  staff_id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  role VARCHAR(20) NOT NULL,  -- Manager, Receptionist, Concierge, Housekeeping, Maintenance
  contact_number VARCHAR(15)
);

-- Reservations
CREATE TABLE reservations (
  reservation_id SERIAL PRIMARY KEY,
  guest_id INT REFERENCES guests(guest_id),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_guests INT NOT NULL,
  status VARCHAR(20) DEFAULT 'Reserved'  -- Reserved, Checked-In, Checked-Out, Cancelled
);

-- Junction Tables
CREATE TABLE reservation_room (
  reservation_id INT REFERENCES reservations,
  room_number VARCHAR(10) REFERENCES rooms,
  PRIMARY KEY (reservation_id, room_number)
);

CREATE TABLE reservation_staff (
  reservation_id INT REFERENCES reservations,
  staff_id INT REFERENCES staff,
  PRIMARY KEY (reservation_id, staff_id)
);

-- Payments
CREATE TABLE payments (
  payment_id SERIAL PRIMARY KEY,
  reservation_id INT REFERENCES reservations,
  payment_date DATE NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,  -- Cash, Credit Card, Debit Card, Bank Transfer, E-Wallet
  transaction_id VARCHAR(50)
);
```

### Table Purposes

| Table | Purpose |
|-------|---------|
| `admins` | Admin portal login accounts |
| `front_desk` | Front desk portal login accounts |
| `guests` | Guest portal login accounts + customer data |
| `staff` | Hotel employee records (housekeeping, etc.) - NOT portal users |
| `rooms` | Room inventory and status |
| `reservations` | Booking records |
| `reservation_room` | Links reservations to rooms (many-to-many) |
| `reservation_staff` | Links reservations to staff (many-to-many) |
| `payments` | Payment transactions |

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **State**: React Query + Context API

---

## 📦 Build for Production

```bash
# Build each portal
cd hotel-admin && npm run build
cd hotel-staff && npm run build
cd hotel-user && npm run build

# Output in dist/ folder of each portal
```

---

## 🔧 Troubleshooting

### Blank screen after login
- Check browser console for errors
- Verify `.env` file has correct Supabase credentials
- Clear localStorage and try again

### Can't login
- Verify username/password from test accounts above
- Check if database has seed data (run `setup.sql`)
- Make sure you're using the correct portal for your account type

### Database errors
- Run `drop.sql` then `setup.sql` to reset
- Check Supabase dashboard for table existence

---

## 📝 License

Academic project for DATAMA2 - Database Management 2

---

**Grand Romeo Hotel** - DATAMA2 Finals Project
