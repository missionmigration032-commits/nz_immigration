import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";
import OfferLetterClient from "./OfferLetterClient";

export const metadata = {
  title: "Grant Letter of Sponsorship | Immigration New Zealand",
  description: "Create, preview, and download official 2-page New Zealand Immigration Offer Letters and Grant Letters of Sponsorship.",
};

export default async function OfferLetterPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (!["employee", "admin"].includes(role)) {
    redirect("/");
  }

  const token = (session as any)?.apiToken;

  return (
    <div
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        padding: "35px 20px 60px",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <OfferLetterClient apiToken={token} />
    </div>
  );
}
