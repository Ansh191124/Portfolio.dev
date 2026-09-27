import * as THREE from "three";
import { theme } from "@/lib/theme";

const MONO = '"Geist Mono", ui-monospace, Menlo, Consolas, monospace';

export interface Surface {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
}

/** A 2D canvas wrapped in a THREE texture — crisp, depth-correct UI on 3D planes. */
export const createSurface = (width: number, height: number): Surface => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { canvas, ctx, texture };
};

type TokenKind = "keyword" | "string" | "comment" | "plain" | "prompt";

interface Token {
  text: string;
  kind: TokenKind;
}

const TOKEN = /(\/\/.*$)|("[^"]*")|\b(const|export|let|return|import|from|await|async|function|npm|git)\b|(\$)/g;

const tokenize = (line: string): Token[] => {
  const tokens: Token[] = [];
  let last = 0;
  for (const match of line.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) tokens.push({ text: line.slice(last, index), kind: "plain" });
    const kind: TokenKind = match[1] ? "comment" : match[2] ? "string" : match[3] ? "keyword" : "prompt";
    tokens.push({ text: match[0], kind });
    last = index + match[0].length;
  }
  if (last < line.length) tokens.push({ text: line.slice(last), kind: "plain" });
  return tokens;
};

const COLORS: Record<TokenKind, string> = {
  keyword: theme.accent,
  string: "#d8d7d0",
  comment: "#5e5e5a",
  plain: "#9c9b95",
  prompt: theme.accent,
};

export interface CodeDrawOptions {
  title: string;
  lines: readonly string[];
  /** "lines" reveals whole lines; "chars" types characters. */
  mode: "lines" | "chars";
}

/** Draws an editor/terminal window. `progress` is lines or characters revealed. */
export const drawCode = (
  { canvas, ctx }: Surface,
  { title, lines, mode }: CodeDrawOptions,
  progress: number,
): void => {
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#070707";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, w - 3, h - 3);

  // window chrome
  ctx.fillStyle = "#0f0f0f";
  ctx.fillRect(3, 3, w - 6, 62);
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(3, 65, w - 6, 2);
  [0, 1, 2].forEach((i) => {
    ctx.beginPath();
    ctx.arc(38 + i * 30, 34, 8, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? theme.accent : "#3a3a3a";
    ctx.fill();
  });
  ctx.font = `28px ${MONO}`;
  ctx.fillStyle = "#6f6f6a";
  ctx.textBaseline = "middle";
  ctx.fillText(title, 140, 35);

  const fontSize = Math.round(w * 0.036);
  const lineHeight = Math.round(fontSize * 1.55);
  ctx.font = `${fontSize}px ${MONO}`;
  ctx.textBaseline = "alphabetic";
  const charWidth = ctx.measureText("M").width;
  let remaining = progress;
  let cursor: { x: number; y: number } | null = null;

  lines.forEach((line, i) => {
    const y = 120 + i * lineHeight;
    let x = 40;
    let alpha = 1;
    let visible = line;

    if (mode === "lines") {
      alpha = Math.max(0, Math.min(1, progress - i));
      if (alpha <= 0) return;
    } else {
      if (remaining <= 0) return;
      visible = line.slice(0, Math.floor(remaining));
      remaining -= line.length + 1;
    }

    ctx.globalAlpha = alpha;
    let consumed = 0;
    for (const token of tokenize(line)) {
      const text = token.text.slice(0, Math.max(0, visible.length - consumed));
      consumed += token.text.length;
      if (!text) break;
      ctx.fillStyle = COLORS[token.kind];
      ctx.fillText(text, x, y);
      x += charWidth * text.length;
    }
    ctx.globalAlpha = 1;
    if (mode === "chars" && visible.length < line.length + 1 && remaining <= 0 && !cursor) {
      cursor = { x: 40 + charWidth * visible.length, y };
    }
  });

  if (mode === "chars") {
    const c = cursor ?? { x: 40, y: 120 };
    ctx.fillStyle = theme.accent;
    ctx.fillRect(c.x + 2, c.y - fontSize * 0.85, charWidth * 0.6, fontSize);
  }
};

/** Static "product UI" wireframe shown on the 3D monitor. */
export const drawScreen = ({ canvas, ctx }: Surface): void => {
  const { width: w, height: h } = canvas;
  ctx.fillStyle = "#070707";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = "#232323";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);
  ctx.fillStyle = "#101010";
  ctx.fillRect(0, 0, w, 56);
  ctx.fillStyle = theme.accent;
  ctx.fillRect(28, 22, 44, 12);
  ctx.fillStyle = "#2b2b2b";
  [0, 1, 2, 3].forEach((i) => ctx.fillRect(w - 380 + i * 90, 24, 64, 8));

  // sidebar
  ctx.fillStyle = "#0c0c0c";
  ctx.fillRect(0, 56, 190, h - 56);
  [0, 1, 2, 3, 4].forEach((i) => {
    ctx.fillStyle = i === 1 ? "#1d1d1d" : "#141414";
    ctx.fillRect(22, 96 + i * 52, 146, 30);
    if (i === 1) {
      ctx.fillStyle = theme.accent;
      ctx.fillRect(22, 96 + i * 52, 3, 30);
    }
  });

  // chart
  const cx = 230;
  const cy = 96;
  const cw = w - cx - 40;
  ctx.fillStyle = "#0e0e0e";
  ctx.fillRect(cx, cy, cw, 250);
  ctx.strokeStyle = "#1e1e1e";
  ctx.strokeRect(cx, cy, cw, 250);
  const bars = 18;
  for (let i = 0; i < bars; i += 1) {
    const bh = 40 + ((Math.sin(i * 1.3) + 1) / 2) * 150;
    ctx.fillStyle = i === 12 ? theme.accent : "#2c2c2c";
    ctx.fillRect(cx + 26 + i * ((cw - 52) / bars), cy + 224 - bh, (cw - 52) / bars - 10, bh);
  }
  // rows
  for (let i = 0; i < 4; i += 1) {
    ctx.fillStyle = "#121212";
    ctx.fillRect(cx, cy + 280 + i * 54, cw, 40);
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(cx + 20, cy + 296 + i * 54, 140 + (i % 2) * 60, 8);
    ctx.fillStyle = i === 0 ? theme.accent : "#333";
    ctx.fillRect(cx + cw - 90, cy + 296 + i * 54, 60, 8);
  }
};

/** Small mono label used above 3D nodes. */
export const createLabelTexture = (text: string): THREE.CanvasTexture => {
  const surface = createSurface(256, 64);
  const { ctx } = surface;
  ctx.clearRect(0, 0, 256, 64);
  ctx.font = `600 26px ${MONO}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = theme.fg;
  ctx.fillText(text, 128, 34);
  surface.texture.needsUpdate = true;
  return surface.texture;
};

/** Deterministic PRNG so scene layouts are stable and render-pure. */
export const seeded = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
