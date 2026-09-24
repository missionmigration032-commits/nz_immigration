"use client";

import dynamic from "next/dynamic";
import React from "react";

const OfferLetterForm = dynamic(() => import("@/components/OfferLetterForm"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#6b7280",
        gap: "12px",
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          border: "3px solid #e5e7eb",
          borderTopColor: "#0062a4",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <span style={{ fontSize: "14px", fontWeight: "500" }}>
        Loading Offer Letter Engine & PDF Renderer...
      </span>
      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  ),
});

export default function OfferLetterClient({ apiToken }: { apiToken?: string }) {
  return <OfferLetterForm apiToken={apiToken} />;
}
