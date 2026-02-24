import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  CalendarCheck,
  Plus,
  BedDouble,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  LogIn,
  ArrowRight,
  Maximize,
  Users,
  Star,
  Ban,
  Eye,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { roomService, reservationService, paymentService } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import type { Room, Reservation, Payment } from '@/types/hotel';
import { ROOM_TYPE_DATA, ROOM_TYPES_ORDER, getRoomTypeInfo } from '@/data/roomTypes';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';

const statusConfig: Record<
  string,
  { label: string; icon: typeof Clock; color: string; bgColor: string }
> = {
  'Pending Payment': {
    label: 'Pending Payment',
    icon: Clock,
    color: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    bgColor: 'from-amber-500/5 to-amber-600/5 border-amber-500/20',
  },
  Confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    bgColor: 'from-emerald-500/5 to-emerald-600/5 border-emerald-500/20',
  },
  Reserved: {
    label: 'Reserved',
    icon: Clock,
    color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    bgColor: 'from-blue-500/5 to-blue-600/5 border-blue-500/20',
  },
  'Checked-In': {
    label: 'Checked In',
    icon: LogIn,
    color: 'bg-green-500/10 text-green-600 border-green-500/20',
    bgColor: 'from-green-500/5 to-green-600/5 border-green-500/20',
  },
  'Checked-Out': {
    label: 'Checked Out',
    icon: CheckCircle2,
    color: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    bgColor: 'from-gray-500/5 to-gray-600/5 border-gray-500/20',
  },
  Cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    bgColor: 'from-red-500/5 to-red-600/5 border-red-500/20',
  },
  'No-Show': {
    label: 'No-Show',
    icon: XCircle,
    color: 'bg-red-500/10 text-red-600 border-red-500/20',
    bgColor: 'from-red-500/5 to-red-600/5 border-red-500/20',
  },
  Refunded: {
    label: 'Refunded',
    icon: XCircle,
    color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    bgColor: 'from-purple-500/5 to-purple-600/5 border-purple-500/20',
  },
};

export default function MyReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allActiveReservations, setAllActiveReservations] = useState<Reservation[]>([]); // All active reservations for availability check
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    totalGuests: 1,
    specialRequests: '',
    selectedRoom: '',
    selectedRoomType: 'all',
    paymentMethod: 'Credit Card' as const,
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const roomsData = await roomService.getAll(); // Get all rooms
      setRooms(roomsData);
      if (user) {
        const myReservations = await reservationService.getByGuestId(
          user.guest_id
        );
        setReservations(myReservations);
      }

      // Fetch all active reservations for availability checking
      const allActiveData = await reservationService.getAllActive();
      setAllActiveReservations(allActiveData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if a room has a date conflict with existing reservations
  const isRoomAvailableForDates = (roomNumber: string, checkIn: string, checkOut: string): boolean => {
    if (!checkIn || !checkOut) return true; // If no dates selected, show all rooms

    const newCheckIn = new Date(checkIn);
    const newCheckOut = new Date(checkOut);

    // Find all reservations for this specific room
    for (const reservation of allActiveReservations) {
      // Check if this reservation includes the room we're checking
      const roomAssignments = reservation.rooms as any;
      if (!roomAssignments || !Array.isArray(roomAssignments)) continue;

      const hasThisRoom = roomAssignments.some((r: any) => r.room_number === roomNumber);
      if (!hasThisRoom) continue; // This reservation doesn't use this room

      const existingCheckIn = new Date(reservation.check_in_date);
      const existingCheckOut = new Date(reservation.check_out_date);

      // Check for date overlap
      // Two reservations conflict if: new_check_in < existing_check_out AND new_check_out > existing_check_in
      // However, if new_check_in === existing_check_out, that's OK (checkout day can be next check-in day)
      if (newCheckIn < existingCheckOut && newCheckOut > existingCheckIn) {
        return false; // Conflict found
      }
    }

    return true; // No conflicts
  };

  const availableRooms = rooms.filter((r) => {
    // Never show rooms in maintenance
    if (r.status === 'Maintenance') {
      return false;
    }

    // Filter by room type
    if (formData.selectedRoomType !== 'all' && r.room_type !== formData.selectedRoomType) {
      return false;
    }

    // Filter by date availability
    return isRoomAvailableForDates(r.room_number, formData.checkInDate, formData.checkOutDate);
  });

  const filteredAvailableRooms = availableRooms;

  const filteredReservations =
    filterStatus === 'all'
      ? reservations
      : reservations.filter((r) => r.status === filterStatus);

  const fetchPayments = async (reservationId: number) => {
    try {
      const paymentsData = await paymentService.getByReservation(reservationId);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleCreateReservation = async () => {
    if (
      !formData.checkInDate ||
      !formData.checkOutDate ||
      !formData.selectedRoom
    ) {
      toast({
        title: 'Missing information',
        description: 'Please select dates and a room',
        variant: 'destructive',
      });
      return;
    }

    if (new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
      toast({
        title: 'Invalid dates',
        description: 'Check-out date must be after check-in date',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to make a reservation',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      const newReservation = await reservationService.create(
        {
          guest_id: user.guest_id,
          check_in_date: formData.checkInDate,
          check_out_date: formData.checkOutDate,
          total_guests: formData.totalGuests,
          special_requests: formData.specialRequests || null,
          status: 'Reserved',
        },
        [formData.selectedRoom],
        []
      );

      // Create payment record
      const totalAmount = calculateTotal();
      await paymentService.create({
        reservation_id: newReservation.reservation_id,
        amount_paid: totalAmount,
        payment_method: formData.paymentMethod,
        transaction_id: `TXN${Date.now()}`,
      });

      await fetchData();
      setDialogOpen(false);
      setFormData({
        checkInDate: '',
        checkOutDate: '',
        totalGuests: 1,
        specialRequests: '',
        selectedRoom: '',
        selectedRoomType: 'all',
        paymentMethod: 'Credit Card',
      });

      toast({
        title: 'Reservation Confirmed!',
        description: `Booking #${newReservation.reservation_id} has been created successfully. Payment of ₱${totalAmount.toLocaleString()} processed.`,
      });
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      toast({
        title: 'Booking Failed',
        description: error?.message || 'Unable to complete your reservation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!selectedReservation) return;
    setSaving(true);
    try {
      await reservationService.cancel(selectedReservation.reservation_id);
      await fetchData();
      setCancelDialogOpen(false);
      setSelectedReservation(null);
      toast({
        title: 'Reservation Cancelled',
        description: `Booking #${selectedReservation.reservation_id} has been cancelled.`,
      });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel reservation.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedRoomDetails = rooms.find(
    (r) => r.room_number === formData.selectedRoom
  );
  const calculateNights = () => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    return differenceInDays(
      new Date(formData.checkOutDate),
      new Date(formData.checkInDate)
    );
  };
  const calculateTotal = () => {
    if (!selectedRoomDetails) return 0;
    const nights = calculateNights();
    return nights > 0 ? nights * Number(selectedRoomDetails.daily_rate) : 0;
  };

  const activeCount = reservations.filter(
    (r) => r.status === 'Reserved' || r.status === 'Checked-In'
  ).length;

  return (
    <DashboardLayout
      title="My Reservations"
      subtitle="Manage your bookings at Grand Romeo Hotel"
    >
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sidebar via-sidebar/95 to-sidebar/90 p-8 mb-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzMuMzEzIDAgNi0yLjY4NyA2LTZIMGY2IDAgNi0yLjY4NyA2LTZzLTIuNjg3LTYtNi02LTYgMi42ODctNiA2IDIuNjg3IDYgNiA2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-red-500" />
              <span className="text-red-500 text-sm font-medium uppercase tracking-wider">
                Reservations
              </span>
            </div>
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-sidebar-foreground mb-1">
              Your Booking Overview
            </h2>
            <p className="text-sidebar-foreground/70">
              {reservations.length} total booking{reservations.length !== 1 ? 's' : ''} •{' '}
              {activeCount} active
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-red hover:opacity-90 text-primary-foreground shadow-red h-11 shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Book a Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  Book Your Stay
                </DialogTitle>
                <DialogDescription>
                  Reserve your room at Grand Romeo Hotel
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto">
                {/* Guest Info (read-only) */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-red flex items-center justify-center text-primary-foreground text-sm font-semibold">
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkIn">Check-in Date *</Label>
                    <Input
                      id="checkIn"
                      type="date"
                      value={formData.checkInDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          checkInDate: e.target.value,
                          checkOutDate:
                            formData.checkOutDate &&
                            e.target.value >= formData.checkOutDate
                              ? ''
                              : formData.checkOutDate,
                        })
                      }
                      min={new Date().toISOString().split('T')[0]}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="checkOut">Check-out Date *</Label>
                    <Input
                      id="checkOut"
                      type="date"
                      value={formData.checkOutDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          checkOutDate: e.target.value,
                        })
                      }
                      min={
                        formData.checkInDate ||
                        new Date().toISOString().split('T')[0]
                      }
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guests">Number of Guests</Label>
                  <Input
                    id="guests"
                    type="number"
                    min={1}
                    max={10}
                    value={formData.totalGuests}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalGuests: parseInt(e.target.value) || 1,
                      })
                    }
                    className="h-10"
                  />
                </div>

                {/* Special Requests */}
                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Special Requests (optional)</Label>
                  <Textarea
                    id="specialRequests"
                    placeholder="e.g. Non-smoking room, extra bed, late check-in, airport transfer..."
                    value={formData.specialRequests}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialRequests: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>

                {/* Room Type Filter */}
                <div className="space-y-2">
                  <Label>Room Category</Label>
                  <Select
                    value={formData.selectedRoomType}
                    onValueChange={(val) =>
                      setFormData({
                        ...formData,
                        selectedRoomType: val,
                        selectedRoom: '',
                      })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Filter by room type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Room Types</SelectItem>
                      {ROOM_TYPES_ORDER.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}{' '}
                          {type === 'Presidential' ? 'Suite' : 'Room'} —{' '}
                          {ROOM_TYPE_DATA[type].priceRange}/night
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Room Selection */}
                <div className="space-y-2">
                  <Label htmlFor="room">Select Room *</Label>
                  <Select
                    value={formData.selectedRoom}
                    onValueChange={(val) =>
                      setFormData({ ...formData, selectedRoom: val })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Choose an available room" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredAvailableRooms.length === 0 ? (
                        <SelectItem value="_none" disabled>
                          {formData.checkInDate && formData.checkOutDate 
                            ? 'No rooms available for selected dates' 
                            : 'Please select dates first'}
                        </SelectItem>
                      ) : (
                        filteredAvailableRooms.map((room) => {
                          const info = getRoomTypeInfo(room.room_type);
                          return (
                            <SelectItem
                              key={room.room_number}
                              value={room.room_number}
                            >
                              Room {room.room_number} — {room.room_type} •{' '}
                              {info.floorArea} • ₱
                              {Number(room.daily_rate).toLocaleString()}/night
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Room Preview */}
                {selectedRoomDetails && (
                  <div
                    className={cn(
                      'rounded-xl p-4 bg-gradient-to-r text-sidebar-foreground',
                      getRoomTypeInfo(selectedRoomDetails.room_type).gradient
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-display text-lg font-bold">
                          Room {selectedRoomDetails.room_number}
                        </p>
                        <p className="text-sm text-sidebar-foreground/90">
                          {selectedRoomDetails.room_type}{' '}
                          {selectedRoomDetails.room_type === 'Presidential'
                            ? 'Suite'
                            : 'Room'}
                        </p>
                      </div>
                      <Star className="w-4 h-4 text-red-400 fill-red-400" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-sidebar-foreground/80 mt-1">
                      <span className="flex items-center gap-1">
                        <Maximize className="w-3 h-3" />{' '}
                        {getRoomTypeInfo(selectedRoomDetails.room_type).floorArea}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> Max{' '}
                        {selectedRoomDetails.capacity}
                      </span>
                      <span className="flex items-center gap-1">
                        <BedDouble className="w-3 h-3" />{' '}
                        {getRoomTypeInfo(selectedRoomDetails.room_type).bedType}
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) =>
                      setFormData({ ...formData, paymentMethod: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Debit Card">Debit Card</SelectItem>
                      <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cost Summary */}
                {selectedRoomDetails &&
                  formData.checkInDate &&
                  formData.checkOutDate &&
                  calculateNights() > 0 && (
                    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                      <h4 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Booking Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Room Rate
                          </span>
                          <span>
                            ₱
                            {Number(
                              selectedRoomDetails.daily_rate
                            ).toLocaleString()}{' '}
                            × {calculateNights()} night(s)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Check-in
                          </span>
                          <span>
                            {format(
                              new Date(formData.checkInDate),
                              'MMM d, yyyy'
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Check-out
                          </span>
                          <span>
                            {format(
                              new Date(formData.checkOutDate),
                              'MMM d, yyyy'
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Payment Method
                          </span>
                          <span className="font-medium">
                            {formData.paymentMethod}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-border font-semibold text-lg">
                          <span>Total Amount</span>
                          <span className="font-display text-primary">
                            ₱{calculateTotal().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateReservation}
                  disabled={saving || filteredAvailableRooms.length === 0}
                  className="bg-gradient-red hover:opacity-90 text-primary-foreground shadow-red"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <CalendarCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {reservations.length}
              </p>
              <p className="text-xs text-muted-foreground">Total Bookings</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {reservations.filter((r) => r.status === 'Reserved').length}
              </p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <LogIn className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {
                  reservations.filter((r) => r.status === 'Checked-In')
                    .length
                }
              </p>
              <p className="text-xs text-muted-foreground">Checked In</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <BedDouble className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">
                {availableRooms.length}
              </p>
              <p className="text-xs text-muted-foreground">Rooms Available</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {['all', 'Reserved', 'Checked-In', 'Checked-Out', 'Cancelled'].map(
          (status) => {
            const count =
              status === 'all'
                ? reservations.length
                : reservations.filter((r) => r.status === status).length;
            return (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status)}
                className={cn(
                  filterStatus === status &&
                    'bg-gradient-red text-primary-foreground shadow-red'
                )}
              >
                {status === 'all' ? 'All' : statusConfig[status]?.label || status}
                <span className="ml-1.5 text-xs opacity-70">({count})</span>
              </Button>
            );
          }
        )}
      </div>

      {/* Reservation Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CalendarCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-display text-xl font-semibold text-muted-foreground mb-1">
            {filterStatus === 'all'
              ? 'No reservations yet'
              : `No ${statusConfig[filterStatus]?.label.toLowerCase()} bookings`}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            {filterStatus === 'all'
              ? 'Start your Grand Romeo experience — book your first room today!'
              : 'Try a different filter to see your other bookings.'}
          </p>
          {filterStatus === 'all' && (
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-gradient-red hover:opacity-90 text-primary-foreground shadow-red"
            >
              <Plus className="w-4 h-4 mr-2" />
              Book a Room
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => {
            const config =
              statusConfig[reservation.status] || statusConfig['Reserved'];
            const roomType =
              reservation.rooms?.[0]?.room?.room_type || 'Standard';
            const info = getRoomTypeInfo(roomType);
            const nights = differenceInDays(
              new Date(reservation.check_out_date),
              new Date(reservation.check_in_date)
            );
            const estimatedCost =
              nights *
              Number(reservation.rooms?.[0]?.room?.daily_rate || 0);

            return (
              <div
                key={reservation.reservation_id}
                className={cn(
                  'rounded-xl border overflow-hidden bg-gradient-to-r transition-all duration-200 hover:shadow-elegant',
                  config.bgColor
                )}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Color Accent */}
                  <div
                    className={cn(
                      'lg:w-2 h-1.5 lg:h-auto bg-gradient-to-b',
                      info.gradient
                    )}
                  />

                  <div className="flex-1 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left */}
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0',
                            info.gradient
                          )}
                        >
                          <BedDouble className="w-6 h-6 text-sidebar-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-display text-lg font-bold">
                              Booking #{reservation.reservation_id}
                            </h4>
                            <Badge
                              variant="outline"
                              className={cn('border', config.color)}
                            >
                              <config.icon className="w-3 h-3 mr-1" />
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Room{' '}
                            {reservation.rooms?.[0]?.room_number || 'N/A'} —{' '}
                            {roomType}{' '}
                            {roomType === 'Presidential' ? 'Suite' : 'Room'}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted-foreground">
                            <span>
                              {format(
                                new Date(reservation.check_in_date),
                                'MMM d, yyyy'
                              )}{' '}
                              →{' '}
                              {format(
                                new Date(reservation.check_out_date),
                                'MMM d, yyyy'
                              )}
                            </span>
                            <span>{nights} night(s)</span>
                            <span>
                              {reservation.total_guests} guest(s)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                        {estimatedCost > 0 && (
                          <p className="font-display text-xl font-bold text-primary">
                            ₱{estimatedCost.toLocaleString()}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReservation(reservation);
                              fetchPayments(reservation.reservation_id);
                              setViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Details
                          </Button>
                          {reservation.status === 'Reserved' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              onClick={() => {
                                setSelectedReservation(reservation);
                                setCancelDialogOpen(true);
                              }}
                            >
                              <Ban className="w-3.5 h-3.5 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Reservation Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          {selectedReservation && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  Booking #{selectedReservation.reservation_id}
                </DialogTitle>
                <DialogDescription>Reservation details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {/* Room Card */}
                {selectedReservation.rooms?.[0]?.room && (
                  <div
                    className={cn(
                      'rounded-xl p-4 bg-gradient-to-r text-sidebar-foreground',
                      getRoomTypeInfo(
                        selectedReservation.rooms[0].room.room_type
                      ).gradient
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display text-lg font-bold">
                          Room{' '}
                          {selectedReservation.rooms[0].room_number}
                        </p>
                        <p className="text-sm text-sidebar-foreground/90">
                          {selectedReservation.rooms[0].room.room_type}{' '}
                          {selectedReservation.rooms[0].room.room_type ===
                          'Presidential'
                            ? 'Suite'
                            : 'Room'}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'border',
                          statusConfig[selectedReservation.status]?.color
                        )}
                      >
                        {statusConfig[selectedReservation.status]?.label}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Check-in
                    </p>
                    <p className="font-medium">
                      {format(
                        new Date(selectedReservation.check_in_date),
                        'EEE, MMM d, yyyy'
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Check-out
                    </p>
                    <p className="font-medium">
                      {format(
                        new Date(selectedReservation.check_out_date),
                        'EEE, MMM d, yyyy'
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Duration
                    </p>
                    <p className="font-medium">
                      {differenceInDays(
                        new Date(selectedReservation.check_out_date),
                        new Date(selectedReservation.check_in_date)
                      )}{' '}
                      night(s)
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Guests
                    </p>
                    <p className="font-medium">
                      {selectedReservation.total_guests} guest(s)
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Booked On
                    </p>
                    <p className="font-medium">
                      {format(
                        new Date(selectedReservation.created_at),
                        'MMM d, yyyy'
                      )}
                    </p>
                  </div>
                  {selectedReservation.rooms?.[0]?.room && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        Estimated Total
                      </p>
                      <p className="font-display text-lg font-bold text-primary">
                        ₱
                        {(
                          differenceInDays(
                            new Date(
                              selectedReservation.check_out_date
                            ),
                            new Date(
                              selectedReservation.check_in_date
                            )
                          ) *
                          Number(
                            selectedReservation.rooms[0].room
                              .daily_rate
                          )
                        ).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Special Requests */}
                {selectedReservation.special_requests && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Special Requests</p>
                    <p className="text-sm bg-secondary/30 p-2 rounded-md">{selectedReservation.special_requests}</p>
                  </div>
                )}

                {/* Payment Information */}
                {payments.length > 0 && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                      Payment Details
                    </p>
                    <div className="space-y-2">
                      {payments.map((payment) => (
                        <div
                          key={payment.payment_id}
                          className="flex justify-between items-center bg-secondary/20 p-3 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">
                              {payment.payment_method}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(payment.payment_date), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <p className="font-display text-lg font-bold text-primary">
                            ₱{Number(payment.amount_paid).toLocaleString()}
                          </p>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-semibold">Total Paid</span>
                        <span className="font-display text-xl font-bold text-primary">
                          ₱{payments.reduce((sum, p) => sum + Number(p.amount_paid), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Room Amenities Preview */}
                {selectedReservation.rooms?.[0]?.room && (
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                      Room Amenities
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {getRoomTypeInfo(
                        selectedReservation.rooms[0].room.room_type
                      ).amenities.map((amenity, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-xs bg-secondary/80 px-2 py-1 rounded-md"
                        >
                          <amenity.icon className="w-3 h-3" />
                          {amenity.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-destructive">
              Cancel Reservation
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel Booking #
              {selectedReservation?.reservation_id}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20 text-sm">
              <p>
                <strong>Room:</strong>{' '}
                {selectedReservation.rooms?.[0]?.room_number || 'N/A'}
              </p>
              <p>
                <strong>Dates:</strong>{' '}
                {format(
                  new Date(selectedReservation.check_in_date),
                  'MMM d'
                )}{' '}
                —{' '}
                {format(
                  new Date(selectedReservation.check_out_date),
                  'MMM d, yyyy'
                )}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Keep Reservation
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelReservation}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Yes, Cancel Booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}