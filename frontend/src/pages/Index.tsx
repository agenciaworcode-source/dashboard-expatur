import { useState, useMemo, useCallback, useEffect } from "react";
import { DollarSign, TrendingUp, AlertCircle, RefreshCw, Columns3, FileText, GripVertical } from "lucide-react";
import { Reorder } from "framer-motion";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { DashboardFiltersComponent, DashboardFilters, getDefaultFilters } from "@/components/dashboard/DashboardFilters";
import { useBitrixDashboard, useSyncBitrix, formatCurrency, DealItem } from "@/hooks/useBitrixData";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface ColumnDef { key: string; label: string; }

const RIGHT_ALIGNED = new Set([
    "amount", "amountBrl", "feesBrl", "exchangeRate",
    "volumeX1000", "cpmBrl", "subtotalBrl", "valorNota",
]);

// ─── helpers ────────────────────────────────────────────────────────

function abbreviate(full: string | null): string {
    if (!full) return "?";
    return full.split(" - ")[0]?.trim() || full.split(" (")[0]?.trim() || full;
}

// ─── Component ────────────────────────────────────────────────────────

const Index = () => {
    const { t, i18n } = useTranslation();
    const [filters, setFilters] = useState<DashboardFilters>(getDefaultFilters());
    const { data, isLoading, error, refetch } = useBitrixDashboard(filters);
    const syncMutation = useSyncBitrix();

    const dateLocale = i18n.language.startsWith('en') ? enUS : ptBR;
    const formatLocale = i18n.language.startsWith('en') ? 'en-US' : 'pt-BR';

    const ALL_COLUMNS: ColumnDef[] = useMemo(() => [
        { key: "id", label: "ID" },
        { key: "title", label: t('deals.columns.title') },
        { key: "stage", label: t('deals.columns.stage') },
        { key: "route", label: t('deals.columns.route') },
        { key: "airlineIata", label: t('deals.columns.airline') },
        { key: "pnr", label: t('common.pnr') },
        { key: "issuingPartner", label: "Issuing Partner" },
        { key: "currency", label: t('deals.columns.currency') },
        { key: "amount", label: t('deals.columns.amount') },
        { key: "exchangeRate", label: t('deals.columns.exchange_rate') },
        { key: "amountBrl", label: t('deals.columns.amount_brl') },
        { key: "volumeX1000", label: t('deals.columns.volume') },
        { key: "cpmBrl", label: t('deals.columns.cpm') },
        { key: "feesBrl", label: t('deals.columns.fees') },
        { key: "subtotalBrl", label: t('deals.columns.subtotal') },
        { key: "valorNota", label: t('deals.columns.rav') },
        { key: "numeroNf", label: t('deals.columns.nf') },
        { key: "paxName", label: t('deals.columns.pax') },
        { key: "numPassengers", label: t('deals.columns.passengers') },
        { key: "departureDate", label: t('deals.columns.date') },
        { key: "horarioSpIda", label: "Horário SP Ida" },
        { key: "horarioSpVolta", label: "Horário SP Volta" },
        { key: "departure", label: t('deals.columns.departure') },
        { key: "destination", label: t('deals.columns.destination') },
        { key: "dealDate", label: "Data Deal" },
    ], [t]);

    const initialOrder = useMemo(() => {
        const saved = localStorage.getItem("expatur_index_column_order");
        if (saved) return JSON.parse(saved) as string[];
        return ALL_COLUMNS.map(c => c.key);
    }, [ALL_COLUMNS]);

    const initialVisible = useMemo(() => {
        const saved = localStorage.getItem("expatur_index_visible_columns");
        if (saved) return new Set(JSON.parse(saved) as string[]);
        return new Set([
            "id", "title", "stage", "route", "airlineIata", "amount", "amountBrl",
            "cpmBrl", "volumeX1000", "feesBrl", "valorNota", "dealDate",
        ]);
    }, []);

    const [columnOrder, setColumnOrder] = useState<string[]>(initialOrder);
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(initialVisible);

    useEffect(() => {
        localStorage.setItem("expatur_index_column_order", JSON.stringify(columnOrder));
    }, [columnOrder]);

    useEffect(() => {
        localStorage.setItem("expatur_index_visible_columns", JSON.stringify(Array.from(visibleColumns)));
    }, [visibleColumns]);

    const stageConfig = useCallback((stage: string) => {
        return stage === "flown"
            ? { label: "Flown", cls: "bg-green-500/10 text-green-500 border-green-500/20" }
            : { label: "Ticketed", cls: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
    }, []);

    const renderDealCell = useCallback((deal: DealItem, key: string): React.ReactNode => {
        switch (key) {
            case "id":
                return <span className="text-muted-foreground font-mono text-xs">{deal.id}</span>;
            case "title":
                return <span className="font-medium max-w-[200px] truncate block">{deal.title}</span>;
            case "stage": {
                const s = stageConfig(deal.stage);
                return (
                    <Badge variant="outline" className={`${s.cls} font-normal`}>
                        {s.label}
                    </Badge>
                );
            }
            case "route":
                return deal.departure && deal.destination ? (
                    <span className="text-xs whitespace-nowrap">
                        {abbreviate(deal.departure)}
                        <span className="text-muted-foreground mx-1">→</span>
                        {abbreviate(deal.destination)}
                    </span>
                ) : "—";
            case "airlineIata":
                return <span className="font-mono text-xs">{deal.airlineIata || "—"}</span>;
            case "pnr":
                return <span className="font-mono text-xs">{deal.pnr || "—"}</span>;
            case "issuingPartner":
                return <span className="text-sm">{deal.issuingPartner || "—"}</span>;
            case "currency":
                return <span className="text-muted-foreground">{deal.currency}</span>;
            case "amount": {
                const sym = deal.currency === "EUR" ? "€" : deal.currency === "BRL" ? "R$" : "$";
                return (
                    <span className="font-mono text-right block">
                        {`${sym} ${deal.amount.toLocaleString(formatLocale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                    </span>
                );
            }
            case "exchangeRate":
                return (
                    <span className="text-right block text-muted-foreground">
                        {deal.exchangeRate ? Number(deal.exchangeRate).toFixed(4) : "—"}
                    </span>
                );
            case "amountBrl":
                return (
                    <span className="font-mono font-semibold text-primary text-right block">
                        {formatCurrency(deal.amountBrl)}
                    </span>
                );
            case "volumeX1000":
                return (
                    <span className="text-right block text-muted-foreground">
                        {deal.volumeX1000 != null ? (Number(deal.volumeX1000) * 1000).toLocaleString(formatLocale, { maximumFractionDigits: 0 }).replace(/\./g, ' ') : "—"}
                    </span>
                );
            case "cpmBrl":
                return (
                    <span className="text-right block text-muted-foreground">
                        {deal.cpmBrl != null ? formatCurrency(deal.cpmBrl) : "—"}
                    </span>
                );
            case "feesBrl":
                return (
                    <span className="text-right block text-muted-foreground font-mono">
                        {deal.feesBrl ? formatCurrency(deal.feesBrl) : "—"}
                    </span>
                );
            case "subtotalBrl":
                return (
                    <span className="text-right block font-semibold">
                        {deal.subtotalBrl != null ? formatCurrency(deal.subtotalBrl) : "—"}
                    </span>
                );
            case "valorNota":
                return (
                    <span className="text-right block font-semibold text-emerald-400">
                        {deal.valorNota != null ? formatCurrency(deal.valorNota) : "—"}
                    </span>
                );
            case "numeroNf":
                return <span className="font-mono text-xs text-muted-foreground">{deal.numeroNf ?? "—"}</span>;
            case "paxName":
                return <span className="text-sm">{deal.paxName || "—"}</span>;
            case "numPassengers":
                return <span className="text-center block">{deal.numPassengers ?? "—"}</span>;
            case "departureDate":
                return (
                    <span className="text-muted-foreground whitespace-nowrap text-xs">
                        {deal.departureDate ? new Date(deal.departureDate).toLocaleDateString(formatLocale) : "—"}
                    </span>
                );
            case "horarioSpIda":
                return (
                    <span className="text-muted-foreground whitespace-nowrap text-xs">
                        {deal.horarioSpIda ? new Date(deal.horarioSpIda).toLocaleString(formatLocale) : "—"}
                    </span>
                );
            case "horarioSpVolta":
                return (
                    <span className="text-muted-foreground whitespace-nowrap text-xs">
                        {deal.horarioSpVolta ? new Date(deal.horarioSpVolta).toLocaleString(formatLocale) : "—"}
                    </span>
                );
            case "departure":
                return <span className="text-sm text-muted-foreground">{deal.departure || "—"}</span>;
            case "destination":
                return <span className="text-sm text-muted-foreground">{deal.destination || "—"}</span>;
            case "dealDate":
                return (
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                        {deal.dealDate ? format(new Date(deal.dealDate), "dd/MM/yy", { locale: dateLocale }) : "—"}
                    </span>
                );
        }
    }, [formatLocale, dateLocale, t]);

    const activeColumns = useMemo(() => {
        const columnsMap = new Map(ALL_COLUMNS.map(c => [c.key, c]));
        return columnOrder
            .filter(key => visibleColumns.has(key))
            .map(key => columnsMap.get(key)!)
            .filter(Boolean);
    }, [ALL_COLUMNS, visibleColumns, columnOrder]);

    const orderedAllColumns = useMemo(() => {
        const columnsMap = new Map(ALL_COLUMNS.map(c => [c.key, c]));
        return columnOrder
            .map(key => columnsMap.get(key)!)
            .filter(Boolean);
    }, [ALL_COLUMNS, columnOrder]);

    const toggleColumn = useCallback((key: string) => {
        setVisibleColumns(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                if (next.size > 1) next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    }, []);

    const getFilterDescription = useCallback(() => {
        const { from, to } = filters.dateRange;
        return `${format(from, "dd MMM", { locale: dateLocale })} - ${format(to, "dd MMM yyyy", { locale: dateLocale })}`;
    }, [filters, dateLocale]);

    return (
        <>
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive shadow-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm flex-grow">{t('common.error_loading')}: {error.message}</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refetch()}
                        className="hover:bg-destructive/10"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t('common.try_again')}
                    </Button>
                </div>
            )}

            {/* Header with filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
                    <p className="text-muted-foreground">
                        {t('dashboard.subtitle')} ({getFilterDescription()})
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <DashboardFiltersComponent
                        filters={filters}
                        onFiltersChange={setFilters}
                    />
                    <Button
                        onClick={() => syncMutation.mutate()}
                        disabled={syncMutation.isPending}
                        className="gap-2 shadow-sm transition-all active:scale-95"
                    >
                        <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                        {syncMutation.isPending ? t('common.syncing') : t('common.sync')}
                    </Button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard
                    title={t('dashboard.ticketed')}
                    value={data ? formatCurrency(data.metrics.totalRevenue) : "R$ 0"}
                    subtitle={data ? t('dashboard.deals_count', { count: data.metrics.dealCount }) : undefined}
                    icon={<DollarSign className="w-5 h-5 text-primary" />}
                    delay={0}
                    isLoading={isLoading}
                />
                <MetricCard
                    title={t('dashboard.rav_billing')}
                    value={data ? formatCurrency(data.metrics.ravRevenue) : "R$ 0"}
                    subtitle={t('dashboard.total_revenue')}
                    icon={<FileText className="w-5 h-5 text-primary" />}
                    delay={50}
                    isLoading={isLoading}
                />
                <MetricCard
                    title={t('dashboard.fees_title')}
                    value={data ? formatCurrency(data.metrics.feesRevenue) : "R$ 0"}
                    subtitle={t('dashboard.fees_subtitle')}
                    icon={<TrendingUp className="w-5 h-5 text-primary" />}
                    delay={100}
                    isLoading={isLoading}
                />
            </div>

            {/* Currency Breakdown */}
            {data?.byCurrency && (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b border-border/10">
                        <CardTitle className="text-lg font-semibold">{t('dashboard.currency_dist')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {Object.entries(data.byCurrency).map(([currency, info]) => (
                                <div key={currency} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{currency}</p>
                                        <p className="text-lg font-bold">
                                            {new Intl.NumberFormat(formatLocale, { style: 'currency', currency: currency === 'BRL' ? 'BRL' : currency === 'EUR' ? 'EUR' : 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(info.total)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{t('dashboard.deals_count', { count: info.count })}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">{t('dashboard.in_brl')}</p>
                                        <p className="text-base font-semibold text-primary">{formatCurrency(info.totalBrl)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Commission Analysis (R.A.V) */}
            {data?.metrics && (
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b border-border/10">
                        <CardTitle className="text-lg font-semibold">{t('dashboard.commissions')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.today')}</p>
                                <p className="text-xl font-bold text-primary">{formatCurrency(data.metrics.todayRav)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.month')}</p>
                                <p className="text-xl font-bold text-primary">{formatCurrency(data.metrics.monthRav)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.avg_daily')}</p>
                                <p className="text-xl font-bold text-primary">{formatCurrency(data.metrics.dailyAvgRav)}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                                <p className="text-sm font-medium text-muted-foreground">{t('dashboard.avg_3d')}</p>
                                <p className="text-xl font-bold text-primary">{formatCurrency(data.metrics.threeDayAvgRav)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Deals Table with Column Filter */}
            {data?.deals && data.deals.length > 0 && (
                <Card className="border-border/50 bg-card shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b border-border/10 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-semibold">{t('dashboard.deals_table')} ({data.deals.length})</CardTitle>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" className="border-border/50" title={t('common.visible_columns')}>
                                    <Columns3 className="w-4 h-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-64 p-3 max-h-[400px] overflow-y-auto shadow-xl">
                                <p className="text-sm font-semibold mb-3">{t('common.visible_columns')}</p>
                                <Reorder.Group axis="y" values={columnOrder} onReorder={setColumnOrder} className="space-y-px">
                                    {orderedAllColumns.map(col => (
                                        <Reorder.Item
                                            key={col.key}
                                            value={col.key}
                                            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer text-sm transition-colors group bg-card"
                                        >
                                            <div className="cursor-grab active:cursor-grabbing text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
                                                <GripVertical className="w-4 h-4" />
                                            </div>
                                            <Checkbox
                                                id={`check-${col.key}`}
                                                checked={visibleColumns.has(col.key)}
                                                onCheckedChange={() => toggleColumn(col.key)}
                                            />
                                            <label htmlFor={`check-${col.key}`} className="grow cursor-pointer select-none">
                                                {col.label}
                                            </label>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            </PopoverContent>
                        </Popover>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/30">
                                    <tr className="border-b border-border/50">
                                        {activeColumns.map(col => (
                                            <th
                                                key={col.key}
                                                className={`py-3 px-4 font-semibold text-muted-foreground uppercase tracking-wider text-[11px] whitespace-nowrap ${RIGHT_ALIGNED.has(col.key) ? "text-right" : "text-left"}`}
                                            >
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.deals.map((deal) => (
                                        <tr key={deal.id} className="border-b border-border/10 hover:bg-muted/20 transition-colors group">
                                            {activeColumns.map(col => (
                                                <td key={col.key} className="py-3 px-4 whitespace-nowrap">
                                                    {renderDealCell(deal, col.key)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );
};

export default Index;
