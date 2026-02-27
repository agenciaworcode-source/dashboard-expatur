import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// ─── Config ─────────────────────────────────────────────────────────
const BITRIX_WEBHOOK = "https://expaturtravel.bitrix24.com.br/rest/26/up8m1o2k80hmmwir";

const STAGES = {
  "UC_DTK0RF": "ticketed",
  "WON": "flown",
} as const;

const FALLBACK_RATES: Record<string, number> = {
  USD: 5.80,
  EUR: 6.30,
};

// Issuing Partner enum map (Bitrix enumeration ID → label)
const ISSUING_PARTNER_MAP: Record<string, string> = {
  "174": "Smiles",
  "176": "Latam",
  "178": "Azul",
  "180": "Consolidator",
  "190": "QR Privilege Club",
  "192": "IB Iberia Plus",
  "198": "Azul Pelo Mundo",
  "204": "CM Connect Miles",
  "208": "AFKLM Flying Blue",
};

// Bitrix fields we need
const SELECT_FIELDS = [
  "ID", "TITLE", "STAGE_ID",
  "CURRENCY_ID", "OPPORTUNITY",
  "MOVED_TIME", "DATE_CREATE",
  "CONTACT_ID",
  "UF_CRM_1756992493574",   // DEPARTURE (1)
  "UF_CRM_1756992747627",   // DESTINATION (1)
  "UF_CRM_1757190455496",   // Fees (R$)
  "UF_CRM_1757338964489",   // CÂMBIO PARA BRL (R$)
  // ─── Extended fields ───
  "UF_CRM_1757190314483",   // Volume (x1000)
  "UF_CRM_1757190328531",   // C.P.M (R$)
  "UF_CRM_1757192894574",   // VALOR DA NOTA (R$)
  "UF_CRM_1757192916639",   // NÚMERO N.F
  "UF_CRM_1757195905762",   // Airline (IATA CODE)
  "UF_CRM_1757086906365",   // PNR
  "UF_CRM_1764259589338",   // ISSUING PARTNER 1 (enum)
  "UF_CRM_1763603095809",   // F. SUBTOTAL (R$)
  "UF_CRM_1756994205699",   // DATE OF DEPARTURE (1)
  "UF_CRM_1765324058",      // HORARIO SP / DEP IDA
  "UF_CRM_1765888934348",   // HORARIO SP / VOLTA
  "UF_CRM_1762867470569",   // PAX
  "UF_CRM_1762867504476",   // Number of passengers
  // ─── Expense fields ───
  "UF_CRM_1758643702390",   // Volume retour (x1000)
  "UF_CRM_1763584871346",   // c.p.m 2
  "UF_CRM_1758643738446",   // Fees retour (R$)
  "UF_CRM_1757190378686",   // Additional services/options
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

// ─── Bitrix API ─────────────────────────────────────────────────────

async function bitrixRequest(method: string, params: Record<string, any> = {}): Promise<any> {
  const url = new URL(`${BITRIX_WEBHOOK}/${method}`);

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((v, i) => url.searchParams.append(`${key}[${i}]`, String(v)));
    } else if (typeof value === "object" && value !== null) {
      for (const [subKey, subValue] of Object.entries(value)) {
        url.searchParams.append(`${key}[${subKey}]`, String(subValue));
      }
    } else {
      url.searchParams.append(key, String(value));
    }
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Bitrix API error: ${res.status}`);
  return res.json();
}

async function fetchDeals(stageId: string): Promise<any[]> {
  const all: any[] = [];
  let start = 0;

  while (true) {
    const res = await bitrixRequest("crm.deal.list", {
      filter: { STAGE_ID: stageId },
      select: SELECT_FIELDS,
      order: { ID: "DESC" },
      start,
    });

    const items = res.result || [];
    all.push(...items);

    if (res.next && res.next > start) {
      start = res.next;
    } else {
      break;
    }

    if (all.length > 500) {
      console.warn(`Safety break at ${all.length} deals for stage ${stageId}`);
      break;
    }
  }

  return all;
}

// ─── Helpers ────────────────────────────────────────────────────────

function toNum(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return isNaN(n) ? null : n;
}

function calcBRL(amount: number, currency: string, exchangeRate: number | null): number {
  if (currency === "BRL") return amount;
  if (exchangeRate && exchangeRate > 0) return amount * exchangeRate;
  return amount * (FALLBACK_RATES[currency] || 1);
}

// ─── Main Handler ───────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    let body: any = {};
    if (req.method === "POST") {
      try { body = await req.json(); } catch { body = {}; }
    }

    const action = url.searchParams.get("action") || body.action || "dashboard";

    const filters = body.filters || {};
    const dateFrom = url.searchParams.get("dateFrom") || filters.dateFrom;
    const dateTo = url.searchParams.get("dateTo") || filters.dateTo;
    const stageFilter = url.searchParams.get("stage") || filters.stageFilter;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ═══════════════════════════════════════════════════════════════
    // SYNC — Fetch from Bitrix → Save to Supabase
    // ═══════════════════════════════════════════════════════════════
    if (action === "sync") {
      console.log("Starting sync...");

      const [ticketedDeals, flownDeals] = await Promise.all([
        fetchDeals("UC_DTK0RF"),
        fetchDeals("WON"),
      ]);

      console.log(`Fetched: ${ticketedDeals.length} ticketed, ${flownDeals.length} flown`);

      const allDeals = [
        ...ticketedDeals.map(d => ({ ...d, _stage: "ticketed" })),
        ...flownDeals.map(d => ({ ...d, _stage: "flown" })),
      ];

      const rows = allDeals.map(d => {
        const amount = toNum(d.OPPORTUNITY) || 0;
        const currency = (d.CURRENCY_ID || "BRL").toUpperCase();
        const exchangeRate = toNum(d.UF_CRM_1757338964489);
        const amountBrl = calcBRL(amount, currency, exchangeRate);

        // Resolve issuing partner enum
        const issuingPartnerRaw = d.UF_CRM_1764259589338;
        const issuingPartner = issuingPartnerRaw
          ? (ISSUING_PARTNER_MAP[String(issuingPartnerRaw)] || String(issuingPartnerRaw))
          : null;

        return {
          bitrix_id: parseInt(d.ID),
          title: d.TITLE || null,
          stage: d._stage,
          currency,
          amount,
          exchange_rate: exchangeRate,
          amount_brl: Math.round(amountBrl * 100) / 100,
          fees_brl: toNum(d.UF_CRM_1757190455496),
          deal_date: d.MOVED_TIME || null,
          created_at: d.DATE_CREATE || null,
          contact_id: d.CONTACT_ID ? parseInt(d.CONTACT_ID) : null,
          departure: d.UF_CRM_1756992493574 || null,
          destination: d.UF_CRM_1756992747627 || null,
          synced_at: new Date().toISOString(),
          // ─── Extended fields ───
          volume_x1000: toNum(d.UF_CRM_1757190314483),
          cpm_brl: toNum(d.UF_CRM_1757190328531),
          valor_nota: toNum(d.UF_CRM_1757192894574),
          numero_nf: toNum(d.UF_CRM_1757192916639),
          airline_iata: d.UF_CRM_1757195905762 || null,
          pnr: d.UF_CRM_1757086906365 || null,
          issuing_partner: issuingPartner,
          subtotal_brl: toNum(d.UF_CRM_1763603095809),
          departure_date: d.UF_CRM_1756994205699 || null,
          horario_sp_ida: d.UF_CRM_1765324058 || null,
          horario_sp_volta: d.UF_CRM_1765888934348 || null,
          pax_name: d.UF_CRM_1762867470569 || null,
          num_passengers: toNum(d.UF_CRM_1762867504476),
          // ─── Expense fields ───
          volume_retour_x1000: toNum(d.UF_CRM_1758643702390),
          cpm_2_brl: toNum(d.UF_CRM_1763584871346),
          fees_retour_brl: toNum(d.UF_CRM_1758643738446),
          additional_services_brl: toNum(d.UF_CRM_1757190378686),
        };
      });

      // Upsert in batches of 50
      let errors = 0;
      for (let i = 0; i < rows.length; i += 50) {
        const batch = rows.slice(i, i + 50);
        const { error } = await supabase
          .from("deals")
          .upsert(batch, { onConflict: "bitrix_id" });

        if (error) {
          console.error(`Batch ${i} error:`, JSON.stringify(error));
          errors++;
        }
      }

      const summary = {
        success: true,
        total: rows.length,
        ticketed: ticketedDeals.length,
        flown: flownDeals.length,
        errors,
      };
      console.log("Sync complete:", JSON.stringify(summary));

      return new Response(JSON.stringify(summary), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // DASHBOARD — Read from Supabase → Return metrics
    // ═══════════════════════════════════════════════════════════════
    if (action === "dashboard") {
      const query = supabase.from("deals").select("*").order("deal_date", { ascending: false });

      const { data: deals, error } = await query;
      if (error) throw error;

      let filtered = deals || [];

      if (dateFrom && dateTo) {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);

        filtered = filtered.filter((d: any) => {
          const dd = new Date(d.deal_date || d.created_at);
          return dd >= from && dd <= to;
        });
      }

      if (stageFilter && stageFilter !== "all") {
        filtered = filtered.filter((d: any) => d.stage === stageFilter);
      }

      const ticketed = filtered.filter((d: any) => d.stage === "ticketed");
      const flown = filtered.filter((d: any) => d.stage === "flown");

      const sum = (arr: any[]) => arr.reduce((s: number, d: any) => s + Number(d.amount_brl || 0), 0);
      const sumRav = (arr: any[]) => arr.reduce((s: number, d: any) => s + Number(d.valor_nota || 0), 0);
      const sumFees = (arr: any[]) => arr.reduce((s: number, d: any) => s + Number(d.fees_brl || 0) + Number(d.fees_retour_brl || 0), 0);
      
      const sumInvestMiles = (arr: any[]) => arr.reduce((s: number, d: any) => 
        s + (Number(d.volume_x1000 || 0) * Number(d.cpm_brl || 0)) + (Number(d.volume_retour_x1000 || 0) * Number(d.cpm_2_brl || 0)), 0);
      
      const sumInvestIda = (arr: any[]) => arr.reduce((s: number, d: any) => 
        s + (Number(d.volume_x1000 || 0) * Number(d.cpm_brl || 0)), 0);
      
      const sumInvestVolta = (arr: any[]) => arr.reduce((s: number, d: any) => 
        s + (Number(d.volume_retour_x1000 || 0) * Number(d.cpm_2_brl || 0)), 0);

      const totalAddServices = filtered.reduce((s: number, d: any) => s + Number(d.additional_services_brl || 0), 0);
      const totalFees = sumFees(filtered);
      const milesInvestment = sumInvestMiles(filtered);
      const totalInvestment = milesInvestment + totalFees + totalAddServices;

      // --- Temporal Rav Metrics (Comissionamento) ---
      const now = new Date();
      const brNow = new Date(now.getTime() - 3 * 3600000); // Simple GMT-3
      const todayStr = brNow.toISOString().split('T')[0];
      const monthStr = todayStr.substring(0, 7); // YYYY-MM
      
      const dealsForTemporal: any[] = deals || [];
      
      const todayRavDeals = dealsForTemporal.filter((d: any) => (d.deal_date || d.created_at || '').split('T')[0] === todayStr);
      const monthRavDeals = dealsForTemporal.filter((d: any) => (d.deal_date || d.created_at || '').startsWith(monthStr));
      
      const dayOfMonth = brNow.getDate();
      const monthRav = sumRav(monthRavDeals);
      const dailyAvgRav = dayOfMonth > 0 ? monthRav / dayOfMonth : 0;
      
      const last3Days: string[] = [];
      for (let i = 0; i < 3; i++) {
        const d = new Date(brNow.getTime() - i * 86400000);
        last3Days.push(d.toISOString().split('T')[0]);
      }
      const threeDayRavDeals = dealsForTemporal.filter((d: any) => last3Days.includes((d.deal_date || d.created_at || '').split('T')[0]));
      const threeDayAvgRav = sumRav(threeDayRavDeals) / 3;

      const byCurrency = (arr: any[]) => {
        const result: Record<string, { count: number; total: number; totalBrl: number }> = {};
        for (const d of arr as any[]) {
          const c = (d.currency || "BRL") as string;
          if (!result[c]) result[c] = { count: 0, total: 0, totalBrl: 0 };
          result[c].count++;
          result[c].total += Number(d.amount || 0);
          result[c].totalBrl += Number(d.amount_brl || 0);
        }
        return result;
      };

      const responseData = {
        metrics: {
          totalRevenue: Math.round(sum(filtered) * 100) / 100,
          ticketedRevenue: Math.round(sum(ticketed) * 100) / 100,
          flownRevenue: Math.round(sum(flown) * 100) / 100,
          ravRevenue: Math.round(sumRav(filtered) * 100) / 100,
          feesRevenue: Math.round(sumFees(filtered) * 100) / 100,
          
          // Re-calculated "Investment" metrics (Expenses focus)
          totalInvestment: Math.round(totalInvestment * 100) / 100,
          milesInvestment: Math.round(milesInvestment * 100) / 100,
          milesIda: Math.round(sumInvestIda(filtered) * 100) / 100,
          milesVolta: Math.round(sumInvestVolta(filtered) * 100) / 100,
          totalAddServices: Math.round(totalAddServices * 100) / 100,
          totalFees: Math.round(totalFees * 100) / 100,
          totalVolume: Math.round(filtered.reduce((s: number, d: any) => s + Number(d.volume_x1000 || 0) + Number(d.volume_retour_x1000 || 0), 0) * 100) / 100,
          
          todayRav: Math.round(sumRav(todayRavDeals) * 100) / 100,
          monthRav: Math.round(monthRav * 100) / 100,
          dailyAvgRav: Math.round(dailyAvgRav * 100) / 100,
          threeDayAvgRav: Math.round(threeDayAvgRav * 100) / 100,
          dealCount: filtered.length,
          ticketedCount: ticketed.length,
          flownCount: flown.length,
        },
        byCurrency: byCurrency(filtered),
        deals: filtered.map(d => ({
          id: d.bitrix_id,
          title: d.title,
          stage: d.stage,
          currency: d.currency,
          amount: d.amount,
          amountBrl: d.amount_brl,
          feesBrl: d.fees_brl,
          exchangeRate: d.exchange_rate,
          dealDate: d.deal_date,
          departure: d.departure,
          destination: d.destination,
          // ─── Extended fields ───
          volumeX1000: d.volume_x1000,
          cpmBrl: d.cpm_brl,
          valorNota: d.valor_nota,
          numeroNf: d.numero_nf,
          airlineIata: d.airline_iata,
          pnr: d.pnr,
          issuingPartner: d.issuing_partner,
          subtotalBrl: d.subtotal_brl,
          departureDate: d.departure_date,
          horarioSpIda: d.horario_sp_ida,
          horarioSpVolta: d.horario_sp_volta,
          paxName: d.pax_name,
          numPassengers: d.num_passengers,
          // ─── Expense fields ───
          volumeRetourX1000: d.volume_retour_x1000,
          cpm2Brl: d.cpm_2_brl,
          feesRetourBrl: d.fees_retour_brl,
          additionalServicesBrl: d.additional_services_brl,
        })),
      };

      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use ?action=sync or ?action=dashboard" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
