"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/scene-state";
import { theme } from "@/lib/theme";
import { seeded } from "./textures";

interface ContactNetworkProps {
  count: number;
  reduced: boolean;
}

const LINK_DISTANCE = 2.1;
const REACH = 2.6;

/**
 * A slowly drifting node network. Nodes connect when they come close and are
 * pushed apart near the pointer, so the graph visibly reacts to the visitor.
 */
export default function ContactNetwork({ count, reduced }: ContactNetworkProps) {
  const viewport = useThree((s) => s.viewport);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const maxSegments = Math.min(400, (count * (count - 1)) / 2);

  const state = useMemo(() => {
    const rand = seeded(2024);
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (rand() - 0.5) * 14;
      positions[i * 3 + 1] = (rand() - 0.5) * 8;
      positions[i * 3 + 2] = (rand() - 0.5) * 3;
      velocities[i * 3] = (rand() - 0.5) * 0.25;
      velocities[i * 3 + 1] = (rand() - 0.5) * 0.25;
      velocities[i * 3 + 2] = (rand() - 0.5) * 0.08;
    }
    return {
      positions,
      velocities,
      linePositions: new Float32Array(maxSegments * 6),
      lineColors: new Float32Array(maxSegments * 6),
    };
  }, [count, maxSegments]);

  const accent = useMemo(() => new THREE.Color(theme.accent), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const { positions, velocities, linePositions, lineColors } = state;
    const halfW = viewport.width / 2 + 1;
    const halfH = viewport.height / 2 + 1;
    const mx = sceneState.pointerX * (viewport.width / 2);
    const my = sceneState.pointerY * (viewport.height / 2);

    for (let i = 0; i < count; i += 1) {
      const k = i * 3;
      if (!reduced) {
        positions[k] += velocities[k] * dt;
        positions[k + 1] += velocities[k + 1] * dt;
        positions[k + 2] += velocities[k + 2] * dt;
        const dx = positions[k] - mx;
        const dy = positions[k + 1] - my;
        const d = Math.hypot(dx, dy);
        if (d < REACH && d > 0.001) {
          const push = ((REACH - d) / REACH) * dt * 2.4;
          positions[k] += (dx / d) * push;
          positions[k + 1] += (dy / d) * push;
        }
        if (Math.abs(positions[k]) > halfW) velocities[k] *= -1;
        if (Math.abs(positions[k + 1]) > halfH) velocities[k + 1] *= -1;
        if (Math.abs(positions[k + 2]) > 1.6) velocities[k + 2] *= -1;
      }
    }

    let segments = 0;
    for (let i = 0; i < count && segments < maxSegments; i += 1) {
      for (let j = i + 1; j < count && segments < maxSegments; j += 1) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d > LINK_DISTANCE) continue;
        const fade = 1 - d / LINK_DISTANCE;
        const o = segments * 6;
        linePositions.set([positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2], positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]], o);
        // Lines near the pointer glow with the accent colour.
        const midX = (positions[i * 3] + positions[j * 3]) / 2;
        const midY = (positions[i * 3 + 1] + positions[j * 3 + 1]) / 2;
        const near = Math.max(0, 1 - Math.hypot(midX - mx, midY - my) / (REACH * 1.4));
        const r = THREE.MathUtils.lerp(0.32, accent.r, near) * fade;
        const g = THREE.MathUtils.lerp(0.32, accent.g, near) * fade;
        const b = THREE.MathUtils.lerp(0.31, accent.b, near) * fade;
        lineColors.set([r, g, b, r, g, b], o);
        segments += 1;
      }
    }

    const lines = linesRef.current;
    if (lines) {
      lines.geometry.attributes.position.needsUpdate = true;
      lines.geometry.attributes.color.needsUpdate = true;
      lines.geometry.setDrawRange(0, segments * 2);
    }
    if (pointsRef.current) pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[state.positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={theme.fg} size={0.05} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
      </points>
      <lineSegments ref={linesRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[state.linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[state.lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent depthWrite={false} />
      </lineSegments>
    </>
  );
}
