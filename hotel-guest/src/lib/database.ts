// Database service layer - Guest Portal
// Only exposes data that a guest should be able to access

import { supabase } from '@/lib/supabase';
import type {
  Guest,
  Room,
  Reservation,
  Payment,
} from '@/types/hotel';

// =====================
// ROOMS (Guest: read-only, available rooms only)
// =====================
export const roomService = {
  async getAvailable(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('status', 'Available')
      .order('room_number');
    if (error) throw error;
    return data as Room[];
  },

  async getAll(): Promise<Room[]> {
    // For guest portal, "getAll" still only returns available rooms
    return this.getAvailable();
  },

  async getByNumber(roomNumber: string): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_number', roomNumber)
      .single();
    if (error) throw error;
    return data as Room;
  },
};

// =====================
// RESERVATIONS (Guest: own reservations only)
// =====================
export const reservationService = {
  // Get only the logged-in guest's reservations (server-side filter)
  async getByGuestId(guestId: number): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        guest:guests(first_name, last_name, contact_number),
        rooms:reservation_room(
          reservation_id,
          room_number,
          room:rooms(*)
        )
      `)
      .eq('guest_id', guestId)
      .order('reservation_id', { ascending: false });
    if (error) throw error;
    return data as unknown as Reservation[];
  },

  async getById(id: number): Promise<Reservation> {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        guest:guests(first_name, last_name, contact_number),
        rooms:reservation_room(
          reservation_id,
          room_number,
          room:rooms(*)
        )
      `)
      .eq('reservation_id', id)
      .single();
    if (error) throw error;
    return data as unknown as Reservation;
  },

  async create(
    reservation: {
      guest_id: number;
      check_in_date: string;
      check_out_date: string;
      total_guests: number;
      status?: string;
    },
    roomNumbers: string[],
    staffIds: number[]
  ): Promise<Reservation> {
    // Insert reservation
    const { data: res, error: resError } = await supabase
      .from('reservations')
      .insert(reservation)
      .select()
      .single();
    if (resError) throw resError;

    const resId = (res as any).reservation_id;

    // Insert room assignments
    if (roomNumbers.length > 0) {
      const roomInserts = roomNumbers.map((rn) => ({
        reservation_id: resId,
        room_number: rn,
      }));
      const { error: roomError } = await supabase
        .from('reservation_room')
        .insert(roomInserts);
      if (roomError) throw roomError;

      // Update room status to Reserved
      for (const rn of roomNumbers) {
        await supabase
          .from('rooms')
          .update({ status: 'Reserved' })
          .eq('room_number', rn);
      }
    }

    return this.getById(resId);
  },

  // Guest can cancel their own reservation
  async cancel(id: number): Promise<void> {
    // Free up rooms
    const { data: rooms } = await supabase
      .from('reservation_room')
      .select('room_number')
      .eq('reservation_id', id);
    if (rooms) {
      for (const r of rooms) {
        await supabase
          .from('rooms')
          .update({ status: 'Available' })
          .eq('room_number', r.room_number);
      }
    }

    const { error } = await supabase
      .from('reservations')
      .update({ status: 'Cancelled' })
      .eq('reservation_id', id);
    if (error) throw error;
  },
};

// =====================
// PAYMENTS (Guest: own payments only)
// =====================
export const paymentService = {
  async getByReservation(reservationId: number): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('reservation_id', reservationId)
      .order('payment_date');
    if (error) throw error;
    return data as Payment[];
  },
};

// =====================
// GUEST PROFILE (Guest: own profile only)
// =====================
export const guestService = {
  async updateProfile(
    guestId: number,
    data: {
      first_name: string;
      last_name: string;
      email: string;
      contact_number: string | null;
      street: string | null;
      city: string | null;
      state_province: string | null;
      zip_code: string | null;
      country: string | null;
    }
  ): Promise<Guest> {
    const { data: updated, error } = await supabase
      .from('guests')
      .update(data)
      .eq('guest_id', guestId)
      .select()
      .single();
    if (error) throw error;
    return updated as Guest;
  },
};

