-- ============================================================
-- HOTEL RESERVATION SYSTEM - DDL (Data Definition Language)
-- Grand Romeo Hotel - DATAMA2 Finals (Database Management)
-- ============================================================
-- This file contains all CREATE TABLE statements with FORMATTED IDs
-- Run this in your Supabase SQL Editor to set up the database schema
-- 
-- ID FORMAT:
--   Admins:       A001, A002, A003, ...
--   Front Desk:   FD001, FD002, FD003, ...
--   Guests:       G001, G002, G003, ...
--   Staff:        S001, S002, S003, ...
--   Reservations: R001, R002, R003, ...
--   Payments:     P001, P002, P003, ...
-- ============================================================


-- =====================================================
-- PART 1: CREATE SEQUENCES FOR ID GENERATION
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS admins_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS front_desk_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS guests_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS staff_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS reservations_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS payments_id_seq START 1;


-- =====================================================
-- PART 2: CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to generate formatted admin IDs
CREATE OR REPLACE FUNCTION generate_admin_id()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
BEGIN
    next_id := nextval('admins_id_seq');
    RETURN 'A' || LPAD(next_id::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate formatted front desk IDs
CREATE OR REPLACE FUNCTION generate_front_desk_id()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
BEGIN
    next_id := nextval('front_desk_id_seq');
    RETURN 'FD' || LPAD(next_id::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate formatted guest IDs
CREATE OR REPLACE FUNCTION generate_guest_id()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
BEGIN
    next_id := nextval('guests_id_seq');
    RETURN 'G' || LPAD(next_id::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate formatted staff IDs
CREATE OR REPLACE FUNCTION generate_staff_id()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
BEGIN
    next_id := nextval('staff_id_seq');
    RETURN 'S' || LPAD(next_id::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate formatted reservation IDs
CREATE OR REPLACE FUNCTION generate_reservation_id()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
BEGIN
    next_id := nextval('reservations_id_seq');
    RETURN 'R' || LPAD(next_id::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate formatted payment IDs
CREATE OR REPLACE FUNCTION generate_payment_id()
RETURNS TEXT AS $$
DECLARE
    next_id INTEGER;
BEGIN
    next_id := nextval('payments_id_seq');
    RETURN 'P' || LPAD(next_id::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- PART 3: USER ACCOUNT TABLES
-- =====================================================

-- ADMINS TABLE (System Administrators)
CREATE TABLE IF NOT EXISTS admins (
    admin_id VARCHAR(10) PRIMARY KEY DEFAULT generate_admin_id(),
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL CHECK (
        LENGTH(password) >= 8 AND
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
    front_desk_id VARCHAR(10) PRIMARY KEY DEFAULT generate_front_desk_id(),
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL CHECK (
        LENGTH(password) >= 8 AND
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
    guest_id VARCHAR(10) PRIMARY KEY DEFAULT generate_guest_id(),
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL CHECK (
        LENGTH(password) >= 8 AND
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
-- PART 4: BUSINESS DATA TABLES
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
    staff_id VARCHAR(10) PRIMARY KEY DEFAULT generate_staff_id(),
    first_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(first_name)) >= 2),
    last_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(last_name)) >= 2),
    role VARCHAR(20) NOT NULL CHECK (role IN ('Manager', 'Receptionist', 'Concierge', 'Housekeeping', 'Maintenance', 'Front Desk')),
    contact_number VARCHAR(15) CHECK (contact_number ~* '^[0-9+\-() ]+$')
);

-- RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS reservations (
    reservation_id VARCHAR(10) PRIMARY KEY DEFAULT generate_reservation_id(),
    guest_id VARCHAR(10) NOT NULL REFERENCES guests(guest_id) ON DELETE CASCADE,
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
    reservation_id VARCHAR(10) REFERENCES reservations(reservation_id) ON DELETE CASCADE,
    room_number VARCHAR(10) REFERENCES rooms(room_number) ON DELETE CASCADE,
    PRIMARY KEY (reservation_id, room_number)
);

-- RESERVATION_STAFF TABLE (Junction - many-to-many)
CREATE TABLE IF NOT EXISTS reservation_staff (
    reservation_id VARCHAR(10) REFERENCES reservations(reservation_id) ON DELETE CASCADE,
    staff_id VARCHAR(10) REFERENCES staff(staff_id) ON DELETE CASCADE,
    PRIMARY KEY (reservation_id, staff_id)
);

-- PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    payment_id VARCHAR(10) PRIMARY KEY DEFAULT generate_payment_id(),
    reservation_id VARCHAR(10) NOT NULL REFERENCES reservations(reservation_id) ON DELETE CASCADE,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_paid DECIMAL(10,2) NOT NULL CHECK (amount_paid > 0),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'E-Wallet')),
    transaction_id VARCHAR(50)
);


-- =====================================================
-- PART 5: CREATE TRIGGERS FOR AUTO-ID GENERATION
-- =====================================================

-- Trigger for admins
CREATE OR REPLACE FUNCTION set_admin_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.admin_id IS NULL THEN
        NEW.admin_id := generate_admin_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admins_id_trigger ON admins;
CREATE TRIGGER admins_id_trigger
BEFORE INSERT ON admins
FOR EACH ROW
EXECUTE FUNCTION set_admin_id();

-- Trigger for front_desk
CREATE OR REPLACE FUNCTION set_front_desk_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.front_desk_id IS NULL THEN
        NEW.front_desk_id := generate_front_desk_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS front_desk_id_trigger ON front_desk;
CREATE TRIGGER front_desk_id_trigger
BEFORE INSERT ON front_desk
FOR EACH ROW
EXECUTE FUNCTION set_front_desk_id();

-- Trigger for guests
CREATE OR REPLACE FUNCTION set_guest_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.guest_id IS NULL THEN
        NEW.guest_id := generate_guest_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS guests_id_trigger ON guests;
CREATE TRIGGER guests_id_trigger
BEFORE INSERT ON guests
FOR EACH ROW
EXECUTE FUNCTION set_guest_id();

-- Trigger for staff
CREATE OR REPLACE FUNCTION set_staff_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.staff_id IS NULL THEN
        NEW.staff_id := generate_staff_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS staff_id_trigger ON staff;
CREATE TRIGGER staff_id_trigger
BEFORE INSERT ON staff
FOR EACH ROW
EXECUTE FUNCTION set_staff_id();

-- Trigger for reservations
CREATE OR REPLACE FUNCTION set_reservation_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reservation_id IS NULL THEN
        NEW.reservation_id := generate_reservation_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reservations_id_trigger ON reservations;
CREATE TRIGGER reservations_id_trigger
BEFORE INSERT ON reservations
FOR EACH ROW
EXECUTE FUNCTION set_reservation_id();

-- Trigger for payments
CREATE OR REPLACE FUNCTION set_payment_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_id IS NULL THEN
        NEW.payment_id := generate_payment_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payments_id_trigger ON payments;
CREATE TRIGGER payments_id_trigger
BEFORE INSERT ON payments
FOR EACH ROW
EXECUTE FUNCTION set_payment_id();


-- ============================================================
-- END OF DDL
-- ============================================================
