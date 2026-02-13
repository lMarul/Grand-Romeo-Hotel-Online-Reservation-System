import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { reservationService, guestService, roomService, staffService } from '@/lib/database';
import { Reservation, ReservationStatus, Guest, Room, Staff } from '@/types/hotel';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Eye, LogIn, LogOut, Loader2, X, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const statusStyles: Record<ReservationStatus, string> = {
  'Reserved': 'bg-info/10 text-info border-info/30',
  'Checked-In': 'bg-success/10 text-success border-success/30',
  'Checked-Out': 'bg-muted text-muted-foreground border-border',
  'Cancelled': 'bg-destructive/10 text-destructive border-destructive/30',
  'No-Show': 'bg-warning/10 text-warning border-warning/30',
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { isAdmin, isStaff: isStaffRole } = useAuth();

  const [formData, setFormData] = useState({
    guest_id: '',
    check_in_date: '',
    check_out_date: '',
    total_guests: 1,
    room_numbers: [] as string[],
    staff_ids: [] as number[],
  });

  const [editFormData, setEditFormData] = useState({
    guest_id: '',
    check_in_date: '',
    check_out_date: '',
    total_guests: 1,
    room_numbers: [] as string[],
    staff_ids: [] as number[],
  });

  const loadData = async () => {
    try {
      const [resData, guestData, roomData, staffData] = await Promise.all([
        reservationService.getAll(),
        guestService.getAll(),
        roomService.getAvailable(),
        staffService.getAll(),
      ]);
      setReservations(resData);
      setGuests(guestData);
      setAvailableRooms(roomData);
      setStaffList(staffData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filteredReservations = reservations.filter((res) => {
    const guestName = `${res.guest?.first_name || ''} ${res.guest?.last_name || ''}`.toLowerCase();
    const matchesSearch =
      guestName.includes(searchQuery.toLowerCase()) ||
      String(res.reservation_id).includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || res.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async () => {
    if (!formData.guest_id || !formData.check_in_date || !formData.check_out_date) {
      toast({ title: 'Error', description: 'Guest, check-in and check-out dates are required', variant: 'destructive' });
      return;
    }
    if (formData.room_numbers.length === 0) {
      toast({ title: 'Error', description: 'Select at least one room', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await reservationService.create(
        {
          guest_id: parseInt(formData.guest_id),
          check_in_date: formData.check_in_date,
          check_out_date: formData.check_out_date,
          total_guests: formData.total_guests,
          status: 'Reserved',
        },
        formData.room_numbers,
        formData.staff_ids
      );
      toast({ title: 'Success', description: 'Reservation created' });
      setIsAddDialogOpen(false);
      setFormData({ guest_id: '', check_in_date: '', check_out_date: '', total_guests: 1, room_numbers: [], staff_ids: [] });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: number, status: ReservationStatus) => {
    try {
      await reservationService.updateStatus(id, status);
      toast({ title: 'Success', description: `Reservation ${id} updated to ${status}` });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await reservationService.delete(id);
      toast({ title: 'Success', description: `Reservation ${id} deleted` });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleEditClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setEditFormData({
      guest_id: String(reservation.guest_id),
      check_in_date: reservation.check_in_date,
      check_out_date: reservation.check_out_date,
      total_guests: reservation.total_guests,
      room_numbers: reservation.rooms?.map((r) => r.room_number) || [],
      staff_ids: reservation.staff?.map((s) => s.staff_id) || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedReservation || !editFormData.guest_id || !editFormData.check_in_date || !editFormData.check_out_date) {
      toast({ title: 'Error', description: 'Guest, check-in and check-out dates are required', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await reservationService.update(
        selectedReservation.reservation_id,
        {
          guest_id: parseInt(editFormData.guest_id),
          check_in_date: editFormData.check_in_date,
          check_out_date: editFormData.check_out_date,
          total_guests: editFormData.total_guests,
        },
        editFormData.room_numbers,
        editFormData.staff_ids
      );
      toast({ title: 'Success', description: 'Reservation updated successfully' });
      setIsEditDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleRoom = (roomNumber: string) => {
    setFormData(prev => ({
      ...prev,
      room_numbers: prev.room_numbers.includes(roomNumber)
        ? prev.room_numbers.filter(r => r !== roomNumber)
        : [...prev.room_numbers, roomNumber],
    }));
  };

  const toggleEditRoom = (roomNumber: string) => {
    setEditFormData(prev => ({
      ...prev,
      room_numbers: prev.room_numbers.includes(roomNumber)
        ? prev.room_numbers.filter(r => r !== roomNumber)
        : [...prev.room_numbers, roomNumber],
    }));
  };

  const toggleStaff = (staffId: number) => {
    setFormData(prev => ({
      ...prev,
      staff_ids: prev.staff_ids.includes(staffId)
        ? prev.staff_ids.filter(s => s !== staffId)
        : [...prev.staff_ids, staffId],
    }));
  };

  const toggleEditStaff = (staffId: number) => {
    setEditFormData(prev => ({
      ...prev,
      staff_ids: prev.staff_ids.includes(staffId)
        ? prev.staff_ids.filter(s => s !== staffId)
        : [...prev.staff_ids, staffId],
    }));
  };

  return (
    <DashboardLayout title="Reservations" subtitle="Manage bookings and check-ins">
      {/* Actions Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by guest or reservation ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Reserved">Reserved</SelectItem>
              <SelectItem value="Checked-In">Checked-In</SelectItem>
              <SelectItem value="Checked-Out">Checked-Out</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="No-Show">No-Show</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(isAdmin || isStaffRole) && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold">
              <Plus className="w-4 h-4 mr-2" />New Reservation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Create New Reservation</DialogTitle>
              <DialogDescription>Book a room for a guest.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Guest</Label>
                <Select value={formData.guest_id} onValueChange={(val) => setFormData({ ...formData, guest_id: val })}>
                  <SelectTrigger><SelectValue placeholder="Select a guest" /></SelectTrigger>
                  <SelectContent>
                    {guests.map((guest) => (
                      <SelectItem key={guest.guest_id} value={String(guest.guest_id)}>
                        {guest.first_name} {guest.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-in Date</Label>
                  <Input type="date" value={formData.check_in_date} onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Check-out Date</Label>
                  <Input type="date" value={formData.check_out_date} onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Number of Guests</Label>
                <Input type="number" min="1" value={formData.total_guests} onChange={(e) => setFormData({ ...formData, total_guests: parseInt(e.target.value) || 1 })} />
              </div>
              <div className="space-y-2">
                <Label>Rooms (click to select)</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md max-h-32 overflow-y-auto">
                  {availableRooms.map((room) => (
                    <Badge
                      key={room.room_number}
                      variant={formData.room_numbers.includes(room.room_number) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleRoom(room.room_number)}
                    >
                      {room.room_number} - {room.room_type} (₱{room.daily_rate})
                    </Badge>
                  ))}
                  {availableRooms.length === 0 && <span className="text-sm text-muted-foreground">No available rooms</span>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assign Staff (optional)</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md max-h-32 overflow-y-auto">
                  {staffList.map((s) => (
                    <Badge
                      key={s.staff_id}
                      variant={formData.staff_ids.includes(s.staff_id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleStaff(s.staff_id)}
                    >
                      {s.first_name} {s.last_name} ({s.role})
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button className="bg-gradient-gold hover:opacity-90 text-primary-foreground" onClick={handleCreate} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : 'Create Reservation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        )}
      </div>

      {/* Reservations Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/30">
              <TableHead>ID</TableHead>
              <TableHead>Guest</TableHead>
              <TableHead>Room(s)</TableHead>
              <TableHead>Check-in</TableHead>
              <TableHead>Check-out</TableHead>
              <TableHead>Guests</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReservations.map((reservation) => (
              <TableRow key={reservation.reservation_id} className="hover:bg-secondary/20">
                <TableCell className="font-mono text-sm">{reservation.reservation_id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground text-xs font-medium">
                      {reservation.guest?.first_name?.[0]}{reservation.guest?.last_name?.[0]}
                    </div>
                    <span className="font-medium">
                      {reservation.guest?.first_name} {reservation.guest?.last_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {reservation.rooms?.map((rr) => (
                      <Badge key={rr.room_number} variant="secondary" className="text-xs">
                        {rr.room_number}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <div>
                    {format(new Date(reservation.check_in_date), 'MMM d, yyyy')}
                    {reservation.check_in_time && (
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(reservation.check_in_time), 'h:mm a')}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <div>
                    {format(new Date(reservation.check_out_date), 'MMM d, yyyy')}
                    {reservation.check_out_time && (
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(reservation.check_out_time), 'h:mm a')}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">{reservation.total_guests}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("border", statusStyles[reservation.status])}>
                    {reservation.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedReservation(reservation); setIsViewDialogOpen(true); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {(isAdmin || isStaffRole) && reservation.status === 'Reserved' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600" onClick={() => handleEditClick(reservation)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {(isAdmin || isStaffRole) && reservation.status === 'Reserved' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:text-success" onClick={() => handleStatusChange(reservation.reservation_id, 'Checked-In')}>
                        <LogIn className="w-4 h-4" />
                      </Button>
                    )}
                    {(isAdmin || isStaffRole) && reservation.status === 'Checked-In' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-info hover:text-info" onClick={() => handleStatusChange(reservation.reservation_id, 'Checked-Out')}>
                        <LogOut className="w-4 h-4" />
                      </Button>
                    )}
                    {(isAdmin || isStaffRole) && reservation.status === 'Reserved' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleStatusChange(reservation.reservation_id, 'Cancelled')}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(reservation.reservation_id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      )}

      {/* View Reservation Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Reservation Details</DialogTitle>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reservation ID</p>
                  <p className="font-mono font-semibold">{selectedReservation.reservation_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className={cn("border mt-1", statusStyles[selectedReservation.status])}>
                    {selectedReservation.status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Guest</p>
                <p className="font-semibold">{selectedReservation.guest?.first_name} {selectedReservation.guest?.last_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Check-in</p>
                  <p>{format(new Date(selectedReservation.check_in_date), 'MMM d, yyyy')}</p>
                  {selectedReservation.check_in_time && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(selectedReservation.check_in_time), 'h:mm a')}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Check-out</p>
                  <p>{format(new Date(selectedReservation.check_out_date), 'MMM d, yyyy')}</p>
                  {selectedReservation.check_out_time && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(selectedReservation.check_out_time), 'h:mm a')}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Guests</p>
                <p>{selectedReservation.total_guests}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Room(s)</p>
                <div className="flex flex-wrap gap-2">
                  {selectedReservation.rooms?.map((rr) => (
                    <Badge key={rr.room_number} variant="secondary">
                      Room {rr.room_number} {rr.room ? `- ${rr.room.room_type}` : ''}
                    </Badge>
                  ))}
                </div>
              </div>
              {selectedReservation.staff && selectedReservation.staff.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Assigned Staff</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedReservation.staff.map((rs) => (
                      <Badge key={rs.staff_id} variant="outline">
                        {rs.staff?.first_name} {rs.staff?.last_name} ({rs.staff?.role})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Reservation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Reservation</DialogTitle>
            <DialogDescription>Update reservation details</DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Guest</Label>
                <Select value={editFormData.guest_id} onValueChange={(val) => setEditFormData({ ...editFormData, guest_id: val })}>
                  <SelectTrigger><SelectValue placeholder="Select a guest" /></SelectTrigger>
                  <SelectContent>
                    {guests.map((guest) => (
                      <SelectItem key={guest.guest_id} value={String(guest.guest_id)}>
                        {guest.first_name} {guest.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Check-in Date</Label>
                  <Input type="date" value={editFormData.check_in_date} onChange={(e) => setEditFormData({ ...editFormData, check_in_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Check-out Date</Label>
                  <Input type="date" value={editFormData.check_out_date} onChange={(e) => setEditFormData({ ...editFormData, check_out_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Number of Guests</Label>
                <Input type="number" min="1" value={editFormData.total_guests} onChange={(e) => setEditFormData({ ...editFormData, total_guests: parseInt(e.target.value) || 1 })} />
              </div>
              <div className="space-y-2">
                <Label>Rooms (click to select)</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md max-h-32 overflow-y-auto">
                  {availableRooms.map((room) => (
                    <Badge
                      key={room.room_number}
                      variant={editFormData.room_numbers.includes(room.room_number) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleEditRoom(room.room_number)}
                    >
                      {room.room_number} - {room.room_type} (₱{room.daily_rate})
                    </Badge>
                  ))}
                  {/* Show currently assigned rooms even if not available */}
                  {selectedReservation.rooms?.map((rr) => {
                    if (!availableRooms.some(r => r.room_number === rr.room_number)) {
                      return (
                        <Badge
                          key={rr.room_number}
                          variant={editFormData.room_numbers.includes(rr.room_number) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleEditRoom(rr.room_number)}
                        >
                          {rr.room_number} - {rr.room?.room_type}
                        </Badge>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assign Staff (optional)</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md max-h-32 overflow-y-auto">
                  {staffList.map((s) => (
                    <Badge
                      key={s.staff_id}
                      variant={editFormData.staff_ids.includes(s.staff_id) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => toggleEditStaff(s.staff_id)}
                    >
                      {s.first_name} {s.last_name} ({s.role})
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button className="bg-gradient-gold hover:opacity-90 text-primary-foreground" onClick={handleEditSave} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
