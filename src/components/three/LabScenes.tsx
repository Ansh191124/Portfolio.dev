"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { theme } from "@/lib/theme";

interface SceneProps {
  reduced: boolean;
}

/* ───────────────────────── Experiment 02 — physics ───────────────────────── */

const FLOOR = -1.5;
const HALF_W = 2.5;
const RADIUS = 0.55;

/** A tumbling body with gravity, bounce and friction. Click to throw it. */
export function PhysicsScene({ reduced }: SceneProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const invalidate = useThree((s) => s.invalidate);
  const body = useMemo(
    () => ({
      p: new THREE.Vector3(-1, 1, 0),
      v: new THREE.Vector3(1.4, 0, 0),
      w: new THREE.Vector3(1.2, 1.6, 0.4),
    }),
    [],
  );

  useFrame((_, rawDt) => {
    const m = mesh.current;
    if (!m || reduced) return;
    const dt = Math.min(rawDt, 1 / 30);
    body.v.y -= 9.8 * 0.7 * dt;
    body.p.addScaledVector(body.v, dt);

    if (body.p.y < FLOOR + RADIUS) {
      body.p.y = FLOOR + RADIUS;
      body.v.y *= -0.72;
      body.v.x *= 0.985;
      body.w.multiplyScalar(0.96);
      if (Math.abs(body.v.y) < 0.4) body.v.y = 0;
    }
    if (Math.abs(body.p.x) > HALF_W - RADIUS) {
      body.p.x = Math.sign(body.p.x) * (HALF_W - RADIUS);
      body.v.x *= -0.8;
    }
    m.position.copy(body.p);
    m.rotation.x += body.w.x * dt;
    m.rotation.y += body.w.y * dt;
    m.rotation.z += body.w.z * dt;
  });

  const throwBody = (): void => {
    body.v.set((Math.random() - 0.5) * 7, 5 + Math.random() * 3, 0);
    body.w.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4);
    invalidate();
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <gridHelper args={[8, 16, "#2a2a2a", "#1a1a1a"]} position={[0, FLOOR, 0]} />
      <mesh ref={mesh} onPointerDown={throwBody} position={[-1, 1, 0]}>
        <icosahedronGeometry args={[RADIUS, 0]} />
        <meshStandardMaterial color="#4a4a46" metalness={0.35} roughness={0.35} flatShading emissive="#c6ff3d" emissiveIntensity={0.05} />
      </mesh>
      {/* click target for the whole stage */}
      <mesh position={[0, 0, -1]} onPointerDown={throwBody} visible={false}>
        <planeGeometry args={[12, 8]} />
        <meshBasicMaterial />
      </mesh>
    </>
  );
}

/* ───────────────────────── Experiment 03 — shader ───────────────────────── */

const VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uAccent;
void main() {
  float d = distance(vUv, uMouse);
  float ripple = sin(d * 42.0 - uTime * 3.0) * exp(-d * 4.5);
  vec2 g = abs(fract((vUv + ripple * 0.018) * vec2(32.0, 20.0)) - 0.5);
  float grid = smoothstep(0.46, 0.5, max(g.x, g.y));
  float glow = exp(-d * 5.0);
  vec3 col = vec3(0.018) + uAccent * grid * (0.16 + glow * 1.4) + uAccent * ripple * ripple * glow * 0.6;
  gl_FragColor = vec4(col, 1.0);
}
`;

/** A fragment shader whose ripples and grid brightness follow the pointer. */
export function ShaderScene({ reduced }: SceneProps) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const size = useThree((s) => s.viewport);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uAccent: { value: new THREE.Color(theme.accent) },
    }),
    [],
  );

  useFrame(({ clock, pointer }) => {
    const m = material.current;
    if (!m || reduced) return;
    m.uniforms.uTime.value = clock.elapsedTime;
    (m.uniforms.uMouse.value as THREE.Vector2).lerp(new THREE.Vector2((pointer.x + 1) / 2, (pointer.y + 1) / 2), 0.12);
  });

  return (
    <mesh>
      <planeGeometry args={[size.width, size.height]} />
      <shaderMaterial ref={material} vertexShader={VERTEX} fragmentShader={FRAGMENT} uniforms={uniforms} />
    </mesh>
  );
}

/* ─────────────────────── Experiment 04 — geometry ─────────────────────── */

const COLS = 9;
const ROWS = 5;

/** A field of instanced prisms that all turn to face the cursor. */
export function GeometryScene({ reduced }: SceneProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const viewport = useThree((s) => s.viewport);

  useFrame(({ pointer }) => {
    const m = mesh.current;
    if (!m) return;
    target.set(reduced ? 0 : (pointer.x * viewport.width) / 2, reduced ? 0 : (pointer.y * viewport.height) / 2, 3);
    for (let r = 0; r < ROWS; r += 1) {
      for (let c = 0; c < COLS; c += 1) {
        const x = (c - (COLS - 1) / 2) * (viewport.width / (COLS + 1));
        const y = (r - (ROWS - 1) / 2) * (viewport.height / (ROWS + 1));
        dummy.position.set(x, y, 0);
        dummy.lookAt(target);
        const d = Math.hypot(target.x - x, target.y - y);
        dummy.scale.setScalar(0.7 + Math.max(0, 1 - d / 3) * 0.9);
        dummy.updateMatrix();
        m.setMatrixAt(r * COLS + c, dummy.matrix);
      }
    }
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 3, 5]} intensity={1.6} color={theme.accent} />
      <instancedMesh ref={mesh} args={[undefined, undefined, COLS * ROWS]}>
        <boxGeometry args={[0.16, 0.16, 0.7]} />
        <meshStandardMaterial color="#d9d8d1" metalness={0.5} roughness={0.35} />
      </instancedMesh>
    </>
  );
}
