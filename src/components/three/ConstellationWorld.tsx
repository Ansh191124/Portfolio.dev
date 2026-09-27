"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { Line2 } from "three/examples/jsm/lines/Line2.js";
import { constellationIds, getTech } from "@/data/stack";
import { sceneState } from "@/lib/scene-state";
import { theme } from "@/lib/theme";
import { createLabelTexture, seeded } from "./textures";

const damp = THREE.MathUtils.damp;

interface ConstellationWorldProps {
  density: number;
  reduced: boolean;
}

interface NodeSpec {
  id: string;
  label: string;
  position: THREE.Vector3;
}

/** Nodes are spread on a fibonacci sphere so the layout is even and deterministic. */
const buildNodes = (): NodeSpec[] => {
  const n = constellationIds.length;
  return constellationIds.map((id, i) => {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = i * Math.PI * (3 - Math.sqrt(5));
    return {
      id,
      label: getTech(id)?.label ?? id,
      position: new THREE.Vector3(Math.cos(theta) * r * 2.6, y * 1.7, Math.sin(theta) * r * 2.6),
    };
  });
};

export default function ConstellationWorld({ density, reduced }: ConstellationWorldProps) {
  const group = useRef<THREE.Group>(null);
  const hovered = useRef<number>(-1);
  const invalidate = useThree((s) => s.invalidate);
  const nodes = useMemo(() => buildNodes(), []);

  const edges = useMemo(() => {
    const seen = new Set<string>();
    const list: [number, number][] = [];
    nodes.forEach((node, i) => {
      getTech(node.id)?.related.forEach((rid) => {
        const j = nodes.findIndex((n) => n.id === rid);
        if (j < 0) return;
        const key = [i, j].sort().join("-");
        if (seen.has(key)) return;
        seen.add(key);
        list.push([i, j]);
      });
    });
    return list;
  }, [nodes]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    if (!reduced) g.rotation.y += dt * 0.12;
    g.rotation.x = damp(g.rotation.x, reduced ? 0 : sceneState.pointerY * -0.15, 3, dt);
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[4, 4, 6]} intensity={30} color={theme.accent} distance={16} />
      <group ref={group}>
        {edges.map(([a, b], i) => (
          <Edge key={i} from={nodes[a].position} to={nodes[b].position} a={a} b={b} hovered={hovered} />
        ))}
        {nodes.map((node, i) => (
          <TechNode
            key={node.id}
            index={i}
            spec={node}
            hovered={hovered}
            reduced={reduced}
            onChange={invalidate}
          />
        ))}
        <Dust count={Math.round(220 * density)} reduced={reduced} />
      </group>
    </>
  );
}

interface EdgeProps {
  from: THREE.Vector3;
  to: THREE.Vector3;
  a: number;
  b: number;
  hovered: React.RefObject<number>;
}

function Edge({ from, to, a, b, hovered }: EdgeProps) {
  const ref = useRef<Line2>(null);
  const points = useMemo<[THREE.Vector3, THREE.Vector3]>(() => [from, to], [from, to]);
  const accent = useMemo(() => new THREE.Color(theme.accent), []);
  const base = useMemo(() => new THREE.Color("#4a4a47"), []);

  useFrame((_, dt) => {
    const line = ref.current;
    if (!line) return;
    const active = hovered.current === a || hovered.current === b;
    const target = active ? 1 : hovered.current >= 0 ? 0.08 : 0.35;
    line.material.opacity = damp(line.material.opacity, target, 6, dt);
    line.material.color.lerp(active ? accent : base, 0.15);
  });

  return <Line ref={ref} points={points} color="#4a4a47" lineWidth={1} transparent opacity={0.35} />;
}

interface TechNodeProps {
  index: number;
  spec: NodeSpec;
  hovered: React.RefObject<number>;
  reduced: boolean;
  onChange: () => void;
}

function TechNode({ index, spec, hovered, reduced, onChange }: TechNodeProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const label = useMemo(() => createLabelTexture(spec.label), [spec.label]);
  useEffect(() => () => label.dispose(), [label]);

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    const target = hovered.current === index ? 1.9 : 1;
    const s = reduced ? target : damp(m.scale.x, target, 8, dt);
    m.scale.setScalar(s);
  });

  return (
    <group position={spec.position}>
      <mesh
        ref={mesh}
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = index;
          onChange();
        }}
        onPointerOut={() => {
          hovered.current = -1;
          onChange();
        }}
      >
        <sphereGeometry args={[0.11, 20, 20]} />
        <meshStandardMaterial color={theme.fg} emissive={theme.accent} emissiveIntensity={0.25} />
      </mesh>
      <sprite position={[0, 0.38, 0]} scale={[1.1, 0.28, 1]}>
        <spriteMaterial map={label} transparent depthWrite={false} />
      </sprite>
    </group>
  );
}

function Dust({ count, reduced }: { count: number; reduced: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rand = seeded(99);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      arr[i * 3] = (rand() - 0.5) * 9;
      arr[i * 3 + 1] = (rand() - 0.5) * 6;
      arr[i * 3 + 2] = (rand() - 0.5) * 9;
    }
    return arr;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current || reduced) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.3) * 0.12;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#8d8d88" size={0.02} sizeAttenuation transparent opacity={0.5} depthWrite={false} />
    </points>
  );
}
