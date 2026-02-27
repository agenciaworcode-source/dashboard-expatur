import { Building2, Clock, CheckCircle2, XCircle, AlertCircle, Plane } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecentDeal } from "@/hooks/useBitrixData";
import { useTranslation } from "react-i18next";

interface RecentDealsProps {
  deals?: RecentDeal[];
  isLoading?: boolean;
}

const defaultDeals: RecentDeal[] = [];

export function RecentDeals({ deals, isLoading }: RecentDealsProps) {
  const { t } = useTranslation();
  const displayDeals = deals?.length ? deals : defaultDeals;

  const getStageIcon = (stage: RecentDeal["stage"]) => {
    switch (stage) {
      case "won":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "lost":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "negotiation":
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStageLabel = (stage: RecentDeal["stage"]) => {
    switch (stage) {
      case "won":
        return t('deals.stage_won');
      case "lost":
        return t('deals.stage_lost');
      case "negotiation":
        return t('deals.stage_negotiation');
      default:
        return t('deals.stage_pending');
    }
  };

  return (
    <div className="chart-container animate-slide-up" style={{ animationDelay: "500ms" }}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold font-display text-foreground">
          {t('dashboard.recent_deals')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.crm_activity')}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : displayDeals.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum negócio encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayDeals.map((deal) => (
            <div
              key={deal.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  {deal.departure ? (
                    <Plane className="w-4 h-4 text-primary" />
                  ) : (
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{deal.title}</p>
                  {deal.departure || deal.destination ? (
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                        {deal.departure || '?'} <span className="text-[10px] text-muted-foreground/50">➜</span> {deal.destination || '?'}
                      </p>
                      {(deal.airline || deal.pnr) && (
                        <p className="text-[10px] text-muted-foreground/80">
                          {deal.airline} {deal.airline && deal.pnr && "•"} {deal.pnr && `PNR: ${deal.pnr}`}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">{deal.company}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    R$ {deal.value.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-muted-foreground">{deal.date}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {getStageIcon(deal.stage)}
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {getStageLabel(deal.stage)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
