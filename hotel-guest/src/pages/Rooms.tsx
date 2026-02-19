import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { roomService } from '@/lib/database';
import { Room, RoomType } from '@/types/hotel';
import { ROOM_TYPE_DATA, ROOM_TYPES_ORDER, getRoomTypeInfo } from '@/data/roomTypes';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  BedDouble,
  Loader2,
  CheckCircle2,
  Maximize,
  Eye,
  Star,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadRooms = async () => {
    try {
      const data = await roomService.getAvailable();
      setRooms(data);
    } catch (err) {
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // Group rooms by type
  const roomsByType = rooms.reduce(
    (acc, room) => {
      if (!acc[room.room_type]) acc[room.room_type] = [];
      acc[room.room_type].push(room);
      return acc;
    },
    {} as Record<string, Room[]>
  );

  const filteredTypes =
    filterType === 'all'
      ? ROOM_TYPES_ORDER
      : ROOM_TYPES_ORDER.filter((t) => t === filterType);

  const selectedTypeInfo = selectedType ? getRoomTypeInfo(selectedType) : null;
  const selectedTypeRooms = selectedType ? roomsByType[selectedType] || [] : [];

  return (
    <DashboardLayout
      title="Rooms & Suites"
      subtitle="Discover your perfect retreat at Grand Romeo Hotel"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sidebar via-sidebar/95 to-sidebar/90 p-8 lg:p-12 mb-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzMuMzEzIDAgNi0yLjY4NyA2LTZIMGY2IDAgNi0yLjY4NyA2LTZzLTIuNjg3LTYtNi02LTYgMi42ODctNiA2IDIuNjg3IDYgNiA2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium uppercase tracking-wider">
              Exquisite Accommodations
            </span>
          </div>
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-3">
            Unwind in Our Exquisite Rooms
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Step into a world of refined elegance and ultimate comfort. Each space
            is meticulously designed to offer a serene retreat, from our welcoming
            Standard rooms to the magnificent Presidential Suite.
          </p>
          <div className="flex items-center gap-6 mt-6">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-amber-400">
                {rooms.length}
              </p>
              <p className="text-xs text-white/50 uppercase tracking-wider">
                Rooms Available
              </p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-amber-400">
                {Object.keys(roomsByType).length}
              </p>
              <p className="text-xs text-white/50 uppercase tracking-wider">
                Room Categories
              </p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-amber-400">5★</p>
              <p className="text-xs text-white/50 uppercase tracking-wider">
                Hotel Rating
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
            className={cn(
              filterType === 'all' &&
                'bg-gradient-gold text-primary-foreground shadow-gold'
            )}
          >
            All Categories
          </Button>
          {ROOM_TYPES_ORDER.map((type) => {
            const count = roomsByType[type]?.length || 0;
            return (
              <Button
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType(type)}
                className={cn(
                  filterType === type &&
                    'bg-gradient-gold text-primary-foreground shadow-gold'
                )}
              >
                {type}
                {count > 0 && (
                  <span className="ml-1.5 text-xs opacity-70">({count})</span>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Room Categories */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">Loading available rooms...</p>
          </div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <BedDouble className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-display font-semibold text-muted-foreground mb-2">
            No rooms available
          </h3>
          <p className="text-muted-foreground max-w-md">
            All our rooms are currently booked. Please check back later or
            contact our reservations team for assistance.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {filteredTypes.map((type) => {
            const info = ROOM_TYPE_DATA[type];
            const typeRooms = roomsByType[type] || [];
            if (typeRooms.length === 0 && filterType === 'all') return null;

            return (
              <div key={type} className="group">
                {/* Category Header Card */}
                <div
                  className={cn(
                    'relative overflow-hidden rounded-2xl p-6 lg:p-8 mb-6 bg-gradient-to-r',
                    info.gradient,
                    'text-white'
                  )}
                >
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                          <span className="text-white/80 text-sm font-medium uppercase tracking-wider">
                            {info.tagline}
                          </span>
                        </div>
                        <h3 className="font-display text-2xl lg:text-3xl font-bold mb-3">
                          {type === 'Presidential'
                            ? 'Presidential Suite'
                            : `${type} Room`}
                        </h3>
                        <p className="text-white/80 leading-relaxed max-w-xl">
                          {info.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-4">
                          <div className="flex items-center gap-1.5 text-sm text-white/70">
                            <Maximize className="w-4 h-4" />
                            {info.floorArea}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-white/70">
                            <BedDouble className="w-4 h-4" />
                            {info.bedType}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-white/70">
                            <Users className="w-4 h-4" />
                            {info.maxOccupancy}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-white/60 text-sm">Starting from</p>
                        <p className="font-display text-3xl lg:text-4xl font-bold">
                          {info.priceRange}
                        </p>
                        <p className="text-white/60 text-sm">per night</p>
                        <Button
                          variant="secondary"
                          className="mt-3 bg-white/20 hover:bg-white/30 text-white border-0"
                          onClick={() => setSelectedType(type)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Room Cards Grid */}
                {typeRooms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {typeRooms.map((room) => (
                      <Card
                        key={room.room_number}
                        className="overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 group/card"
                      >
                        <div
                          className={cn(
                            'h-1.5 bg-gradient-to-r',
                            info.gradient
                          )}
                        />
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="font-display text-xl">
                                Room {room.room_number}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-1.5 mt-1">
                                <BedDouble className="w-3.5 h-3.5" />
                                {room.room_type}
                                {type === 'Presidential' ? ' Suite' : ' Room'}
                              </CardDescription>
                            </div>
                            <Badge
                              variant="outline"
                              className="border bg-emerald-500/10 text-emerald-600 border-emerald-500/30 shrink-0"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Available
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Maximize className="w-3.5 h-3.5" />
                              {info.floorArea}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Users className="w-3.5 h-3.5" />
                              Max {room.capacity} guests
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {info.amenities.slice(0, 4).map((amenity, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 text-xs bg-secondary/80 text-muted-foreground px-2 py-1 rounded-md"
                              >
                                <amenity.icon className="w-3 h-3" />
                                {amenity.label}
                              </span>
                            ))}
                            {info.amenities.length > 4 && (
                              <span className="text-xs text-muted-foreground px-2 py-1">
                                +{info.amenities.length - 4} more
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <div>
                              <span className="font-display text-xl font-bold text-primary">
                                ₱{Number(room.daily_rate).toLocaleString()}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                /night
                              </span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => navigate('/my-reservations')}
                              className="bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold"
                            >
                              Book Now
                              <ArrowRight className="w-3.5 h-3.5 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed border-border">
                    <BedDouble className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      No {type.toLowerCase()} rooms available at the moment
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Room Type Detail Dialog */}
      <Dialog
        open={!!selectedType}
        onOpenChange={(open) => !open && setSelectedType(null)}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedTypeInfo && (
            <>
              <DialogHeader>
                <div
                  className={cn(
                    'rounded-xl p-6 mb-4 bg-gradient-to-r text-white -mx-6 -mt-6',
                    selectedTypeInfo.gradient
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                    <span className="text-white/80 text-sm uppercase tracking-wider">
                      {selectedTypeInfo.tagline}
                    </span>
                  </div>
                  <DialogTitle className="font-display text-2xl lg:text-3xl font-bold text-white">
                    {selectedType === 'Presidential'
                      ? 'Presidential Suite'
                      : `${selectedType} Room`}
                  </DialogTitle>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1 text-sm text-white/70">
                      <Maximize className="w-4 h-4" />{' '}
                      {selectedTypeInfo.floorArea}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-white/70">
                      <BedDouble className="w-4 h-4" />{' '}
                      {selectedTypeInfo.bedType}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-white/70">
                      <Users className="w-4 h-4" />{' '}
                      {selectedTypeInfo.maxOccupancy}
                    </span>
                  </div>
                  <p className="text-3xl font-display font-bold mt-4">
                    {selectedTypeInfo.priceRange}
                    <span className="text-base font-normal text-white/60">
                      {' '}
                      / night
                    </span>
                  </p>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <h4 className="font-display text-lg font-semibold mb-2">
                    About This Room
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedTypeInfo.longDescription}
                  </p>
                </div>
                <div>
                  <h4 className="font-display text-lg font-semibold mb-3">
                    Room Amenities
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTypeInfo.amenities.map((amenity, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50"
                      >
                        <div className="p-2 rounded-md bg-primary/10">
                          <amenity.icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">
                          {amenity.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-display text-lg font-semibold mb-3">
                    Highlights
                  </h4>
                  <ul className="space-y-2">
                    {selectedTypeInfo.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-display text-lg font-semibold mb-3">
                    Available Rooms ({selectedTypeRooms.length})
                  </h4>
                  {selectedTypeRooms.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedTypeRooms.map((room) => (
                        <div
                          key={room.room_number}
                          className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-sm">
                              Room {room.room_number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Fits {room.capacity}
                            </p>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No rooms of this type are currently available.
                    </p>
                  )}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold h-11"
                    onClick={() => {
                      setSelectedType(null);
                      navigate('/my-reservations');
                    }}
                  >
                    Book This Room
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-11"
                    onClick={() => setSelectedType(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
