// Database service layer - Front Desk Portal
// Front desk staff can manage reservations, view guests/rooms, process payments
// But cannot: manage staff, manage accounts, delete rooms/guests, or see profiles

import { supabase } from '@/lib/supabase';
import type {
  Guest,
  Room,
  Staff,
  Reservation,
  Payment,
  DashboardStats,
} from '@/types/hotel';

// =====================
// GUESTS (Front Desk: read + create, no delete)
// =====================
export const guestService = {
  async getAll(): Promise<Guest[]> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .order('guest_id', { ascending: true });
    if (error) throw error;
    return data as Guest[];
  },

  async getById(id: number): Promise<Guest> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('guest_id', id)
      .single();
    if (error) throw error;
    return data as Guest;
  },

  async create(guest: Omit<Guest, 'guest_id'>): Promise<Guest> {
    const { data, error } = await supabase
      .from('guests')
      .insert(guest)
      .select()
      .single();
    if (error) throw error;
    return data as Guest;
  },

  async update(id: number, updates: Partial<Guest>): Promise<Guest> {
    const { data, error } = await supabase
      .from('guests')
      .update(updates)
      .eq('guest_id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Guest;
  },

  async search(query: string): Promise<Guest[]> {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,contact_number.ilike.%${query}%`)
      .order('guest_id');
    if (error) throw error;
    return data as Guest[];
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('guest_id', id);
    if (error) throw error;
  },
};

// =====================
// ROOMS (Front Desk: full management)
// =====================
export const roomService = {
  async getAll(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number', { ascending: true });
    if (error) throw error;
    return data as Room[];
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

  async getAvailable(): Promise<Room[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('status', 'Available')
      .order('room_number');
    if (error) throw error;
    return data as Room[];
  },

  async create(room: Room): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .insert(room)
      .select()
      .single();
    if (error) throw error;
    return data as Room;
  },

  async update(roomNumber: string, updates: Partial<Room>): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('room_number', roomNumber)
      .select()
      .single();
    if (error) throw error;
    return data as Room;
  },

  async delete(roomNumber: string): Promise<void> {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('room_number', roomNumber);
    if (error) throw error;
  },
};

// =====================
// STAFF (Front Desk: read-only for assignment to reservations)
// =====================
export const staffService = {
  async getAll(): Promise<Staff[]> {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .order('staff_id', { ascending: true });
    if (error) throw error;
    return data as Staff[];
  },

  async getById(id: number): Promise<Staff> {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('staff_id', id)
      .single();
    if (error) throw error;
    return data as Staff;
  },
};

// =====================
// RESERVATIONS (with JOINs)
// =====================
export const reservationService = {
  async getAll(): Promise<Reservation[]> {
    // Get reservations with guest data
    const { data: reservations, error: resError } = await supabase
      .from('reservations')
      .select(`
        *,
        guest:guests(*),
        rooms:reservation_room(
          reservation_id,
          room_number,
          room:rooms(*)
        ),
        staff:reservation_staff(
          reservation_id,
          staff_id,
          staff:staff(*)
        )
      `)
      .order('reservation_id', { ascending: false });
    if (resError) throw resError;
    return reservations as unknown as Reservation[];
  },

  async getById(id: number): Promise<Reservation> {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        guest:guests(*),
        rooms:reservation_room(
          reservation_id,
          room_number,
          room:rooms(*)
        ),
        staff:reservation_staff(
          reservation_id,
          staff_id,
          staff:staff(*)
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
      special_requests?: string | null;
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

    // Insert staff assignments
    if (staffIds.length > 0) {
      const staffInserts = staffIds.map((sid) => ({
        reservation_id: resId,
        staff_id: sid,
      }));
      const { error: staffError } = await supabase
        .from('reservation_staff')
        .insert(staffInserts);
      if (staffError) throw staffError;
    }

    return this.getById(resId);
  },

  async update(
    id: number,
    reservation: {
      guest_id?: number;
      check_in_date?: string;
      check_out_date?: string;
      total_guests?: number;
      special_requests?: string | null;
    },
    roomNumbers?: string[],
    staffIds?: number[]
  ): Promise<Reservation> {
    // Update reservation basic info
    const { error: resError } = await supabase
      .from('reservations')
      .update(reservation)
      .eq('reservation_id', id);
    if (resError) throw resError;

    // Update room assignments if provided
    if (roomNumbers !== undefined) {
      // Get old rooms and free them
      const { data: oldRooms } = await supabase
        .from('reservation_room')
        .select('room_number')
        .eq('reservation_id', id);
      
      if (oldRooms) {
        for (const r of oldRooms) {
          await supabase
            .from('rooms')
            .update({ status: 'Available' })
            .eq('room_number', r.room_number);
        }
      }

      // Delete old room assignments
      await supabase
        .from('reservation_room')
        .delete()
        .eq('reservation_id', id);

      // Insert new room assignments
      if (roomNumbers.length > 0) {
        const roomInserts = roomNumbers.map((rn) => ({
          reservation_id: id,
          room_number: rn,
        }));
        const { error: roomError } = await supabase
          .from('reservation_room')
          .insert(roomInserts);
        if (roomError) throw roomError;

        // Update new room status to Reserved
        for (const rn of roomNumbers) {
          await supabase
            .from('rooms')
            .update({ status: 'Reserved' })
            .eq('room_number', rn);
        }
      }
    }

    // Update staff assignments if provided
    if (staffIds !== undefined) {
      // Delete old staff assignments
      await supabase
        .from('reservation_staff')
        .delete()
        .eq('reservation_id', id);

      // Insert new staff assignments
      if (staffIds.length > 0) {
        const staffInserts = staffIds.map((sid) => ({
          reservation_id: id,
          staff_id: sid,
        }));
        const { error: staffError } = await supabase
          .from('reservation_staff')
          .insert(staffInserts);
        if (staffError) throw staffError;
      }
    }

    return this.getById(id);
  },

  async updateStatus(id: number, status: string): Promise<void> {
    const updates: any = { status };

    if (status === 'Checked-In') {
      updates.check_in_time = new Date().toISOString();
      // Update room status to Occupied
      const { data: rooms } = await supabase
        .from('reservation_room')
        .select('room_number')
        .eq('reservation_id', id);
      if (rooms) {
        for (const r of rooms) {
          await supabase
            .from('rooms')
            .update({ status: 'Occupied' })
            .eq('room_number', r.room_number);
        }
      }
    }

    if (status === 'Checked-Out') {
      updates.check_out_time = new Date().toISOString();
      // Update room status to Available
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
    }

    if (status === 'Cancelled') {
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
    }

    if (status === 'No-Show') {
      // Free up rooms for no-show guests
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
    }

    const { error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('reservation_id', id);
    if (error) throw error;
  },

  async delete(id: number): Promise<void> {
    // Free up rooms first
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
      .delete()
      .eq('reservation_id', id);
    if (error) throw error;
  },
};

// =====================
// PAYMENTS
// =====================
export const paymentService = {
  async getAll(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        reservation:reservations(
          *,
          guest:guests(*)
        )
      `)
      .order('payment_id', { ascending: false });
    if (error) throw error;
    return data as unknown as Payment[];
  },

  async getByReservation(reservationId: number): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('reservation_id', reservationId)
      .order('payment_date');
    if (error) throw error;
    return data as Payment[];
  },

  async create(payment: Omit<Payment, 'payment_id' | 'reservation'>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();
    if (error) throw error;
    return data as Payment;
  },

  async update(id: number, updates: Partial<Payment>): Promise<Payment> {
    const { reservation, ...rest } = updates;
    const { data, error } = await supabase
      .from('payments')
      .update(rest)
      .eq('payment_id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Payment;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('payment_id', id);
    if (error) throw error;
  },
};

// =====================
// DASHBOARD STATS (Front Desk: operational stats, no revenue)
// =====================
export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = today.slice(0, 8) + '01';

    const [
      { count: totalGuests },
      { data: rooms },
      { data: activeRes },
      { data: todayCheckInsData },
      { data: todayCheckOutsData },
      { data: monthlyPayments },
    ] = await Promise.all([
      supabase.from('guests').select('*', { count: 'exact', head: true }),
      supabase.from('rooms').select('*'),
      supabase.from('reservations').select('*').in('status', ['Reserved', 'Checked-In']),
      supabase.from('reservations').select('*').eq('check_in_date', today),
      supabase.from('reservations').select('*').eq('check_out_date', today),
      supabase.from('payments').select('amount_paid, payment_date').gte('payment_date', monthStart).lte('payment_date', today),
    ]);

    const allRooms = rooms || [];
    const availableRooms = allRooms.filter((r: any) => r.status === 'Available').length;
    const occupiedRooms = allRooms.filter((r: any) => r.status === 'Occupied').length;
    const monthlyRevenue = (monthlyPayments || []).reduce((sum: number, p: any) => sum + Number(p.amount_paid), 0);

    return {
      totalGuests: totalGuests || 0,
      totalRooms: allRooms.length,
      availableRooms,
      occupiedRooms,
      activeReservations: (activeRes || []).length,
      todayCheckIns: (todayCheckInsData || []).length,
      todayCheckOuts: (todayCheckOutsData || []).length,
      monthlyRevenue,
    };
  },
};
