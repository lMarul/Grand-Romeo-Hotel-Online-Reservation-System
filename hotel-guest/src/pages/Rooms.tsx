import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { roomService } from '@/lib/database';
import { Room, RoomType } from '@/types/hotel';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Users, Bed, Loader2, CheckCircle2 } from 'lucide-react';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const loadRooms = async () => {
    try {
      // Only fetch available rooms - guests should not see occupied/maintenance rooms
      const data = await roomService.getAvailable();
      setRooms(data);
    } catch (err) {
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRooms(); }, []);

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.room_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || room.room_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout title="Browse Rooms" subtitle="Find the perfect room for your stay at Grand Romeo Hotel">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search rooms..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
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
        <p className="text-sm text-muted-foreground">{filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} available</p>
      </div>

      {/* Room Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filteredRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <Bed className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-lg font-medium text-muted-foreground">No rooms available</p>
          <p className="text-sm text-muted-foreground">Please check back later or adjust your filters</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map((room) => (
          <Card key={room.room_number} className="overflow-hidden hover:shadow-elegant transition-shadow">
            <div className="h-2 bg-success" />
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-display text-2xl">Room {room.room_number}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Bed className="w-3 h-3" />
                    {room.room_type}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border bg-success/10 text-success border-success/30">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Available
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
                    ₱{Number(room.daily_rate).toLocaleString()}
                    <span className="text-xs text-muted-foreground font-normal">/night</span>
                  </span>
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
