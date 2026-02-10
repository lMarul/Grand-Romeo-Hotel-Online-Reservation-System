import { Reservation } from '@/types/hotel';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RecentReservationsProps {
  reservations: Reservation[];
}

const statusStyles: Record<string, string> = {
  'Reserved': 'bg-info/10 text-info border-info/20',
  'Checked-In': 'bg-success/10 text-success border-success/20',
  'Checked-Out': 'bg-muted text-muted-foreground border-border',
  'Cancelled': 'bg-destructive/10 text-destructive border-destructive/20',
  'No-Show': 'bg-warning/10 text-warning border-warning/20',
};

export function RecentReservations({ reservations }: RecentReservationsProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="font-display text-lg font-semibold">Recent Reservations</h3>
        <p className="text-sm text-muted-foreground">Latest booking activity</p>
      </div>
      <div className="divide-y divide-border">
        {reservations.slice(0, 5).map((reservation) => (
          <div key={reservation.reservation_id} className="p-4 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground font-medium text-sm">
                  {reservation.guest?.first_name?.[0]}{reservation.guest?.last_name?.[0]}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {reservation.guest?.first_name} {reservation.guest?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Room {reservation.rooms?.[0]?.room_number} • {format(new Date(reservation.check_in_date), 'MMM d')} - {format(new Date(reservation.check_out_date), 'MMM d')}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={cn("border", statusStyles[reservation.status])}>
                {reservation.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
