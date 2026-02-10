-- ============================================================
-- HOTEL RESERVATION SYSTEM - COMPLETE SETUP
-- Grand Romeo Hotel - DATAMA2 Finals (Database Management)
-- ============================================================
-- All authentication is handled via database tables with
-- username and password fields. No external auth dependencies.
-- ============================================================


-- =====================================================
-- PART 1: USER ACCOUNT TABLES
-- =====================================================

-- ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
    admin_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email TEXT NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    first_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(first_name)) >= 2),
    last_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(last_name)) >= 2),
    contact_number VARCHAR(15) CHECK (contact_number ~* '^[0-9+\-() ]+$'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- FRONT_DESK TABLE
CREATE TABLE IF NOT EXISTS front_desk (
    front_desk_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email TEXT NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    first_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(first_name)) >= 2),
    last_name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(last_name)) >= 2),
    contact_number VARCHAR(15) CHECK (contact_number ~* '^[0-9+\-() ]+$'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GUESTS TABLE
CREATE TABLE IF NOT EXISTS guests (
    guest_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
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
    status VARCHAR(20) NOT NULL DEFAULT 'Reserved' CHECK (status IN ('Reserved', 'Checked-In', 'Checked-Out', 'Cancelled')),
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


-- =====================================================
-- PART 3: SEED DATA - USER ACCOUNTS
-- =====================================================

-- ADMINS (4 team members)
INSERT INTO admins (admin_id, username, password, email, first_name, last_name, contact_number) VALUES
    (1, 'marwin', 'Admin123', 'marwin.gonzales@grandromeo.com', 'Marwin John', 'Gonzales', '+639171234567'),
    (2, 'romeo', 'Admin123', 'romeo.albeza@grandromeo.com', 'Romeo', 'Albeza Jr.', '+639171234568'),
    (3, 'nairb', 'Admin123', 'nairb.varona@grandromeo.com', 'Nairb Ackilis', 'Varona', '+639171234569'),
    (4, 'johncarlo', 'Admin123', 'johncarlo.baracena@grandromeo.com', 'John Carlo', 'Baracena', '+639171234570')
ON CONFLICT (admin_id) DO NOTHING;

SELECT setval('admins_admin_id_seq', 4, true);

-- FRONT DESK (4 accounts)
INSERT INTO front_desk (front_desk_id, username, password, email, first_name, last_name, contact_number) VALUES
    (1, 'patricia', 'FrontDesk123', 'patricia.cruz@grandromeo.com', 'Patricia', 'Cruz', '+639181234571'),
    (2, 'roberto', 'FrontDesk123', 'roberto.santos@grandromeo.com', 'Roberto', 'Santos', '+639181234572'),
    (3, 'elena', 'FrontDesk123', 'elena.rivera@grandromeo.com', 'Elena', 'Rivera', '+639181234573'),
    (4, 'marco', 'FrontDesk123', 'marco.lim@grandromeo.com', 'Marco', 'Lim', '+639181234574')
ON CONFLICT (front_desk_id) DO NOTHING;

SELECT setval('front_desk_front_desk_id_seq', 4, true);

-- GUESTS (10 accounts)
INSERT INTO guests (guest_id, username, password, email, first_name, last_name, contact_number, street, city, state_province, zip_code, country) VALUES
    (1, 'juan', 'Guest123', 'juan.delacruz@email.com', 'Juan', 'Dela Cruz', '09123456789', '123 Manila Street', 'Manila', 'Metro Manila', '1000', 'Philippines'),
    (2, 'maria', 'Guest123', 'maria.santos@email.com', 'Maria', 'Santos', '09234567890', '456 Makati Avenue', 'Makati', 'Metro Manila', '1200', 'Philippines'),
    (3, 'carlos', 'Guest123', 'carlos.reyes@email.com', 'Carlos', 'Reyes', '09345678901', '789 Quezon City Road', 'Quezon City', 'Metro Manila', '1100', 'Philippines'),
    (4, 'ana', 'Guest123', 'ana.garcia@email.com', 'Ana', 'Garcia', '09456789012', '321 Pasig Boulevard', 'Pasig', 'Metro Manila', '1600', 'Philippines'),
    (5, 'miguel', 'Guest123', 'miguel.torres@email.com', 'Miguel', 'Torres', '09567890123', '654 Taguig Street', 'Taguig', 'Metro Manila', '1630', 'Philippines'),
    (6, 'sofia', 'Guest123', 'sofia.ramos@email.com', 'Sofia', 'Ramos', '09678901234', '987 Paranaque Lane', 'Paranaque', 'Metro Manila', '1700', 'Philippines'),
    (7, 'diego', 'Guest123', 'diego.cruz@email.com', 'Diego', 'Cruz', '09789012345', '147 Las Pinas Road', 'Las Pinas', 'Metro Manila', '1740', 'Philippines'),
    (8, 'isabella', 'Guest123', 'isabella.mendoza@email.com', 'Isabella', 'Mendoza', '09890123456', '258 Muntinlupa Drive', 'Muntinlupa', 'Metro Manila', '1770', 'Philippines'),
    (9, 'gabriel', 'Guest123', 'gabriel.villanueva@email.com', 'Gabriel', 'Villanueva', '09901234567', '369 Marikina Heights', 'Marikina', 'Metro Manila', '1800', 'Philippines'),
    (10, 'camila', 'Guest123', 'camila.bautista@email.com', 'Camila', 'Bautista', '09012345678', '741 Caloocan Avenue', 'Caloocan', 'Metro Manila', '1400', 'Philippines')
ON CONFLICT (guest_id) DO NOTHING;

SELECT setval('guests_guest_id_seq', 10, true);


-- =====================================================
-- PART 4: SEED DATA - BUSINESS DATA
-- =====================================================

-- ROOMS (15 rooms)
INSERT INTO rooms (room_number, room_type, capacity, daily_rate, status) VALUES
    ('101', 'Standard', 2, 2500.00, 'Available'),
    ('102', 'Standard', 2, 2500.00, 'Reserved'),
    ('103', 'Standard', 2, 2500.00, 'Available'),
    ('104', 'Standard', 2, 2500.00, 'Available'),
    ('105', 'Standard', 2, 2500.00, 'Available'),
    ('201', 'Deluxe', 3, 4500.00, 'Available'),
    ('202', 'Deluxe', 3, 4500.00, 'Available'),
    ('203', 'Deluxe', 3, 4500.00, 'Reserved'),
    ('204', 'Deluxe', 3, 4500.00, 'Available'),
    ('205', 'Deluxe', 3, 4500.00, 'Available'),
    ('301', 'Suite', 4, 8000.00, 'Occupied'),
    ('302', 'Suite', 4, 8000.00, 'Available'),
    ('303', 'Suite', 4, 8000.00, 'Available'),
    ('401', 'Presidential', 6, 15000.00, 'Reserved'),
    ('402', 'Presidential', 6, 15000.00, 'Reserved')
ON CONFLICT (room_number) DO NOTHING;

-- STAFF (Hotel employees - not portal users)
INSERT INTO staff (staff_id, first_name, last_name, role, contact_number) VALUES
    (1, 'Roberto', 'Mendoza', 'Manager', '09111222333'),
    (2, 'Patricia', 'Villanueva', 'Receptionist', '09222333444'),
    (3, 'Eduardo', 'Cruz', 'Concierge', '09333444555'),
    (4, 'Linda', 'Ramos', 'Housekeeping', '09444555666'),
    (5, 'Antonio', 'Bautista', 'Maintenance', '09555666777'),
    (6, 'Carmen', 'Garcia', 'Housekeeping', '09666777888'),
    (7, 'Jose', 'Reyes', 'Concierge', '09777888999')
ON CONFLICT (staff_id) DO NOTHING;

SELECT setval('staff_staff_id_seq', 7, true);

-- RESERVATIONS
INSERT INTO reservations (reservation_id, guest_id, check_in_date, check_out_date, total_guests, status) VALUES
    (1, 1, '2026-02-15', '2026-02-17', 2, 'Reserved'),
    (2, 2, '2026-02-16', '2026-02-20', 3, 'Reserved'),
    (3, 3, '2026-02-10', '2026-02-12', 4, 'Checked-In'),
    (4, 4, '2026-02-01', '2026-02-05', 2, 'Checked-Out'),
    (5, 5, '2026-02-12', '2026-02-18', 6, 'Reserved'),
    (6, 6, '2026-02-20', '2026-02-22', 2, 'Reserved'),
    (7, 7, '2026-02-25', '2026-02-28', 3, 'Reserved')
ON CONFLICT (reservation_id) DO NOTHING;

SELECT setval('reservations_reservation_id_seq', 7, true);

-- RESERVATION_ROOM (Which rooms are booked for each reservation)
INSERT INTO reservation_room (reservation_id, room_number) VALUES
    (1, '102'),
    (2, '203'),
    (3, '301'),
    (4, '201'),
    (5, '401'),
    (5, '402'),
    (6, '103'),
    (7, '204')
ON CONFLICT DO NOTHING;

-- RESERVATION_STAFF (Which staff are assigned to each reservation)
INSERT INTO reservation_staff (reservation_id, staff_id) VALUES
    (1, 2),
    (2, 2),
    (3, 3),
    (4, 2),
    (5, 3),
    (5, 4),
    (6, 2),
    (7, 3)
ON CONFLICT DO NOTHING;

-- PAYMENTS
INSERT INTO payments (payment_id, reservation_id, payment_date, amount_paid, payment_method, transaction_id) VALUES
    (1, 3, '2026-02-10', 16000.00, 'Credit Card', 'TXN001'),
    (2, 4, '2026-02-01', 9000.00, 'Cash', 'TXN002'),
    (3, 4, '2026-02-03', 9000.00, 'Cash', 'TXN003'),
    (4, 5, '2026-02-12', 90000.00, 'Bank Transfer', 'TXN004')
ON CONFLICT (payment_id) DO NOTHING;

SELECT setval('payments_payment_id_seq', 4, true);


-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

SELECT 'admins' AS table_name, COUNT(*) AS row_count FROM admins
UNION ALL SELECT 'front_desk', COUNT(*) FROM front_desk
UNION ALL SELECT 'guests', COUNT(*) FROM guests
UNION ALL SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL SELECT 'staff', COUNT(*) FROM staff
UNION ALL SELECT 'reservations', COUNT(*) FROM reservations
UNION ALL SELECT 'payments', COUNT(*) FROM payments;


-- ============================================================
-- ✅ SETUP COMPLETE!
-- ============================================================
-- 
-- LOGIN CREDENTIALS:
-- 
-- ADMIN PORTAL:
--   Username: marwin    Password: Admin123
--   Username: romeo     Password: Admin123
--   Username: nairb     Password: Admin123
--   Username: johncarlo Password: Admin123
-- 
-- FRONT DESK PORTAL:
--   Username: patricia  Password: FrontDesk123
--   Username: roberto   Password: FrontDesk123
--   Username: elena     Password: FrontDesk123
--   Username: marco     Password: FrontDesk123
-- 
-- GUEST PORTAL:
--   Username: juan      Password: Guest123
--   Username: maria     Password: Guest123
--   Username: carlos    Password: Guest123
--   Username: ana       Password: Guest123
--   Username: miguel    Password: Guest123
--   Username: sofia     Password: Guest123
--   Username: diego     Password: Guest123
--   Username: isabella  Password: Guest123
--   Username: gabriel   Password: Guest123
--   Username: camila    Password: Guest123
-- 
-- ============================================================
