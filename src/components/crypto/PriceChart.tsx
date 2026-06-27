import { useState, useRef, useMemo, type MouseEvent } from 'react';

interface PriceChartProps {
  prices: [number, number][];
  days: number;
  onDaysChange: (days: number) => void;
}

const width = 600;
const height = 280;
const paddingX = 10;
const paddingY = 20;

export default function PriceChart({ prices, days, onDaysChange }: PriceChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // FIX: Destructure only the variables that are actually used downstream
  const { points, pathString, fillPathString, values } = useMemo(() => {
    if (!prices || prices.length === 0) {
      return { points: [], pathString: '', fillPathString: '', values: [] };
    }

    const priceValues = prices.map(p => p[1]);
    const min = Math.min(...priceValues);
    const max = Math.max(...priceValues);
    const range = max - min || 1;

    const mappedPoints = prices.map((item, index) => {
      const x = paddingX + (index / (prices.length - 1)) * (width - paddingX * 2);
      const y = height - paddingY - ((item[1] - min) / range) * (height - paddingY * 2);
      return { x, y, time: item[0], price: item[1] };
    });

    const path = mappedPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const fillPath = `${path} L ${mappedPoints[mappedPoints.length - 1].x} ${height - paddingY} L ${mappedPoints[0].x} ${height - paddingY} Z`;

    return {
      points: mappedPoints,
      pathString: path,
      fillPathString: fillPath,
      values: priceValues
    };
  }, [prices]); // Standardized dependency array

  if (!prices || prices.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center font-mono text-xs text-gray-500">
        // NO_CHART_COORDINATES_INGESTED
      </div>
    );
  }

  // Process mouse alignment coordinate tracking
  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const relativeX = mouseX / rect.width;
    const rawIndex = relativeX * (prices.length - 1);
    const targetIndex = Math.min(prices.length - 1, Math.max(0, Math.round(rawIndex)));
    setHoveredIndex(targetIndex);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const currentHoveredPoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div className="rounded-xl border border-cyan-400/20 bg-gray-900/60 p-6 backdrop-blur">
      <div className="flex items-center justify-between border-b border-cyan-400/10 pb-4 mb-4">
        <div>
          <span className="font-mono text-xs text-gray-500">// CHRONO_GRID:</span>
          <div className="mt-1 font-mono text-lg font-bold text-cyan-400">
            {currentHoveredPoint ? (
              <span>${currentHoveredPoint.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            ) : (
              <span>${values[values.length - 1].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            )}
          </div>
          <div className="text-[10px] font-mono text-gray-400 mt-1">
            {currentHoveredPoint ? (
              <span>DATE_SEG: {new Date(currentHoveredPoint.time).toLocaleString()}</span>
            ) : (
              <span>LIVE_REALTIME_MARKET_TELEMETRY</span>
            )}
          </div>
        </div>

        {/* Time intervals */}
        <div className="flex items-center space-x-1.5 font-mono text-[10px]">
          {[1, 7, 30].map(d => (
            <button
              key={d}
              onClick={() => onDaysChange(d)}
              className={`rounded border px-2.5 py-1.5 uppercase transition-all ${
                days === d
                  ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                  : 'border-cyan-400/20 text-gray-500 hover:border-cyan-400/60 hover:text-cyan-400'
              }`}
            >
              {d === 1 ? '24h' : `${d}d`}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Chart Grid Lines */}
          <line x1={0} y1={paddingY} x2={width} y2={paddingY} stroke="rgba(34,211,238,0.05)" strokeDasharray="3 3" />
          <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="rgba(34,211,238,0.05)" strokeDasharray="3 3" />
          <line x1={0} y1={height - paddingY} x2={width} y2={height - paddingY} stroke="rgba(34,211,238,0.05)" strokeDasharray="3 3" />

          {/* Area Fill Gradient under Chart */}
          <path d={fillPathString} fill="url(#cyanGlowGrad)" opacity="0.1" />

          {/* Core Price Line */}
          <path
            d={pathString}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_4px_rgba(34,211,238,0.4)]"
          />

          {/* Interactive Hover Indicators */}
          {currentHoveredPoint && (
            <g>
              {/* Vertical dotted crosshair line */}
              <line
                x1={currentHoveredPoint.x}
                y1={paddingY}
                x2={currentHoveredPoint.x}
                y2={height - paddingY}
                stroke="#d946ef"
                strokeWidth="1"
                strokeDasharray="2 2"
                opacity="0.6"
              />
              {/* Anchor point circle */}
              <circle
                cx={currentHoveredPoint.x}
                cy={currentHoveredPoint.y}
                r="5"
                fill="#d946ef"
                stroke="#111827"
                strokeWidth="2"
                className="drop-shadow-[0_0_4px_rgba(217,70,239,0.8)]"
              />
            </g>
          )}

          {/* SVG Definitions */}
          <defs>
            <linearGradient id="cyanGlowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}