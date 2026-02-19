import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { StatCard } from '@/components/dashboard';
import { reservationService, roomService } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import type { Reservation, Room } from '@/types/hotel';
import { BedDouble, CalendarCheck, Clock, CheckCircle2, Loader2, LogIn } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const statusStyles: Record<string, string> = {
  'Reserved': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Checked-In': 'bg-green-500/10 text-green-500 border-green-500/20',
  'Checked-Out': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  'Cancelled': 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const [resData, roomData] = await Promise.all([
          reservationService.getByGuestId(user.guest_id),
          roomService.getAvailable(),
        ]);
        setMyReservations(resData);
        setAvailableRooms(roomData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load your data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Error">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-lg text-destructive mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const activeBookings = myReservations.filter(r => r.status === 'Reserved' || r.status === 'Checked-In');
  const upcomingReservation = activeBookings.find(r => r.status === 'Reserved');
  const checkedIn = activeBookings.find(r => r.status === 'Checked-In');

  return (
    <DashboardLayout title="Dashboard" subtitle={`Welcome back, ${user?.first_name || 'Guest'}! Here's your booking overview.`}>
      {/* Guest Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="My Bookings"
          value={myReservations.length}
          icon={CalendarCheck}
          subtitle="total reservations"
          variant="primary"
        />
        <StatCard
          title="Active Bookings"
          value={activeBookings.length}
          icon={Clock}
          subtitle="reserved or checked-in"
          variant="success"
        />
        <StatCard
          title="Available Rooms"
          value={availableRooms.length}
          icon={BedDouble}
          subtitle="ready to book"
        />
      </div>

      {/* Current Stay / Upcoming */}
      {checkedIn && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <LogIn className="w-5 h-5 text-green-500" />
            <h3 className="font-display text-lg font-semibold text-green-700">Currently Checked In</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground font-medium">
                Room {checkedIn.rooms?.[0]?.room_number || 'N/A'} — {checkedIn.rooms?.[0]?.room?.room_type || ''}
              </p>
              <p className="text-sm text-muted-foreground">
                Check-out: {format(new Date(checkedIn.check_out_date), 'MMM d, yyyy')}
              </p>
            </div>
            <Badge variant="outline" className={cn("border", statusStyles['Checked-In'])}>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Checked In
            </Badge>
          </div>
        </div>
      )}

      {upcomingReservation && !checkedIn && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <CalendarCheck className="w-5 h-5 text-blue-500" />
            <h3 className="font-display text-lg font-semibold text-blue-700">Upcoming Reservation</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground font-medium">
                Room {upcomingReservation.rooms?.[0]?.room_number || 'N/A'} — {upcomingReservation.rooms?.[0]?.room?.room_type || ''}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(upcomingReservation.check_in_date), 'MMM d')} - {format(new Date(upcomingReservation.check_out_date), 'MMM d, yyyy')}
              </p>
            </div>
            <Badge variant="outline" className={cn("border", statusStyles['Reserved'])}>
              <Clock className="w-3 h-3 mr-1" />
              Reserved
            </Badge>
          </div>
        </div>
      )}

      {/* My Recent Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-display text-lg font-semibold">My Recent Reservations</h3>
            <p className="text-sm text-muted-foreground">Your latest bookings</p>
          </div>
          <div className="divide-y divide-border">
            {myReservations.length === 0 ? (
              <div className="p-8 text-center">
                <CalendarCheck className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No reservations yet</p>
                <button
                  onClick={() => navigate('/rooms')}
                  className="mt-3 text-sm text-primary hover:underline"
                >
                  Browse rooms to get started
                </button>
              </div>
            ) : (
              myReservations.slice(0, 5).map((reservation) => (
                <div key={reservation.reservation_id} className="p-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        Reservation #{reservation.reservation_id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Room {reservation.rooms?.[0]?.room_number || 'N/A'} • {format(new Date(reservation.check_in_date), 'MMM d')} - {format(new Date(reservation.check_out_date), 'MMM d')}
                      </p>
                    </div>
                    <Badge variant="outline" className={cn("border", statusStyles[reservation.status])}>
                      {reservation.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available Rooms Preview */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-display text-lg font-semibold">Available Rooms</h3>
            <p className="text-sm text-muted-foreground">Rooms you can book now</p>
          </div>
          <div className="divide-y divide-border">
            {availableRooms.slice(0, 5).map((room) => (
              <div key={room.room_number} className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Room {room.room_number}</p>
                    <p className="text-sm text-muted-foreground">{room.room_type} • Fits {room.capacity} guests</p>
                  </div>
                  <span className="font-display text-lg font-semibold text-primary">
                    ₱{Number(room.daily_rate).toLocaleString()}<span className="text-xs text-muted-foreground font-normal">/night</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
          {availableRooms.length > 5 && (
            <div className="p-4 border-t border-border text-center">
              <button onClick={() => navigate('/rooms')} className="text-sm text-primary hover:underline">
                View all {availableRooms.length} available rooms →
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
