import React, { useState, useMemo, useRef } from 'react';
import { AssetType } from '../types/asset';
import { MOCK_HISTORY } from '../utils/mockData';

type TimeRange = '1M' | '6M' | '1Y' | 'ALL';
type ChartMetric = 'total' | AssetType;

const METRIC_MAP: Record<ChartMetric, { label: string; color: string; bgGradient: string }> = {
  total: {
    label: 'Total Net Worth',
    color: '#6366f1',
    bgGradient: 'from-indigo-500/20 to-transparent',
  },
  bank: {
    label: 'Bank Accounts',
    color: '#818cf8',
    bgGradient: 'from-indigo-400/20 to-transparent',
  },
  cash: { label: 'Cash', color: '#34d399', bgGradient: 'from-emerald-400/20 to-transparent' },
  real_estate: {
    label: 'Real Estate',
    color: '#38bdf8',
    bgGradient: 'from-sky-400/20 to-transparent',
  },
  vehicle: { label: 'Vehicles', color: '#fbbf24', bgGradient: 'from-amber-400/20 to-transparent' },
  investment: {
    label: 'Investments',
    color: '#a78bfa',
    bgGradient: 'from-violet-400/20 to-transparent',
  },
};

export function HistoryChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>('1Y');
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('total');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter history based on range
  const filteredHistory = useMemo(() => {
    let limit = MOCK_HISTORY.length;
    if (timeRange === '1M')
      limit = 2; // last 2 snapshots
    else if (timeRange === '6M') limit = 6;
    else if (timeRange === '1Y') limit = 12;

    return MOCK_HISTORY.slice(-limit);
  }, [timeRange]);

  // Extract values based on active metric
  const chartPoints = useMemo(() => {
    return filteredHistory.map((snap) => {
      const value = activeMetric === 'total' ? snap.total : snap.breakdown[activeMetric];
      return {
        date: snap.date,
        value,
      };
    });
  }, [filteredHistory, activeMetric]);

  // Max and Min values for SVG scaling
  const { minVal, yRange } = useMemo(() => {
    const values = chartPoints.map((p) => p.value);
    const max = Math.max(...values, 100);
    const min = Math.min(...values, 0);
    return {
      minVal: min,
      yRange: max - min || 1,
    };
  }, [chartPoints]);

  // SVG dimensions
  const width = 600;
  const height = 240;
  const paddingX = 40;
  const paddingY = 20;

  // Generate SVG coordinates
  const svgCoords = useMemo(() => {
    const totalPoints = chartPoints.length;
    if (totalPoints < 2) return [];

    return chartPoints.map((point, index) => {
      const x = paddingX + (index / (totalPoints - 1)) * (width - 2 * paddingX);
      const y = height - paddingY - ((point.value - minVal) / yRange) * (height - 2 * paddingY);
      return { x, y, ...point };
    });
  }, [chartPoints, minVal, yRange]);

  // Line path generator
  const linePath = useMemo(() => {
    if (svgCoords.length < 2) return '';
    return svgCoords.reduce((path, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`;
    }, '');
  }, [svgCoords]);

  // Gradient area path generator
  const areaPath = useMemo(() => {
    if (svgCoords.length < 2) return '';
    const lastPoint = svgCoords[svgCoords.length - 1];
    const firstPoint = svgCoords[0];
    if (!lastPoint || !firstPoint) return '';
    return `${linePath} L ${lastPoint.x} ${height - paddingY} L ${firstPoint.x} ${height - paddingY} Z`;
  }, [svgCoords, linePath]);

  // Handle Mouse Hover/Move for Tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current || svgCoords.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - paddingX;
    const totalWidth = width - 2 * paddingX;
    const pct = mouseX / totalWidth;

    let index = Math.round(pct * (svgCoords.length - 1));
    index = Math.max(0, Math.min(index, svgCoords.length - 1));
    setHoveredPointIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredPointIndex(null);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const selectedPoint = hoveredPointIndex !== null ? svgCoords[hoveredPointIndex] : null;

  return (
    <div
      className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl"
      ref={containerRef}
    >
      {/* Header and range toggles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-400">
            Net Worth Development
          </h3>
          <p className="text-2xl font-bold text-white mt-1">
            {selectedPoint
              ? formatCurrency(selectedPoint.value)
              : formatCurrency(chartPoints[chartPoints.length - 1]?.value || 0)}
            <span className="text-xs font-normal text-zinc-400 ml-2">
              {selectedPoint ? formatDate(selectedPoint.date) : 'Current Balance'}
            </span>
          </p>
        </div>

        {/* Range Buttons */}
        <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          {(['1M', '6M', '1Y', 'ALL'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => {
                setTimeRange(r);
                setHoveredPointIndex(null);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                timeRange === r
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selectors */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.keys(METRIC_MAP) as ChartMetric[]).map((m) => (
          <button
            key={m}
            onClick={() => {
              setActiveMetric(m);
              setHoveredPointIndex(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
              activeMetric === m
                ? 'bg-zinc-800 border-zinc-700 text-white'
                : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-800'
            }`}
          >
            {METRIC_MAP[m].label}
          </button>
        ))}
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative w-full h-[240px] select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Grids / Guidelines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#27272a"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="#27272a"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#27272a"
            strokeWidth={1}
          />

          {/* Render Area with Gradient */}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={METRIC_MAP[activeMetric].color} stopOpacity={0.15} />
              <stop offset="100%" stopColor={METRIC_MAP[activeMetric].color} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          {areaPath && <path d={areaPath} fill="url(#areaGradient)" />}

          {/* Render Trend Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={METRIC_MAP[activeMetric].color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Hover Point */}
          {selectedPoint && (
            <>
              <line
                x1={selectedPoint.x}
                y1={paddingY}
                x2={selectedPoint.x}
                y2={height - paddingY}
                stroke="#3f3f46"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
              <circle
                cx={selectedPoint.x}
                cy={selectedPoint.y}
                r={6}
                fill={METRIC_MAP[activeMetric].color}
                stroke="#09090b"
                strokeWidth={2}
              />
            </>
          )}

          {/* Start and End labels on X axis */}
          {svgCoords.length >= 2 && (
            <>
              <text
                x={paddingX}
                y={height - 4}
                fill="#71717a"
                fontSize={10}
                textAnchor="start"
                className="font-medium"
              >
                {formatDate(svgCoords[0]?.date || '')}
              </text>
              <text
                x={width - paddingX}
                y={height - 4}
                fill="#71717a"
                fontSize={10}
                textAnchor="end"
                className="font-medium"
              >
                {formatDate(svgCoords[svgCoords.length - 1]?.date || '')}
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
export default HistoryChart;
