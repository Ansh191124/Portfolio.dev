"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Line, Lightformer, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { sceneState } from "@/lib/scene-state";
import { theme } from "@/lib/theme";
import { CodePanel } from "./CodePanel";
import { createLabelTexture, createSurface, drawScreen, seeded } from "./textures";

const damp = THREE.MathUtils.damp;

const DEVELOPER_CODE = [
  "const developer = {",
  '  name: "Ansh",',
  '  stack: ["Next.js", "React", "Node.js"],',
  '  focus: ["AI", "Systems", "UX"]',
  "}",
] as const;

const TERMINAL = [
  "$ npm run dev",
  "ready — compiled successfully",
  "$ git commit -m \"ship it\"",
  "$ docker compose up",
] as const;

interface HeroWorldProps {
  density: number;
  reduced: boolean;
  active: boolean;
}

type Vec3 = [number, number, number];

const POSITIONS = {
  monitor: [0, 0, 0] as Vec3,
  code: [2.9, 1.55, 0.6] as Vec3,
  terminal: [-0.3, -2.05, 1.0] as Vec3,
  database: [-1.35, 1.95, -0.6] as Vec3,
  apis: [
    { label: "API", position: [2.7, -0.95, 0.7] as Vec3 },
    { label: "AUTH", position: [2.3, -2.0, 1.1] as Vec3 },
    { label: "QUEUE", position: [3.7, 0.15, -0.9] as Vec3 },
  ],
};

/** Connections between nodes; `apis` lists which API nodes boost the link. */
const LINKS: { from: Vec3; to: Vec3; api: number | null }[] = [
  { from: POSITIONS.monitor, to: POSITIONS.apis[0].position, api: 0 },
  { from: POSITIONS.monitor, to: POSITIONS.apis[1].position, api: 1 },
  { from: POSITIONS.apis[0].position, to: POSITIONS.apis[2].position, api: 2 },
  { from: POSITIONS.database, to: POSITIONS.monitor, api: null },
  { from: POSITIONS.database, to: POSITIONS.apis[1].position, api: 1 },
  { from: POSITIONS.terminal, to: POSITIONS.apis[1].position, api: 1 },
];

export default function HeroWorld({ density, reduced, active }: HeroWorldProps) {
  const rig = useRef<THREE.Group>(null);
  const world = useRef<THREE.Group>(null);
  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera);
  /** Per-API-node hover strength (0–1); links read this to pulse. */
  const apiBoost = useRef<number[]>([0, 0, 0]);
  const wide = size.width >= 1024;
  const offsetX = wide ? (size.width >= 1500 ? 2.6 : 3.1) : 0;
  const scale = wide ? (size.width >= 1500 ? 1 : 0.82) : 0.55;

  useFrame((_, dt) => {
    const k = reduced ? 0 : 1;
    const rigGroup = rig.current;
    const worldGroup = world.current;
    if (!rigGroup || !worldGroup) return;
    // Mouse: ±5° yaw, small vertical drift of the camera.
    rigGroup.rotation.y = damp(rigGroup.rotation.y, sceneState.pointerX * 0.0873 * k, 3, dt);
    camera.position.y = damp(camera.position.y, sceneState.pointerY * 0.5 * k, 3, dt);
    // Scroll: camera pushes deeper while the world drifts toward the viewer.
    const s = sceneState.heroScroll * k;
    camera.position.z = damp(camera.position.z, 8 - s * 2.4, 6, dt);
    worldGroup.position.z = damp(worldGroup.position.z, s * 2.2, 6, dt);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <color attach="background" args={[theme.bg]} />
      <fog attach="fog" args={[theme.bg, 9, 22]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} />
      {/* Procedural, network-free environment: gives the metal/glass materials
          real reflections and soft falloff instead of flat, sketchy shading. */}
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 4, -2]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} color={theme.accent} position={[-5, -1, 3]} scale={[4, 4, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#ffffff" position={[5, -3, -2]} scale={[4, 4, 1]} />
      </Environment>

      <group ref={rig}>
        <group ref={world} position={[offsetX, wide ? 0 : 1.5, 0]} scale={scale}>
          <Monitor reduced={reduced} />
          <group position={POSITIONS.code} rotation={[0, -0.32, 0]}>
            <Float reduced={reduced} phase={1}>
              <CodePanel
                width={2.5}
                height={1.55}
                title="developer.ts"
                mode="lines"
                lines={DEVELOPER_CODE}
                active={active}
                reduced={reduced}
              />
            </Float>
          </group>
          <group position={POSITIONS.terminal} rotation={[0, 0.34, 0]}>
            <Float reduced={reduced} phase={2}>
              <CodePanel
                width={2.5}
                height={1.3}
                title="terminal"
                mode="chars"
                lines={TERMINAL}
                active={active}
                loop
                reduced={reduced}
              />
            </Float>
          </group>
          <Database reduced={reduced} />
          {POSITIONS.apis.map((api, i) => (
            <ApiNode key={api.label} index={i} label={api.label} position={api.position} boost={apiBoost} reduced={reduced} />
          ))}
          {LINKS.map((link, i) => (
            <Link key={i} link={link} seed={i} boost={apiBoost} reduced={reduced} />
          ))}
          <Shards count={Math.round(10 * density)} reduced={reduced} />
        </group>
        <Particles count={Math.round(500 * density)} reduced={reduced} />
      </group>
    </>
  );
}

function Float({ children, reduced, phase }: { children: React.ReactNode; reduced: boolean; phase: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || reduced) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.7 + phase) * 0.07;
  });
  return <group ref={ref}>{children}</group>;
}

function Monitor({ reduced }: { reduced: boolean }) {
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  const hover = useRef({ target: 0, value: 0 });
  const invalidate = useThree((s) => s.invalidate);
  const surface = useMemo(() => {
    const s = createSurface(1024, 608);
    drawScreen(s);
    s.texture.needsUpdate = true;
    return s;
  }, []);

  useEffect(() => () => surface.texture.dispose(), [surface]);

  useFrame((_, dt) => {
    const h = hover.current;
    h.value = reduced ? h.target : damp(h.value, h.target, 5, dt);
    if (group.current) {
      const away = sceneState.heroScroll * (reduced ? 0 : 1.25);
      group.current.rotation.y = -0.26 + h.value * 0.2 - away;
    }
    if (glow.current) glow.current.opacity = h.value * 0.55;
  });

  const set = (v: number) => () => {
    hover.current.target = v;
    invalidate();
  };

  return (
    <group ref={group} onPointerOver={set(1)} onPointerOut={set(0)}>
      <Float reduced={reduced} phase={0}>
        <mesh position={[0, 0, -0.06]}>
          <planeGeometry args={[4.02, 2.62]} />
          <meshBasicMaterial ref={glow} color={theme.accent} transparent opacity={0} depthWrite={false} />
        </mesh>
        <RoundedBox args={[3.9, 2.5, 0.14]} radius={0.05} smoothness={3}>
          <meshStandardMaterial color="#0d0d0d" metalness={0.75} roughness={0.28} envMapIntensity={1.4} />
        </RoundedBox>
        <mesh position={[0, 0, 0.076]}>
          <planeGeometry args={[3.7, 2.2]} />
          <meshBasicMaterial map={surface.texture} toneMapped={false} />
        </mesh>
        <mesh position={[0, -1.55, -0.05]}>
          <boxGeometry args={[0.24, 0.6, 0.12]} />
          <meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} envMapIntensity={1.4} />
        </mesh>
        <mesh position={[0, -1.86, 0.02]}>
          <boxGeometry args={[1.3, 0.05, 0.6]} />
          <meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} envMapIntensity={1.4} />
        </mesh>
      </Float>
    </group>
  );
}

function Database({ reduced }: { reduced: boolean }) {
  const orbit = useRef<THREE.Group>(null);
  const hover = useRef({ target: 0, value: 0 });
  const invalidate = useThree((s) => s.invalidate);
  const ring = useMemo(() => {
    const rand = seeded(7);
    const n = 60;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i += 1) {
      const a = rand() * Math.PI * 2;
      const r = 0.95 + rand() * 0.45;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = (rand() - 0.5) * 0.9;
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    const h = hover.current;
    h.value = reduced ? h.target : damp(h.value, h.target, 4, dt);
    if (orbit.current && !reduced) orbit.current.rotation.y += dt * (0.25 + h.value * 2.6);
  });

  const set = (v: number) => () => {
    hover.current.target = v;
    invalidate();
  };

  return (
    <group position={POSITIONS.database} onPointerOver={set(1)} onPointerOut={set(0)}>
      <Float reduced={reduced} phase={3}>
        {[0, 1, 2].map((i) => (
          <group key={i} position={[0, (i - 1) * 0.26, 0]}>
            <mesh>
              <cylinderGeometry args={[0.62, 0.62, 0.18, 32]} />
              <meshStandardMaterial color="#0d0d0d" metalness={0.8} roughness={0.25} envMapIntensity={1.6} />
            </mesh>
            <mesh position={[0, 0.095, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.62, 0.008, 6, 48]} />
              <meshBasicMaterial color={theme.accent} />
            </mesh>
          </group>
        ))}
        <group ref={orbit}>
          <points>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[ring, 3]} />
            </bufferGeometry>
            <pointsMaterial color={theme.accent} size={0.04} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
          </points>
        </group>
      </Float>
    </group>
  );
}

interface ApiNodeProps {
  index: number;
  label: string;
  position: Vec3;
  boost: React.RefObject<number[]>;
  reduced: boolean;
}

function ApiNode({ index, label, position, boost, reduced }: ApiNodeProps) {
  const mesh = useRef<THREE.Group>(null);
  const hover = useRef({ target: 0, value: 0 });
  const invalidate = useThree((s) => s.invalidate);
  const labelTexture = useMemo(() => createLabelTexture(label), [label]);
  useEffect(() => () => labelTexture.dispose(), [labelTexture]);

  useFrame((_, dt) => {
    const h = hover.current;
    h.value = reduced ? h.target : damp(h.value, h.target, 6, dt);
    boost.current[index] = h.value;
    if (mesh.current) {
      const s = 1 + h.value * 0.35;
      mesh.current.scale.setScalar(s);
      if (!reduced) mesh.current.rotation.y += dt * (0.4 + h.value * 1.6);
    }
  });

  const set = (v: number) => () => {
    hover.current.target = v;
    invalidate();
  };

  return (
    <group position={position}>
      <group ref={mesh} onPointerOver={set(1)} onPointerOut={set(0)}>
        <mesh>
          <octahedronGeometry args={[0.24, 0]} />
          <meshStandardMaterial color="#101010" metalness={0.7} roughness={0.22} envMapIntensity={1.6} />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.26, 0]} />
          <meshBasicMaterial color={theme.accent} wireframe />
        </mesh>
      </group>
      <sprite position={[0, 0.5, 0]} scale={[0.8, 0.2, 1]}>
        <spriteMaterial map={labelTexture} transparent depthWrite={false} />
      </sprite>
    </group>
  );
}

interface LinkProps {
  link: { from: Vec3; to: Vec3; api: number | null };
  seed: number;
  boost: React.RefObject<number[]>;
  reduced: boolean;
}

/** A connection line with a light pulse that travels along it and speeds up on hover. */
function Link({ link, seed, boost, reduced }: LinkProps) {
  const pulse = useRef<THREE.Mesh>(null);
  const t = useRef((seed * 0.37) % 1);
  const from = useMemo(() => new THREE.Vector3(...link.from), [link.from]);
  const to = useMemo(() => new THREE.Vector3(...link.to), [link.to]);
  const points = useMemo<Vec3[]>(() => [link.from, link.to], [link.from, link.to]);

  useFrame((_, dt) => {
    const mesh = pulse.current;
    if (!mesh) return;
    const b = link.api === null ? 0 : boost.current[link.api] ?? 0;
    if (!reduced) t.current = (t.current + dt * (0.18 + b * 0.7)) % 1;
    mesh.position.lerpVectors(from, to, t.current);
    mesh.scale.setScalar(0.7 + b * 1.1);
  });

  return (
    <>
      <Line points={points} color="#3a3a38" lineWidth={1} transparent opacity={0.8} />
      <mesh ref={pulse}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshBasicMaterial color={theme.accent} />
      </mesh>
    </>
  );
}

function Shards({ count, reduced }: { count: number; reduced: boolean }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(() => {
    const rand = seeded(42);
    return Array.from({ length: count }, () => ({
      x: (rand() - 0.5) * 9,
      y: (rand() - 0.5) * 5.5,
      z: (rand() - 0.5) * 5 - 1.5,
      s: 0.3 + rand() * 0.55,
      speed: 0.2 + rand() * 0.5,
      phase: rand() * Math.PI * 2,
    }));
  }, [count]);

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const t = reduced ? 0 : clock.elapsedTime;
    seeds.forEach((s, i) => {
      dummy.position.set(s.x, s.y + Math.sin(t * s.speed + s.phase) * 0.25, s.z);
      dummy.rotation.set(t * s.speed + s.phase, t * s.speed * 0.7, 0);
      dummy.scale.setScalar(s.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <octahedronGeometry args={[0.1, 0]} />
      <meshBasicMaterial color="#4a4a46" wireframe transparent opacity={0.45} />
    </instancedMesh>
  );
}

function Particles({ count, reduced }: { count: number; reduced: boolean }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const rand = seeded(1337);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const r = 3 + rand() * 9;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      arr[i * 3 + 2] = r * Math.cos(phi) - 2;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    const p = points.current;
    if (!p) return;
    if (!reduced) p.rotation.y += dt * 0.012;
    // Particles spread outward as the hero scrolls away.
    p.scale.setScalar(1 + sceneState.heroScroll * (reduced ? 0 : 2.4));
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#8d8d88" size={0.022} sizeAttenuation transparent opacity={0.65} depthWrite={false} />
    </points>
  );
}
