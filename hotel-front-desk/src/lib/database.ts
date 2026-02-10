// Database service layer - All Supabase CRUD operations
// Matches the DATAMA2 Finals Paper schema exactly

import { supabase } from '@/lib/supabase';
import type {
  Guest,
  Room,
  Staff,
  Reservation,
  Payment,
  DashboardStats,
  Profile,
  UserRole,
} from '@/types/hotel';

// =====================
// GUESTS
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

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('guest_id', id);
    if (error) throw error;
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
};

// =====================
// ROOMS
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
// STAFF
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

  async create(staff: Omit<Staff, 'staff_id'>): Promise<Staff> {
    const { data, error } = await supabase
      .from('staff')
      .insert(staff)
      .select()
      .single();
    if (error) throw error;
    return data as Staff;
  },

  async update(id: number, updates: Partial<Staff>): Promise<Staff> {
    const { data, error } = await supabase
      .from('staff')
      .update(updates)
      .eq('staff_id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Staff;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('staff_id', id);
    if (error) throw error;
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
// DASHBOARD STATS
// =====================
export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString().split('T')[0];

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
      supabase.from('payments').select('amount_paid').gte('payment_date', monthStart),
    ]);

    const allRooms = rooms || [];
    const availableRooms = allRooms.filter((r: any) => r.status === 'Available').length;
    const occupiedRooms = allRooms.filter((r: any) => r.status === 'Occupied').length;
    const monthlyRevenue = (monthlyPayments || []).reduce(
      (sum: number, p: any) => sum + Number(p.amount_paid),
      0
    );

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

// =====================
// PDF QUERY DEMONSTRATIONS
// These replicate the SQL queries from the DATAMA2 paper
// =====================
export const queryDemos = {
  // Query 1: List all guests and their reservations
  async guestsWithReservations() {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        reservation_id,
        check_in_date,
        check_out_date,
        status,
        guest:guests(first_name, last_name)
      `)
      .order('reservation_id');
    if (error) throw error;
    return data;
  },

  // Query 2: Show all available rooms with rates
  async availableRoomsWithRates() {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('status', 'Available');
    if (error) throw error;
    return data;
  },

  // Query 3: Guests currently checked in
  async checkedInGuests() {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        guest:guests(guest_id, first_name, last_name)
      `)
      .eq('status', 'Checked-In');
    if (error) throw error;
    return data;
  },

  // Query 4: Total amount spent by each guest
  async totalSpentByGuest() {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        amount_paid,
        reservation:reservations(
          guest:guests(first_name, last_name)
        )
      `);
    if (error) throw error;
    return data;
  },

  // Query 5: Staff and reservations handled
  async staffReservationCount() {
    const { data, error } = await supabase
      .from('reservation_staff')
      .select(`
        staff:staff(first_name, last_name),
        reservation_id
      `);
    if (error) throw error;
    return data;
  },
};

// =====================
// PROFILES (User Accounts)
// =====================
export const profileService = {
  async getAll(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Profile[];
  },

  async getById(id: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Profile;
  },

  async updateRole(id: string, role: UserRole): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  },

  async search(query: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('full_name', `%${query}%`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Profile[];
  },
};
