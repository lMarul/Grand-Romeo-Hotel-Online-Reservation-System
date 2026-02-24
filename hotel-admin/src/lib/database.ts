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
  AccountProfile,
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
      .insert(guest as any)
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
      .insert(room as any)
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

  async getAllIncludingFrontDesk(): Promise<Staff[]> {
    // Get regular staff
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .order('staff_id', { ascending: true });
    if (staffError) throw staffError;

    // Get front desk users and transform them to staff format
    const { data: frontDeskData, error: frontDeskError } = await supabase
      .from('front_desk')
      .select('*')
      .order('front_desk_id', { ascending: true });
    if (frontDeskError) throw frontDeskError;

    // Transform front desk to staff format
    const frontDeskAsStaff: Staff[] = (frontDeskData || []).map(fd => ({
      staff_id: fd.front_desk_id, // Use front_desk_id as staff_id for display
      first_name: fd.first_name,
      last_name: fd.last_name,
      role: 'Front Desk' as any,
      contact_number: fd.contact_number,
      email: fd.email,
      hire_date: fd.created_at,
      salary: null,
      // Include additional metadata to identify source
      _source: 'front_desk' as any,
      _original_id: fd.front_desk_id as any,
    }));

    // Combine both arrays
    return [...(staffData || []), ...frontDeskAsStaff];
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
      .insert(staff as any)
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
      special_requests?: string | null;
      status?: string;
    },
    roomNumbers: string[],
    staffIds: number[]
  ): Promise<Reservation> {
    // Insert reservation
    const { data: res, error: resError } = await supabase
      .from('reservations')
      .insert(reservation as any)
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
        .insert(roomInserts as any);
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
        .insert(staffInserts as any);
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
          .insert(roomInserts as any);
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
          .insert(staffInserts as any);
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
      .insert(payment as any)
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
  async getAll(): Promise<AccountProfile[]> {
    // Fetch from all three user tables and combine
    const [adminsRes, frontDeskRes, guestsRes] = await Promise.all([
      supabase.from('admins').select('*').order('created_at', { ascending: false }),
      supabase.from('front_desk').select('*').order('created_at', { ascending: false }),
      supabase.from('guests').select('*').order('created_at', { ascending: false }),
    ]);

    if (adminsRes.error) throw adminsRes.error;
    if (frontDeskRes.error) throw frontDeskRes.error;
    if (guestsRes.error) throw guestsRes.error;

    // Transform to unified Profile format
    const profiles: AccountProfile[] = [
      ...(adminsRes.data || []).map(admin => ({
        id: `admin_${admin.admin_id}`,
        full_name: `${admin.first_name} ${admin.last_name}`,
        email: admin.email,
        role: 'admin' as UserRole,
        created_at: admin.created_at,
        contact_number: admin.contact_number,
        username: admin.username,
      })),
      ...(frontDeskRes.data || []).map(staff => ({
        id: `staff_${staff.front_desk_id}`,
        full_name: `${staff.first_name} ${staff.last_name}`,
        email: staff.email,
        role: 'staff' as UserRole,
        created_at: staff.created_at,
        contact_number: staff.contact_number,
        username: staff.username,
      })),
      ...(guestsRes.data || []).map(guest => ({
        id: `user_${guest.guest_id}`,
        full_name: `${guest.first_name} ${guest.last_name}`,
        email: guest.email,
        role: 'user' as UserRole,
        created_at: guest.created_at,
        contact_number: guest.contact_number,
        username: guest.username,
      })),
    ];

    return profiles;
  },

  async getById(id: string): Promise<AccountProfile> {
    const [type, idStr] = id.split('_');
    const numId = parseInt(idStr);

    if (type === 'admin') {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('admin_id', numId)
        .single();
      if (error) throw error;
      return {
        id: `admin_${data.admin_id}`,
        full_name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        role: 'admin' as UserRole,
        created_at: data.created_at,
        contact_number: data.contact_number,
        username: data.username,
      };
    } else if (type === 'staff') {
      const { data, error } = await supabase
        .from('front_desk')
        .select('*')
        .eq('front_desk_id', numId)
        .single();
      if (error) throw error;
      return {
        id: `staff_${data.front_desk_id}`,
        full_name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        role: 'staff' as UserRole,
        created_at: data.created_at,
        contact_number: data.contact_number,
        username: data.username,
      };
    } else {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('guest_id', numId)
        .single();
      if (error) throw error;
      return {
        id: `user_${data.guest_id}`,
        full_name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        role: 'user' as UserRole,
        created_at: data.created_at,
        contact_number: data.contact_number,
        username: data.username,
      };
    }
  },

  async updateRole(id: string, newRole: UserRole): Promise<AccountProfile> {
    const [currentType, idStr] = id.split('_');
    const numId = parseInt(idStr);

    // Get current user data
    let userData: any;
    if (currentType === 'admin') {
      const { data, error } = await supabase.from('admins').select('*').eq('admin_id', numId).single();
      if (error) throw error;
      userData = data;
    } else if (currentType === 'staff') {
      const { data, error } = await supabase.from('front_desk').select('*').eq('front_desk_id', numId).single();
      if (error) throw error;
      userData = data;
    } else {
      const { data, error } = await supabase.from('guests').select('*').eq('guest_id', numId).single();
      if (error) throw error;
      userData = data;
    }

    // If role hasn't changed, return current profile
    const roleMap = { admin: 'admin', staff: 'staff', user: 'user' };
    if (roleMap[currentType as keyof typeof roleMap] === newRole) {
      return {
        id,
        full_name: `${userData.first_name} ${userData.last_name}`,
        email: userData.email,
        role: newRole,
        created_at: userData.created_at,
        contact_number: userData.contact_number,
        username: userData.username,
      };
    }

    // Delete from current table
    if (currentType === 'admin') {
      await supabase.from('admins').delete().eq('admin_id', numId);
    } else if (currentType === 'staff') {
      await supabase.from('front_desk').delete().eq('front_desk_id', numId);
    } else {
      await supabase.from('guests').delete().eq('guest_id', numId);
    }

    // Insert into new table
    const baseData = {
      username: userData.username,
      password: userData.password,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      contact_number: userData.contact_number,
    };

    let newData: any;
    if (newRole === 'admin') {
      const { data, error } = await supabase.from('admins').insert(baseData).select().single();
      if (error) throw error;
      newData = data;
      return {
        id: `admin_${newData.admin_id}`,
        full_name: `${newData.first_name} ${newData.last_name}`,
        email: newData.email,
        role: 'admin',
        created_at: newData.created_at,
        contact_number: newData.contact_number,
        username: newData.username,
      };
    } else if (newRole === 'staff') {
      const { data, error } = await supabase.from('front_desk').insert(baseData).select().single();
      if (error) throw error;
      newData = data;
      return {
        id: `staff_${newData.front_desk_id}`,
        full_name: `${newData.first_name} ${newData.last_name}`,
        email: newData.email,
        role: 'staff',
        created_at: newData.created_at,
        contact_number: newData.contact_number,
        username: newData.username,
      };
    } else {
      const guestData = {
        ...baseData,
        street: userData.street || null,
        city: userData.city || null,
        state_province: userData.state_province || null,
        zip_code: userData.zip_code || null,
        country: userData.country || null,
      };
      const { data, error } = await supabase.from('guests').insert(guestData).select().single();
      if (error) throw error;
      newData = data;
      return {
        id: `user_${newData.guest_id}`,
        full_name: `${newData.first_name} ${newData.last_name}`,
        email: newData.email,
        role: 'user',
        created_at: newData.created_at,
        contact_number: newData.contact_number,
        username: newData.username,
      };
    }
  },

  async search(query: string): Promise<AccountProfile[]> {
    const allProfiles = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return allProfiles.filter(profile =>
      profile.full_name?.toLowerCase().includes(lowerQuery) ||
      profile.email?.toLowerCase().includes(lowerQuery) ||
      profile.username?.toLowerCase().includes(lowerQuery)
    );
  },
};
