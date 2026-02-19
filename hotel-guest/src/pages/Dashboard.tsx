import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { StatCard } from '@/components/dashboard';
import { reservationService, roomService } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import type { Reservation, Room } from '@/types/hotel';
import { ROOM_TYPE_DATA, ROOM_TYPES_ORDER } from '@/data/roomTypes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, differenceInDays, isAfter, isBefore, isToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  BedDouble,
  CalendarCheck,
  Clock,
  CheckCircle2,
  Loader2,
  LogIn,
  ArrowRight,
  Sparkles,
  Star,
  MapPin,
  Phone,
  Wifi,
  UtensilsCrossed,
  Dumbbell,
  ShieldCheck,
  Users,
  Maximize,
  CalendarDays,
  CreditCard,
} from 'lucide-react';

const statusStyles: Record<string, string> = {
  Reserved: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'Checked-In': 'bg-green-500/10 text-green-500 border-green-500/20',
  'Checked-Out': 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  Cancelled: 'bg-red-500/10 text-red-500 border-red-500/20',
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

  const activeBookings = myReservations.filter(
    (r) => r.status === 'Reserved' || r.status === 'Checked-In'
  );
  const upcomingReservation = activeBookings.find(
    (r) => r.status === 'Reserved'
  );
  const checkedIn = activeBookings.find((r) => r.status === 'Checked-In');
  const completedStays = myReservations.filter(
    (r) => r.status === 'Checked-Out'
  ).length;

  // Group available rooms by type for room showcase
  const roomsByType = availableRooms.reduce(
    (acc, room) => {
      if (!acc[room.room_type]) acc[room.room_type] = [];
      acc[room.room_type].push(room);
      return acc;
    },
    {} as Record<string, Room[]>
  );

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={`Welcome back, ${user?.first_name || 'Guest'}`}
    >
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sidebar via-sidebar/95 to-sidebar/90 p-8 lg:p-10 mb-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzMuMzEzIDAgNi0yLjY4NyA2LTZIMGY2IDAgNi0yLjY4NyA2LTZzLTIuNjg3LTYtNi02LTYgMi42ODctNiA2IDIuNjg3IDYgNiA2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium uppercase tracking-wider">
              Grand Romeo Hotel
            </span>
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-2">
            Welcome back, {user?.first_name}!
          </h2>
          <p className="text-white/70 text-lg max-w-xl mb-6">
            Experience world-class hospitality. Manage your reservations, explore
            our rooms, and make your next stay unforgettable.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/my-reservations')}
              className="bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold h-11"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Book a Room
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/rooms')}
              className="bg-white/10 hover:bg-white/20 text-white border-0 h-11"
            >
              <BedDouble className="w-4 h-4 mr-2" />
              Browse Rooms
            </Button>
          </div>
        </div>
      </div>

      {/* Current Stay Banner */}
      {checkedIn && (
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-6 mb-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-8 -mt-8" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <LogIn className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-emerald-800">
                  You're Currently Checked In
                </h3>
                <p className="text-emerald-700 font-medium mt-1">
                  Room {checkedIn.rooms?.[0]?.room_number || 'N/A'} —{' '}
                  {checkedIn.rooms?.[0]?.room?.room_type || ''}{' '}
                  {checkedIn.rooms?.[0]?.room?.room_type === 'Presidential'
                    ? 'Suite'
                    : 'Room'}
                </p>
                <p className="text-sm text-emerald-600/80 mt-0.5">
                  Check-out:{' '}
                  {format(
                    new Date(checkedIn.check_out_date),
                    'EEEE, MMMM d, yyyy'
                  )}{' '}
                  •{' '}
                  {differenceInDays(
                    new Date(checkedIn.check_out_date),
                    new Date()
                  )}{' '}
                  night(s) remaining
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border bg-emerald-500/20 text-emerald-700 border-emerald-500/30 px-3 py-1.5"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Active Stay
            </Badge>
          </div>
        </div>
      )}

      {upcomingReservation && !checkedIn && (
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-6 mb-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-8 -mt-8" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <CalendarCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-blue-800">
                  Upcoming Reservation
                </h3>
                <p className="text-blue-700 font-medium mt-1">
                  Room{' '}
                  {upcomingReservation.rooms?.[0]?.room_number || 'N/A'} —{' '}
                  {upcomingReservation.rooms?.[0]?.room?.room_type || ''}{' '}
                  {upcomingReservation.rooms?.[0]?.room?.room_type ===
                  'Presidential'
                    ? 'Suite'
                    : 'Room'}
                </p>
                <p className="text-sm text-blue-600/80 mt-0.5">
                  {format(
                    new Date(upcomingReservation.check_in_date),
                    'MMMM d'
                  )}{' '}
                  —{' '}
                  {format(
                    new Date(upcomingReservation.check_out_date),
                    'MMMM d, yyyy'
                  )}{' '}
                  •{' '}
                  {differenceInDays(
                    new Date(upcomingReservation.check_in_date),
                    new Date()
                  )}{' '}
                  day(s) until check-in
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="border bg-blue-500/20 text-blue-700 border-blue-500/30 px-3 py-1.5"
            >
              <Clock className="w-4 h-4 mr-1.5" />
              Confirmed
            </Badge>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
          title="Completed Stays"
          value={completedStays}
          icon={CheckCircle2}
          subtitle="checked out"
        />
        <StatCard
          title="Available Rooms"
          value={availableRooms.length}
          icon={BedDouble}
          subtitle="ready to book"
        />
      </div>

      {/* Room Categories Showcase */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display text-xl font-bold">
              Explore Our Accommodations
            </h3>
            <p className="text-sm text-muted-foreground">
              From comfortable rooms to luxurious suites
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/rooms')}
          >
            View All Rooms
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROOM_TYPES_ORDER.map((type) => {
            const info = ROOM_TYPE_DATA[type];
            const count = roomsByType[type]?.length || 0;
            const lowestRate = roomsByType[type]
              ? Math.min(...roomsByType[type].map((r) => Number(r.daily_rate)))
              : 0;
            return (
              <div
                key={type}
                className="group relative overflow-hidden rounded-xl border border-border bg-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate('/rooms')}
              >
                <div
                  className={cn(
                    'h-24 bg-gradient-to-br flex items-center justify-center',
                    info.gradient
                  )}
                >
                  <div className="text-center text-white">
                    <Star className="w-5 h-5 mx-auto mb-1 text-amber-300 fill-amber-300" />
                    <span className="text-xs uppercase tracking-wider opacity-80">
                      {info.tagline}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-display text-lg font-semibold">
                    {type === 'Presidential' ? 'Presidential Suite' : `${type} Room`}
                  </h4>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Maximize className="w-3 h-3" />
                      {info.floorArea}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {info.maxOccupancy}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <div>
                      {count > 0 ? (
                        <span className="text-xs text-emerald-600 font-medium">
                          {count} available
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Fully booked
                        </span>
                      )}
                    </div>
                    <span className="font-display text-lg font-bold text-primary">
                      {info.priceRange}
                      <span className="text-xs text-muted-foreground font-normal">
                        /night
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Reservations & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reservations - 2 cols */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">
                My Reservations
              </h3>
              <p className="text-sm text-muted-foreground">
                Your booking history
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/my-reservations')}
            >
              View All
            </Button>
          </div>
          <div className="divide-y divide-border">
            {myReservations.length === 0 ? (
              <div className="p-10 text-center">
                <CalendarCheck className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <h4 className="font-display text-lg font-semibold text-muted-foreground mb-1">
                  No reservations yet
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Start your journey with Grand Romeo Hotel
                </p>
                <Button
                  onClick={() => navigate('/rooms')}
                  className="bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold"
                >
                  Browse Rooms
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              myReservations.slice(0, 5).map((reservation) => {
                const roomType =
                  reservation.rooms?.[0]?.room?.room_type || 'Standard';
                const info = ROOM_TYPE_DATA[roomType];
                return (
                  <div
                    key={reservation.reservation_id}
                    className="p-4 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0',
                          info?.gradient || 'from-slate-600 to-slate-800'
                        )}
                      >
                        <BedDouble className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground">
                            Room{' '}
                            {reservation.rooms?.[0]?.room_number || 'N/A'}{' '}
                            <span className="text-muted-foreground font-normal">
                              • {roomType}{' '}
                              {roomType === 'Presidential'
                                ? 'Suite'
                                : 'Room'}
                            </span>
                          </p>
                          <Badge
                            variant="outline"
                            className={cn(
                              'border ml-2 shrink-0',
                              statusStyles[reservation.status]
                            )}
                          >
                            {reservation.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {format(
                            new Date(reservation.check_in_date),
                            'MMM d'
                          )}{' '}
                          —{' '}
                          {format(
                            new Date(reservation.check_out_date),
                            'MMM d, yyyy'
                          )}{' '}
                          •{' '}
                          {differenceInDays(
                            new Date(reservation.check_out_date),
                            new Date(reservation.check_in_date)
                          )}{' '}
                          night(s) •{' '}
                          {reservation.total_guests} guest(s)
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Hotel Services & Info */}
        <div className="space-y-6">
          {/* Direct Booking Benefits */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 rounded-xl border border-amber-200/50 dark:border-amber-800/30 p-5">
            <h4 className="font-display text-base font-semibold mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Direct Booking Benefits
            </h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Best rate guarantee when you book direct</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Flexible cancellation policy</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Complimentary early check-in (subject to availability)</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Priority room upgrades for returning guests</span>
              </li>
            </ul>
          </div>

          {/* Hotel Facilities */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="font-display text-base font-semibold mb-3">
              Hotel Facilities
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Wifi, label: 'Free WiFi' },
                { icon: UtensilsCrossed, label: 'Restaurant' },
                { icon: Dumbbell, label: 'Fitness Center' },
                { icon: CreditCard, label: 'Concierge' },
              ].map((facility) => (
                <div
                  key={facility.label}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-secondary/50 text-sm"
                >
                  <facility.icon className="w-4 h-4 text-primary shrink-0" />
                  {facility.label}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-card rounded-xl border border-border p-5">
            <h4 className="font-display text-base font-semibold mb-3">
              Need Assistance?
            </h4>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span>+63 (2) 8888 7777</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Manila, Philippines</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Our front desk team is available 24/7
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
