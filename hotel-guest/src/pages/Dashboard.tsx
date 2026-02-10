import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { StatCard, RecentReservations, RoomStatusGrid } from '@/components/dashboard';
import { dashboardService, reservationService, roomService } from '@/lib/database';
import type { DashboardStats, Reservation, Room } from '@/types/hotel';
import { Users, BedDouble, CalendarCheck, DollarSign, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, resData, roomData] = await Promise.all([
          dashboardService.getStats(),
          reservationService.getAll(),
          roomService.getAll(),
        ]);
        setStats(statsData);
        setReservations(resData);
        setRooms(roomData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data. Please check your database connection.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Loading...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !stats) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Error">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-lg text-destructive mb-4">{error || 'Failed to load data'}</p>
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

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back! Here's what's happening today.">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Monthly Revenue"
          value={`₱${stats.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          subtitle="this month"
          variant="primary"
        />
        <StatCard
          title="Available Rooms"
          value={stats.availableRooms}
          subtitle={`of ${stats.totalRooms} total rooms`}
          icon={BedDouble}
          variant="success"
        />
        <StatCard
          title="Active Reservations"
          value={stats.activeReservations}
          icon={CalendarCheck}
          subtitle="current"
        />
        <StatCard
          title="Registered Guests"
          value={stats.totalGuests}
          icon={Users}
          subtitle="total"
        />
      </div>

      {/* Today's Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <ArrowDownRight className="w-5 h-5 text-success" />
            <span className="text-sm text-muted-foreground">Today's Check-ins</span>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{stats.todayCheckIns}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <ArrowUpRight className="w-5 h-5 text-info" />
            <span className="text-sm text-muted-foreground">Today's Check-outs</span>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">{stats.todayCheckOuts}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-2">
            <BedDouble className="w-5 h-5 text-warning" />
            <span className="text-sm text-muted-foreground">Occupancy Rate</span>
          </div>
          <p className="text-3xl font-display font-bold text-foreground">
            {stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentReservations reservations={reservations} />
        <RoomStatusGrid rooms={rooms} />
      </div>
    </DashboardLayout>
  );
}
