
interface SparklineProps {
  prices?: number[];
  color?: string;
}

export default function Sparkline({ prices, color }: SparklineProps) {
  if (!prices || prices.length < 2) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const width = 120;
  const height = 40;
  const padding = 2;

  const points = prices.map((price, i) => {
    const x = (i / (prices.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((price - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(' ');

  const strokeColor = color || (prices[prices.length - 1] >= prices[0] ? '#10b981' : '#f43f5e');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}