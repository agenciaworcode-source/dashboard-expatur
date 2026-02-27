import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { InvoiceStatus as InvoiceStatusType } from "@/hooks/useBitrixData";
import { useTranslation } from "react-i18next";

interface InvoiceStatusProps {
  data?: InvoiceStatusType[];
  isLoading?: boolean;
}

export function InvoiceStatus({ data, isLoading }: InvoiceStatusProps) {
  const { t } = useTranslation();
  
  const defaultData: InvoiceStatusType[] = [
    { name: t('dashboard.invoice_paid'), value: 0, color: "hsl(160, 84%, 39%)" },
    { name: t('dashboard.invoice_pending'), value: 0, color: "hsl(38, 92%, 50%)" },
    { name: t('dashboard.invoice_overdue'), value: 0, color: "hsl(0, 84%, 60%)" },
  ];

  const chartData = data?.length ? data : defaultData;
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  
  // Add total to each item for tooltip percentage calculation
  const dataWithTotal = chartData.map(item => ({ ...item, total }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const totalVal = payload[0]?.payload?.total || 1;
      const percentage = ((payload[0].value / totalVal) * 100).toFixed(1);
      return (
        <div className="glass-effect rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{payload[0].name}</p>
          <p className="text-sm" style={{ color: payload[0].payload.color }}>
            R$ {payload[0].value.toLocaleString("pt-BR")}
          </p>
          <p className="text-xs text-muted-foreground">{t('dashboard.invoice_share', { percentage })}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container animate-slide-up" style={{ animationDelay: "450ms" }}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold font-display text-foreground">
          {t('dashboard.invoice_title')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.invoice_desc')}
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center gap-6">
          <Skeleton className="h-[180px] w-[180px] rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <div className="h-[180px] w-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataWithTotal}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {dataWithTotal.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 space-y-3">
            {chartData.map((item) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : "0";
              return (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-foreground">
                      R$ {(item.value / 1000).toFixed(0)}k
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
