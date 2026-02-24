-- ============================================================
-- DATABASE ENHANCEMENTS MIGRATION
-- Run this after DDL.sql to add new features
-- ============================================================

-- =====================================================
-- 1. ADD IMAGE SUPPORT TO ROOMS
-- =====================================================
-- Add image_url column to rooms table to display room images
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS description TEXT;

-- Add some default images (using Unsplash hotel room images)
UPDATE rooms SET image_url = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800' WHERE room_type = 'Standard' AND image_url IS NULL;
UPDATE rooms SET image_url = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800' WHERE room_type = 'Deluxe' AND image_url IS NULL;
UPDATE rooms SET image_url = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800' WHERE room_type = 'Suite' AND image_url IS NULL;
UPDATE rooms SET image_url = 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800' WHERE room_type = 'Presidential' AND image_url IS NULL;


-- =====================================================
-- 2. ADD WALK-IN CUSTOMER SUPPORT
-- =====================================================
-- Add flag to identify walk-in customers vs online registrations
ALTER TABLE guests ADD COLUMN IF NOT EXISTS is_walk_in BOOLEAN DEFAULT FALSE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS is_walk_in BOOLEAN DEFAULT FALSE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS created_by_admin_id INT REFERENCES admins(admin_id);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS created_by_front_desk_id INT REFERENCES front_desk(front_desk_id);


-- =====================================================
-- 3. ENHANCE STAFF ROLES TO INCLUDE FRONT DESK
-- =====================================================
-- Update staff role check to include 'Front Desk' as a role option
ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_role_check;
ALTER TABLE staff ADD CONSTRAINT staff_role_check CHECK (
    role IN ('Manager', 'Receptionist', 'Concierge', 'Housekeeping', 'Maintenance', 'Front Desk')
);

-- Add link between front_desk users and staff table
ALTER TABLE staff ADD COLUMN IF NOT EXISTS front_desk_id INT REFERENCES front_desk(front_desk_id);


-- =====================================================
-- 4. ENHANCE RESERVATION STATUS TRACKING
-- =====================================================
-- Add more detailed reservation statuses
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check;
ALTER TABLE reservations ADD CONSTRAINT reservations_status_check CHECK (
    status IN (
        'Pending Payment',      -- Newly created, awaiting payment
        'Confirmed',            -- Payment received, reservation confirmed
        'Reserved',             -- Traditional reserved status
        'Checked-In',           -- Guest has arrived and checked in
        'Checked-Out',          -- Guest has completed stay
        'Cancelled',            -- Cancelled by guest or admin
        'No-Show',              -- Guest didn't arrive
        'Refunded'              -- Cancelled with refund processed
    )
);

-- Add payment status tracking
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'Completed' 
    CHECK (payment_status IN ('Pending', 'Completed', 'Failed', 'Refunded'));
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes TEXT;


-- =====================================================
-- 5. ADD ROOM FEATURES AND AMENITIES
-- =====================================================
-- Add amenities field to track room features (wifi, TV, minibar, etc.)
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT ARRAY['WiFi', 'TV', 'Air Conditioning'];
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS floor_number INT;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS room_size_sqft INT;


-- =====================================================
-- 6. ADD RECEIPT AND INVOICE TRACKING
-- =====================================================
-- Add receipt number for payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(50) UNIQUE;

-- Create sequence for auto-generating receipt numbers
CREATE SEQUENCE IF NOT EXISTS receipt_number_seq START 10001;

-- Update existing payments to have receipt numbers
UPDATE payments SET receipt_number = 'RCP-' || LPAD(payment_id::TEXT, 6, '0') 
WHERE receipt_number IS NULL;


-- =====================================================
-- 7. ADD AUDIT TRAIL FIELDS
-- =====================================================
-- Track who made changes and when
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS last_maintenance_date DATE;


-- =====================================================
-- 8. ADD GUEST PREFERENCES
-- =====================================================
-- Track guest preferences for better service
ALTER TABLE guests ADD COLUMN IF NOT EXISTS preferences TEXT;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS loyalty_points INT DEFAULT 0;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS vip_status BOOLEAN DEFAULT FALSE;


-- =====================================================
-- 9. CREATE VIEW FOR AVAILABLE ROOMS
-- =====================================================
-- Create a view to easily query available rooms
CREATE OR REPLACE VIEW available_rooms_view AS
SELECT 
    r.*,
    CASE 
        WHEN r.status = 'Available' THEN true
        ELSE false
    END as is_available
FROM rooms r
WHERE r.status = 'Available';


-- =====================================================
-- 10. CREATE VIEW FOR RESERVATION SUMMARY
-- =====================================================
-- Comprehensive reservation view with all details
CREATE OR REPLACE VIEW reservation_details_view AS
SELECT 
    res.reservation_id,
    res.guest_id,
    g.first_name || ' ' || g.last_name as guest_name,
    g.email as guest_email,
    g.contact_number as guest_phone,
    res.check_in_date,
    res.check_out_date,
    res.status,
    res.total_guests,
    res.special_requests,
    res.created_at,
    res.is_walk_in,
    STRING_AGG(DISTINCT rr.room_number, ', ') as room_numbers,
    SUM(DISTINCT rm.daily_rate) as total_daily_rate,
    COALESCE(SUM(p.amount_paid), 0) as total_paid,
    res.check_out_date::date - res.check_in_date::date as nights,
    (res.check_out_date::date - res.check_in_date::date) * SUM(DISTINCT rm.daily_rate) as total_amount
FROM reservations res
JOIN guests g ON res.guest_id = g.guest_id
LEFT JOIN reservation_room rr ON res.reservation_id = rr.reservation_id
LEFT JOIN rooms rm ON rr.room_number = rm.room_number
LEFT JOIN payments p ON res.reservation_id = p.reservation_id
GROUP BY res.reservation_id, g.first_name, g.last_name, g.email, g.contact_number;


-- =====================================================
-- 11. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
-- Add indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_reservations_guest_id ON reservations(guest_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_payments_reservation_id ON payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);


-- =====================================================
-- 12. CHECK-IN/CHECK-OUT AUTOMATION
-- =====================================================

-- Function: Automatically update room status to 'Occupied' when checking in
CREATE OR REPLACE FUNCTION auto_update_room_status_on_checkin()
RETURNS TRIGGER AS $$
BEGIN
    -- When reservation status changes to 'Checked-In', mark rooms as 'Occupied'
    IF NEW.status = 'Checked-In' AND OLD.status != 'Checked-In' THEN
        -- Set check_in_time if not already set
        IF NEW.check_in_time IS NULL THEN
            NEW.check_in_time := NOW();
        END IF;
        
        -- Update all rooms in this reservation to 'Occupied'
        UPDATE rooms
        SET status = 'Occupied'
        WHERE room_number IN (
            SELECT room_number FROM reservation_room WHERE reservation_id = NEW.reservation_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for check-in
DROP TRIGGER IF EXISTS trigger_checkin_update_room_status ON reservations;
CREATE TRIGGER trigger_checkin_update_room_status
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_room_status_on_checkin();


-- Function: Automatically update room status to 'Available' when checking out
CREATE OR REPLACE FUNCTION auto_update_room_status_on_checkout()
RETURNS TRIGGER AS $$
BEGIN
    -- When reservation status changes to 'Checked-Out', mark rooms as 'Available'
    IF NEW.status = 'Checked-Out' AND OLD.status != 'Checked-Out' THEN
        -- Set check_out_time if not already set
        IF NEW.check_out_time IS NULL THEN
            NEW.check_out_time := NOW();
        END IF;
        
        -- Update all rooms in this reservation to 'Available'
        UPDATE rooms
        SET status = 'Available'
        WHERE room_number IN (
            SELECT room_number FROM reservation_room WHERE reservation_id = NEW.reservation_id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for check-out
DROP TRIGGER IF EXISTS trigger_checkout_update_room_status ON reservations;
CREATE TRIGGER trigger_checkout_update_room_status
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_room_status_on_checkout();


-- Function: Update 'updated_at' timestamp automatically
CREATE OR REPLACE FUNCTION auto_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp update
DROP TRIGGER IF EXISTS trigger_update_reservation_timestamp ON reservations;
CREATE TRIGGER trigger_update_reservation_timestamp
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_timestamp();


-- Function: Validate room is available before check-in
CREATE OR REPLACE FUNCTION validate_room_availability()
RETURNS TRIGGER AS $$
DECLARE
    room_status_check TEXT;
BEGIN
    -- Check if any of the rooms for this reservation are not available
    SELECT status INTO room_status_check
    FROM rooms
    WHERE room_number IN (
        SELECT room_number FROM reservation_room WHERE reservation_id = NEW.reservation_id
    )
    AND status != 'Reserved'
    AND status != 'Available'
    LIMIT 1;
    
    -- If room is occupied or in maintenance, prevent check-in
    IF room_status_check IS NOT NULL AND NEW.status = 'Checked-In' AND OLD.status != 'Checked-In' THEN
        RAISE EXCEPTION 'Cannot check in: One or more rooms are not available for check-in';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate availability before check-in
DROP TRIGGER IF EXISTS trigger_validate_checkin ON reservations;
CREATE TRIGGER trigger_validate_checkin
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION validate_room_availability();


-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
