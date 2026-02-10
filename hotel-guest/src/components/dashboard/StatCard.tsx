import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const variantStyles = {
  default: 'bg-card border-border',
  primary: 'bg-gradient-gold text-primary-foreground border-transparent',
  success: 'bg-success/10 border-success/20',
  warning: 'bg-warning/10 border-warning/20',
};

const iconStyles = {
  default: 'bg-secondary text-foreground',
  primary: 'bg-primary-foreground/20 text-primary-foreground',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border p-6 transition-all duration-200 hover:shadow-elegant",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            "text-sm font-medium",
            variant === 'primary' ? 'text-primary-foreground/80' : 'text-muted-foreground'
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-display font-bold",
            variant === 'primary' ? 'text-primary-foreground' : 'text-foreground'
          )}>
            {value}
          </p>
          {(subtitle || trend) && (
            <div className="flex items-center gap-2">
              {trend && (
                <span className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded",
                  trend.isPositive 
                    ? "bg-success/20 text-success" 
                    : "bg-destructive/20 text-destructive"
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
              {subtitle && (
                <span className={cn(
                  "text-xs",
                  variant === 'primary' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                )}>
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-lg",
          iconStyles[variant]
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
