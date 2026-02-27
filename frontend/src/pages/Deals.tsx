import { useState, useMemo, useCallback, useEffect } from "react";
import { Reorder } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/hooks/useBitrixData";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Columns3, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

// ─── Definição das colunas ──────────────────────────────────────────

interface ColumnDef {
    key: string;
    label: string;
}

// ─── Helpers ────────────────────────────────────────────────────────

function abbreviateAirport(full: string | null): string {
    if (!full) return "?";
    const code = full.split(" - ")[0]?.trim();
    return code || full;
}

function formatAmount(value: number | string | null, currency: string, locale: string): string {
    if (value === null || value === undefined) return "—";
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "—";

    const symbolMap: Record<string, string> = {
        USD: "$",
        EUR: "€",
        BRL: "R$",
    };
    const symbol = symbolMap[currency] || currency + " ";

    return `${symbol} ${num.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ─── Componente ─────────────────────────────────────────────────────

const Deals = () => {
    const { t, i18n } = useTranslation();
    const [searchTerm, setSearchTerm] = useState("");
    const [stageFilter, setStageFilter] = useState("all");
    const dateLocale = i18n.language.startsWith('en') ? 'en-US' : 'pt-BR';

    const ALL_COLUMNS: ColumnDef[] = useMemo(() => [
        { key: "bitrix_id", label: "ID" },
        { key: "title", label: t('deals.columns.title') },
        { key: "stage", label: t('deals.columns.stage') },
        { key: "route", label: t('deals.columns.route') },
        { key: "departure", label: t('deals.columns.departure') },
        { key: "destination", label: t('deals.columns.destination') },
        { key: "airline_iata", label: t('deals.columns.airline') },
        { key: "pnr", label: t('common.pnr') },
        { key: "issuing_partner", label: "Issuing Partner" },
        { key: "currency", label: t('deals.columns.currency') },
        { key: "amount", label: t('deals.columns.amount') },
        { key: "exchange_rate", label: t('deals.columns.exchange_rate') },
        { key: "amount_brl", label: t('deals.columns.amount_brl') },
        { key: "volume_x1000", label: t('deals.columns.volume') },
        { key: "cpm_brl", label: t('deals.columns.cpm') },
        { key: "fees_brl", label: t('deals.columns.fees') },
        { key: "subtotal_brl", label: t('deals.columns.subtotal') },
        { key: "valor_nota", label: t('deals.columns.rav') },
        { key: "numero_nf", label: t('deals.columns.nf') },
        { key: "pax_name", label: t('deals.columns.pax') },
        { key: "num_passengers", label: t('deals.columns.passengers') },
        { key: "departure_date", label: t('deals.columns.date') },
        { key: "horario_sp_ida", label: "Horário SP Ida" },
        { key: "horario_sp_volta", label: "Horário SP Volta" },
        { key: "contact_id", label: "Contato ID" },
        { key: "deal_date", label: "Data Deal" },
        { key: "created_at", label: t('deals.columns.created') },
        { key: "synced_at", label: t('deals.columns.synced') },
    ], [t]);

    const initialOrder = useMemo(() => {
        const saved = localStorage.getItem("expatur_deals_column_order");
        if (saved) return JSON.parse(saved) as string[];
        return ALL_COLUMNS.map(c => c.key);
    }, [ALL_COLUMNS]);

    const initialVisible = useMemo(() => {
        const saved = localStorage.getItem("expatur_deals_visible_columns");
        if (saved) return new Set(JSON.parse(saved) as string[]);
        return new Set(ALL_COLUMNS.map(c => c.key).slice(0, 15));
    }, [ALL_COLUMNS]);

    const [columnOrder, setColumnOrder] = useState<string[]>(initialOrder);
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(initialVisible);

    useEffect(() => {
        localStorage.setItem("expatur_deals_column_order", JSON.stringify(columnOrder));
    }, [columnOrder]);

    useEffect(() => {
        localStorage.setItem("expatur_deals_visible_columns", JSON.stringify(Array.from(visibleColumns)));
    }, [visibleColumns]);

    const { data: deals, isLoading } = useQuery({
        queryKey: ['deals-list'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('deals')
                .select('id, bitrix_id, title, stage, departure, destination, airline_iata, pnr, issuing_partner, currency, amount, exchange_rate, amount_brl, volume_x1000, cpm_brl, fees_brl, subtotal_brl, valor_nota, numero_nf, pax_name, num_passengers, departure_date, horario_sp_ida, horario_sp_volta, contact_id, deal_date, created_at, synced_at')
                .order('deal_date', { ascending: false });

            if (error) throw error;
            return data;
        }
    });

    const stageConfig = useCallback((stage: string) => {
        switch (stage) {
            case "ticketed":
                return { label: "Ticketed", bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" };
            case "flown":
                return { label: "Flown", bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" };
            case "won":
                return { label: t('deals.stage_won'), bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" };
            case "lost":
                return { label: t('deals.stage_lost'), bg: "bg-destructive/15", text: "text-destructive", border: "border-destructive/30" };
            default:
                return { label: stage, bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };
        }
    }, [t]);

    // ─── Filtros ────────────────────────────────────────────────────

    const filteredDeals = useMemo(() => deals?.filter(deal => {
        const matchesSearch =
            deal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deal.departure?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            deal.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(deal.bitrix_id).includes(searchTerm);
        const matchesStage = stageFilter === "all" || deal.stage === stageFilter;
        return matchesSearch && matchesStage;
    }), [deals, searchTerm, stageFilter]);

    // ─── Toggle de coluna ───────────────────────────────────────────

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

    const isVisible = useCallback((key: string) => visibleColumns.has(key), [visibleColumns]);

    // ─── Render de uma célula ───────────────────────────────────────

    const renderCell = useCallback((deal: any, colKey: string) => {
        switch (colKey) {
            case "bitrix_id":
                return <span className="text-muted-foreground font-mono text-xs">{deal.bitrix_id}</span>;
            case "title":
                return <span className="font-medium">{deal.title}</span>;
            case "stage": {
                const cfg = stageConfig(deal.stage);
                return (
                    <Badge variant="outline" className={`${cfg.bg} ${cfg.text} ${cfg.border} font-normal`}>
                        {cfg.label}
                    </Badge>
                );
            }
            case "route":
                return (
                    <span className="text-sm whitespace-nowrap">
                        {abbreviateAirport(deal.departure)}
                        <span className="text-muted-foreground mx-1">→</span>
                        {abbreviateAirport(deal.destination)}
                    </span>
                );
            case "currency":
                return <span className="text-muted-foreground font-medium uppercase">{deal.currency}</span>;
            case "amount":
                return (
                    <span className="font-semibold text-right block font-mono">
                        {formatAmount(deal.amount, deal.currency, dateLocale)}
                    </span>
                );
            case "amount_brl":
                return (
                    <span className="font-semibold text-primary text-right block font-mono">
                        {formatCurrency(parseFloat(deal.amount_brl) || 0)}
                    </span>
                );
            case "fees_brl":
                return (
                    <span className="text-right block text-muted-foreground font-mono">
                        {deal.fees_brl ? formatCurrency(parseFloat(deal.fees_brl)) : "—"}
                    </span>
                );
            case "departure":
                return <span className="text-xs text-muted-foreground">{deal.departure || "—"}</span>;
            case "destination":
                return <span className="text-xs text-muted-foreground">{deal.destination || "—"}</span>;
            case "exchange_rate":
                return (
                    <span className="text-right block text-muted-foreground font-mono">
                        {deal.exchange_rate ? Number(deal.exchange_rate).toFixed(4) : "—"}
                    </span>
                );
            case "contact_id":
                return <span className="text-muted-foreground font-mono text-[10px]">{deal.contact_id ?? "—"}</span>;
            case "deal_date":
                return (
                    <span className="text-muted-foreground whitespace-nowrap text-sm">
                        {deal.deal_date ? new Date(deal.deal_date).toLocaleDateString(dateLocale) : "—"}
                    </span>
                );
            case "created_at":
                return (
                    <span className="text-muted-foreground whitespace-nowrap text-[11px]">
                        {deal.created_at ? new Date(deal.created_at).toLocaleDateString(dateLocale) : "—"}
                    </span>
                );
            case "synced_at":
                return (
                    <span className="text-muted-foreground whitespace-nowrap text-[11px]">
                        {deal.synced_at ? new Date(deal.synced_at).toLocaleString(dateLocale) : "—"}
                    </span>
                );
            case "airline_iata":
                return <span className="font-mono text-xs">{deal.airline_iata || "—"}</span>;
            case "pnr":
                return <span className="font-mono text-xs font-bold text-primary">{deal.pnr || "—"}</span>;
            case "issuing_partner":
                return <span className="text-sm">{deal.issuing_partner || "—"}</span>;
            case "volume_x1000":
                return (
                    <span className="text-right block text-muted-foreground font-mono">
                        {deal.volume_x1000 != null ? (Number(deal.volume_x1000) * 1000).toLocaleString(dateLocale, { maximumFractionDigits: 0 }).replace(/\./g, ' ') : "—"}
                    </span>
                );
            case "cpm_brl":
                return (
                    <span className="text-right block text-muted-foreground font-mono">
                        {deal.cpm_brl != null ? formatCurrency(Number(deal.cpm_brl)) : "—"}
                    </span>
                );
            case "subtotal_brl":
                return (
                    <span className="text-right block font-semibold font-mono">
                        {deal.subtotal_brl != null ? formatCurrency(Number(deal.subtotal_brl)) : "—"}
                    </span>
                );
            case "valor_nota":
                return (
                    <span className="text-right block font-bold text-emerald-400 font-mono">
                        {deal.valor_nota != null ? formatCurrency(Number(deal.valor_nota)) : "—"}
                    </span>
                );
            case "numero_nf":
                return <span className="font-mono text-xs text-muted-foreground">{deal.numero_nf ?? "—"}</span>;
            case "pax_name":
                return <span className="text-sm font-medium">{deal.pax_name || "—"}</span>;
            case "num_passengers":
                return <span className="text-center block">{deal.num_passengers ?? "—"}</span>;
            case "departure_date":
                return (
                    <span className="text-muted-foreground whitespace-nowrap text-sm">
                        {deal.departure_date ? new Date(deal.departure_date).toLocaleDateString(dateLocale) : "—"}
                    </span>
                );
            case "horario_sp_ida":
                return (
                    <span className="text-muted-foreground whitespace-nowrap text-[11px]">
                        {deal.horario_sp_ida ? new Date(deal.horario_sp_ida).toLocaleString(dateLocale) : "—"}
                    </span>
                );
            case "horario_sp_volta":
                return (
                    <span className="text-muted-foreground whitespace-nowrap text-[11px]">
                        {deal.horario_sp_volta ? new Date(deal.horario_sp_volta).toLocaleString(dateLocale) : "—"}
                    </span>
                );
            default:
                return null;
        }
    }, [dateLocale, stageConfig]);

    // ─── Colunas visíveis ───────────────────────────────────────────

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

    return (
        <>
            {/* Header / Title Section */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-display">
                    {t('deals.title')} ({filteredDeals?.length ?? 0})
                </h1>
                <p className="text-muted-foreground">
                    {t('deals.subtitle')}
                </p>
            </div>

            {/* Barra de Filtros */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center bg-card/50 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder={t('deals.search_placeholder')}
                        className="pl-9 bg-background/50 border-border/50 rounded-xl focus-visible:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Select value={stageFilter} onValueChange={setStageFilter}>
                        <SelectTrigger className="w-[180px] bg-background/50 border-border/50 rounded-xl focus:ring-primary/20">
                            <SelectValue placeholder={t('common.filter_by_stage')} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl shadow-xl border-border/50">
                            <SelectItem value="all" className="rounded-md mx-1">{t('filters.all_stages')}</SelectItem>
                            <SelectItem value="ticketed" className="rounded-md mx-1">Ticketed</SelectItem>
                            <SelectItem value="flown" className="rounded-md mx-1">Flown</SelectItem>
                        </SelectContent>
                    </Select>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="icon" className="border-border/50 rounded-xl hover:bg-muted/50" title={t('common.columns')}>
                                <Columns3 className="w-4 h-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-64 p-3 rounded-2xl shadow-xl border-border/50 max-h-[500px] overflow-y-auto">
                            <p className="text-sm font-semibold mb-3 px-1">{t('common.visible_columns')}</p>
                            <Reorder.Group axis="y" values={columnOrder} onReorder={setColumnOrder} className="space-y-px">
                                {orderedAllColumns.map(col => (
                                    <Reorder.Item
                                        key={col.key}
                                        value={col.key}
                                        className="flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm hover:bg-muted/50 transition-colors group bg-card"
                                    >
                                        <div className="cursor-grab active:cursor-grabbing text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors">
                                            <GripVertical className="w-4 h-4" />
                                        </div>
                                        <Checkbox
                                            id={`check-${col.key}`}
                                            checked={isVisible(col.key)}
                                            onCheckedChange={() => toggleColumn(col.key)}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <label htmlFor={`check-${col.key}`} className={`grow cursor-pointer select-none ${isVisible(col.key) ? 'text-foreground font-medium' : 'text-muted-foreground'} group-hover:text-foreground`}>
                                            {col.label}
                                        </label>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Tabela Container */}
            <Card className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-md">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow className="hover:bg-transparent border-border/50">
                                {activeColumns.map(col => (
                                    <TableHead
                                        key={col.key}
                                        className={`font-bold text-muted-foreground text-[11px] uppercase tracking-wider py-4 ${["amount", "amount_brl", "fees_brl", "exchange_rate", "volume_x1000", "cpm_brl", "subtotal_brl", "valor_nota"].includes(col.key) ? "text-right" : ""}`}
                                    >
                                        {col.label}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <TableRow key={i} className="border-border/10">
                                        {activeColumns.map(col => (
                                            <TableCell key={col.key}>
                                                <div className="h-4 w-full bg-muted/50 animate-pulse rounded-md" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : filteredDeals?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={activeColumns.length} className="text-center py-20 text-muted-foreground animate-in fade-in duration-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="w-8 h-8 opacity-20" />
                                            {t('deals.no_deals')}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredDeals?.map((deal) => (
                                    <TableRow key={deal.id} className="hover:bg-muted/30 transition-colors border-border/10 group">
                                        {activeColumns.map(col => (
                                            <TableCell key={col.key} className="py-2.5">
                                                {renderCell(deal, col.key)}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </>
    );
};

export default Deals;
