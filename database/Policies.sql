-- ============================================================
-- ADD ROW LEVEL SECURITY POLICIES - MIGRATION SCRIPT
-- Grand Romeo Hotel - DATAMA2 Finals (Database Management)
-- ============================================================
-- Run this script on an existing database to add RLS policies.
-- This replaces the DISABLE ROW LEVEL SECURITY approach with
-- proper policies that allow anon key access.
-- ============================================================

-- First, drop any existing policies (if re-running)
DROP POLICY IF EXISTS "Allow all operations on admins for anon" ON admins;
DROP POLICY IF EXISTS "Allow all operations on admins for authenticated" ON admins;
DROP POLICY IF EXISTS "Allow all operations on front_desk for anon" ON front_desk;
DROP POLICY IF EXISTS "Allow all operations on front_desk for authenticated" ON front_desk;
DROP POLICY IF EXISTS "Allow all operations on guests for anon" ON guests;
DROP POLICY IF EXISTS "Allow all operations on guests for authenticated" ON guests;
DROP POLICY IF EXISTS "Allow read access on rooms for anon" ON rooms;
DROP POLICY IF EXISTS "Allow all operations on rooms for anon" ON rooms;
DROP POLICY IF EXISTS "Allow all operations on rooms for authenticated" ON rooms;
DROP POLICY IF EXISTS "Allow read access on staff for anon" ON staff;
DROP POLICY IF EXISTS "Allow all operations on staff for anon" ON staff;
DROP POLICY IF EXISTS "Allow all operations on staff for authenticated" ON staff;
DROP POLICY IF EXISTS "Allow all operations on reservations for anon" ON reservations;
DROP POLICY IF EXISTS "Allow all operations on reservations for authenticated" ON reservations;
DROP POLICY IF EXISTS "Allow all operations on reservation_room for anon" ON reservation_room;
DROP POLICY IF EXISTS "Allow all operations on reservation_room for authenticated" ON reservation_room;
DROP POLICY IF EXISTS "Allow all operations on reservation_staff for anon" ON reservation_staff;
DROP POLICY IF EXISTS "Allow all operations on reservation_staff for authenticated" ON reservation_staff;
DROP POLICY IF EXISTS "Allow all operations on payments for anon" ON payments;
DROP POLICY IF EXISTS "Allow all operations on payments for authenticated" ON payments;

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
-- POLICIES ADDED SUCCESSFULLY!
-- ============================================================
-- 
-- All tables now have Row Level Security enabled with policies
-- that allow anon and authenticated users to perform operations.
-- 
-- These policies maintain compatibility with your application-level
-- authentication system while enabling RLS at the database level.
-- 
-- To verify policies are working, run:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd 
-- FROM pg_policies 
-- WHERE schemaname = 'public';
-- 
-- ============================================================
