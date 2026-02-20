// Types matching the Grand Romeo Hotel database schema
// Simple database authentication (no Supabase Auth)

// =====================
// PORTAL USER TYPES (Authentication Tables)
// =====================

export type UserRole = 'admin' | 'front_desk' | 'guest';

// Admin Portal Users
export interface Admin {
  admin_id: number;
  username: string;
  password?: string;
  email: string;
  first_name: string;
  last_name: string;
  contact_number: string | null;
  created_at: string;
}

// Front Desk Portal Users
export interface FrontDesk {
  front_desk_id: number;
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
  guest_id: number;
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
  created_at: string;
}

// Generic Profile type (used in AuthContext)
export type Profile = Admin | FrontDesk | Guest;

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
}

export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | 'Presidential';
export type BedType = 'Single' | 'Twin' | 'Double' | 'Queen' | 'King';
export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';

// =====================
// BUSINESS DATA TYPES
// =====================

// Hotel Employees (NOT portal users - just employee records)
export interface Staff {
  staff_id: number;
  first_name: string;
  last_name: string;
  role: StaffRole;
  contact_number: string | null;
}

export type StaffRole = 'Manager' | 'Receptionist' | 'Housekeeping' | 'Concierge' | 'Maintenance';

// =====================
// RESERVATIONS TABLE
// =====================
export interface Reservation {
  reservation_id: number;
  guest_id: number;
  check_in_date: string;
  check_out_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  total_guests: number;
  special_requests: string | null;
  status: ReservationStatus;
  created_at: string;
  // Joined data (from related tables)
  guest?: Guest;
  rooms?: ReservationRoom[];
  staff?: ReservationStaff[];
}

export type ReservationStatus = 'Reserved' | 'Checked-In' | 'Checked-Out' | 'Cancelled' | 'No-Show';

// =====================
// RESERVATION_ROOM TABLE (Junction)
// =====================
// PDF: ReservationID, RoomNumber (Composite PK)
export interface ReservationRoom {
  reservation_id: number;
  room_number: string;
  room?: Room;
}

// =====================
// RESERVATION_STAFF TABLE (Junction)
// =====================
// PDF: ReservationID, StaffID (Composite PK)
export interface ReservationStaff {
  reservation_id: number;
  staff_id: number;
  staff?: Staff;
}

// =====================
// PAYMENTS TABLE
// =====================
// PDF: PaymentID, ReservationID, PaymentDate, AmountPaid,
//      PaymentMethod, TransactionID
export interface Payment {
  payment_id: number;
  reservation_id: number;
  payment_date: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  transaction_id: string | null;
  // Joined data
  reservation?: Reservation;
}

export type PaymentMethod = 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'E-Wallet';

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
