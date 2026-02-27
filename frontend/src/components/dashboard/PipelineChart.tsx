import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { PipelineStage } from "@/hooks/useBitrixData";
import { useTranslation } from "react-i18next";

interface PipelineChartProps {
  data?: PipelineStage[];
  isLoading?: boolean;
}

export function PipelineChart({ data, isLoading }: PipelineChartProps) {
  const { t } = useTranslation();
  
  const defaultData: PipelineStage[] = [
    { stage: t('deals.stage_pending'), value: 0, deals: 0, color: "hsl(215, 70%, 60%)" },
    { stage: "Qualificação", value: 0, deals: 0, color: "hsl(200, 70%, 55%)" },
    { stage: "Proposta", value: 0, deals: 0, color: "hsl(180, 70%, 50%)" },
    { stage: t('deals.stage_negotiation'), value: 0, deals: 0, color: "hsl(160, 84%, 45%)" },
    { stage: t('deals.stage_won'), value: 0, deals: 0, color: "hsl(160, 84%, 39%)" },
  ];

  const chartData = data?.length ? data : defaultData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0]?.payload;
      return (
        <div className="glass-effect rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          <p className="text-sm text-primary">
            R$ {payload[0].value.toLocaleString("pt-BR")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('dashboard.deals_count', { count: item?.deals || 0 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold font-display text-foreground">
          {t('dashboard.pipeline_title')}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('dashboard.pipeline_desc')}
        </p>
      </div>
      
      {isLoading ? (
        <Skeleton className="h-[250px] w-full rounded-lg" />
      ) : (
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 22%)" horizontal={false} />
              <XAxis 
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <YAxis 
                type="category"
                dataKey="stage"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
                width={85}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(222, 47%, 18%)" }} />
              <Bar 
                dataKey="value" 
                radius={[0, 6, 6, 0]}
                barSize={24}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
