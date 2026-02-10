import { Room } from '@/types/hotel';
import { cn } from '@/lib/utils';
import { BedDouble, Wrench } from 'lucide-react';

interface RoomStatusGridProps {
  rooms: Room[];
}

const statusColors: Record<string, string> = {
  'Available': 'bg-success/10 border-success/30 text-success',
  'Occupied': 'bg-info/10 border-info/30 text-info',
  'Reserved': 'bg-warning/10 border-warning/30 text-warning',
  'Maintenance': 'bg-muted border-border text-muted-foreground',
};

const statusIcons: Record<string, typeof BedDouble> = {
  'Maintenance': Wrench,
};

export function RoomStatusGrid({ rooms }: RoomStatusGridProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="font-display text-lg font-semibold">Room Status Overview</h3>
        <p className="text-sm text-muted-foreground">Quick view of all rooms</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-5 gap-3">
          {rooms.map((room) => {
            const Icon = statusIcons[room.status] || BedDouble;
            return (
              <div
                key={room.room_number}
                className={cn(
                  "aspect-square rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 cursor-pointer",
                  statusColors[room.status]
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-semibold">{room.room_number}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-80">{room.room_type}</span>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", color.replace('text-', 'bg-').split(' ')[0])} />
              <span className="text-xs text-muted-foreground">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
