-- ============================================================
-- HOTEL RESERVATION SYSTEM - CLEAN DROP SCRIPT
-- Grand Romeo Hotel - DATAMA2 Finals
-- ============================================================
-- Run this script to completely reset the database
-- Drops all policies, tables, and related objects
-- ============================================================

-- =====================================================
-- STEP 1: DROP ALL ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Drop policies for admins table
DROP POLICY IF EXISTS "Allow all operations on admins for anon" ON admins;
DROP POLICY IF EXISTS "Allow all operations on admins for authenticated" ON admins;

-- Drop policies for front_desk table
DROP POLICY IF EXISTS "Allow all operations on front_desk for anon" ON front_desk;
DROP POLICY IF EXISTS "Allow all operations on front_desk for authenticated" ON front_desk;

-- Drop policies for guests table
DROP POLICY IF EXISTS "Allow all operations on guests for anon" ON guests;
DROP POLICY IF EXISTS "Allow all operations on guests for authenticated" ON guests;

-- Drop policies for rooms table
DROP POLICY IF EXISTS "Allow read access on rooms for anon" ON rooms;
DROP POLICY IF EXISTS "Allow all operations on rooms for anon" ON rooms;
DROP POLICY IF EXISTS "Allow all operations on rooms for authenticated" ON rooms;

-- Drop policies for staff table
DROP POLICY IF EXISTS "Allow read access on staff for anon" ON staff;
DROP POLICY IF EXISTS "Allow all operations on staff for anon" ON staff;
DROP POLICY IF EXISTS "Allow all operations on staff for authenticated" ON staff;

-- Drop policies for reservations table
DROP POLICY IF EXISTS "Allow all operations on reservations for anon" ON reservations;
DROP POLICY IF EXISTS "Allow all operations on reservations for authenticated" ON reservations;

-- Drop policies for reservation_room table
DROP POLICY IF EXISTS "Allow all operations on reservation_room for anon" ON reservation_room;
DROP POLICY IF EXISTS "Allow all operations on reservation_room for authenticated" ON reservation_room;

-- Drop policies for reservation_staff table
DROP POLICY IF EXISTS "Allow all operations on reservation_staff for anon" ON reservation_staff;
DROP POLICY IF EXISTS "Allow all operations on reservation_staff for authenticated" ON reservation_staff;

-- Drop policies for payments table
DROP POLICY IF EXISTS "Allow all operations on payments for anon" ON payments;
DROP POLICY IF EXISTS "Allow all operations on payments for authenticated" ON payments;


-- =====================================================
-- STEP 2: DROP ALL TABLES (CASCADE removes dependencies)
-- =====================================================

-- Drop junction and dependent tables first
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS reservation_staff CASCADE;
DROP TABLE IF EXISTS reservation_room CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;

-- Drop core business tables
DROP TABLE IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;

-- Drop user account tables
DROP TABLE IF EXISTS guests CASCADE;
DROP TABLE IF EXISTS front_desk CASCADE;
DROP TABLE IF EXISTS admins CASCADE;


-- =====================================================
-- VERIFICATION QUERIES (Uncomment to verify)
-- =====================================================

-- Check for remaining tables
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check for remaining policies
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE '✓ Database cleanup complete - all tables and policies dropped';
END $$;
