# Grand Romeo Hotel Management System
**DATAMA2 - Database Management 2 Finals Project**

A comprehensive multi-portal hotel reservation and management system with role-based access control, formatted IDs, and modern black/red theme.

---

## 📋 Table of Contents
- [Architecture](#-architecture)
- [ID Format System](#-id-format-system)
- [Quick Start](#-quick-start)
- [Database Setup](#-database-setup)
- [Installation](#-installation)
- [Authentication](#-authentication)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)
- [Changelog](#-changelog)

---

## 🏗️ Architecture

This system consists of **3 separate web applications**, each deployed independently:

| Portal | Folder | Default Port | User Role | Purpose |
|--------|--------|--------------|-----------|---------|
| **Admin Portal** | `hotel-admin/` | 5173 | `admin` | Full system management |
| **Front Desk Portal** | `hotel-front-desk/` | 5174 | `front_desk` | Daily operations |
| **Guest Portal** | `hotel-guest/` | 5175 | `guest` | Book rooms, view reservations |

### Why 3 Separate Apps?
- **Security Isolation** - Each portal only contains code for its role
- **Independent Deployment** - Deploy to different URLs/servers
- **Minimal Code Exposure** - Guests can't see admin functionality
- **Role Enforcement** - Wrong credentials = access denied

---

## 🔢 ID Format System

All database records use **formatted string IDs** instead of numeric auto-increment:

| Table | Format | Example | Description |
|-------|--------|---------|-------------|
| **Admins** | `A###` | A001, A002, A003 | Admin portal users |
| **Front Desk** | `FD###` | FD001, FD002 | Front desk portal users |
| **Guests** | `G###` | G001, G002, G003 | Guest portal users |
| **Staff** | `S###` | S001, S002, S003 | Hotel employees |
| **Reservations** | `R###` | R001, R002, R003 | Booking records |
| **Payments** | `P###` | P001, P002, P003 | Payment transactions |

### Benefits
- ✅ **Human-Readable**: "G001" is clearer than "1234"
- ✅ **Self-Documenting**: Prefix indicates the table type
- ✅ **Professional**: Better for URLs, reports, and logs
- ✅ **No Conflicts**: Each table has its own namespace

### Implementation
The system uses PostgreSQL sequences, functions, and triggers to automatically generate formatted IDs:
- **Sequences**: Track the next number (1, 2, 3...)
- **Functions**: Format the ID (G + LPAD(3, '0') = G003)
- **Triggers**: Auto-generate on INSERT if not provided

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

#### Run Database Scripts
1. Go to Supabase Dashboard → SQL Editor
2. Run `database/drop.sql` (if resetting)
3. Run `database/DDL.sql` (creates tables with formatted IDs)
4. Run `database/DML.sql` (loads seed data)
5. Run `database/Policies.sql` (optional, for RLS)

### 2. Configure Environment

Create `.env.local` file in **each** portal folder:

```bash
# hotel-admin/.env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# hotel-front-desk/.env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# hotel-guest/.env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Install Dependencies

```bash
# Terminal 1 - Admin Portal
cd hotel-admin
npm install   # or: bun install

# Terminal 2 - Front Desk Portal
cd hotel-front-desk
npm install   # or: bun install

# Terminal 3 - Guest Portal
cd hotel-guest
npm install   # or: bun install
```

### 4. Start Development Servers

```bash
# Terminal 1 - Admin Portal
cd hotel-admin
npm run dev   # Runs on http://localhost:5173

# Terminal 2 - Front Desk Portal
cd hotel-front-desk
npm run dev   # Runs on http://localhost:5174

# Terminal 3 - Guest Portal
cd hotel-guest
npm run dev   # Runs on http://localhost:5175
```

---

## 🗄️ Database Setup

### Database Tables

#### User Account Tables (for authentication)
- `admins` - Admin portal login accounts (A001, A002...)
- `front_desk` - Front desk portal login accounts (FD001, FD002...)
- `guests` - Guest portal login accounts + customer data (G001, G002...)

#### Business Data Tables
- `rooms` - Room inventory and status (101, 102...)
- `staff` - Hotel employee records (S001, S002...)
- `reservations` - Booking records (R001, R002...)
- `reservation_room` - Links reservations to rooms (many-to-many)
- `reservation_staff` - Links reservations to staff (many-to-many)
- `payments` - Payment transactions (P001, P002...)

### Database Scripts

| File | Purpose | When to Use |
|------|---------|-------------|
| `database/DDL.sql` | Create tables with formatted IDs | New installation |
| `database/DML.sql` | Load seed data | After DDL.sql |
| `database/drop.sql` | Drop all tables | Reset database |
| `database/Policies.sql` | Row Level Security policies | Optional security |
| `database/setup.sql` | Complete setup (DDL + DML) | Quick setup |

### Verification Queries

```sql
-- Check ID formats
SELECT admin_id, username FROM admins LIMIT 5;
-- Expected: A001, A002, A003, A004

SELECT guest_id, username FROM guests LIMIT 5;
-- Expected: G001, G002, G003, G004, G005

SELECT reservation_id, guest_id, status FROM reservations LIMIT 5;
-- Expected: R001 → G001, R002 → G002, etc.

-- Verify sequences
SELECT last_value FROM admins_id_seq;
SELECT last_value FROM guests_id_seq;
SELECT last_value FROM reservations_id_seq;
```

---

## 🔐 Authentication

### How Login Works
This system uses **simple database authentication** (NOT Supabase Auth):

1. User enters **username** + **password**
2. Query the appropriate table (`admins`, `front_desk`, or `guests`)
3. If credentials match, user is logged in
4. Session stored in localStorage

### Password Requirements
All passwords must have:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Login Credentials

#### Admin Portal (http://localhost:5173/login)
| Username | Password | ID | Name |
|----------|----------|-----|------|
| marwin | Marwin2024! | A001 | Marwin John Gonzales |
| romeo | Romeo2024! | A002 | Romeo Albeza Jr. |
| nairb | Nairb2024! | A003 | Nairb Ackilis Varona |
| johncarlo | Johncarlo2024! | A004 | John Carlo Baracena |

#### Front Desk Portal (http://localhost:5174/login)
| Username | Password | ID | Name |
|----------|----------|-----|------|
| patricia | Patricia2024! | FD001 | Patricia Cruz |
| roberto | Roberto2024! | FD002 | Roberto Santos |
| elena | Elena2024! | FD003 | Elena Rivera |
| marco | Marco2024! | FD004 | Marco Lim |

#### Guest Portal (http://localhost:5175/login)
| Username | Password | ID | Name |
|----------|----------|-----|------|
| juan | Juan2024! | G001 | Juan Dela Cruz |
| maria | Maria2024! | G002 | Maria Santos |
| carlos | Carlos2024! | G003 | Carlos Reyes |
| ana | Ana2024! | G004 | Ana Garcia |
| miguel | Miguel2024! | G005 | Miguel Torres |
| sofia | Sofia2024! | G006 | Sofia Ramos |
| diego | Diego2024! | G007 | Diego Cruz |
| isabella | Isabella2024! | G008 | Isabella Mendoza |
| gabriel | Gabriel2024! | G009 | Gabriel Villanueva |
| camila | Camila2024! | G010 | Camila Bautista |

---

## ✨ Features

### Admin Portal
- ✅ Full system management and oversight
- ✅ Manage all users (guests, front desk, admins)
- ✅ View financial reports and revenue
- ✅ Add/Edit/Delete rooms
- ✅ Manage staff members
- ✅ Register walk-in customers
- ✅ Complete reservation management
- ✅ Process payments and refunds

### Front Desk Portal
- ✅ View and manage guest information
- ✅ Create and manage reservations
- ✅ Register walk-in customers
- ✅ Check-in/Check-out guests
- ✅ Process payments
- ✅ View room availability
- ✅ Daily operations dashboard

### Guest Portal
- ✅ Browse available rooms
- ✅ Make reservations
- ✅ View booking history
- ✅ Update profile information
- ✅ View reservation details
- ✅ Cancel reservations
- ✅ Modern black/red theme UI

### Database Features
- ✅ Formatted string IDs (G001, R001, etc.)
- ✅ Password strength validation
- ✅ Email format validation
- ✅ Referential integrity (foreign keys)
- ✅ Automatic ID generation
- ✅ Row Level Security support
- ✅ Transaction safety

### Recent Enhancements
- ✅ **Formatted IDs**: Professional G001, A001, FD001 format
- ✅ **Theme Update**: Modern black/red color scheme
- ✅ **Text Visibility**: Fixed white text on dark backgrounds
- ✅ **Walk-In Support**: Register customers without pre-booking
- ✅ **Enhanced Statuses**: Pending Payment, Confirmed, Refunded, etc.
- ✅ **TypeScript Types**: Full type safety with string IDs

---

## 📁 Project Structure

```
Grand-Romeo-Hotel/
├── database/
│   ├── DDL.sql                    # Create tables (with formatted IDs)
│   ├── DML.sql                    # Seed data (formatted IDs)
│   ├── drop.sql                   # Drop all tables
│   ├── setup.sql                  # Complete setup
│   ├── Policies.sql               # Row Level Security
│   └── POLICIES.md                # RLS documentation
│
├── hotel-admin/                   # Admin Portal (Port 5173)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/            # Sidebar, header, etc.
│   │   │   ├── dashboard/         # Dashboard widgets
│   │   │   ├── ui/                # shadcn/ui components
│   │   │   └── WalkInGuestDialog.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── lib/
│   │   │   ├── supabase.ts        # Supabase client
│   │   │   ├── database.ts        # Database services
│   │   │   └── utils.ts
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Guests.tsx
│   │   │   ├── Rooms.tsx
│   │   │   ├── Reservations.tsx
│   │   │   ├── Payments.tsx
│   │   │   ├── Staff.tsx
│   │   │   ├── Accounts.tsx
│   │   │   └── Login.tsx
│   │   ├── types/
│   │   │   └── hotel.ts           # TypeScript interfaces
│   │   ├── index.css              # Black/red theme
│   │   └── App.tsx
│   ├── .env.local                 # Supabase credentials
│   ├── package.json
│   └── vite.config.ts
│
├── hotel-front-desk/              # Front Desk Portal (Port 5174)
│   └── [Similar structure to admin]
│
├── hotel-guest/                   # Guest Portal (Port 5175)
│   └── [Similar structure to admin]
│
├── test_accounts.md               # Test credentials
└── README.md                      # This file
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Context API
- **Data Fetching**: Supabase client

### Backend
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Database-level (username/password)
- **ORM**: Supabase JS Client
- **Security**: Row Level Security (optional)

### Database Features
- **ID Generation**: PostgreSQL Sequences + Functions + Triggers
- **Constraints**: CHECK constraints for validation
- **Relationships**: Foreign keys with CASCADE
- **Indexes**: Automatic on primary keys

---

## 🧪 Testing

### Database Testing
```sql
-- Test ID generation
INSERT INTO guests (username, password, email, first_name, last_name, contact_number)
VALUES ('testuser', 'Test123!', 'test@email.com', 'Test', 'User', '09999999999');
-- Check that guest_id is auto-generated as G011

-- Verify foreign keys
SELECT 
  r.reservation_id,
  r.guest_id,
  g.first_name || ' ' || g.last_name as guest_name
FROM reservations r
JOIN guests g ON r.guest_id = g.guest_id
LIMIT 5;
```

### Application Testing Checklist

#### Admin Portal
- [ ] Login with admin credentials
- [ ] View dashboard with statistics
- [ ] Add new guest
- [ ] Edit room details
- [ ] Create reservation
- [ ] Process payment
- [ ] View all tables

#### Front Desk Portal
- [ ] Login with front desk credentials
- [ ] Register walk-in guest
- [ ] Create reservation
- [ ] Check-in guest
- [ ] View room status
- [ ] Process payment

#### Guest Portal
- [ ] Login with guest credentials
- [ ] Browse available rooms
- [ ] Create reservation
- [ ] View reservation history
- [ ] Update profile
- [ ] Cancel reservation

---

## 🔧 Troubleshooting

### Common Issues

#### "Module not found" error
```bash
rm -rf node_modules
rm bun.lockb  # or package-lock.json
npm install   # or: bun install
```

#### Database connection error
1. Check `.env.local` has correct Supabase URL and key
2. Verify Supabase project is active
3. Test connection in Supabase dashboard

#### Blank screen after login
1. Check browser console for errors
2. Verify database has seed data
3. Clear localStorage and try again
4. Check if you're using correct portal for account type

#### "Foreign key constraint violation"
- Ensure parent records exist before creating children
- Check ID formats match (all should be strings now)
- Verify foreign key relationships in database

#### TypeScript type errors
```bash
# Clear cache and rebuild
rm -rf dist
rm -rf .vite
npm run dev
```

#### Port already in use
```typescript
// Edit vite.config.ts
export default defineConfig({
  server: {
    port: 5176  // Change to different port
  }
})
```

#### White text not visible
- This should be fixed in the latest version
- Check that `index.css` has proper CSS variables
- Verify using `text-sidebar-foreground` classes

### Database Verification

```sql
-- Check ID formats
SELECT 'admins' as table_name, admin_id FROM admins LIMIT 1
UNION ALL SELECT 'guests', guest_id FROM guests LIMIT 1
UNION ALL SELECT 'reservations', reservation_id FROM reservations LIMIT 1;

-- Check row counts
SELECT 'admins' AS table_name, COUNT(*) AS row_count FROM admins
UNION ALL SELECT 'front_desk', COUNT(*) FROM front_desk
UNION ALL SELECT 'guests', COUNT(*) FROM guests
UNION ALL SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL SELECT 'staff', COUNT(*) FROM staff
UNION ALL SELECT 'reservations', COUNT(*) FROM reservations
UNION ALL SELECT 'payments', COUNT(*) FROM payments;

-- Check sequences
SELECT 'admins_id_seq' as sequence_name, last_value FROM admins_id_seq
UNION ALL SELECT 'guests_id_seq', last_value FROM guests_id_seq
UNION ALL SELECT 'reservations_id_seq', last_value FROM reservations_id_seq;
```

---

## 🚢 Deployment

### Deploy to Vercel

Each portal can be deployed separately:

1. **Push code to GitHub**
2. **Go to [Vercel Dashboard](https://vercel.com/)**
3. **Import each folder as separate project:**
   - `hotel-admin` → grand-romeo-admin.vercel.app
   - `hotel-front-desk` → grand-romeo-frontdesk.vercel.app
   - `hotel-guest` → grand-romeo-guest.vercel.app

4. **Add environment variables in Vercel:**
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Deploy!**

### Build for Production

```bash
# Build each portal
cd hotel-admin && npm run build
cd hotel-front-desk && npm run build
cd hotel-guest && npm run build

# Output in dist/ folder of each portal
```

---

## 📝 Changelog

### v2.1.0 (2026-02-24) - Current Version
- ✨ **Formatted IDs**: Implemented G001, A001, FD001, etc. format
- ✨ **SQL Updates**: Updated DDL.sql and DML.sql with formatted IDs
- ✨ **Type Safety**: All TypeScript types use string IDs
- ✨ **Documentation**: Consolidated all docs into single README
- 🔧 **Text Visibility**: Fixed white text on dark backgrounds
- 🗑️ **Cleanup**: Removed temporary migration files

### v2.0.0 (2026-02-24)
- ✨ **Black/Red Theme**: Redesigned color scheme
- ✨ **Walk-In Customers**: Register guests without pre-booking
- ✨ **Enhanced Statuses**: Added Pending Payment, Confirmed, Refunded
- ✨ **Database Updates**: Room images, audit trails, loyalty system
- 🎨 **UI Improvements**: Updated all components with new theme
- 🐛 **Bug Fixes**: Various fixes and improvements

### v1.0.0 (Initial Release)
- 🎉 **Three-Portal Architecture**: Admin, Front Desk, Guest
- 🔐 **Database Authentication**: Username/password login
- 🏨 **Core Features**: Rooms, reservations, payments
- 📊 **Dashboard**: Statistics and overview
- 🗄️ **PostgreSQL**: Full relational database

---

## 👥 Team

**DATAMA2 Finals Project Team:**
- **Marwin John Gonzales** (A001)
- **Romeo Albeza Jr.** (A002)
- **Nairb Ackilis Varona** (A003)
- **John Carlo Baracena** (A004)

---

## 📞 Support

For issues or questions:
1. Check this README thoroughly
2. Review [test_accounts.md](test_accounts.md) for login credentials
3. Review [database/POLICIES.md](database/POLICIES.md) for RLS documentation
4. Check Supabase dashboard logs
5. Verify database setup with verification queries above

---

## 📄 License

Academic project for DATAMA2 - Database Management 2

---

## 🎯 Next Steps

After setup, consider implementing:
- [ ] Email notifications for bookings
- [ ] PDF receipt generation
- [ ] Advanced search and filters
- [ ] Guest loyalty program
- [ ] Mobile responsive improvements
- [ ] Real-time room availability
- [ ] Payment gateway integration
- [ ] Analytics and reports

---

**Grand Romeo Hotel Management System** - Built with ❤️ for DATAMA2

Last Updated: February 24, 2026
