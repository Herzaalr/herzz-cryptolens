import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Herzz Cryptolens — Crypto news, AI ringkas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraph() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0a0a0a",
          padding: "80px",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            color: "#a1a1aa",
            fontSize: "24px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "#10b981",
            }}
          />
          <span>Herzz Cryptolens_</span>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                color: "white",
                fontSize: "84px",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
              }}
            >
              Crypto news,
            </div>
            <div
              style={{
                color: "#71717a",
                fontSize: "84px",
                fontWeight: 700,
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
              }}
            >
              ringkas.
            </div>
            <div
              style={{
                marginTop: "24px",
                color: "#a1a1aa",
                fontSize: "26px",
                maxWidth: "900px",
                lineHeight: 1.4,
              }}
            >
              Singkat, padat, jelas. Dual-language AI summary dari 6 sumber
              crypto teratas, refresh tiap 15 menit.
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#71717a",
            fontSize: "20px",
          }}
        >
          <span>by Herzaalr</span>
          <span>herzz-cryptolens.vercel.app</span>
        </div>
      </div>
    ),
    size,
  );
}
