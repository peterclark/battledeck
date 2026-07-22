// Original hand-drawn SVG artwork for the illuminated-parchment theme.
// Replace with AI-generated watercolor art via scripts/generate-art.mjs.

const Laurel = ({ x, y, flip }) => (
  <g
    transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}
    fill="#8fae6b"
    opacity="0.75"
  >
    <path d="M0 30 Q10 18 12 0 Q4 16 -2 28 Z" />
    <ellipse cx="3" cy="8" rx="2.6" ry="5" transform="rotate(30 3 8)" />
    <ellipse cx="7" cy="14" rx="2.6" ry="5" transform="rotate(40 7 14)" />
    <ellipse cx="10" cy="21" rx="2.6" ry="5" transform="rotate(55 10 21)" />
    <ellipse cx="-1" cy="14" rx="2.4" ry="4.6" transform="rotate(-10 -1 14)" />
    <ellipse cx="2" cy="21" rx="2.4" ry="4.6" transform="rotate(5 2 21)" />
  </g>
);

const Pennant = ({ x, color }) => (
  <g>
    <line x1={x} y1="18" x2={x} y2="74" stroke="#5f4c33" strokeWidth="2" />
    <path
      d={`M${x} 18 L${x + 30} 23 L${x + 23} 31 L${x + 30} 39 L${x} 44 Z`}
      fill={color}
      stroke="#443626"
      strokeWidth="1"
      opacity="0.9"
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
    <rect width="360" height="92" fill="#f3ead3" />
    <rect width="360" height="92" fill="#d4c08d" opacity="0.18" />
    <rect x="8" y="6" width="344" height="80" fill="#f8f1de" rx="3" />
    <rect
      x="8"
      y="6"
      width="344"
      height="80"
      fill="none"
      stroke="#b08d2f"
      strokeWidth="1.5"
      rx="3"
    />
    <rect
      x="13"
      y="11"
      width="334"
      height="70"
      fill="none"
      stroke="#c9b98f"
      strokeWidth="0.8"
      rx="2"
    />
    <Pennant x={34} color="#a83232" />
    <Pennant x={296} color="#4a6b2a" />
    <Laurel x={92} y={26} />
    <Laurel x={268} y={26} flip />
    <g transform="translate(180 66)" fill="#5f4c33">
      <circle cx="-14" cy="0" r="1.8" />
      <circle cx="14" cy="0" r="1.8" />
      <path d="M-10 0 H10" stroke="#5f4c33" strokeWidth="1.2" />
      <path
        d="M0 -4 Q3 0 0 4 Q-3 0 0 -4 Z"
        stroke="#a83232"
        strokeWidth="1"
        fill="#a83232"
      />
    </g>
    <circle
      cx="322"
      cy="68"
      r="9"
      fill="#a83232"
      opacity="0.9"
      className="animate-quill-fade"
    />
    <circle
      cx="322"
      cy="68"
      r="5.2"
      fill="none"
      stroke="#f6e3de"
      strokeWidth="1.4"
    />
  </svg>
);
