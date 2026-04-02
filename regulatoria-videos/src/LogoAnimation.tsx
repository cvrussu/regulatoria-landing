import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BackgroundGrid } from "./logo/BackgroundGrid";
import { ShieldPath } from "./logo/ShieldPath";
import { MolecularNetwork } from "./logo/MolecularNetwork";
import { LogoText } from "./logo/LogoText";

const NAVY_DEEP = "#0d1520";

export const LogoAnimation: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: NAVY_DEEP,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Animated background grid + particles */}
      <BackgroundGrid />

      {/* Centered logo container */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Shield + molecular network SVG */}
          <svg
            width={400}
            height={380}
            viewBox="0 0 400 380"
            style={{ overflow: "visible" }}
          >
            <ShieldPath />
            <MolecularNetwork />
          </svg>

          {/* Logo text */}
          <LogoText />
        </div>
      </AbsoluteFill>

      {/* Final ambient halo behind everything */}
      {frame > 130 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at 50% 42%, rgba(13,148,136,${
              0.04 + Math.sin(frame * 0.06) * 0.02
            }) 0%, transparent 50%)`,
            pointerEvents: "none",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
