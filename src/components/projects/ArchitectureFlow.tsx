"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  BaseEdge,
  getBezierPath,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion } from "framer-motion";
import { animate } from "animejs";
import type { ArchitectureNode } from "@/data/projects";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Emphasis = "none" | "active" | "dim";

interface FlowNodeData extends Record<string, unknown> {
  label: string;
  index: number;
  emphasis: Emphasis;
  selected: boolean;
}

interface FlowEdgeData extends Record<string, unknown> {
  index: number;
  emphasis: Emphasis;
}

type FlowNode = Node<FlowNodeData, "arch">;
type FlowEdge = Edge<FlowEdgeData, "draw">;

const ArchNodeView = memo(function ArchNodeView({ data }: NodeProps<FlowNode>) {
  const reduced = useReducedMotion();
  const color =
    data.emphasis === "active" || data.selected
      ? "border-[var(--color-accent)] text-[var(--color-accent)]"
      : data.emphasis === "dim"
        ? "border-[var(--color-line)] text-[var(--color-muted)] opacity-50"
        : "border-[var(--color-fg)]/40 text-[var(--color-fg)]";
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.85 }}
      animate={{ opacity: data.emphasis === "dim" ? 0.5 : 1, scale: 1 }}
      transition={{ duration: 0.6, delay: reduced ? 0 : data.index * 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`min-w-32 cursor-pointer border bg-[var(--color-bg)] px-4 py-3 text-center font-mono text-[11px] tracking-[0.16em] transition-colors duration-300 ${color}`}
    >
      <Handle type="target" position={Position.Left} className="!size-1.5 !border-0 !bg-[var(--color-muted)]" />
      <span className="mb-1 block text-[9px] text-[var(--color-muted)]">{String(data.index + 1).padStart(2, "0")}</span>
      {data.label}
      <Handle type="source" position={Position.Right} className="!size-1.5 !border-0 !bg-[var(--color-muted)]" />
    </motion.div>
  );
});

/** Edge whose stroke draws itself with Anime.js on mount. */
const DrawEdge = memo(function DrawEdge(props: EdgeProps<FlowEdge>) {
  const reduced = useReducedMotion();
  const pathRef = useRef<SVGGElement>(null);
  const [path] = getBezierPath(props);
  const index = props.data?.index ?? 0;
  const emphasis = props.data?.emphasis ?? "none";

  useEffect(() => {
    if (reduced) return;
    const el = pathRef.current?.querySelector<SVGPathElement>("path.react-flow__edge-path");
    if (!el) return;
    const length = el.getTotalLength();
    el.style.strokeDasharray = `${length}`;
    const animation = animate(el, {
      strokeDashoffset: [length, 0],
      duration: 900,
      delay: 300 + index * 300,
      ease: "inOutQuad",
      onComplete: () => {
        el.style.strokeDasharray = "none";
      },
    });
    return () => {
      animation.cancel();
    };
  }, [reduced, index]);

  return (
    <g ref={pathRef}>
      <BaseEdge
        id={props.id}
        path={path}
        style={{
          stroke: emphasis === "active" ? "var(--color-accent)" : "var(--color-muted)",
          strokeWidth: emphasis === "active" ? 2 : 1,
          opacity: emphasis === "dim" ? 0.25 : 1,
          transition: "stroke 0.3s, opacity 0.3s",
        }}
      />
    </g>
  );
});

const nodeTypes = { arch: ArchNodeView };
const edgeTypes = { draw: DrawEdge };

interface ArchitectureFlowProps {
  nodes: ArchitectureNode[];
}

/** Interactive architecture diagram: hover highlights connections, click explains a node. */
export default function ArchitectureFlow({ nodes: source }: ArchitectureFlowProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>(source[0]?.id ?? "");

  const { nodes, edges } = useMemo(() => {
    const connected = new Set<string>();
    if (hovered) {
      connected.add(hovered);
      source.forEach((n, i) => {
        const next = source[i + 1];
        if (n.id === hovered && next) connected.add(next.id);
        if (next?.id === hovered) connected.add(n.id);
      });
    }
    const emphasisOf = (id: string): Emphasis =>
      !hovered ? "none" : connected.has(id) ? "active" : "dim";

    const flowNodes: FlowNode[] = source.map((n, i) => ({
      id: n.id,
      type: "arch",
      position: { x: i * 210, y: (i % 2) * 56 },
      data: { label: n.label, index: i, emphasis: emphasisOf(n.id), selected: selected === n.id },
      draggable: false,
    }));
    const flowEdges: FlowEdge[] = source.slice(0, -1).map((n, i) => {
      const next = source[i + 1];
      const touches = hovered === n.id || hovered === next.id;
      return {
        id: `${n.id}-${next.id}`,
        source: n.id,
        target: next.id,
        type: "draw",
        data: { index: i, emphasis: !hovered ? "none" : touches ? "active" : "dim" },
      };
    });
    return { nodes: flowNodes, edges: flowEdges };
  }, [source, hovered, selected]);

  const detail = source.find((n) => n.id === selected);

  return (
    <div>
      <div
        className="h-[260px] w-full border border-[var(--color-line)] bg-[var(--color-surface)]"
        role="group"
        aria-label="Architecture diagram"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          panOnDrag={false}
          preventScrolling={false}
          onNodeMouseEnter={(_, node) => setHovered(node.id)}
          onNodeMouseLeave={() => setHovered(null)}
          onNodeClick={(_, node) => setSelected(node.id)}
        />
      </div>
      <div className="mt-3 min-h-16 border-l-2 border-[var(--color-accent)] pl-4" aria-live="polite">
        <p className="label text-[var(--color-accent)]">{detail?.label}</p>
        <p className="mt-1 text-[15px] leading-relaxed text-[var(--color-muted)]">{detail?.detail}</p>
      </div>
    </div>
  );
}
