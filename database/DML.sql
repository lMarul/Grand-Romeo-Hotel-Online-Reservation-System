-- ============================================================
-- HOTEL RESERVATION SYSTEM - DML (Data Manipulation Language)
-- Grand Romeo Hotel - DATAMA2 Finals (Database Management)
-- ============================================================
-- This file contains all INSERT statements for initial data
-- Run this AFTER running DDL.sql
-- ============================================================


-- =====================================================
-- PART 1: SEED DATA - USER ACCOUNTS
-- =====================================================

-- ADMINS (4 team members)
INSERT INTO admins (admin_id, username, password, email, first_name, last_name, contact_number) VALUES
    (1, 'marwin', 'Admin123!', 'marwin.gonzales@grandromeo.com', 'Marwin John', 'Gonzales', '+639171234567'),
    (2, 'romeo', 'Admin123!', 'romeo.albeza@grandromeo.com', 'Romeo', 'Albeza Jr.', '+639171234568'),
    (3, 'nairb', 'Admin123!', 'nairb.varona@grandromeo.com', 'Nairb Ackilis', 'Varona', '+639171234569'),
    (4, 'johncarlo', 'Admin123!', 'johncarlo.baracena@grandromeo.com', 'John Carlo', 'Baracena', '+639171234570')
ON CONFLICT (admin_id) DO NOTHING;

SELECT setval('admins_admin_id_seq', 4, true);

-- FRONT DESK (4 accounts)
INSERT INTO front_desk (front_desk_id, username, password, email, first_name, last_name, contact_number) VALUES
    (1, 'patricia', 'FrontDesk123!', 'patricia.cruz@grandromeo.com', 'Patricia', 'Cruz', '+639181234571'),
    (2, 'roberto', 'FrontDesk123!', 'roberto.santos@grandromeo.com', 'Roberto', 'Santos', '+639181234572'),
    (3, 'elena', 'FrontDesk123!', 'elena.rivera@grandromeo.com', 'Elena', 'Rivera', '+639181234573'),
    (4, 'marco', 'FrontDesk123!', 'marco.lim@grandromeo.com', 'Marco', 'Lim', '+639181234574')
ON CONFLICT (front_desk_id) DO NOTHING;

SELECT setval('front_desk_front_desk_id_seq', 4, true);

-- GUESTS (10 accounts)
INSERT INTO guests (guest_id, username, password, email, first_name, last_name, contact_number, street, city, state_province, zip_code, country) VALUES
    (1, 'juan', 'Guest123!', 'juan.delacruz@email.com', 'Juan', 'Dela Cruz', '09123456789', '123 Manila Street', 'Manila', 'Metro Manila', '1000', 'Philippines'),
    (2, 'maria', 'Guest123!', 'maria.santos@email.com', 'Maria', 'Santos', '09234567890', '456 Makati Avenue', 'Makati', 'Metro Manila', '1200', 'Philippines'),
    (3, 'carlos', 'Guest123!', 'carlos.reyes@email.com', 'Carlos', 'Reyes', '09345678901', '789 Quezon City Road', 'Quezon City', 'Metro Manila', '1100', 'Philippines'),
    (4, 'ana', 'Guest123!', 'ana.garcia@email.com', 'Ana', 'Garcia', '09456789012', '321 Pasig Boulevard', 'Pasig', 'Metro Manila', '1600', 'Philippines'),
    (5, 'miguel', 'Guest123!', 'miguel.torres@email.com', 'Miguel', 'Torres', '09567890123', '654 Taguig Street', 'Taguig', 'Metro Manila', '1630', 'Philippines'),
    (6, 'sofia', 'Guest123!', 'sofia.ramos@email.com', 'Sofia', 'Ramos', '09678901234', '987 Paranaque Lane', 'Paranaque', 'Metro Manila', '1700', 'Philippines'),
    (7, 'diego', 'Guest123!', 'diego.cruz@email.com', 'Diego', 'Cruz', '09789012345', '147 Las Pinas Road', 'Las Pinas', 'Metro Manila', '1740', 'Philippines'),
    (8, 'isabella', 'Guest123!', 'isabella.mendoza@email.com', 'Isabella', 'Mendoza', '09890123456', '258 Muntinlupa Drive', 'Muntinlupa', 'Metro Manila', '1770', 'Philippines'),
    (9, 'gabriel', 'Guest123!', 'gabriel.villanueva@email.com', 'Gabriel', 'Villanueva', '09901234567', '369 Marikina Heights', 'Marikina', 'Metro Manila', '1800', 'Philippines'),
    (10, 'camila', 'Guest123!', 'camila.bautista@email.com', 'Camila', 'Bautista', '09012345678', '741 Caloocan Avenue', 'Caloocan', 'Metro Manila', '1400', 'Philippines')
ON CONFLICT (guest_id) DO NOTHING;

SELECT setval('guests_guest_id_seq', 10, true);


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
    (1, 'Roberto', 'Mendoza', 'Manager', '09111222333'),
    (2, 'Patricia', 'Villanueva', 'Receptionist', '09222333444'),
    (3, 'Eduardo', 'Cruz', 'Concierge', '09333444555'),
    (4, 'Linda', 'Ramos', 'Housekeeping', '09444555666'),
    (5, 'Antonio', 'Bautista', 'Maintenance', '09555666777'),
    (6, 'Carmen', 'Garcia', 'Housekeeping', '09666777888'),
    (7, 'Jose', 'Reyes', 'Concierge', '09777888999')
ON CONFLICT (staff_id) DO NOTHING;

SELECT setval('staff_staff_id_seq', 7, true);

-- RESERVATIONS (Demonstrating all new status types)
INSERT INTO reservations (reservation_id, guest_id, check_in_date, check_out_date, check_in_time, check_out_time, total_guests, special_requests, status) VALUES
    (1, 1, '2026-02-15', '2026-02-17', NULL, NULL, 2, 'Late check-in after 10 PM. Non-smoking room preferred.', 'Reserved'),
    (2, 2, '2026-02-16', '2026-02-20', NULL, NULL, 3, 'Extra bed for child. High floor preferred.', 'Confirmed'),
    (3, 3, '2026-02-10', '2026-02-12', '2026-02-10 15:30:00+00', NULL, 4, NULL, 'Checked-In'),
    (4, 4, '2026-02-01', '2026-02-05', '2026-02-01 14:00:00+00', '2026-02-05 11:30:00+00', 2, 'Airport shuttle on arrival.', 'Checked-Out'),
    (5, 5, '2026-02-12', '2026-02-18', NULL, NULL, 6, 'Connecting rooms please. Celebrating anniversary.', 'Confirmed'),
    (6, 6, '2026-02-20', '2026-02-22', NULL, NULL, 2, NULL, 'Pending Payment'),
    (7, 7, '2026-02-25', '2026-02-28', NULL, NULL, 3, 'Early check-in if possible. Need baby crib.', 'Confirmed'),
    (8, 8, '2026-01-20', '2026-01-22', NULL, NULL, 2, NULL, 'No-Show'),
    (9, 9, '2026-02-05', '2026-02-07', '2026-02-05 14:15:00+00', '2026-02-07 10:45:00+00', 1, 'Quiet room away from elevator.', 'Checked-Out'),
    (10, 10, '2026-02-28', '2026-03-03', NULL, NULL, 2, 'Vegetarian meal options. Late checkout requested.', 'Confirmed'),
    (11, 1, '2026-01-15', '2026-01-17', NULL, NULL, 2, 'Cancelled due to emergency.', 'Refunded'),
    (12, 3, '2026-03-01', '2026-03-05', NULL, NULL, 2, 'Business trip reservation.', 'Pending Payment')
ON CONFLICT (reservation_id) DO NOTHING;

SELECT setval('reservations_reservation_id_seq', 12, true);

-- RESERVATION_ROOM (Which rooms are booked for each reservation)
INSERT INTO reservation_room (reservation_id, room_number) VALUES
    (1, '102'),
    (2, '203'),
    (3, '301'),
    (4, '201'),
    (5, '401'),
    (5, '402'),
    (6, '103'),
    (7, '204'),
    (8, '104'),
    (9, '105'),
    (10, '302'),
    (11, '101'),
    (12, '202')
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
    (7, 3),
    (8, 2),,
    (11, 2),
    (12, 3)
    (9, 3),
    (10, 2)
ON CONFLICT (Including examples with new payment_status field)
INSERT INTO payments (payment_id, reservation_id, payment_date, amount_paid, payment_method, transaction_id) VALUES
    (1, 3, '2026-02-10', 16000.00, 'Credit Card', 'TXN001'),
    (2, 4, '2026-02-01', 9000.00, 'Cash', 'TXN002'),
    (3, 4, '2026-02-03', 9000.00, 'Cash', 'TXN003'),
    (4, 5, '2026-02-12', 90000.00, 'Bank Transfer', 'TXN004'),
    (5, 9, '2026-02-05', 5000.00, 'E-Wallet', 'TXN005'),
    (6, 10, '2026-02-27', 8000.00, 'Credit Card', 'TXN006'),
    (7, 2, '2026-02-16', 13500.00, 'Credit Card', 'TXN007'),
    (8, 7, '2026-02-24', 13500.00, 'Debit Card', 'TXN008')
ON CONFLICT (payment_id) DO NOTHING;

SELECT setval('payments_payment_id_seq', 8

SELECT setval('payments_payment_id_seq', 6, true);


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
