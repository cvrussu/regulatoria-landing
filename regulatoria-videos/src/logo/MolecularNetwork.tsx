import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Node positions relative to SVG viewBox (inside the shield)
const NODES = [
  { x: 200, y: 100 }, // top center
  { x: 300, y: 180 }, // right
  { x: 250, y: 280 }, // bottom right
  { x: 130, y: 210 }, // left (leaf node)
];

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [0, 2],
];

const NODE_RADIUS = 9;

// Leaf SVG path (small sprout growing from node 3)
const LEAF_PATH = "M 0 0 C -6 -14 -18 -22 -12 -32 C -8 -24 2 -20 0 0 Z";
const STEM_PATH = "M 0 0 L -4 -16";

export const MolecularNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <g>
      {/* Glow filter for nodes */}
      <defs>
        <filter id="node-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="pulse-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Connection lines (Phase 5: frames 60-90) */}
      {EDGES.map(([a, b], i) => {
        const lineStart = 60 + i * 5;
        const lineEnd = lineStart + 15;
        const dx = NODES[b].x - NODES[a].x;
        const dy = NODES[b].y - NODES[a].y;
        const lineLength = Math.sqrt(dx * dx + dy * dy);

        const drawProgress = interpolate(frame, [lineStart, lineEnd], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <line
            key={`edge-${i}`}
            x1={NODES[a].x}
            y1={NODES[a].y}
            x2={NODES[b].x}
            y2={NODES[b].y}
            stroke="#0d9488"
            strokeWidth={2}
            strokeOpacity={0.5}
            strokeDasharray={lineLength}
            strokeDashoffset={lineLength * (1 - drawProgress)}
            strokeLinecap="round"
          />
        );
      })}

      {/* Energy pulses along edges (Phase 6: frames 85-110) */}
      {EDGES.map(([a, b], i) => {
        const pulseStart = 85 + i * 5;
        const pulseDuration = 15;
        const t = interpolate(
          frame,
          [pulseStart, pulseStart + pulseDuration],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        if (frame < pulseStart || frame > pulseStart + pulseDuration + 5)
          return null;

        const px = NODES[a].x + (NODES[b].x - NODES[a].x) * t;
        const py = NODES[a].y + (NODES[b].y - NODES[a].y) * t;
        const pulseOpacity = t < 0.9 ? 1 : interpolate(t, [0.9, 1], [1, 0]);

        return (
          <circle
            key={`pulse-${i}`}
            cx={px}
            cy={py}
            r={4}
            fill="#2dd4bf"
            opacity={pulseOpacity * 0.9}
            filter="url(#pulse-glow)"
          />
        );
      })}

      {/* Ambient repeating pulses (Phase 10: frames 130+) */}
      {frame > 130 &&
        EDGES.slice(0, 3).map(([a, b], i) => {
          const cycleLength = 40;
          const localFrame = (frame - 130 + i * 12) % cycleLength;
          const t = interpolate(localFrame, [0, cycleLength], [0, 1]);
          const px = NODES[a].x + (NODES[b].x - NODES[a].x) * t;
          const py = NODES[a].y + (NODES[b].y - NODES[a].y) * t;
          const pulseOpacity =
            t < 0.1 ? t / 0.1 : t > 0.9 ? (1 - t) / 0.1 : 1;

          return (
            <circle
              key={`ambient-pulse-${i}`}
              cx={px}
              cy={py}
              r={3}
              fill="#2dd4bf"
              opacity={pulseOpacity * 0.5}
              filter="url(#pulse-glow)"
            />
          );
        })}

      {/* Molecular nodes (Phase 4: frames 50-85) */}
      {NODES.map((node, i) => {
        const nodeAppear = 50 + i * 8;
        const nodeScale = spring({
          frame: frame - nodeAppear,
          fps,
          config: { damping: 12, stiffness: 120 },
        });

        // Node pulse when energy arrives
        const pulseHit = 85 + i * 5 + 15;
        const hitScale =
          frame >= pulseHit && frame <= pulseHit + 8
            ? spring({
                frame: frame - pulseHit,
                fps,
                config: { damping: 8, stiffness: 200 },
              }) *
                0.15 +
              1
            : 1;

        if (frame < nodeAppear) return null;

        return (
          <g key={`node-${i}`} transform={`translate(${node.x}, ${node.y})`}>
            {/* Outer glow */}
            <circle
              r={NODE_RADIUS + 4}
              fill="#0d9488"
              opacity={0.2 * nodeScale}
              filter="url(#node-glow)"
            />
            {/* Main node */}
            <circle
              r={NODE_RADIUS * nodeScale * hitScale}
              fill="#0d9488"
              stroke="#2dd4bf"
              strokeWidth={1.5}
            />
            {/* Inner highlight */}
            <circle
              r={3 * nodeScale}
              fill="#2dd4bf"
              opacity={0.6}
            />
          </g>
        );
      })}

      {/* Leaf sprout on node 3 (Phase 7: frames 82-100) */}
      {frame >= 82 && (
        <g transform={`translate(${NODES[3].x - 5}, ${NODES[3].y - 8})`}>
          {(() => {
            const leafScale = spring({
              frame: frame - 82,
              fps,
              config: { damping: 8, stiffness: 100 },
            });
            const leafRotate = interpolate(frame, [82, 100], [-20, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <g
                transform={`scale(${leafScale}) rotate(${leafRotate})`}
                style={{ transformOrigin: "0 0" }}
              >
                {/* Stem */}
                <path
                  d={STEM_PATH}
                  stroke="#2dd4bf"
                  strokeWidth={1.5}
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Leaf blade */}
                <path d={LEAF_PATH} fill="#2dd4bf" opacity={0.8} />
                {/* Second smaller leaf */}
                <g transform="translate(2, -8) rotate(40) scale(0.6)">
                  <path d={LEAF_PATH} fill="#5AAD2D" opacity={0.7} />
                </g>
              </g>
            );
          })()}
        </g>
      )}
    </g>
  );
};
