import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { MonthlyRevenue } from "@/hooks/useBitrixData";
import { useTranslation } from "react-i18next";

interface RevenueChartProps {
  data?: MonthlyRevenue[];
  isLoading?: boolean;
}

const defaultData: MonthlyRevenue[] = [
  { month: "Jan", receita: 0, despesas: 0 },
  { month: "Fev", receita: 0, despesas: 0 },
  { month: "Mar", receita: 0, despesas: 0 },
  { month: "Abr", receita: 0, despesas: 0 },
  { month: "Mai", receita: 0, despesas: 0 },
  { month: "Jun", receita: 0, despesas: 0 },
  { month: "Jul", receita: 0, despesas: 0 },
  { month: "Ago", receita: 0, despesas: 0 },
  { month: "Set", receita: 0, despesas: 0 },
  { month: "Out", receita: 0, despesas: 0 },
  { month: "Nov", receita: 0, despesas: 0 },
  { month: "Dez", receita: 0, despesas: 0 },
];

export function RevenueChart({ data, isLoading }: RevenueChartProps) {
  const { t } = useTranslation();
  const chartData = data || defaultData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-effect rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === "receita" || entry.name === "Receita" ? t('dashboard.revenue') : t('dashboard.expenses')}: R$ {entry.value.toLocaleString("pt-BR")}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold font-display text-foreground">
            {t('dashboard.revenue_vs_expenses')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t('dashboard.annual_evolution')}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">{t('dashboard.revenue')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-muted-foreground">{t('dashboard.expenses')}</span>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <Skeleton className="h-[300px] w-full rounded-lg" />
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 47%, 22%)" vertical={false} />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 20%, 65%)", fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="receita"
                name="Receita"
                stroke="hsl(160, 84%, 39%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReceita)"
              />
              <Area
                type="monotone"
                dataKey="despesas"
                name="Despesas"
                stroke="hsl(38, 92%, 50%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDespesas)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
