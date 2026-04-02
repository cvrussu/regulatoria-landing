import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  x: 200 + i * 200 + (i % 3) * 80,
  y: 150 + (i % 4) * 200 + (i % 2) * 100,
  size: 2 + (i % 3),
  speed: 0.02 + (i % 5) * 0.008,
  offset: i * 1.2,
}));

export const BackgroundGrid: React.FC = () => {
  const frame = useCurrentFrame();

  const gridOpacity = interpolate(frame, [0, 20], [0, 0.08], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* Dot grid pattern */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(13,148,136,${gridOpacity}) 1.5px, transparent 0)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Floating particles */}
      <svg
        width="1920"
        height="1080"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {PARTICLES.map((p, i) => {
          const particleOpacity = interpolate(frame, [5, 25], [0, 0.4], {
            extrapolateRight: "clamp",
          });
          const cx = p.x + Math.sin(frame * p.speed + p.offset) * 30;
          const cy = p.y + Math.cos(frame * p.speed * 0.7 + p.offset) * 20;

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={p.size}
              fill="#0d9488"
              opacity={particleOpacity * (0.3 + (i % 3) * 0.25)}
            />
          );
        })}
      </svg>

      {/* Radial vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(13,21,32,0.6) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
