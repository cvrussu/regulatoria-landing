import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const REGULATOR_TEXT = "Regulator.";

export const LogoText: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "center",
        marginTop: 30,
      }}
    >
      {/* "Regulator." letter by letter (Phase 8: frames 90-120) */}
      <div style={{ display: "flex" }}>
        {REGULATOR_TEXT.split("").map((char, i) => {
          const charStart = 90 + i * 3;
          const charOpacity = interpolate(frame, [charStart, charStart + 6], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const charY = interpolate(frame, [charStart, charStart + 6], [12, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <span
              key={i}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 72,
                fontWeight: 700,
                color: "#0f766e",
                opacity: charOpacity,
                transform: `translateY(${charY}px)`,
                display: "inline-block",
              }}
            >
              {char}
            </span>
          );
        })}
      </div>

      {/* "IA" with tech reveal (Phase 9: frames 115-135) */}
      <div style={{ position: "relative", marginLeft: 4 }}>
        {(() => {
          // Scan line sweep (frames 115-125)
          const scanProgress = interpolate(frame, [115, 125], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          const iaOpacity = interpolate(frame, [115, 120], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          // Glitch effect (frames 120-125)
          const isGlitching = frame >= 120 && frame <= 125;
          const glitchY = isGlitching ? (frame % 2 === 0 ? -2 : 2) : 0;
          const glitchX = isGlitching ? (frame % 3 === 0 ? 1 : -1) : 0;

          // Final glow settle (frames 125-135)
          const glowOpacity = interpolate(frame, [125, 135], [0.8, 0.3], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          // Ambient glow pulse (frames 135+)
          const ambientGlow =
            frame > 135 ? Math.sin(frame * 0.1) * 0.1 + 0.25 : glowOpacity;

          return (
            <>
              {/* Glow layer behind text */}
              <span
                style={{
                  position: "absolute",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 72,
                  fontWeight: 800,
                  color: "#2dd4bf",
                  opacity: iaOpacity * ambientGlow,
                  filter: "blur(8px)",
                  transform: `translateY(${glitchY}px) translateX(${glitchX}px)`,
                  letterSpacing: 3,
                  userSelect: "none",
                }}
              >
                IA
              </span>

              {/* Main IA text */}
              <span
                style={{
                  position: "relative",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 72,
                  fontWeight: 800,
                  color: "#0f766e",
                  opacity: iaOpacity,
                  transform: `translateY(${glitchY}px) translateX(${glitchX}px)`,
                  letterSpacing: 3,
                  display: "inline-block",
                }}
              >
                IA
              </span>

              {/* Scan line */}
              {frame >= 115 && frame <= 127 && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: `${scanProgress * 100}%`,
                    width: 2,
                    height: "100%",
                    background:
                      "linear-gradient(180deg, transparent, #2dd4bf, transparent)",
                    opacity: interpolate(frame, [115, 122, 127], [0, 1, 0], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                    boxShadow: "0 0 12px 4px rgba(45,212,191,0.5)",
                  }}
                />
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
};
