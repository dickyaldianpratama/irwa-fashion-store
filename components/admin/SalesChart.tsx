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
  CreditCard,
  Info
} from "lucide-react";

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
    // Jika tidak ada initialData atau jika range berubah dari initialRange, fetch data baru
    if (!initialData || range !== initialRange) {
      fetchAnalytics(range);
    }
  }, [range]);

  // Calculations for SVG rendering
  const values = chartData.map((item) => (metric === "revenue" ? item.revenue : item.orders));
  const maxValue = Math.max(...values, metric === "revenue" ? 100000 : 5);

  const formatRupiah = (val: number) => {
    if (val >= 1_000_000_000) return `Rp ${(val / 1_000_000_000).toFixed(1)}M`;
    if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}Jt`;
    if (val >= 1_000) return `Rp ${(val / 1_000).toFixed(0)}Rb`;
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  const formatAxisRupiah = (val: number) => {
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}M`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}Jt`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
    return `${val}`;
  };

  // Generate Y-axis grid ticks (4 steps)
  const yTicks = [0, 0.33, 0.66, 1].map((factor) => Math.round(maxValue * factor));

  // Canvas / SVG Dimensions
  const svgWidth = 800;
  const svgHeight = 260;
  const paddingX = 45;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Calculate coordinates for line/area points
  const points = chartData.map((item, index) => {
    const val = metric === "revenue" ? item.revenue : item.orders;
    const x = chartData.length > 1
      ? paddingX + (index / (chartData.length - 1)) * chartWidth
      : paddingX + chartWidth / 2;
    const y = paddingY + chartHeight - (val / (maxValue || 1)) * chartHeight;
    return { x, y, val, item };
  });

  // Construct Smooth Path (Cubic Bezier curve) for Area Chart
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
        <div className="h-10 flex items-center justify-between px-2 text-xs">
          {activeItem ? (
            <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 px-3 py-1.5 rounded-lg w-full transition-all">
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
        <div className="w-full h-64 relative select-none">
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
              // Menampilkan label X-axis secukupnya agar tidak menumpuk
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
                {/* Area Fill */}
                <path
                  d={areaD}
                  fill={`url(#${gradientId}-${metric === "revenue" ? "revenue" : "orders"})`}
                />

                {/* Smooth Curve Line */}
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
                  {/* Invisible Hit Area Box for smooth hovering */}
                  <rect
                    x={pt.x - hitAreaWidth / 2}
                    y={paddingY}
                    width={hitAreaWidth}
                    height={chartHeight}
                    fill="transparent"
                    onMouseEnter={() => setActivePointIndex(idx)}
                  />

                  {/* Vertical Hover Guide Line */}
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

                  {/* Line Chart Data Point Circle */}
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
    </div>
  );
}
