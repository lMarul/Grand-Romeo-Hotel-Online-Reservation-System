// Types matching the Grand Romeo Hotel database schema
// Simple database authentication (no Supabase Auth)

// =====================
// PORTAL USER TYPES (Authentication Tables)
// =====================

export type UserRole = 'admin' | 'staff' | 'user';

// Admin Portal Users
export interface Admin {
  admin_id: string; // Format: A001, A002, A003, ...
  username: string;
  password?: string; // Not returned in queries for security
  email: string;
  first_name: string;
  last_name: string;
  contact_number: string | null;
  created_at: string;
}

// Front Desk Portal Users
export interface FrontDesk {
  front_desk_id: string; // Format: FD001, FD002, FD003, ...
  username: string;
  password?: string;
  email: string;
  first_name: string;
  last_name: string;
  contact_number: string | null;
  created_at: string;
}

// Guest Portal Users (also used for reservations)
export interface Guest {
  guest_id: string; // Format: G001, G002, G003, ...
  username: string;
  password?: string;
  email: string;
  first_name: string;
  last_name: string;
  contact_number: string | null;
  street: string | null;
  city: string | null;
  state_province: string | null;
  zip_code: string | null;
  country: string | null;
  is_walk_in: boolean;
  preferences: string | null;
  loyalty_points: number;
  vip_status: boolean;
  created_at: string;
}

// Generic Profile type (used in AuthContext)
export type Profile = Admin | FrontDesk | Guest;

// Unified Account Profile for Account Management
export interface AccountProfile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: UserRole;
  contact_number: string | null;
  created_at: string;
}

// =====================
// ROOMS TABLE
// =====================
// PDF: RoomNumber, RoomType, Capacity, DailyRate, Status
export interface Room {
  room_number: string;
  room_type: RoomType;
  bed_type: BedType;
  capacity: number;
  daily_rate: number;
  status: RoomStatus;
  image_url: string | null;
  description: string | null;
  amenities: string[];
  floor_number: number | null;
  room_size_sqft: number | null;
  last_maintenance_date: string | null;
}

export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | 'Presidential';
export type BedType = 'Single' | 'Twin' | 'Double' | 'Queen' | 'King';
export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';

// =====================
// BUSINESS DATA TYPES
// =====================

// Hotel Employees (NOT portal users - just employee records)
export interface Staff {
  staff_id: string; // Format: S001, S002, S003, ...
  first_name: string;
  last_name: string;
  role: StaffRole;
  contact_number: string | null;
}

export type StaffRole = 'Manager' | 'Receptionist' | 'Housekeeping' | 'Concierge' | 'Maintenance' | 'Front Desk';

// =====================
// RESERVATIONS TABLE
// =====================
export interface Reservation {
  reservation_id: string; // Format: R001, R002, R003, ...
  guest_id: string; // Format: G001, G002, G003, ...
  check_in_date: string;
  check_out_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  total_guests: number;
  special_requests: string | null;
  status: ReservationStatus;
  is_walk_in: boolean;
  created_by_admin_id: string | null; // Format: A001, A002, A003, ...
  created_by_front_desk_id: string | null; // Format: FD001, FD002, FD003, ...
  created_at: string;
  updated_at: string | null;
  updated_by: string | null;
  // Joined data (from related tables)
  guest?: Guest;
  rooms?: ReservationRoom[];
  staff?: ReservationStaff[];
}

export type ReservationStatus = 'Pending Payment' | 'Confirmed' | 'Reserved' | 'Checked-In' | 'Checked-Out' | 'Cancelled' | 'No-Show' | 'Refunded';

// =====================
// RESERVATION_ROOM TABLE (Junction)
// =====================
// PDF: ReservationID, RoomNumber (Composite PK)
export interface ReservationRoom {
  reservation_id: string; // Format: R001, R002, R003, ...
  room_number: string;
  room?: Room;
}

// =====================
// RESERVATION_STAFF TABLE (Junction)
// =====================
// PDF: ReservationID, StaffID (Composite PK)
export interface ReservationStaff {
  reservation_id: string; // Format: R001, R002, R003, ...
  staff_id: string; // Format: S001, S002, S003, ...
  staff?: Staff;
}

// =====================
// PAYMENTS TABLE
// =====================
// PDF: PaymentID, ReservationID, PaymentDate, AmountPaid,
//      PaymentMethod, TransactionID
export interface Payment {
  payment_id: string; // Format: P001, P002, P003, ...
  reservation_id: string; // Format: R001, R002, R003, ...
  payment_date: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  transaction_id: string | null;
  payment_status: PaymentStatus;
  refund_amount: number;
  notes: string | null;
  receipt_number: string | null;
  created_at: string;
  // Joined data
  reservation?: Reservation;
}

export type PaymentMethod = 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'E-Wallet';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';

// =====================
// DASHBOARD STATS
// =====================
export interface DashboardStats {
  totalGuests: number;
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  activeReservations: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  monthlyRevenue: number;
}
