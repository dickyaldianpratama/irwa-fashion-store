"use client";

import { useState, useEffect, useId } from "react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  ShoppingBag,
  BarChart2,
  LineChart as LineChartIcon,
  RefreshCw,
  Award,
  Info,
  Users,
  User,
  Mail,
  Search,
  Heart,
  PackageCheck,
  ArrowUpDown
} from "lucide-react";

interface CustomerProduct {
  nama: string;
  jumlah: number;
  image?: string;
}

interface CustomerStat {
  userId: string;
  email: string;
  name: string;
  periodOrders: number;
  lifetimeOrders?: number;
  totalSpent: number;
  wishlistCount?: number;
  wishlistProducts?: { nama: string; image?: string }[];
  topProducts?: CustomerProduct[];
}

interface TimelineItem {
  label: string;
  dateKey: string;
  revenue: number;
  orders: number;
  unpaidOrders: number;
}

interface SummaryData {
  totalRevenue: number;
  prevTotalRevenue: number;
  growthRate: number;
  totalOrders: number;
  prevTotalOrders: number;
  avgOrderValue: number;
  peakPeriod: { label: string; revenue: number };
  statusBreakdown: Record<string, number>;
  customerStats?: CustomerStat[];
}

interface SalesChartProps {
  initialRange?: string;
  initialData?: {
    summary: SummaryData;
    chartData: TimelineItem[];
  };
}

export default function SalesChart({ initialRange = "30d", initialData }: SalesChartProps) {
  const [range, setRange] = useState<string>(initialRange);
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  
  const [summary, setSummary] = useState<SummaryData | null>(initialData?.summary || null);
  const [chartData, setChartData] = useState<TimelineItem[]>(initialData?.chartData || []);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);

  // Customer Filter & Search states
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [customerSort, setCustomerSort] = useState<"orders" | "spent" | "name">("orders");

  const gradientId = useId();

  const fetchAnalytics = async (selectedRange: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/sales-analytics?range=${selectedRange}`);
      if (!res.ok) throw new Error("Gagal memuat data grafik");
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
        setChartData(data.chartData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData || range !== initialRange) {
      fetchAnalytics(range);
    }
  }, [range]);

  // Filter & Sort Customer Stats
  const filteredCustomerStats = (summary?.customerStats || [])
    .filter((c) => {
      const q = customerSearch.toLowerCase().trim();
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (customerSort === "spent") {
        return b.totalSpent - a.totalSpent;
      }
      if (customerSort === "name") {
        return a.name.localeCompare(b.name);
      }
      return b.periodOrders - a.periodOrders || b.totalSpent - a.totalSpent;
    });

  // Calculations for SVG rendering
  const values = chartData.map((item) => (metric === "revenue" ? item.revenue : item.orders));
  const maxValue = Math.max(...values, metric === "revenue" ? 100000 : 5);

  const formatAxisRupiah = (val: number) => {
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}M`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}Jt`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
    return `${val}`;
  };

  const yTicks = [0, 0.33, 0.66, 1].map((factor) => Math.round(maxValue * factor));

  const svgWidth = 800;
  const svgHeight = 260;
  const paddingX = 45;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const points = chartData.map((item, index) => {
    const val = metric === "revenue" ? item.revenue : item.orders;
    const x = chartData.length > 1
      ? paddingX + (index / (chartData.length - 1)) * chartWidth
      : paddingX + chartWidth / 2;
    const y = paddingY + chartHeight - (val / (maxValue || 1)) * chartHeight;
    return { x, y, val, item };
  });

  const pathD = points.reduce((acc, point, i, a) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = a[i - 1];
    const cx1 = prev.x + (point.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (point.x - prev.x) / 2;
    const cy2 = point.y;
    return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${point.x},${point.y}`;
  }, "");

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x},${svgHeight - paddingY} L ${points[0].x},${svgHeight - paddingY} Z`
    : "";

  const activeItem = activePointIndex !== null && chartData[activePointIndex] ? chartData[activePointIndex] : null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6 transition-all">
      {/* Header controls & filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Grafik Penjualan Toko
                {loading && <RefreshCw size={14} className="animate-spin text-blue-500" />}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Visualisasi tren pendapatan dan transaksi secara real-time
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Type selector */}
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setChartType("area")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                chartType === "area"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
              title="Grafik Garis Area"
            >
              <LineChartIcon size={14} /> Area
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                chartType === "bar"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
              title="Grafik Batang"
            >
              <BarChart2 size={14} /> Batang
            </button>
          </div>

          {/* Metric Selector */}
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setMetric("revenue")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                metric === "revenue"
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <DollarSign size={13} /> Omset
            </button>
            <button
              onClick={() => setMetric("orders")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                metric === "orders"
                  ? "bg-blue-600 text-white shadow-xs font-bold"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <ShoppingBag size={13} /> Pesanan
            </button>
          </div>

          {/* Range Selector */}
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex items-center text-xs">
            {[
              { id: "7d", label: "7 Hari" },
              { id: "30d", label: "30 Hari" },
              { id: "6m", label: "6 Bulan" },
              { id: "12m", label: "12 Bulan" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setRange(t.id)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  range === t.id
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-800/40 p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 text-xs">
          <div>
            <span className="text-gray-400 block font-medium">Pendapatan Periode Ini</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-bold text-sm text-gray-900 dark:text-white">
                Rp {summary.totalRevenue.toLocaleString("id-ID")}
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                  summary.growthRate >= 0
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400"
                }`}
              >
                {summary.growthRate >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {summary.growthRate >= 0 ? `+${summary.growthRate}%` : `${summary.growthRate}%`}
              </span>
            </div>
          </div>

          <div>
            <span className="text-gray-400 block font-medium">Total Pesanan Sukses</span>
            <span className="font-bold text-sm text-gray-900 dark:text-white block mt-0.5">
              {summary.totalOrders} Transaksi
            </span>
          </div>

          <div>
            <span className="text-gray-400 block font-medium">Rata-rata / Pesanan (AOV)</span>
            <span className="font-bold text-sm text-gray-900 dark:text-white block mt-0.5">
              Rp {summary.avgOrderValue.toLocaleString("id-ID")}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block font-medium flex items-center gap-1">
              <Award size={12} className="text-amber-500" /> Penjualan Puncak (Peak)
            </span>
            <span className="font-bold text-sm text-amber-600 dark:text-amber-400 block mt-0.5 truncate">
              {summary.peakPeriod.label}: Rp {summary.peakPeriod.revenue.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      )}

      {/* Main Interactive Chart Display */}
      <div className="relative w-full overflow-hidden">
        {/* Active Point Hover Banner / Tooltip Info Box */}
        <div className="min-h-10 flex flex-wrap items-center justify-between px-2 text-xs py-1">
          {activeItem ? (
            <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 px-3 py-1.5 rounded-lg w-full transition-all flex-wrap">
              <span className="font-bold flex items-center gap-1">
                <Calendar size={13} /> {activeItem.label}
              </span>
              <span className="text-blue-300 dark:text-blue-700">•</span>
              <span>
                Pendapatan: <strong className="font-bold text-emerald-600 dark:text-emerald-400">Rp {activeItem.revenue.toLocaleString("id-ID")}</strong>
              </span>
              <span className="text-blue-300 dark:text-blue-700">•</span>
              <span>
                Pesanan Sukses: <strong className="font-bold">{activeItem.orders}</strong>
              </span>
              {activeItem.unpaidOrders > 0 && (
                <>
                  <span className="text-blue-300 dark:text-blue-700">•</span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    Belum Dibayar: {activeItem.unpaidOrders}
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="text-gray-400 dark:text-gray-500 text-[11px] flex items-center gap-1">
              <Info size={12} /> Arahkan kursor atau sentuh titik grafik untuk melihat rincian per tanggal.
            </div>
          )}
        </div>

        {/* SVG Canvas Chart */}
        <div className="w-full h-64 relative select-none mt-1">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full overflow-visible"
            onMouseLeave={() => setActivePointIndex(null)}
          >
            <defs>
              <linearGradient id={`${gradientId}-revenue`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
              </linearGradient>

              <linearGradient id={`${gradientId}-orders`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>

              <filter id={`${gradientId}-shadow`} x1="-10%" y1="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#2563eb" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {yTicks.map((tick, idx) => {
              const yPos = paddingY + chartHeight - (tick / (maxValue || 1)) * chartHeight;
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={yPos}
                    x2={svgWidth - paddingX}
                    y2={yPos}
                    stroke="currentColor"
                    className="text-gray-100 dark:text-gray-800/80"
                    strokeDasharray={idx === 0 ? "none" : "3 3"}
                    strokeWidth={1}
                  />
                  <text
                    x={paddingX - 8}
                    y={yPos + 4}
                    textAnchor="end"
                    className="fill-gray-400 dark:fill-gray-500 text-[10px] font-mono"
                  >
                    {metric === "revenue" ? formatAxisRupiah(tick) : tick}
                  </text>
                </g>
              );
            })}

            {/* X-Axis Dates Labels */}
            {points.map((pt, idx) => {
              const step = Math.ceil(chartData.length / 10);
              const showLabel = idx % step === 0 || idx === chartData.length - 1;

              return showLabel ? (
                <text
                  key={idx}
                  x={pt.x}
                  y={svgHeight - 5}
                  textAnchor="middle"
                  className="fill-gray-400 dark:fill-gray-500 text-[10px] font-medium"
                >
                  {pt.item.label}
                </text>
              ) : null;
            })}

            {/* Render Area/Line Chart */}
            {chartType === "area" && (
              <>
                <path
                  d={areaD}
                  fill={`url(#${gradientId}-${metric === "revenue" ? "revenue" : "orders"})`}
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke={metric === "revenue" ? "#2563eb" : "#10b981"}
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#${gradientId}-shadow)`}
                />
              </>
            )}

            {/* Render Bar Chart */}
            {chartType === "bar" && (
              <g>
                {points.map((pt, idx) => {
                  const barWidth = Math.max(4, Math.min(28, (chartWidth / points.length) * 0.6));
                  const barHeight = Math.max(4, (pt.val / (maxValue || 1)) * chartHeight);
                  const isHovered = activePointIndex === idx;

                  return (
                    <rect
                      key={idx}
                      x={pt.x - barWidth / 2}
                      y={paddingY + chartHeight - barHeight}
                      width={barWidth}
                      height={barHeight}
                      rx={barWidth > 8 ? 4 : 2}
                      className={`transition-all duration-200 cursor-pointer ${
                        metric === "revenue"
                          ? isHovered
                            ? "fill-blue-500 dark:fill-blue-400"
                            : "fill-blue-600/80 dark:fill-blue-500/80 hover:fill-blue-600"
                          : isHovered
                          ? "fill-emerald-500 dark:fill-emerald-400"
                          : "fill-emerald-600/80 dark:fill-emerald-500/80 hover:fill-emerald-600"
                      }`}
                      onMouseEnter={() => setActivePointIndex(idx)}
                    />
                  );
                })}
              </g>
            )}

            {/* Interactive Hover Vertical Line & Data Circles */}
            {points.map((pt, idx) => {
              const isHovered = activePointIndex === idx;
              const hitAreaWidth = chartWidth / points.length;

              return (
                <g key={idx} className="cursor-pointer">
                  <rect
                    x={pt.x - hitAreaWidth / 2}
                    y={paddingY}
                    width={hitAreaWidth}
                    height={chartHeight}
                    fill="transparent"
                    onMouseEnter={() => setActivePointIndex(idx)}
                  />

                  {isHovered && (
                    <line
                      x1={pt.x}
                      y1={paddingY}
                      x2={pt.x}
                      y2={svgHeight - paddingY}
                      stroke={metric === "revenue" ? "#2563eb" : "#10b981"}
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      className="opacity-60"
                    />
                  )}

                  {chartType === "area" && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4}
                      fill={metric === "revenue" ? "#2563eb" : "#10b981"}
                      stroke="white"
                      strokeWidth={isHovered ? 3 : 2}
                      className="transition-all duration-150 shadow-md"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Frekuensi Pesanan & Analisis Minat Produk Pelanggan */}
      {summary?.customerStats && summary.customerStats.length > 0 && (
        <div className="pt-5 border-t border-gray-100 dark:border-gray-800 space-y-4">
          {/* Header section & Controls Filter/Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-500 shrink-0" />
                <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Frekuensi Pesanan & Minat Produk Pelanggan
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  {summary.customerStats.length} Pelanggan
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Cari pelanggan & temukan produk pakaian favorit yang paling sering mereka beli
              </p>
            </div>

            {/* Filter Tools: Search bar & Sort dropdown */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search input */}
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau email..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-44 sm:w-52"
                />
              </div>

              {/* Sort selector */}
              <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex items-center text-xs">
                <span className="text-gray-400 px-1.5 text-[11px] flex items-center gap-1">
                  <ArrowUpDown size={12} /> Urut:
                </span>
                <button
                  onClick={() => setCustomerSort("orders")}
                  className={`px-2 py-1 rounded-lg font-medium transition-all text-[11px] ${
                    customerSort === "orders"
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                  }`}
                >
                  Pesanan
                </button>
                <button
                  onClick={() => setCustomerSort("spent")}
                  className={`px-2 py-1 rounded-lg font-medium transition-all text-[11px] ${
                    customerSort === "spent"
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                  }`}
                >
                  Omset
                </button>
                <button
                  onClick={() => setCustomerSort("name")}
                  className={`px-2 py-1 rounded-lg font-medium transition-all text-[11px] ${
                    customerSort === "name"
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                      : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                  }`}
                >
                  Nama
                </button>
              </div>
            </div>
          </div>

          {/* Customer Cards List */}
          {filteredCustomerStats.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
              Tidak ada pelanggan ditemukan dengan kata kunci &quot;{customerSearch}&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-80 overflow-y-auto pr-1">
              {filteredCustomerStats.map((cust, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-800/60 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800/80 flex flex-col justify-between hover:bg-gray-100/80 dark:hover:bg-gray-800 transition-all shadow-2xs space-y-2.5"
                >
                  {/* Top Row: User Info & Order Count Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {cust.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Mail size={11} className="text-gray-400 shrink-0" />
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate font-mono">
                          {cust.email}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-2xs">
                        {cust.periodOrders}x Pesanan
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40">
                        <Heart size={10} className="fill-rose-500 text-rose-500" /> {cust.wishlistCount || 0} Wishlist
                      </span>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        Rp {cust.totalSpent.toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>

                  {/* Wishlist Produk Disukai */}
                  {cust.wishlistProducts && cust.wishlistProducts.length > 0 && (
                    <div className="pt-2 border-t border-gray-200/60 dark:border-gray-700/60 space-y-1">
                      <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                        <Heart size={10} className="text-rose-500 fill-rose-500" /> Wishlist Disukai ({cust.wishlistCount} Produk):
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {cust.wishlistProducts.map((p, pi) => (
                          <span
                            key={pi}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/40 rounded-md text-[10px] font-medium text-rose-800 dark:text-rose-200 shadow-2xs max-w-full truncate"
                          >
                            <Heart size={9} className="fill-rose-500 text-rose-500 shrink-0" />
                            <span className="truncate max-w-[130px]">{p.nama}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Most Purchased Products */}
                  {cust.topProducts && cust.topProducts.length > 0 && (
                    <div className="pt-1.5 border-t border-gray-200/60 dark:border-gray-700/60 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <PackageCheck size={10} className="text-blue-500" /> Produk Sering Dibeli:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {cust.topProducts.map((p, pi) => (
                          <span
                            key={pi}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-700/80 rounded-md text-[10px] font-medium text-gray-800 dark:text-gray-200 shadow-2xs max-w-full truncate"
                          >
                            <PackageCheck size={10} className="text-blue-500 shrink-0" />
                            <span className="truncate max-w-[120px]">{p.nama}</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">({p.jumlah}x)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
