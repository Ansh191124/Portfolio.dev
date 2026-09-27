import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#050505",
          color: "#ecebe6",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 8, color: "#c6ff3d" }}>{site.brand}</div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 120, fontWeight: 700, lineHeight: 0.95 }}>
          <span>BUILDING</span>
          <span>DIGITAL</span>
          <span style={{ color: "#c6ff3d" }}>SYSTEMS.</span>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#8a8a85" }}>
          {site.name} — {site.role}
        </div>
      </div>
    ),
    size,
  );
}
