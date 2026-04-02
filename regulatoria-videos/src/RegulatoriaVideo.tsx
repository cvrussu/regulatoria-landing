import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Sequence,
} from "remotion";

const GREEN = "#5AAD2D";
const GREEN_DARK = "#2B5A14";

export const RegulatoriaVideo: React.FC<{
  title: string;
  subtitle: string;
}> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Intro animation (frames 0-90)
  const titleScale = spring({ frame, fps, config: { damping: 12 } });
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Subtitle animation (frames 30-90)
  const subtitleOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [30, 60], [30, 0], {
    extrapolateRight: "clamp",
  });

  // Features section (frames 90-240)
  const features = [
    { icon: "🤖", text: "11 Agentes de IA Especializados" },
    { icon: "🌱", text: "Registro de Agroquímicos" },
    { icon: "📋", text: "Pre-registro Gratuito" },
    { icon: "🌎", text: "Chile y LATAM" },
  ];

  // Outro fade (last 30 frames)
  const outroOpacity = interpolate(
    frame,
    [durationInFrames - 30, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, #0f1a0a 0%, ${GREEN_DARK} 50%, #0f1a0a 100%)`,
        opacity: outroOpacity,
      }}
    >
      {/* Background grid pattern */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(90,173,45,0.08) 2px, transparent 0)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Title Section */}
      <Sequence from={0} durationInFrames={durationInFrames}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              fontFamily: "Inter, sans-serif",
              background: `linear-gradient(135deg, #7BC950, ${GREEN}, #b8e986)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              transform: `scale(${titleScale})`,
              opacity: titleOpacity,
              letterSpacing: -4,
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 36,
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
              color: "rgba(255,255,255,0.85)",
              marginTop: 20,
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleY}px)`,
              maxWidth: 800,
              textAlign: "center",
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Features Section */}
      <Sequence from={90} durationInFrames={150}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 40,
              marginTop: 200,
            }}
          >
            {features.map((feature, i) => {
              const featureFrame = frame - 90;
              const delay = i * 15;
              const featureOpacity = interpolate(
                featureFrame,
                [delay, delay + 20],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              const featureY = interpolate(
                featureFrame,
                [delay, delay + 20],
                [40, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12,
                    opacity: featureOpacity,
                    transform: `translateY(${featureY}px)`,
                  }}
                >
                  <div
                    style={{
                      fontSize: 48,
                      width: 80,
                      height: 80,
                      borderRadius: 16,
                      background: "rgba(90,173,45,0.15)",
                      border: "1px solid rgba(90,173,45,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {feature.icon}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      fontFamily: "Inter, sans-serif",
                      color: "rgba(255,255,255,0.9)",
                      textAlign: "center",
                      maxWidth: 160,
                    }}
                  >
                    {feature.text}
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* CTA Section */}
      <Sequence from={210} durationInFrames={90}>
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 100,
          }}
        >
          {(() => {
            const ctaFrame = frame - 210;
            const ctaOpacity = interpolate(ctaFrame, [0, 20], [0, 1], {
              extrapolateRight: "clamp",
              extrapolateLeft: "clamp",
            });
            const ctaScale = spring({
              frame: ctaFrame,
              fps,
              config: { damping: 12 },
            });

            return (
              <div
                style={{
                  background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`,
                  padding: "24px 60px",
                  borderRadius: 16,
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: "Inter, sans-serif",
                  color: "#fff",
                  opacity: ctaOpacity,
                  transform: `scale(${ctaScale})`,
                  boxShadow: "0 8px 40px rgba(90,173,45,0.4)",
                }}
              >
                Pre-regístrate Gratis → regulatoria.cl
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
