"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BuildShape as Shape } from "@/data/profile";
import { sceneState } from "@/lib/scene-state";
import { theme } from "@/lib/theme";

const damp = THREE.MathUtils.damp;

interface BuildShapeProps {
  shape: Shape;
  reduced: boolean;
}

const SHAPES: Shape[] = ["box", "icosa", "torus", "octa"];

function Geometry({ shape }: { shape: Shape }) {
  switch (shape) {
    case "box":
      return <boxGeometry args={[1.5, 1.5, 1.5, 2, 2, 2]} />;
    case "icosa":
      return <icosahedronGeometry args={[1.05, 1]} />;
    case "torus":
      return <torusKnotGeometry args={[0.8, 0.26, 120, 12]} />;
    case "octa":
      return <octahedronGeometry args={[1.2, 0]} />;
  }
}

/** Wireframe form that changes with the hovered "What I build" panel. */
export default function BuildShape({ shape, reduced }: BuildShapeProps) {
  const refs = useRef<Record<Shape, THREE.Mesh | null>>({ box: null, icosa: null, torus: null, octa: null });

  useFrame((_, dt) => {
    SHAPES.forEach((key) => {
      const mesh = refs.current[key];
      if (!mesh) return;
      const target = key === shape ? 1 : 0.0001;
      const s = reduced ? target : damp(mesh.scale.x, target, 7, dt);
      mesh.scale.setScalar(s);
      if (!reduced) {
        mesh.rotation.y += dt * 0.35;
        mesh.rotation.x = damp(mesh.rotation.x, sceneState.pointerY * -0.4 + 0.3, 3, dt);
      }
    });
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      {SHAPES.map((key) => (
        <mesh
          key={key}
          ref={(node) => {
            refs.current[key] = node;
          }}
          scale={key === shape ? 1 : 0.0001}
        >
          <Geometry shape={key} />
          <meshBasicMaterial color={theme.accent} wireframe transparent opacity={0.55} />
        </mesh>
      ))}
    </>
  );
}
