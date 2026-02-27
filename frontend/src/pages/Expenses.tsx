import { useState, useMemo, useCallback, useEffect } from "react";
import { Reorder } from "framer-motion";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DashboardFiltersComponent, DashboardFilters, getDefaultFilters } from "@/components/dashboard/DashboardFilters";
import { useBitrixDashboard, useSyncBitrix, formatCurrency, DealItem } from "@/hooks/useBitrixData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  RefreshCw, 
  Search, 
  Columns3,
  Box,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  CircleDollarSign,
  GripVertical
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

interface ColumnDef { key: string; label: string; }

const Expenses = () => {
  const { t, i18n } = useTranslation();
  const [filters, setFilters] = useState<DashboardFilters>(getDefaultFilters());
  const [searchTerm, setSearchTerm] = useState("");
  
  const dateLocale = i18n.language.startsWith('en') ? enUS : ptBR;
  const formatLocale = i18n.language.startsWith('en') ? 'en-US' : 'pt-BR';

  const ALL_COLUMNS: ColumnDef[] = useMemo(() => [
    { key: "id", label: "ID" },
    { key: "title", label: t('sidebar.deals') },
    { key: "volumeX1000", label: t('expenses.vol_1') },
    { key: "cpmBrl", label: t('expenses.cpm_1') },
    { key: "volumeRetourX1000", label: t('expenses.vol_r') },
    { key: "cpm2Brl", label: t('expenses.cpm_2') },
    { key: "feesBrl", label: t('expenses.fees_1') },
    { key: "feesRetourBrl", label: t('expenses.fees_r') },
    { key: "additionalServicesBrl", label: t('expenses.add_services_short') },
    { key: "totalCost", label: t('expenses.total_cost') },
    { key: "dealDate", label: t('deals.columns.date') },
  ], [t]);

  const initialOrder = useMemo(() => {
    const saved = localStorage.getItem("expatur_expenses_column_order");
    if (saved) return JSON.parse(saved) as string[];
    return ALL_COLUMNS.map(c => c.key);
  }, [ALL_COLUMNS]);

  const initialVisible = useMemo(() => {
    const saved = localStorage.getItem("expatur_expenses_visible_columns");
    if (saved) return JSON.parse(saved) as string[];
    return ["title", "volumeX1000", "cpmBrl", "volumeRetourX1000", "cpm2Brl", "feesBrl", "feesRetourBrl", "additionalServicesBrl", "totalCost"];
  }, []);

  const [columnOrder, setColumnOrder] = useState<string[]>(initialOrder);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(initialVisible);

  useEffect(() => {
    localStorage.setItem("expatur_expenses_column_order", JSON.stringify(columnOrder));
  }, [columnOrder]);

  useEffect(() => {
    localStorage.setItem("expatur_expenses_visible_columns", JSON.stringify(visibleColumns));
  }, [visibleColumns]);
  
  const { data, isLoading } = useBitrixDashboard(filters);
  const syncMutation = useSyncBitrix();

  const filteredDeals = useMemo(() => data?.deals.filter(deal => 
    deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(deal.id).includes(searchTerm)
  ) || [], [data, searchTerm]);

  const toggleColumn = useCallback((key: string) => {
    setVisibleColumns(prev => 
      prev.includes(key) ? (prev.length > 1 ? prev.filter(k => k !== key) : prev) : [...prev, key]
    );
  }, []);

  const activeColumns = useMemo(() => {
    const columnsMap = new Map(ALL_COLUMNS.map(c => [c.key, c]));
    return columnOrder
      .filter(key => visibleColumns.includes(key))
      .map(key => columnsMap.get(key)!)
      .filter(Boolean);
  }, [ALL_COLUMNS, visibleColumns, columnOrder]);

  const orderedAllColumns = useMemo(() => {
    const columnsMap = new Map(ALL_COLUMNS.map(c => [c.key, c]));
    return columnOrder
      .map(key => columnsMap.get(key)!)
      .filter(Boolean);
  }, [ALL_COLUMNS, columnOrder]);

  const renderCell = useCallback((deal: DealItem, key: string) => {
    switch (key) {
      case "dealDate":
        return deal.dealDate ? format(new Date(deal.dealDate), "dd/MM/yyyy", { locale: dateLocale }) : "-";
      case "totalCost":
        const cost = (Number(deal.volumeX1000 || 0) * Number(deal.cpmBrl || 0)) +
                     (Number(deal.volumeRetourX1000 || 0) * Number(deal.cpm2Brl || 0)) +
                     Number(deal.feesBrl || 0) +
                     Number(deal.feesRetourBrl || 0) +
                     Number(deal.additionalServicesBrl || 0);
        return <span className="font-bold text-primary">{formatCurrency(cost)}</span>;
      case "volumeX1000":
      case "volumeRetourX1000": {
        const val = Number(deal[key as keyof DealItem]);
        return val != null ? (val * 1000).toLocaleString(formatLocale, { maximumFractionDigits: 0 }).replace(/\./g, ' ') : "-";
      }
      case "cpmBrl":
      case "cpm2Brl":
      case "feesBrl":
      case "feesRetourBrl":
      case "additionalServicesBrl":
        const val = deal[key as keyof DealItem] as number;
        return val ? formatCurrency(val) : "-";
      default:
        return (deal as any)[key] || "-";
    }
  }, [dateLocale, formatLocale]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('expenses.title')}</h1>
          <p className="text-muted-foreground">{t('expenses.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <DashboardFiltersComponent filters={filters} onFiltersChange={setFilters} />
          <Button 
            onClick={() => syncMutation.mutate()} 
            disabled={syncMutation.isPending}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-sm transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? t('common.syncing') : t('common.sync')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <MetricCard
            title={t('expenses.total_cost')}
            value={data ? formatCurrency(data.metrics.totalInvestment) : "R$ 0"}
            subtitle={t('expenses.cost_subtitle')}
            icon={<CircleDollarSign className="w-5 h-5 text-primary" />}
            delay={0}
            isLoading={isLoading}
          />
        </div>

        <Card className="lg:col-span-3 border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col justify-center">
          <CardHeader className="pb-2 pt-4 px-6">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t('expenses.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold">{t('expenses.miles')}</span>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {data ? formatCurrency(data.metrics.milesInvestment) : "R$ 0"}
                </p>
              </div>

              <div className="space-y-1 border-l border-border/10 pl-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Receipt className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold">{t('expenses.total_fees')}</span>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {data ? formatCurrency(data.metrics.totalFees) : "R$ 0"}
                </p>
              </div>

              <div className="space-y-1 border-l border-border/10 pl-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Plus className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold">{t('expenses.add_services')}</span>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {data ? formatCurrency(data.metrics.totalAddServices) : "R$ 0"}
                </p>
              </div>

              <div className="space-y-1 border-l border-border/10 pl-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Box className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-semibold">{t('expenses.total_volume')}</span>
                </div>
                <p className="text-xl font-bold text-foreground">
                  {data ? `${(data.metrics.totalVolume / 1000).toLocaleString(formatLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} M` : "0 M"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-primary">
              <Calculator className="w-5 h-5" />
              {t('sidebar.deals')} - {t('expenses.cost_details')}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <div className="relative group">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder={t('expenses.search_placeholder')}
                  className="pl-9 h-9 w-[200px] md:w-[300px] rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <Columns3 className="h-4 w-4" />
                    {t('common.columns')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[220px] p-3 shadow-xl border-border/50" align="end">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('common.visible_columns')}</p>
                  <Reorder.Group axis="y" values={columnOrder} onReorder={setColumnOrder} className="space-y-px max-h-[400px] overflow-y-auto pr-2">
                    {orderedAllColumns.map(col => (
                      <Reorder.Item 
                        key={col.key} 
                        value={col.key}
                        className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-md transition-colors cursor-pointer group bg-card"
                      >
                        <div className="cursor-grab active:cursor-grabbing text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <Checkbox 
                          id={`col-${col.key}`} 
                          checked={visibleColumns.includes(col.key)}
                          onCheckedChange={() => toggleColumn(col.key)}
                        />
                        <label 
                          htmlFor={`col-${col.key}`}
                          className="text-sm font-medium leading-none cursor-pointer select-none grow"
                        >
                          {col.label}
                        </label>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-4">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">{t('common.loading')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/30">
                    {activeColumns.map(col => (
                      <th key={col.key} className="h-10 px-4 text-left font-semibold text-muted-foreground uppercase tracking-tighter text-[11px] border-b border-border/50">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDeals.map((deal) => (
                    <tr 
                      key={deal.id} 
                      className="border-b border-border/10 hover:bg-primary/[0.03] transition-colors group"
                    >
                      {activeColumns.map(col => (
                        <td key={`${deal.id}-${col.key}`} className="p-4 whitespace-nowrap">
                          {renderCell(deal, col.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {filteredDeals.length === 0 && (
                    <tr>
                      <td colSpan={visibleColumns.length} className="p-12 text-center text-muted-foreground italic">
                        {t('expenses.no_deals_period')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default Expenses;
