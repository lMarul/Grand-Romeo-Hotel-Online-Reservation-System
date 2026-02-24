-- ============================================================
-- HOTEL RESERVATION SYSTEM - DML (Data Manipulation Language)
-- Grand Romeo Hotel - DATAMA2 Finals (Database Management)
-- ============================================================
-- This file contains all INSERT statements for initial data with FORMATTED IDs
-- Run this AFTER running DDL_FORMATTED_IDS.sql or after migration_formatted_ids.sql
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
-- PART 1: SEED DATA - USER ACCOUNTS
-- =====================================================

-- ADMINS (4 team members)
INSERT INTO admins (admin_id, username, password, email, first_name, last_name, contact_number) VALUES
    ('A001', 'marwin', 'Marwin2024!', 'marwin.gonzales@grandromeo.com', 'Marwin John', 'Gonzales', '+639171234567'),
    ('A002', 'romeo', 'Romeo2024!', 'romeo.albeza@grandromeo.com', 'Romeo', 'Albeza Jr.', '+639171234568'),
    ('A003', 'nairb', 'Nairb2024!', 'nairb.varona@grandromeo.com', 'Nairb Ackilis', 'Varona', '+639171234569'),
    ('A004', 'johncarlo', 'Johncarlo2024!', 'johncarlo.baracena@grandromeo.com', 'John Carlo', 'Baracena', '+639171234570')
ON CONFLICT (admin_id) DO NOTHING;

-- Update sequence to continue from 5
SELECT setval('admins_id_seq', 4, true);

-- FRONT DESK (4 accounts)
INSERT INTO front_desk (front_desk_id, username, password, email, first_name, last_name, contact_number) VALUES
    ('FD001', 'patricia', 'Patricia2024!', 'patricia.cruz@grandromeo.com', 'Patricia', 'Cruz', '+639181234571'),
    ('FD002', 'roberto', 'Roberto2024!', 'roberto.santos@grandromeo.com', 'Roberto', 'Santos', '+639181234572'),
    ('FD003', 'elena', 'Elena2024!', 'elena.rivera@grandromeo.com', 'Elena', 'Rivera', '+639181234573'),
    ('FD004', 'marco', 'Marco2024!', 'marco.lim@grandromeo.com', 'Marco', 'Lim', '+639181234574')
ON CONFLICT (front_desk_id) DO NOTHING;

-- Update sequence to continue from 5
SELECT setval('front_desk_id_seq', 4, true);

-- GUESTS (10 accounts)
INSERT INTO guests (guest_id, username, password, email, first_name, last_name, contact_number, street, city, state_province, zip_code, country) VALUES
    ('G001', 'juan', 'Juan2024!', 'juan.delacruz@email.com', 'Juan', 'Dela Cruz', '09123456789', '123 Manila Street', 'Manila', 'Metro Manila', '1000', 'Philippines'),
    ('G002', 'maria', 'Maria2024!', 'maria.santos@email.com', 'Maria', 'Santos', '09234567890', '456 Makati Avenue', 'Makati', 'Metro Manila', '1200', 'Philippines'),
    ('G003', 'carlos', 'Carlos2024!', 'carlos.reyes@email.com', 'Carlos', 'Reyes', '09345678901', '789 Quezon City Road', 'Quezon City', 'Metro Manila', '1100', 'Philippines'),
    ('G004', 'ana', 'Ana2024!', 'ana.garcia@email.com', 'Ana', 'Garcia', '09456789012', '321 Pasig Boulevard', 'Pasig', 'Metro Manila', '1600', 'Philippines'),
    ('G005', 'miguel', 'Miguel2024!', 'miguel.torres@email.com', 'Miguel', 'Torres', '09567890123', '654 Taguig Street', 'Taguig', 'Metro Manila', '1630', 'Philippines'),
    ('G006', 'sofia', 'Sofia2024!', 'sofia.ramos@email.com', 'Sofia', 'Ramos', '09678901234', '987 Paranaque Lane', 'Paranaque', 'Metro Manila', '1700', 'Philippines'),
    ('G007', 'diego', 'Diego2024!', 'diego.cruz@email.com', 'Diego', 'Cruz', '09789012345', '147 Las Pinas Road', 'Las Pinas', 'Metro Manila', '1740', 'Philippines'),
    ('G008', 'isabella', 'Isabella2024!', 'isabella.mendoza@email.com', 'Isabella', 'Mendoza', '09890123456', '258 Muntinlupa Drive', 'Muntinlupa', 'Metro Manila', '1770', 'Philippines'),
    ('G009', 'gabriel', 'Gabriel2024!', 'gabriel.villanueva@email.com', 'Gabriel', 'Villanueva', '09901234567', '369 Marikina Heights', 'Marikina', 'Metro Manila', '1800', 'Philippines'),
    ('G010', 'camila', 'Camila2024!', 'camila.bautista@email.com', 'Camila', 'Bautista', '09012345678', '741 Caloocan Avenue', 'Caloocan', 'Metro Manila', '1400', 'Philippines')
ON CONFLICT (guest_id) DO NOTHING;

-- Update sequence to continue from 11
SELECT setval('guests_id_seq', 10, true);


-- =====================================================
-- PART 2: SEED DATA - BUSINESS DATA
-- =====================================================

-- ROOMS (15 rooms)
INSERT INTO rooms (room_number, room_type, bed_type, capacity, daily_rate, status) VALUES
    ('101', 'Standard', 'Twin', 2, 2500.00, 'Available'),
    ('102', 'Standard', 'Double', 2, 2500.00, 'Reserved'),
    ('103', 'Standard', 'Twin', 2, 2500.00, 'Available'),
    ('104', 'Standard', 'Single', 1, 2500.00, 'Available'),
    ('105', 'Standard', 'Double', 2, 2500.00, 'Available'),
    ('201', 'Deluxe', 'Queen', 3, 4500.00, 'Available'),
    ('202', 'Deluxe', 'Queen', 3, 4500.00, 'Available'),
    ('203', 'Deluxe', 'King', 3, 4500.00, 'Reserved'),
    ('204', 'Deluxe', 'Queen', 3, 4500.00, 'Available'),
    ('205', 'Deluxe', 'King', 3, 4500.00, 'Available'),
    ('301', 'Suite', 'King', 4, 8000.00, 'Occupied'),
    ('302', 'Suite', 'King', 4, 8000.00, 'Available'),
    ('303', 'Suite', 'King', 4, 8000.00, 'Available'),
    ('401', 'Presidential', 'King', 6, 15000.00, 'Reserved'),
    ('402', 'Presidential', 'King', 6, 15000.00, 'Reserved')
ON CONFLICT (room_number) DO NOTHING;

-- STAFF (Hotel employees - not portal users)
INSERT INTO staff (staff_id, first_name, last_name, role, contact_number) VALUES
    ('S001', 'Roberto', 'Mendoza', 'Manager', '09111222333'),
    ('S002', 'Patricia', 'Villanueva', 'Receptionist', '09222333444'),
    ('S003', 'Eduardo', 'Cruz', 'Concierge', '09333444555'),
    ('S004', 'Linda', 'Ramos', 'Housekeeping', '09444555666'),
    ('S005', 'Antonio', 'Bautista', 'Maintenance', '09555666777'),
    ('S006', 'Carmen', 'Garcia', 'Housekeeping', '09666777888'),
    ('S007', 'Jose', 'Reyes', 'Concierge', '09777888999')
ON CONFLICT (staff_id) DO NOTHING;

-- Update sequence to continue from 8
SELECT setval('staff_id_seq', 7, true);

-- RESERVATIONS (Demonstrating all new status types)
INSERT INTO reservations (reservation_id, guest_id, check_in_date, check_out_date, check_in_time, check_out_time, total_guests, special_requests, status) VALUES
    ('R001', 'G001', '2026-02-15', '2026-02-17', NULL, NULL, 2, 'Late check-in after 10 PM. Non-smoking room preferred.', 'Reserved'),
    ('R002', 'G002', '2026-02-16', '2026-02-20', NULL, NULL, 3, 'Extra bed for child. High floor preferred.', 'Confirmed'),
    ('R003', 'G003', '2026-02-10', '2026-02-12', '2026-02-10 15:30:00+00', NULL, 4, NULL, 'Checked-In'),
    ('R004', 'G004', '2026-02-01', '2026-02-05', '2026-02-01 14:00:00+00', '2026-02-05 11:30:00+00', 2, 'Airport shuttle on arrival.', 'Checked-Out'),
    ('R005', 'G005', '2026-02-12', '2026-02-18', NULL, NULL, 6, 'Connecting rooms please. Celebrating anniversary.', 'Confirmed'),
    ('R006', 'G006', '2026-02-20', '2026-02-22', NULL, NULL, 2, NULL, 'Pending Payment'),
    ('R007', 'G007', '2026-02-25', '2026-02-28', NULL, NULL, 3, 'Early check-in if possible. Need baby crib.', 'Confirmed'),
    ('R008', 'G008', '2026-01-20', '2026-01-22', NULL, NULL, 2, NULL, 'No-Show'),
    ('R009', 'G009', '2026-02-05', '2026-02-07', '2026-02-05 14:15:00+00', '2026-02-07 10:45:00+00', 1, 'Quiet room away from elevator.', 'Checked-Out'),
    ('R010', 'G010', '2026-02-28', '2026-03-03', NULL, NULL, 2, 'Vegetarian meal options. Late checkout requested.', 'Confirmed'),
    ('R011', 'G001', '2026-01-15', '2026-01-17', NULL, NULL, 2, 'Cancelled due to emergency.', 'Refunded'),
    ('R012', 'G003', '2026-03-01', '2026-03-05', NULL, NULL, 2, 'Business trip reservation.', 'Pending Payment')
ON CONFLICT (reservation_id) DO NOTHING;

-- Update sequence to continue from 13
SELECT setval('reservations_id_seq', 12, true);

-- RESERVATION_ROOM (Which rooms are booked for each reservation)
INSERT INTO reservation_room (reservation_id, room_number) VALUES
    ('R001', '102'),
    ('R002', '203'),
    ('R003', '301'),
    ('R004', '201'),
    ('R005', '401'),
    ('R005', '402'),
    ('R006', '103'),
    ('R007', '204'),
    ('R008', '104'),
    ('R009', '105'),
    ('R010', '302'),
    ('R011', '101'),
    ('R012', '202')
ON CONFLICT DO NOTHING;

-- RESERVATION_STAFF (Which staff are assigned to each reservation)
INSERT INTO reservation_staff (reservation_id, staff_id) VALUES
    ('R001', 'S002'),
    ('R002', 'S002'),
    ('R003', 'S003'),
    ('R004', 'S002'),
    ('R005', 'S003'),
    ('R005', 'S004'),
    ('R006', 'S002'),
    ('R007', 'S003'),
    ('R008', 'S002'),
    ('R009', 'S003'),
    ('R010', 'S002'),
    ('R011', 'S002'),
    ('R012', 'S003')
ON CONFLICT DO NOTHING;

-- PAYMENTS
INSERT INTO payments (payment_id, reservation_id, payment_date, amount_paid, payment_method, transaction_id) VALUES
    ('P001', 'R003', '2026-02-10', 16000.00, 'Credit Card', 'TXN001'),
    ('P002', 'R004', '2026-02-01', 9000.00, 'Cash', 'TXN002'),
    ('P003', 'R004', '2026-02-03', 9000.00, 'Cash', 'TXN003'),
    ('P004', 'R005', '2026-02-12', 90000.00, 'Bank Transfer', 'TXN004'),
    ('P005', 'R009', '2026-02-05', 5000.00, 'E-Wallet', 'TXN005'),
    ('P006', 'R010', '2026-02-27', 8000.00, 'Credit Card', 'TXN006'),
    ('P007', 'R002', '2026-02-16', 13500.00, 'Credit Card', 'TXN007'),
    ('P008', 'R007', '2026-02-24', 13500.00, 'Debit Card', 'TXN008')
ON CONFLICT (payment_id) DO NOTHING;

-- Update sequence to continue from 9
SELECT setval('payments_id_seq', 8, true);


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
-- ✅ DML COMPLETE!
-- ============================================================
-- 
-- LOGIN CREDENTIALS:
-- 
-- ADMIN PORTAL:
--   Username: marwin    Password: Admin123!
--   Username: romeo     Password: Admin123!
--   Username: nairb     Password: Admin123!
--   Username: johncarlo Password: Admin123!
-- 
-- FRONT DESK PORTAL:
--   Username: patricia  Password: FrontDesk123!
--   Username: roberto   Password: FrontDesk123!
--   Username: elena     Password: FrontDesk123!
--   Username: marco     Password: FrontDesk123!
-- 
-- GUEST PORTAL:
--   Username: juan      Password: Guest123!
--   Username: maria     Password: Guest123!
--   Username: carlos    Password: Guest123!
--   Username: ana       Password: Guest123!
--   Username: miguel    Password: Guest123!
--   Username: sofia     Password: Guest123!
--   Username: diego     Password: Guest123!
--   Username: isabella  Password: Guest123!
--   Username: gabriel   Password: Guest123!
--   Username: camila    Password: Guest123!
-- 
-- ============================================================
-- 
-- ID FORMATS IN USE:
--   Admins:       A001, A002, A003, A004
--   Front Desk:   FD001, FD002, FD003, FD004
--   Guests:       G001 to G010
--   Staff:        S001 to S007
--   Reservations: R001 to R012
--   Payments:     P001 to P008
-- 
-- ============================================================
