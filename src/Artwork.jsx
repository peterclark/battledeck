// Original flat-vector SVG artwork for the arcane-tactics-HUD theme.
// Replace with AI-generated vector art via scripts/generate-art.mjs.

const Hex = ({ x, y, r, fill, opacity }) => {
  const pts = [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const a = (Math.PI / 3) * i + Math.PI / 6;
      return `${x + r * Math.cos(a)},${y + r * Math.sin(a)}`;
    })
    .join(" ");
  return <polygon points={pts} fill={fill} opacity={opacity} />;
};

const Chevrons = ({ x, color, flip }) => (
  <g
    transform={`translate(${x} 46) scale(${flip ? -1 : 1} 1)`}
    stroke={color}
    strokeWidth="3"
    fill="none"
    strokeLinecap="round"
  >
    <path d="M0 -14 L12 0 L0 14" />
    <path d="M-14 -14 L-2 0 L-14 14" opacity="0.55" />
    <path d="M-28 -14 L-16 0 L-28 14" opacity="0.3" />
  </g>
);

export const BannerArt = () => (
  <svg
    viewBox="0 0 360 92"
    className="block h-auto w-full"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <rect width="360" height="92" fill="#10131c" />
    <Hex x={30} y={18} r={14} fill="#171c29" />
    <Hex x={56} y={32} r={14} fill="#171c29" opacity="0.7" />
    <Hex x={30} y={46} r={14} fill="#171c29" opacity="0.5" />
    <Hex x={330} y={74} r={14} fill="#171c29" />
    <Hex x={304} y={60} r={14} fill="#171c29" opacity="0.7" />
    <Hex x={330} y={46} r={14} fill="#171c29" opacity="0.5" />
    <Chevrons x={96} color="#1d9e75" flip />
    <Chevrons x={264} color="#d85a30" />
    <g className="animate-glow-drift">
      <path
        d="M180 16 L202 46 L180 76 L158 46 Z"
        fill="none"
        stroke="#7f77dd"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M180 26 L194 46 L180 66 L166 46 Z"
        fill="#2b2657"
        opacity="0.8"
      />
    </g>
    <circle cx="180" cy="46" r="3" fill="#cecbf6" />
    <line
      x1="14"
      y1="86"
      x2="346"
      y2="86"
      stroke="#2b3450"
      strokeWidth="1.5"
    />
    <line
      x1="120"
      y1="86"
      x2="240"
      y2="86"
      stroke="#7f77dd"
      strokeWidth="1.5"
      className="animate-glow-drift"
    />
  </svg>
);
