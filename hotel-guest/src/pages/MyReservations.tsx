import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CalendarCheck, 
  Plus, 
  BedDouble,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  LogIn,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { roomService, reservationService } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';
import type { Room, Reservation } from '@/types/hotel';

const statusConfig: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  'Reserved': { label: 'Reserved', icon: Clock, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  'Checked-In': { label: 'Checked In', icon: LogIn, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  'Checked-Out': { label: 'Checked Out', icon: CheckCircle2, color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
  'Cancelled': { label: 'Cancelled', icon: XCircle, color: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

export default function MyReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state for new reservation
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    checkInDate: '',
    checkOutDate: '',
    totalGuests: 1,
    selectedRoom: '',
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch only available rooms (guests shouldn't see occupied/maintenance)
      const roomsData = await roomService.getAvailable();
      setRooms(roomsData);

      // Use logged-in user's data directly - they are the guest
      if (user) {
        // Pre-fill form with user data
        setFormData(prev => ({
          ...prev,
          firstName: user.first_name,
          lastName: user.last_name,
          contactNumber: user.contact_number || '',
        }));
        
        // Fetch only this guest's reservations (server-side filter)
        const myReservations = await reservationService.getByGuestId(user.guest_id);
        setReservations(myReservations);
      }
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

  const availableRooms = rooms.filter(r => r.status === 'Available');

  const handleCreateReservation = async () => {
    if (!formData.firstName || !formData.lastName || !formData.checkInDate || 
        !formData.checkOutDate || !formData.selectedRoom) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      // Use logged-in user's guest_id
      if (!user) {
        toast({
          title: 'Error',
          description: 'You must be logged in to make a reservation',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      // Create reservation with room assignment
      const newReservation = await reservationService.create(
        {
          guest_id: user.guest_id,
          check_in_date: formData.checkInDate,
          check_out_date: formData.checkOutDate,
          total_guests: formData.totalGuests,
          status: 'Reserved',
        },
        [formData.selectedRoom], // Room numbers
        [] // No staff assigned by guest
      );

      // Refresh data
      await fetchData();
      
      setDialogOpen(false);
      setFormData(prev => ({
        ...prev,
        checkInDate: '',
        checkOutDate: '',
        totalGuests: 1,
        selectedRoom: '',
      }));
      
      toast({
        title: 'Reservation created!',
        description: `Your room has been reserved. Reservation #${newReservation.reservation_id}`,
      });
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create reservation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedRoomDetails = rooms.find(r => r.room_number === formData.selectedRoom);
  
  // Calculate total cost
  const calculateTotal = () => {
    if (!selectedRoomDetails || !formData.checkInDate || !formData.checkOutDate) return 0;
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * Number(selectedRoomDetails.daily_rate) : 0;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">My Reservations</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your bookings at Grand Romeo Hotel
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold">
                <Plus className="w-4 h-4 mr-2" />
                Book a Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Book a Room</DialogTitle>
                <DialogDescription>
                  Reserve your stay at Grand Azure Hotel
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                {/* Guest Details - Pre-filled from logged-in user */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">Guest Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Juan"
                        disabled={!!user}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Dela Cruz"
                        disabled={!!user}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      placeholder="09123456789"
                      disabled={!!user}
                    />
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-sm text-muted-foreground">Booking Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="checkIn">Check-in Date *</Label>
                      <Input
                        id="checkIn"
                        type="date"
                        value={formData.checkInDate}
                        onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="checkOut">Check-out Date *</Label>
                      <Input
                        id="checkOut"
                        type="date"
                        value={formData.checkOutDate}
                        onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                        min={formData.checkInDate || new Date().toISOString().split('T')[0]}
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
                      onChange={(e) => setFormData({ ...formData, totalGuests: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room">Select Room *</Label>
                    <Select 
                      value={formData.selectedRoom} 
                      onValueChange={(val) => setFormData({ ...formData, selectedRoom: val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an available room" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRooms.length === 0 ? (
                          <SelectItem value="_none" disabled>No rooms available</SelectItem>
                        ) : (
                          availableRooms.map(room => (
                            <SelectItem key={room.room_number} value={room.room_number}>
                              Room {room.room_number} - {room.room_type} (₱{Number(room.daily_rate).toLocaleString()}/night, fits {room.capacity})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Cost Summary */}
                {selectedRoomDetails && formData.checkInDate && formData.checkOutDate && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Room {selectedRoomDetails.room_number}</p>
                          <p className="text-sm text-muted-foreground">{selectedRoomDetails.room_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">₱{calculateTotal().toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">
                            {Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))} night(s)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateReservation} 
                  disabled={saving || availableRooms.length === 0}
                  className="bg-gradient-gold hover:opacity-90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
              <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reservations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reservations.filter(r => r.status === 'Reserved' || r.status === 'Checked-In').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
              <BedDouble className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableRooms.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Reservations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Bookings</CardTitle>
            <CardDescription>
              {user 
                ? `Showing reservations for ${user.first_name} ${user.last_name}`
                : 'Please log in to view your reservations'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reservation #</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      <p className="text-muted-foreground">Loading your reservations...</p>
                    </TableCell>
                  </TableRow>
                ) : reservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <CalendarCheck className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No reservations yet</p>
                      <p className="text-sm text-muted-foreground">Book your first room to get started!</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  reservations.map((reservation) => {
                    const config = statusConfig[reservation.status] || statusConfig['Reserved'];
                    return (
                      <TableRow key={reservation.reservation_id}>
                        <TableCell className="font-medium">
                          #{reservation.reservation_id}
                        </TableCell>
                        <TableCell>
                          {new Date(reservation.check_in_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(reservation.check_out_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{reservation.total_guests}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={config.color}>
                            <config.icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
