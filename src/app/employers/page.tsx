import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";
import Link from "next/link";

export default async function EmployersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  if (!["employee", "admin"].includes(role)) {
    redirect("/");
  }

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", padding: "40px 20px", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: "1050px", margin: "0 auto" }}>
        
        {/* Title */}
        <div style={{ marginBottom: "35px", borderBottom: "1px solid #e5e7eb", paddingBottom: "20px" }}>
          <h1 style={{ fontSize: "40px", color: "#6b7280", margin: "0", fontWeight: "300", letterSpacing: "-0.5px" }}>
            Employ migrants
          </h1>
        </div>

        {/* Info Banner */}
        <div style={{ marginBottom: "40px", backgroundColor: "#f9fafb", padding: "20px 24px", borderRadius: "2px", borderLeft: "4px solid #0062a4" }}>
          <h2 style={{ fontSize: "18px", color: "#1a1f36", margin: "0 0 8px 0", fontWeight: "600" }}>Employer Accreditation & Management</h2>
          <p style={{ color: "#4b5563", margin: "0", fontSize: "14px", lineHeight: "1.6" }}>
            Welcome back, <strong>{session.user?.name}</strong>. Manage customer accounts, review visa applications, and generate new employee credentials for system administration.
          </p>
        </div>

        {/* Grid Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "24px" }}>
          
          {/* Card 1: Users */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #d1d5db", borderRadius: "2px", padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: "20px", color: "#1a1f36", margin: "0 0 12px 0", fontWeight: "700" }}>
                Manage Users
              </h3>
              <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px 0" }}>
                Create customer accounts, reset user credentials, and manage system access permissions.
              </p>
            </div>
            <Link
              href="/employers/users"
              style={{
                display: "inline-block",
                textAlign: "center",
                padding: "11px 20px",
                backgroundColor: "#1a1f36",
                color: "#ffffff",
                textDecoration: "none",
                borderRadius: "2px",
                fontWeight: "bold",
                fontSize: "14px"
              }}
            >
              Manage Users &rarr;
            </Link>
          </div>

          {/* Card 2: Visas */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #d1d5db", borderRadius: "2px", padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ fontSize: "20px", color: "#1a1f36", margin: "0 0 12px 0", fontWeight: "700" }}>
                Manage Visas
              </h3>
              <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px 0" }}>
                Create, review, or assign visa applications. Track status pools and manage visa allocations.
              </p>
            </div>
            <Link
              href="/employers/visas"
              style={{
                display: "inline-block",
                textAlign: "center",
                padding: "11px 20px",
                backgroundColor: "#c60c46",
                color: "#ffffff",
                textDecoration: "none",
                borderRadius: "2px",
                fontWeight: "bold",
                fontSize: "14px"
              }}
            >
              Manage Visas &rarr;
            </Link>
          </div>

          {/* Card 3: Offer Letter */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #d1d5db", borderRadius: "2px", padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "20px", color: "#1a1f36", margin: 0, fontWeight: "700" }}>
                  Grant / Offer Letter
                </h3>
                <span style={{ fontSize: "11px", backgroundColor: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", padding: "2px 8px", borderRadius: "10px", fontWeight: "600" }}>
                  Official INZ PDF
                </span>
              </div>
              <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px 0" }}>
                Generate official 2-page Grant Letters of Sponsorship with dynamic variable forms, instant live preview, and PDF download.
              </p>
            </div>
            <Link
              href="/employers/offer-letter"
              style={{
                display: "inline-block",
                textAlign: "center",
                padding: "11px 20px",
                backgroundColor: "#065f46",
                color: "#ffffff",
                textDecoration: "none",
                borderRadius: "2px",
                fontWeight: "bold",
                fontSize: "14px",
                boxShadow: "0 2px 4px rgba(6, 95, 70, 0.15)",
              }}
            >
              Generate Offer Letter &rarr;
            </Link>
          </div>

          {/* Card 4: Employee (Admin only) */}
          {role === "admin" && (
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #d1d5db", borderRadius: "2px", padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: "20px", color: "#1a1f36", margin: "0 0 12px 0", fontWeight: "700" }}>
                  Create Employee
                </h3>
                <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.6", margin: "0 0 24px 0" }}>
                  Generate new employee accounts with administrative privileges to manage system operations.
                </p>
              </div>
              <Link
                href="/employers/employees"
                style={{
                  display: "inline-block",
                  textAlign: "center",
                  padding: "11px 20px",
                  backgroundColor: "#0062a4",
                  color: "#ffffff",
                  textDecoration: "none",
                  borderRadius: "2px",
                  fontWeight: "bold",
                  fontSize: "14px"
                }}
              >
                Create Employee &rarr;
              </Link>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
