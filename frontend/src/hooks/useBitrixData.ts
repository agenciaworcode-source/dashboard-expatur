import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";

// ─── Interfaces alinhadas com o novo backend ───────────────────────

export interface DashboardMetrics {
  totalRevenue: number;
  ticketedRevenue: number;
  flownRevenue: number;
  ravRevenue: number;
  feesRevenue: number;
  
  // Expense/Investment Metrics (Refined)
  totalInvestment: number;      // Soma de tudo: Milhas + Fees + AddServices
  milesInvestment: number;      // Soma apenas de Vol * CPM (Ida + Volta)
  milesIda: number;             // Vol 1 * CPM 1
  milesVolta: number;           // Vol 2 * CPM 2
  totalAddServices: number;     // Additional Services
  totalFees: number;            // Fees 1 + Fees 2
  totalVolume: number;          // Vol 1 + Vol 2
  
  // Temporal RAV
  todayRav: number;
  monthRav: number;
  dailyAvgRav: number;
  threeDayAvgRav: number;
  dealCount: number;
  ticketedCount: number;
  flownCount: number;
}

export interface CurrencyBreakdown {
  count: number;
  total: number;
  totalBrl: number;
}

export interface DealItem {
  id: number;
  title: string;
  stage: "ticketed" | "flown";
  currency: string;
  amount: number;
  amountBrl: number;
  feesBrl: number | null;
  exchangeRate: number | null;
  dealDate: string;
  departure: string | null;
  destination: string | null;
  // Extended Bitrix fields
  volumeX1000: number | null;
  cpmBrl: number | null;
  valorNota: number | null;
  numeroNf: number | null;
  airlineIata: string | null;
  pnr: string | null;
  issuingPartner: string | null;
  subtotalBrl: number | null;
  departureDate: string | null;
  horarioSpIda: string | null;
  horarioSpVolta: string | null;
  paxName: string | null;
  numPassengers: number | null;
  // Expense fields
  volumeRetourX1000: number | null;
  cpm2Brl: number | null;
  feesRetourBrl: number | null;
  additionalServicesBrl: number | null;
}

export interface InvoiceStatus {
  name: string;
  value: number;
  color: string;
}

export interface PipelineStage {
  stage: string;
  value: number;
  deals: number;
  color: string;
}

export interface MonthlyRevenue {
  month: string;
  receita: number;
  despesas: number;
}

export interface RecentDeal {
  id: number;
  title: string;
  company: string;
  value: number;
  date: string;
  stage: "won" | "lost" | "negotiation" | "pending";
  departure?: string;
  destination?: string;
  airline?: string;
  pnr?: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  byCurrency: Record<string, CurrencyBreakdown>;
  deals: DealItem[];
  monthlyRevenue: MonthlyRevenue[];
  recentDeals: RecentDeal[];
  invoiceStatus: InvoiceStatus[];
  pipeline: PipelineStage[];
}

// ─── Fetch Dashboard Data ──────────────────────────────────────────

async function fetchDashboardData(filters?: DashboardFilters): Promise<DashboardData> {
  const body: Record<string, any> = { action: 'dashboard' };

  if (filters) {
    body.filters = {
      dateFrom: filters.dateRange.from.toISOString(),
      dateTo: filters.dateRange.to.toISOString(),
      stageFilter: filters.stageFilter
    };
  }

  const { data, error } = await supabase.functions.invoke('bitrix-crm', {
    method: 'POST',
    body
  });

  if (error) {
    console.error('Error fetching Bitrix data:', error);
    throw new Error(error.message || 'Failed to fetch dashboard data');
  }

  return data as DashboardData;
}

export function useBitrixDashboard(filters?: DashboardFilters) {
  return useQuery({
    queryKey: ['bitrix-dashboard', filters?.dateRange.from?.toISOString(), filters?.dateRange.to?.toISOString(), filters?.stageFilter],
    queryFn: () => fetchDashboardData(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ─── Sync Mutation ─────────────────────────────────────────────────

export function useSyncBitrix() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('bitrix-crm', {
        method: 'POST',
        body: { action: 'sync' }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bitrix-dashboard'] });
      toast.success("Sincronização concluída com sucesso!");
    },
    onError: (error: any) => {
      console.error('Sync error:', error);
      toast.error(`Falha na sincronização: ${error.message}`);
    }
  });
}

// ─── Utilities ─────────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
