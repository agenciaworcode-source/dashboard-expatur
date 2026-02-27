import { Calendar, Filter, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, subMonths, startOfMonth, endOfMonth, subDays } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";

export interface DashboardFilters {
    dateRange: {
        from: Date;
        to: Date;
    };
    stageFilter: string;
}

interface DashboardFiltersProps {
    filters: DashboardFilters;
    onFiltersChange: (filters: DashboardFilters) => void;
    stages?: { bitrix_id: string; name: string }[];
}

export function DashboardFiltersComponent({ filters, onFiltersChange, stages = [] }: DashboardFiltersProps) {
    const { t, i18n } = useTranslation();
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const dateLocale = i18n.language.startsWith('en') ? enUS : ptBR;

    const presetRanges = [
        { label: t('filters.last_7_days'), getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
        { label: t('filters.last_30_days'), getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
        { label: t('filters.this_month'), getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
        { label: t('filters.last_month'), getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
        { label: t('filters.last_3_months'), getValue: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
        { label: t('filters.this_year'), getValue: () => ({ from: new Date(new Date().getFullYear(), 0, 1), to: new Date() }) },
        { label: t('filters.all_time'), getValue: () => ({ from: new Date(2020, 0, 1), to: new Date() }) },
    ];
    
    // Internal state for the calendar selection
    const [pendingRange, setPendingRange] = useState<DateRange | undefined>({
        from: filters.dateRange.from,
        to: filters.dateRange.to,
    });

    // Sync internal state when filters change externally
    useEffect(() => {
        setPendingRange({ from: filters.dateRange.from, to: filters.dateRange.to });
    }, [filters.dateRange.from, filters.dateRange.to]);

    const handleDateRangeChange = (range: DateRange | undefined) => {
        setPendingRange(range);
        if (range?.from && range?.to) {
            onFiltersChange({
                ...filters,
                dateRange: { from: range.from, to: range.to }
            });
        }
    };

    const handlePresetClick = (preset: any) => {
        const range = preset.getValue();
        setPendingRange(range);
        onFiltersChange({
            ...filters,
            dateRange: range
        });
        setDatePickerOpen(false);
    };

    const handleStageChange = (value: string) => {
        onFiltersChange({
            ...filters,
            stageFilter: value
        });
    };

    const formatDateRange = () => {
        const { from, to } = filters.dateRange;
        if (from && to) {
            return `${format(from, "dd MMM", { locale: dateLocale })} - ${format(to, "dd MMM yyyy", { locale: dateLocale })}`;
        }
        return t('filters.select_period');
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Filter */}
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2 h-9">
                        <Calendar className="w-4 h-4" />
                        <span className="hidden sm:inline">{formatDateRange()}</span>
                        <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex">
                        {/* Preset options */}
                        <div className="border-r border-border p-2 space-y-1">
                            {presetRanges.map((preset) => (
                                <Button
                                    key={preset.label}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start text-sm"
                                    onClick={() => handlePresetClick(preset)}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                        {/* Calendar */}
                        <div className="p-3">
                            <CalendarComponent
                                mode="range"
                                selected={pendingRange}
                                onSelect={handleDateRangeChange}
                                numberOfMonths={2}
                                locale={dateLocale}
                            />
                            {/* Hint when user selected only the start date */}
                            {pendingRange?.from && !pendingRange?.to && (
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    {t('filters.start_date_hint', { date: format(pendingRange.from, "dd/MM/yyyy") })}
                                </p>
                            )}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Stage/Funnel Filter */}
            <Select value={filters.stageFilter} onValueChange={handleStageChange}>
                <SelectTrigger className="w-[180px] h-9">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder={t('filters.all_stages')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('filters.all_stages')}</SelectItem>
                    <SelectItem value="ticketed">Ticketed / Upcoming Trip</SelectItem>
                    <SelectItem value="flown">Flown</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

// Default filters
export const getDefaultFilters = (): DashboardFilters => ({
    dateRange: {
        from: startOfMonth(new Date()),
        to: new Date()
    },
    stageFilter: "all"
});
