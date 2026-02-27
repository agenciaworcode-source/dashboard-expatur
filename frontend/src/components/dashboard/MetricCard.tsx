import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  delay?: number;
  isLoading?: boolean;
}

export function MetricCard({ 
  title, 
  value, 
  subtitle,
  change, 
  changeLabel,
  icon,
  delay = 0,
  isLoading = false,
}: MetricCardProps) {
  const { t } = useTranslation();
  const finalChangeLabel = changeLabel || t('dashboard.vs_last_month');

  const getTrendIcon = () => {
    if (!change) return <Minus className="w-3 h-3" />;
    if (change > 0) return <TrendingUp className="w-3 h-3" />;
    return <TrendingDown className="w-3 h-3" />;
  };

  const getTrendClass = () => {
    if (!change || change === 0) return "badge-warning";
    if (change > 0) return "badge-success";
    return "badge-destructive";
  };

  if (isLoading) {
    return (
      <div 
        className="metric-card animate-slide-up"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="metric-card animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          {icon}
        </div>
        {change !== undefined && (
          <div className={getTrendClass()}>
            {getTrendIcon()}
            <span>{change > 0 ? "+" : ""}{change}%</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="stat-label">{title}</p>
        <p className="stat-value text-foreground">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
        {finalChangeLabel && change !== undefined && (
          <p className="text-xs text-muted-foreground">{finalChangeLabel}</p>
        )}
      </div>
    </div>
  );
}
