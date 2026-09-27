"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SceneCanvas } from "@/components/three/SceneCanvas";
import { SceneFallback } from "@/components/ui/SceneFallback";
import { NeuralViz } from "./NeuralViz";
import { ParticleField } from "./ParticleField";

const PhysicsScene = dynamic(() => import("@/components/three/LabScenes").then((m) => m.PhysicsScene), { ssr: false });
const ShaderScene = dynamic(() => import("@/components/three/LabScenes").then((m) => m.ShaderScene), { ssr: false });
const GeometryScene = dynamic(() => import("@/components/three/LabScenes").then((m) => m.GeometryScene), { ssr: false });

interface ExperimentViewProps {
  id: string;
  /** Freeze the experiment (e.g. while its expanded twin is open). */
  paused?: boolean;
}

/** Renders one lab experiment. WebGL experiments degrade to a static backdrop without WebGL. */
export function ExperimentView({ id, paused = false }: ExperimentViewProps) {
  const reduced = useReducedMotion();

  const gl = (children: React.ReactNode, position: [number, number, number], label: string) => (
    <SceneCanvas
      className="absolute inset-0"
      position={position}
      fov={45}
      paused={paused}
      fallback={<SceneFallback />}
      label={label}
    >
      {children}
    </SceneCanvas>
  );

  switch (id) {
    case "particles":
      return <ParticleField paused={paused} />;
    case "physics":
      return gl(<PhysicsScene reduced={reduced} />, [0, 0, 6], "A 3D body with gravity that you can throw");
    case "shader":
      return gl(<ShaderScene reduced={reduced} />, [0, 0, 5], "A fragment shader that ripples where the pointer moves");
    case "geometry":
      return gl(<GeometryScene reduced={reduced} />, [0, 0, 6], "Prisms that turn toward the cursor");
    case "neural":
      return <NeuralViz paused={paused} />;
    default:
      return null;
  }
}
