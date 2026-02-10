// Supabase Database Types - matching Grand Romeo Hotel schema
// Simple database authentication (no Supabase Auth)

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          admin_id: number;
          username: string;
          password: string;
          email: string;
          first_name: string;
          last_name: string;
          contact_number: string | null;
          created_at: string;
        };
        Insert: {
          admin_id?: number;
          username: string;
          password: string;
          email: string;
          first_name: string;
          last_name: string;
          contact_number?: string | null;
          created_at?: string;
        };
        Update: {
          admin_id?: number;
          username?: string;
          password?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          contact_number?: string | null;
          created_at?: string;
        };
      };
      front_desk: {
        Row: {
          front_desk_id: number;
          username: string;
          password: string;
          email: string;
          first_name: string;
          last_name: string;
          contact_number: string | null;
          created_at: string;
        };
        Insert: {
          front_desk_id?: number;
          username: string;
          password: string;
          email: string;
          first_name: string;
          last_name: string;
          contact_number?: string | null;
          created_at?: string;
        };
        Update: {
          front_desk_id?: number;
          username?: string;
          password?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          contact_number?: string | null;
          created_at?: string;
        };
      };
      guests: {
        Row: {
          guest_id: number;
          username: string;
          password: string;
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
        };
        Insert: {
          guest_id?: number;
          username: string;
          password: string;
          email: string;
          first_name: string;
          last_name: string;
          contact_number?: string | null;
          street?: string | null;
          city?: string | null;
          state_province?: string | null;
          zip_code?: string | null;
          country?: string | null;
          created_at?: string;
        };
        Update: {
          guest_id?: number;
          username?: string;
          password?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          contact_number?: string | null;
          street?: string | null;
          city?: string | null;
          state_province?: string | null;
          zip_code?: string | null;
          country?: string | null;
          created_at?: string;
        };
      };
      rooms: {
        Row: {
          room_number: string;
          room_type: string;
          capacity: number;
          daily_rate: number;
          status: string;
        };
        Insert: {
          room_number: string;
          room_type: string;
          capacity?: number;
          daily_rate: number;
          status?: string;
        };
        Update: {
          room_number?: string;
          room_type?: string;
          capacity?: number;
          daily_rate?: number;
          status?: string;
        };
      };
      staff: {
        Row: {
          staff_id: number;
          first_name: string;
          last_name: string;
          role: string;
          contact_number: string | null;
        };
        Insert: {
          staff_id?: number;
          first_name: string;
          last_name: string;
          role: string;
          contact_number?: string | null;
        };
        Update: {
          staff_id?: number;
          first_name?: string;
          last_name?: string;
          role?: string;
          contact_number?: string | null;
        };
      };
      reservations: {
        Row: {
          reservation_id: number;
          guest_id: number;
          check_in_date: string;
          check_out_date: string;
          check_in_time: string | null;
          check_out_time: string | null;
          total_guests: number;
          status: string;
          created_at: string;
        };
        Insert: {
          reservation_id?: number;
          guest_id: number;
          check_in_date: string;
          check_out_date: string;
          check_in_time?: string | null;
          check_out_time?: string | null;
          total_guests?: number;
          status?: string;
          created_at?: string;
        };
        Update: {
          reservation_id?: number;
          guest_id?: number;
          check_in_date?: string;
          check_out_date?: string;
          check_in_time?: string | null;
          check_out_time?: string | null;
          total_guests?: number;
          status?: string;
          created_at?: string;
        };
      };
      reservation_room: {
        Row: {
          reservation_id: number;
          room_number: string;
        };
        Insert: {
          reservation_id: number;
          room_number: string;
        };
        Update: {
          reservation_id?: number;
          room_number?: string;
        };
      };
      reservation_staff: {
        Row: {
          reservation_id: number;
          staff_id: number;
        };
        Insert: {
          reservation_id: number;
          staff_id: number;
        };
        Update: {
          reservation_id?: number;
          staff_id?: number;
        };
      };
      payments: {
        Row: {
          payment_id: number;
          reservation_id: number;
          payment_date: string;
          amount_paid: number;
          payment_method: string;
          transaction_id: string | null;
        };
        Insert: {
          payment_id?: number;
          reservation_id: number;
          payment_date?: string;
          amount_paid: number;
          payment_method: string;
          transaction_id?: string | null;
        };
        Update: {
          payment_id?: number;
          reservation_id?: number;
          payment_date?: string;
          amount_paid?: number;
          payment_method?: string;
          transaction_id?: string | null;
        };
      };
    };
  };
}
