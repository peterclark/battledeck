// Original hand-drawn SVG artwork for the grimdark theme. Replace with
// AI-generated paintings via scripts/generate-art.mjs when desired.

const Spear = ({ x, top, bottom = 78 }) => (
  <g>
    <line x1={x} y1={top} x2={x} y2={bottom} stroke="#070605" strokeWidth="1.6" />
    <polygon
      points={`${x - 2.4},${top + 6} ${x},${top - 4} ${x + 2.4},${top + 6}`}
      fill="#070605"
    />
  </g>
);

const Banner = ({ x, top, color }) => (
  <g>
    <line x1={x} y1={top} x2={x} y2={78} stroke="#070605" strokeWidth="2" />
    <path
      d={`M${x} ${top} L${x + 26} ${top + 4} L${x + 20} ${top + 12} L${x + 26} ${top + 20} L${x} ${top + 24} Z`}
      fill={color}
      stroke="#070605"
      strokeWidth="1"
    />
  </g>
);

export const BannerArt = () => (
  <svg
    viewBox="0 0 360 92"
    className="block h-auto w-full"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <rect width="360" height="92" fill="#14110d" />
    <circle cx="292" cy="28" r="34" fill="#ef9f27" opacity="0.06" />
    <circle
      cx="292"
      cy="28"
      r="22"
      fill="#ef9f27"
      opacity="0.14"
      className="animate-flicker"
    />
    <circle cx="292" cy="28" r="13" fill="#ef9f27" opacity="0.85" />
    <circle cx="288" cy="25" r="3" fill="#fbe3b5" opacity="0.9" />
    <path
      d="M0 60 L38 53 L84 59 L142 49 L206 57 L262 51 L318 57 L360 52 L360 92 L0 92 Z"
      fill="#0f0d0a"
    />
    <Spear x={24} top={34} />
    <Spear x={35} top={40} />
    <Spear x={46} top={31} />
    <Spear x={57} top={38} />
    <Spear x={68} top={35} />
    <Banner x={92} top={26} color="#521b1b" />
    <Spear x={132} top={36} />
    <Spear x={143} top={30} />
    <Spear x={154} top={39} />
    <Spear x={165} top={33} />
    <Banner x={188} top={30} color="#26221d" />
    <Spear x={228} top={37} />
    <Spear x={239} top={32} />
    <Spear x={250} top={40} />
    <Spear x={261} top={35} />
    <Spear x={330} top={38} />
    <Spear x={341} top={33} />
    <Spear x={352} top={41} />
    <path
      d="M0 78 Q60 70 120 76 T240 74 T360 76 L360 92 L0 92 Z"
      fill="#080706"
    />
  </svg>
);
