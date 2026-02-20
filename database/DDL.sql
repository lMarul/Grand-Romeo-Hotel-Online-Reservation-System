-- ============================================================
-- HOTEL RESERVATION SYSTEM - DDL (Data Definition Language)
-- Grand Romeo Hotel - DATAMA2 Finals (Database Management)
-- ============================================================
-- This file contains all CREATE TABLE statements
-- Run this in your Supabase SQL Editor to set up the database schema
-- 
-- All authentication is handled via database tables with
-- username and password fields. No external auth dependencies.
-- ============================================================


-- =====================================================
-- PART 1: USER ACCOUNT TABLES
-- =====================================================

-- ADMINS TABLE (System Administrators)
CREATE TABLE IF NOT EXISTS admins (
    admin_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL CHECK (
        LENGTH(password) >= 6 AND
        password ~ '[A-Z]' AND
        password ~ '[a-z]' AND
        password ~ '[0-9]' AND
        password ~ '[!@#$%^&*(),.?":{}|<>]'
    ),
    email TEXT NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    first_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(first_name)) >= 2),
    last_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(last_name)) >= 2),
    contact_number VARCHAR(15) CHECK (contact_number ~* '^[0-9+\-() ]+$'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FRONT_DESK TABLE (Front Desk Portal Users)
CREATE TABLE IF NOT EXISTS front_desk (
    front_desk_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL CHECK (
        LENGTH(password) >= 6 AND
        password ~ '[A-Z]' AND
        password ~ '[a-z]' AND
        password ~ '[0-9]' AND
        password ~ '[!@#$%^&*(),.?":{}|<>]'
    ),
    email TEXT NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    first_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(first_name)) >= 2),
    last_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(last_name)) >= 2),
    contact_number VARCHAR(15) CHECK (contact_number ~* '^[0-9+\-() ]+$'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GUESTS TABLE (Guest Portal Users & Customer Records)
CREATE TABLE IF NOT EXISTS guests (
    guest_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL CHECK (
        LENGTH(password) >= 6 AND
        password ~ '[A-Z]' AND
        password ~ '[a-z]' AND
        password ~ '[0-9]' AND
        password ~ '[!@#$%^&*(),.?":{}|<>]'
    ),
    email TEXT NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    first_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(first_name)) >= 2),
    last_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(last_name)) >= 2),
    contact_number VARCHAR(15) CHECK (contact_number ~* '^[0-9+\-() ]+$'),
    street VARCHAR(100),
    city VARCHAR(50),
    state_province VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- PART 2: BUSINESS DATA TABLES
-- =====================================================

-- ROOMS TABLE
CREATE TABLE IF NOT EXISTS rooms (
    room_number VARCHAR(10) PRIMARY KEY CHECK (LENGTH(TRIM(room_number)) > 0),
    room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('Standard', 'Deluxe', 'Suite', 'Presidential')),
    bed_type VARCHAR(20) NOT NULL DEFAULT 'Twin' CHECK (bed_type IN ('Single', 'Twin', 'Double', 'Queen', 'King')),
    capacity INT NOT NULL DEFAULT 1 CHECK (capacity >= 1 AND capacity <= 10),
    daily_rate DECIMAL(10,2) NOT NULL CHECK (daily_rate > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Occupied', 'Reserved', 'Maintenance'))
);

-- STAFF TABLE (Hotel employees - housekeeping, maintenance, etc.)
CREATE TABLE IF NOT EXISTS staff (
    staff_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(first_name)) >= 2),
    last_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(last_name)) >= 2),
    role VARCHAR(20) NOT NULL CHECK (role IN ('Manager', 'Receptionist', 'Concierge', 'Housekeeping', 'Maintenance')),
    contact_number VARCHAR(15) CHECK (contact_number ~* '^[0-9+\-() ]+$')
);

-- RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS reservations (
    reservation_id SERIAL PRIMARY KEY,
    guest_id INT NOT NULL REFERENCES guests(guest_id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL CHECK (check_out_date > check_in_date),
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    total_guests INT NOT NULL DEFAULT 1 CHECK (total_guests >= 1 AND total_guests <= 20),
    special_requests TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Reserved' CHECK (status IN ('Reserved', 'Checked-In', 'Checked-Out', 'Cancelled', 'No-Show')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RESERVATION_ROOM TABLE (Junction - many-to-many)
CREATE TABLE IF NOT EXISTS reservation_room (
    reservation_id INT REFERENCES reservations(reservation_id) ON DELETE CASCADE,
    room_number VARCHAR(10) REFERENCES rooms(room_number) ON DELETE CASCADE,
    PRIMARY KEY (reservation_id, room_number)
);

-- RESERVATION_STAFF TABLE (Junction - many-to-many)
CREATE TABLE IF NOT EXISTS reservation_staff (
    reservation_id INT REFERENCES reservations(reservation_id) ON DELETE CASCADE,
    staff_id INT REFERENCES staff(staff_id) ON DELETE CASCADE,
    PRIMARY KEY (reservation_id, staff_id)
);

-- PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    payment_id SERIAL PRIMARY KEY,
    reservation_id INT NOT NULL REFERENCES reservations(reservation_id) ON DELETE CASCADE,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_paid DECIMAL(10,2) NOT NULL CHECK (amount_paid > 0),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'E-Wallet')),
    transaction_id VARCHAR(50)
);


-- ============================================================
-- END OF DDL
-- ============================================================


-- =====================================================
-- PART 3: DISABLE ROW LEVEL SECURITY
-- =====================================================
-- Supabase enables RLS by default on all tables.
-- Since this project uses application-level authentication
-- (username/password in tables), we disable RLS to allow
-- the anon key to perform CRUD operations.
-- =====================================================

ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE front_desk DISABLE ROW LEVEL SECURITY;
ALTER TABLE guests DISABLE ROW LEVEL SECURITY;
ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_room DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;


-- ============================================================
-- Next step: Run DML.sql for seed data
-- ============================================================
