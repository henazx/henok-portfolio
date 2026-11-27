import { ImageResponse } from "next/og";

import { BrandMark } from "@/components/ui/BrandMark";
import { profile } from "@/data/profile";
import { translate } from "@/lib/i18n/dictionary";

export const alt = `${translate(profile.name, "en")} — ${translate(profile.role, "en")}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#060910",
          backgroundImage:
            "radial-gradient(circle at 12% 8%, rgba(37,99,235,0.42), transparent 54%), radial-gradient(circle at 88% 88%, rgba(139,92,246,0.3), transparent 56%), radial-gradient(circle at 72% 12%, rgba(34,211,238,0.16), transparent 44%)",
          color: "#f8fafc",
          padding: "70px 78px",
          border: "1px solid rgba(255,255,255,0.14)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 25,
              letterSpacing: "-0.02em",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 46,
                height: 46,
                borderRadius: 11,
                border: "1px solid rgba(96,165,250,0.45)",
                backgroundColor: "rgba(59,130,246,0.18)",
                color: "#93c5fd",
              }}
            >
              <BrandMark />
            </div>
            <span style={{ color: "#94a3b8" }}>
              {translate("Portfolio", "en")}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 16px",
              border: "1px solid rgba(52,211,153,0.35)",
              borderRadius: 999,
              backgroundColor: "rgba(52,211,153,0.1)",
              color: "#a7f3d0",
              fontSize: 18,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            <span
              style={{
                display: "flex",
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: "#34d399",
              }}
            />
            {translate("Available for work", "en")}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#60a5fa",
            }}
          >
            {translate("Information Technology Specialist", "en")}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 88,
              fontWeight: 700,
              letterSpacing: "-0.05em",
              lineHeight: 1,
            }}
          >
            {translate(profile.name, "en")}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "#94a3b8",
              letterSpacing: "-0.01em",
            }}
          >
            {translate(
              "Computer Science Graduate · Software Developer · UX/UI Designer",
              "en",
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
            fontSize: 21,
            color: "#64748b",
          }}
        >
          <div style={{ display: "flex", gap: 10 }}>
            {profile.positioning.map((item) => (
              <span
                key={item}
                style={{
                  display: "flex",
                  border: "1px solid rgba(255,255,255,0.14)",
                  backgroundColor: "rgba(255,255,255,0.055)",
                  borderRadius: 999,
                  padding: "7px 15px",
                  color: "#94a3b8",
                }}
              >
                {translate(item, "en")}
              </span>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "monospace",
              fontSize: 16,
              letterSpacing: "0.08em",
              color: "#64748b",
            }}
          >
            <span style={{ color: "#22d3ee" }}>↗</span>
            {profile.github.replace("https://", "")}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
