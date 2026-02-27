import { ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface ConversionRateProps {
  rate?: number;
  wonDeals?: number;
  totalDeals?: number;
  isLoading?: boolean;
}

export function ConversionRate({ rate = 0, wonDeals = 0, totalDeals = 0, isLoading }: ConversionRateProps) {
  const { t } = useTranslation();
  const formattedRate = Number(rate.toFixed(1));
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (formattedRate / 100) * circumference;

  return (
    <div className="chart-container animate-slide-up" style={{ animationDelay: "350ms" }}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold font-display text-foreground">
          {t('dashboard.conversion_rate')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.conversion_desc')}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-8">
          <Skeleton className="w-32 h-32 rounded-full" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-8">
          <div className="relative">
            <svg className="w-32 h-32 -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="hsl(222, 47%, 22%)"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="45"
                stroke="hsl(160, 84%, 39%)"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-display text-foreground">
                {formattedRate}%
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Negócios Ganhos</p>
              <p className="text-xl font-semibold text-foreground">{wonDeals}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Negócios</p>
              <p className="text-xl font-semibold text-foreground">{totalDeals}</p>
            </div>
            {formattedRate > 0 && (
              <div className="badge-success">
                <ArrowUpRight className="w-3 h-3" />
                <span>{formattedRate}% conversão</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
