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
    role VARCHAR(20) NOT NULL CHECK (role IN ('Manager', 'Receptionist', 'Concierge', 'Housekeeping', 'Maintenance', 'Front Desk')),
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
    status VARCHAR(20) NOT NULL DEFAULT 'Reserved' CHECK (status IN ('Pending Payment', 'Confirmed', 'Reserved', 'Checked-In', 'Checked-Out', 'Cancelled', 'No-Show', 'Refunded')),
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
-- PART 2: UPDATE EXISTING PASSWORDS (MIGRATION)
-- =====================================================
-- Update any existing passwords that don't meet the new
-- password requirements. This ensures data compatibility
-- before adding password constraints.
-- =====================================================

UPDATE admins 
SET password = 'TempPass123!'
WHERE NOT (
    LENGTH(password) >= 6 AND
    password ~ '[A-Z]' AND
    password ~ '[a-z]' AND
    password ~ '[0-9]' AND
    password ~ '[!@#$%^&*(),.?":{}|<>]'
);

UPDATE front_desk 
SET password = 'TempPass123!'
WHERE NOT (
    LENGTH(password) >= 6 AND
    password ~ '[A-Z]' AND
    password ~ '[a-z]' AND
    password ~ '[0-9]' AND
    password ~ '[!@#$%^&*(),.?":{}|<>]'
);

UPDATE guests 
SET password = 'TempPass123!'
WHERE NOT (
    LENGTH(password) >= 6 AND
    password ~ '[A-Z]' AND
    password ~ '[a-z]' AND
    password ~ '[0-9]' AND
    password ~ '[!@#$%^&*(),.?":{}|<>]'
);


-- =====================================================
-- PART 3: ADD PASSWORD CONSTRAINTS
-- =====================================================
-- Add CHECK constraints to enforce password strength
-- requirements at the database level.
-- =====================================================

ALTER TABLE admins 
DROP CONSTRAINT IF EXISTS admins_password_check;

ALTER TABLE admins 
ADD CONSTRAINT admins_password_check CHECK (
    LENGTH(password) >= 6 AND
    password ~ '[A-Z]' AND
    password ~ '[a-z]' AND
    password ~ '[0-9]' AND
    password ~ '[!@#$%^&*(),.?":{}|<>]'
);

ALTER TABLE front_desk 
DROP CONSTRAINT IF EXISTS front_desk_password_check;

ALTER TABLE front_desk 
ADD CONSTRAINT front_desk_password_check CHECK (
    LENGTH(password) >= 6 AND
    password ~ '[A-Z]' AND
    password ~ '[a-z]' AND
    password ~ '[0-9]' AND
    password ~ '[!@#$%^&*(),.?":{}|<>]'
);

ALTER TABLE guests 
DROP CONSTRAINT IF EXISTS guests_password_check;

ALTER TABLE guests 
ADD CONSTRAINT guests_password_check CHECK (
    LENGTH(password) >= 6 AND
    password ~ '[A-Z]' AND
    password ~ '[a-z]' AND
    password ~ '[0-9]' AND
    password ~ '[!@#$%^&*(),.?":{}|<>]'
);


-- =====================================================
-- PART 4: ROW LEVEL SECURITY POLICIES
-- =====================================================
-- Enable RLS and create policies for data access control.
-- These policies allow anon key access for application-level
-- authentication while providing a framework for future
-- enhancement with Supabase Auth or custom JWT claims.
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE front_desk ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_room ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservation_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ==================
-- ADMINS TABLE POLICIES
-- ==================
CREATE POLICY "Allow all operations on admins for anon" 
ON admins FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on admins for authenticated" 
ON admins FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==================
-- FRONT_DESK TABLE POLICIES
-- ==================
CREATE POLICY "Allow all operations on front_desk for anon" 
ON front_desk FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on front_desk for authenticated" 
ON front_desk FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==================
-- GUESTS TABLE POLICIES
-- ==================
CREATE POLICY "Allow all operations on guests for anon" 
ON guests FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on guests for authenticated" 
ON guests FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==================
-- ROOMS TABLE POLICIES
-- ==================
CREATE POLICY "Allow read access on rooms for anon" 
ON rooms FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow all operations on rooms for anon" 
ON rooms FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on rooms for authenticated" 
ON rooms FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==================
-- STAFF TABLE POLICIES
-- ==================
CREATE POLICY "Allow read access on staff for anon" 
ON staff FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow all operations on staff for anon" 
ON staff FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on staff for authenticated" 
ON staff FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==================
-- RESERVATIONS TABLE POLICIES
-- ==================
CREATE POLICY "Allow all operations on reservations for anon" 
ON reservations FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on reservations for authenticated" 
ON reservations FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==================
-- RESERVATION_ROOM TABLE POLICIES
-- ==================
CREATE POLICY "Allow all operations on reservation_room for anon" 
ON reservation_room FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on reservation_room for authenticated" 
ON reservation_room FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==================
-- RESERVATION_STAFF TABLE POLICIES
-- ==================
CREATE POLICY "Allow all operations on reservation_staff for anon" 
ON reservation_staff FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on reservation_staff for authenticated" 
ON reservation_staff FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- ==================
-- PAYMENTS TABLE POLICIES
-- ==================
CREATE POLICY "Allow all operations on payments for anon" 
ON payments FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow all operations on payments for authenticated" 
ON payments FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);


-- ============================================================
-- Next step: Run DML.sql for seed data
-- ============================================================
