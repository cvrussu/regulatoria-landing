import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Shield path inspired by the RegulatorIA logo - pentagon/shield with rounded edges
const SHIELD_PATH =
  "M 200 30 C 200 30 340 30 340 30 Q 370 30 370 60 L 370 220 Q 370 280 200 350 Q 30 280 30 220 L 30 60 Q 30 30 60 30 Z";

const SHIELD_PATH_LENGTH = 920;

export const ShieldPath: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 2: Stroke draw (frames 10-50)
  const drawProgress = interpolate(frame, [10, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Phase 3: Fill (frames 40-60)
  const fillOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glow intensity
  const glowOpacity = interpolate(frame, [50, 65], [0, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Ambient pulse after settling (frames 130+)
  const ambientGlow =
    frame > 130
      ? Math.sin(frame * 0.08) * 0.15 + 0.85
      : 1;

  return (
    <g>
      {/* Glow filter definitions */}
      <defs>
        <filter id="shield-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="inner-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Shield fill */}
      <path
        d={SHIELD_PATH}
        fill="#1a2744"
        opacity={fillOpacity}
        stroke="none"
      />

      {/* Shield stroke animation */}
      <path
        d={SHIELD_PATH}
        fill="none"
        stroke="#0d9488"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={SHIELD_PATH_LENGTH}
        strokeDashoffset={SHIELD_PATH_LENGTH * (1 - drawProgress)}
        filter="url(#inner-glow)"
        opacity={0.9}
      />

      {/* Outer glow layer */}
      <path
        d={SHIELD_PATH}
        fill="none"
        stroke="#2dd4bf"
        strokeWidth={1}
        strokeDasharray={SHIELD_PATH_LENGTH}
        strokeDashoffset={SHIELD_PATH_LENGTH * (1 - drawProgress)}
        opacity={glowOpacity * ambientGlow}
        filter="url(#shield-glow)"
      />
    </g>
  );
};
