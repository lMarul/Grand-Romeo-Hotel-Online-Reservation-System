import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { roomService } from '@/lib/database';
import { Room, RoomStatus, RoomType } from '@/types/hotel';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Plus, Search, Users, Bed, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const statusStyles: Record<RoomStatus, string> = {
  'Available': 'bg-success/10 text-success border-success/30',
  'Occupied': 'bg-info/10 text-info border-info/30',
  'Reserved': 'bg-warning/10 text-warning border-warning/30',
  'Maintenance': 'bg-muted text-muted-foreground border-border',
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'Standard' as RoomType,
    capacity: 2,
    daily_rate: 2500,
    status: 'Available' as RoomStatus,
  });

  const loadRooms = async () => {
    try {
      const data = await roomService.getAll();
      setRooms(data);
    } catch (err) {
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRooms(); }, []);

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    const matchesType = filterType === 'all' || room.room_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddRoom = async () => {
    if (!formData.room_number) {
      toast({ title: 'Error', description: 'Room number is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await roomService.create(formData);
      toast({ title: 'Success', description: 'Room added successfully' });
      setIsAddDialogOpen(false);
      setFormData({ room_number: '', room_type: 'Standard', capacity: 2, daily_rate: 2500, status: 'Available' });
      loadRooms();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (roomNumber: string, status: RoomStatus) => {
    try {
      await roomService.update(roomNumber, { status });
      toast({ title: 'Success', description: `Room ${roomNumber} set to ${status}` });
      loadRooms();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDeleteRoom = async (roomNumber: string) => {
    try {
      await roomService.delete(roomNumber);
      toast({ title: 'Success', description: `Room ${roomNumber} deleted` });
      loadRooms();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout title="Rooms" subtitle="Manage hotel rooms and availability">
      {/* Actions Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search rooms..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Occupied">Occupied</SelectItem>
              <SelectItem value="Reserved">Reserved</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Filter by type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Standard">Standard</SelectItem>
              <SelectItem value="Deluxe">Deluxe</SelectItem>
              <SelectItem value="Suite">Suite</SelectItem>
              <SelectItem value="Presidential">Presidential</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold">
              <Plus className="w-4 h-4 mr-2" />Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Add New Room</DialogTitle>
              <DialogDescription>Enter the room details below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Number</Label>
                  <Input placeholder="101" value={formData.room_number} onChange={(e) => setFormData({ ...formData, room_number: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Select value={formData.room_type} onValueChange={(val) => setFormData({ ...formData, room_type: val as RoomType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Deluxe">Deluxe</SelectItem>
                      <SelectItem value="Suite">Suite</SelectItem>
                      <SelectItem value="Presidential">Presidential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input type="number" min="1" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })} />
                </div>
                <div className="space-y-2">
                  <Label>Daily Rate (₱)</Label>
                  <Input type="number" min="0" value={formData.daily_rate} onChange={(e) => setFormData({ ...formData, daily_rate: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button className="bg-gradient-gold hover:opacity-90 text-primary-foreground" onClick={handleAddRoom} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Adding...</> : 'Add Room'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Room Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map((room) => (
          <Card key={room.room_number} className="overflow-hidden hover:shadow-elegant transition-shadow">
            <div className={cn(
              "h-2",
              room.status === 'Available' && 'bg-success',
              room.status === 'Occupied' && 'bg-info',
              room.status === 'Reserved' && 'bg-warning',
              room.status === 'Maintenance' && 'bg-muted-foreground'
            )} />
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-display text-2xl">Room {room.room_number}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Bed className="w-3 h-3" />
                    {room.room_type}
                  </CardDescription>
                </div>
                <Badge variant="outline" className={cn("border", statusStyles[room.status])}>
                  {room.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Max {room.capacity} guests</span>
                  </div>
                  <span className="font-display text-lg font-semibold text-primary">
                    ₱{room.daily_rate.toLocaleString()}
                    <span className="text-xs text-muted-foreground font-normal">/night</span>
                  </span>
                </div>

                <div className="flex gap-2">
                    {room.status !== 'Maintenance' && (
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleUpdateStatus(room.room_number, 'Maintenance')}>
                        Set Maintenance
                      </Button>
                    )}
                    {room.status === 'Maintenance' && (
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => handleUpdateStatus(room.room_number, 'Available')}>
                        Set Available
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDeleteRoom(room.room_number)}>
                      Delete
                    </Button>
                  </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </DashboardLayout>
  );
}
