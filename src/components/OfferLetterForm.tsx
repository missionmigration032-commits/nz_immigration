"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { OfferLetterData, DEFAULT_OFFER_LETTER_DATA } from "@/types/offerLetter";
import { pdf } from "@react-pdf/renderer";
import { OfferLetterDocument } from "@/components/OfferLetterDocument";
import Link from "next/link";

interface OfferLetterFormProps {
  apiToken?: string;
}

export default function OfferLetterForm({ apiToken }: OfferLetterFormProps) {
  const [formData, setFormData] = useState<OfferLetterData>(DEFAULT_OFFER_LETTER_DATA);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Visas & Users for quick prefill
  const [visas, setVisas] = useState<any[]>([]);
  const [selectedVisaId, setSelectedVisaId] = useState<string>("");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Fetch existing visa applications for prefill
  useEffect(() => {
    if (!apiToken) return;
    const loadVisas = async () => {
      try {
        const res = await fetch(`${API_URL}/api/visas?origin=nz`, {
          headers: { Authorization: `Bearer ${apiToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setVisas(Array.isArray(data) ? data : data.visas || []);
        }
      } catch (err) {
        console.error("Failed to load visas for prefill:", err);
      }
    };
    loadVisas();
  }, [apiToken, API_URL]);

  // Handle prefill selection
  const handlePrefillSelect = (visaId: string) => {
    setSelectedVisaId(visaId);
    if (!visaId) return;

    const visa = visas.find((v) => v._id === visaId || v.id === visaId);
    if (!visa) return;

    const todayStr = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date());

    let validTillStr = formData.validTill;
    if (visa.validUntil) {
      try {
        validTillStr = new Intl.DateTimeFormat("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }).format(new Date(visa.validUntil));
      } catch {}
    }

    setFormData((prev) => ({
      ...prev,
      candidateName: visa.fullName || prev.candidateName,
      candidateNationality: visa.nationality || prev.candidateNationality,
      passportNumber: visa.passportNumber || visa.documentNumber || prev.passportNumber,
      status: visa.status === "Approved" ? "Issued" : visa.status || "Issued",
      issueDate: todayStr,
      validTill: validTillStr,
      sponsorName: visa.employer || visa.employerName || prev.sponsorName,
    }));
  };

  // Generate PDF Blob URL
  const generatePdfBlob = useCallback(async (data: OfferLetterData) => {
    setIsGenerating(true);
    try {
      const doc = <OfferLetterDocument data={data} />;
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl((oldUrl) => {
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        return url;
      });
    } catch (err) {
      console.error("Error generating PDF preview:", err);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Debounced update on form change
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        generatePdfBlob(formData);
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [formData, generatePdfBlob]);

  // Handle Form Change
  const handleChange = (
    field: keyof OfferLetterData,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle Sponsor Emails Array
  const handleAddEmail = () => {
    const current = formData.sponsorEmails ? [...formData.sponsorEmails] : [];
    setFormData((prev) => ({
      ...prev,
      sponsorEmails: [...current, ""],
    }));
  };

  const handleEmailChange = (index: number, val: string) => {
    const current = formData.sponsorEmails ? [...formData.sponsorEmails] : [""];
    current[index] = val;
    setFormData((prev) => ({
      ...prev,
      sponsorEmails: current,
    }));
  };

  const handleRemoveEmail = (index: number) => {
    const current = formData.sponsorEmails ? [...formData.sponsorEmails] : [];
    current.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      sponsorEmails: current.length > 0 ? current : [""],
    }));
  };

  // Reset to reference
  const handleReset = () => {
    if (confirm("Reset all fields to reference Grant Letter template?")) {
      setFormData(DEFAULT_OFFER_LETTER_DATA);
      setSelectedVisaId("");
    }
  };

  // Direct Download PDF
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      let downloadBlob: Blob | null = null;
      try {
        const doc = <OfferLetterDocument data={formData} />;
        downloadBlob = await pdf(doc).toBlob();
      } catch {
        // Fallback to server endpoint
        const res = await fetch("/api/offer-letter/pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          downloadBlob = await res.blob();
        }
      }

      if (!downloadBlob) throw new Error("Could not produce PDF file");

      const safeName = (formData.candidateName || "Grant_Letter")
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .replace(/_+/g, "_");
      const filename = `Grant_Letter_${safeName}.pdf`;

      const downloadUrl = URL.createObjectURL(downloadBlob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
    } catch (error: any) {
      console.error("Download failed:", error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Open full preview in new tab
  const handleOpenPreview = () => {
    if (previewUrl) {
      window.open(previewUrl, "_blank");
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "20px",
          marginBottom: "28px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <Link
              href="/employers"
              style={{
                color: "#6b7280",
                fontSize: "13px",
                textDecoration: "none",
                fontWeight: "500",
              }}
            >
              Employ migrants
            </Link>
            <span style={{ color: "#9ca3af", fontSize: "13px" }}>/</span>
            <span style={{ color: "#1a1f36", fontSize: "13px", fontWeight: "600" }}>
              Offer Letter / Grant Letter
            </span>
          </div>
          <h1
            style={{
              fontSize: "30px",
              color: "#1a1f36",
              margin: 0,
              fontWeight: "600",
              letterSpacing: "-0.5px",
            }}
          >
            Grant Letter of Sponsorship
          </h1>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "14px" }}>
            Generate 100% authentic 2-page New Zealand Immigration Offer & Grant of Sponsorship letters.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: "9px 16px",
              backgroundColor: "#ffffff",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Reset to Reference
          </button>
          <button
            type="button"
            onClick={handleOpenPreview}
            disabled={!previewUrl}
            style={{
              padding: "9px 16px",
              backgroundColor: "#ffffff",
              color: "#0062a4",
              border: "1px solid #0062a4",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: previewUrl ? "pointer" : "not-allowed",
              opacity: previewUrl ? 1 : 0.6,
            }}
          >
            Full Preview / Print
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
              padding: "9px 20px",
              backgroundColor: "#c60c46",
              color: "#ffffff",
              border: "none",
              borderRadius: "4px",
              fontSize: "13px",
              fontWeight: "600",
              cursor: isDownloading ? "wait" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 4px rgba(198, 12, 70, 0.2)",
            }}
          >
            {isDownloading ? (
              <span>Preparing PDF...</span>
            ) : (
              <>
                <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div
        className="md:hidden"
        style={{
          display: "flex",
          borderBottom: "1px solid #e5e7eb",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setActiveTab("form")}
          style={{
            flex: 1,
            padding: "10px",
            border: "none",
            background: "none",
            borderBottom: activeTab === "form" ? "2px solid #0062a4" : "none",
            color: activeTab === "form" ? "#0062a4" : "#6b7280",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Form Fields
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          style={{
            flex: 1,
            padding: "10px",
            border: "none",
            background: "none",
            borderBottom: activeTab === "preview" ? "2px solid #0062a4" : "none",
            color: activeTab === "preview" ? "#0062a4" : "#6b7280",
            fontWeight: "600",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Live Preview
        </button>
      </div>

      {/* Main Grid: Form on Left, Live PDF Preview on Right */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))",
          gap: "30px",
          alignItems: "start",
        }}
      >
        {/* Left Column: Form */}
        <div style={{ display: activeTab === "form" ? "block" : undefined }}>
          {/* Quick Prefill Card */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              padding: "16px 20px",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#1f2937", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Quick Prefill From System
              </span>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>
                Auto-fill candidate & sponsor
              </span>
            </div>
            <select
              value={selectedVisaId}
              onChange={(e) => handlePrefillSelect(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
                backgroundColor: "#ffffff",
                color: "#1f2937",
                outline: "none",
              }}
            >
              <option value="">-- Select an existing Applicant / Visa application --</option>
              {visas.map((v) => (
                <option key={v._id || v.id} value={v._id || v.id}>
                  {v.fullName || "Unnamed"} ({v.passportNumber || v.documentNumber || "No Passport"}) - {v.visaType || "Visa"} [{v.status || "Draft"}]
                </option>
              ))}
            </select>
          </div>

          {/* Form Section 1: Sponsor Information */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "12px", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: 0 }}>
                1. Sponsor & Quote Reference Details
              </h2>
              <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "13px" }}>
                Details quoted in the top header and sponsor address block of Page 1.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  Name of Sponsor
                </label>
                <input
                  type="text"
                  value={formData.sponsorName}
                  onChange={(e) => handleChange("sponsorName", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                  placeholder="e.g. HD Contractor Limited"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  Company Website URL
                </label>
                <input
                  type="text"
                  value={formData.sponsorWebsite || ""}
                  onChange={(e) => handleChange("sponsorWebsite", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                  placeholder="e.g. www.hdcontractor.co.nz"
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>
                    Company Emails (Displayed in 2 Columns on PDF)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddEmail}
                    style={{
                      backgroundColor: "#0062a4",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "3px",
                      padding: "4px 10px",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    + Add Email
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(formData.sponsorEmails && formData.sponsorEmails.length > 0
                    ? formData.sponsorEmails
                    : [""]
                  ).map((email, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => handleEmailChange(idx, e.target.value)}
                        style={{
                          flex: 1,
                          padding: "9px 12px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                          fontSize: "14px",
                          boxSizing: "border-box",
                        }}
                        placeholder={`e.g. ${idx === 0 ? "info@hdcontractor.co.nz" : "support@hdcontractor.co.nz"}`}
                      />
                      {(formData.sponsorEmails?.length || 0) > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(idx)}
                          style={{
                            backgroundColor: "#fee2e2",
                            color: "#b91c1c",
                            border: "1px solid #fecaca",
                            borderRadius: "4px",
                            padding: "8px 12px",
                            fontSize: "13px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                          title="Remove email"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px", display: "block" }}>
                  Emails are laid out in 2 columns in the PDF header (2 emails per row).
                </span>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                  Sponsor Address
                </label>
                <input
                  type="text"
                  value={formData.sponsorAddress}
                  onChange={(e) => handleChange("sponsorAddress", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "14px",
                    boxSizing: "border-box",
                  }}
                  placeholder="e.g. 54B Tidal Road, Māngere, Auckland 2022, New Zealand"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Client ID
                  </label>
                  <input
                    type="text"
                    value={formData.clientId}
                    onChange={(e) => handleChange("clientId", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                    placeholder="e.g. 15622175210"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Sponsorship Approval ID
                  </label>
                  <input
                    type="text"
                    value={formData.sponsorshipApprovalId}
                    onChange={(e) => handleChange("sponsorshipApprovalId", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                    placeholder="e.g. 1740568430"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    File Number
                  </label>
                  <input
                    type="text"
                    value={formData.fileNumber}
                    onChange={(e) => handleChange("fileNumber", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                    placeholder="e.g. ABD2026/420367"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Sponsorship Fee Receipt Number
                  </label>
                  <input
                    type="text"
                    value={formData.sponsorshipFeeReceiptNumber}
                    onChange={(e) => handleChange("sponsorshipFeeReceiptNumber", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                    placeholder="e.g. 100001750031"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Salary (monthly) in new zealand doller
                  </label>
                  <input
                    type="text"
                    value={formData.monthlySalary ?? ""}
                    onChange={(e) => handleChange("monthlySalary", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                    placeholder="e.g. $5,000"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Date of Sponsorship Approval
                  </label>
                  <input
                    type="text"
                    value={formData.dateOfSponsorshipApproval}
                    onChange={(e) => handleChange("dateOfSponsorshipApproval", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                    placeholder="e.g. 03 September 2026"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Section 2: Candidate / Migrant Information */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ borderBottom: "1px solid #f3f4f6", paddingBottom: "12px", marginBottom: "18px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#111827", margin: 0 }}>
                2. Candidate & Sponsorship Details
              </h2>
              <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "13px" }}>
                Candidate identity, passport, sponsorship number, and validity credentials.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Candidate Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.candidateName}
                    onChange={(e) => handleChange("candidateName", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                    placeholder="e.g. MD Shaminuzzaman"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={formData.candidateNationality}
                    onChange={(e) => handleChange("candidateNationality", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                    placeholder="e.g. Bangladeshi"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Passport Number
                  </label>
                  <input
                    type="text"
                    value={formData.passportNumber}
                    onChange={(e) => handleChange("passportNumber", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                    placeholder="e.g. A09820252"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Sponsorship Number
                  </label>
                  <input
                    type="text"
                    value={formData.sponsorshipNumber}
                    onChange={(e) => handleChange("sponsorshipNumber", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                    placeholder="e.g. W8420862"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Status
                  </label>
                  <input
                    type="text"
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                    placeholder="e.g. Issued"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Issue Date
                  </label>
                  <input
                    type="text"
                    value={formData.issueDate}
                    onChange={(e) => handleChange("issueDate", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                    placeholder="e.g. 03 September 2026"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Valid Till
                  </label>
                  <input
                    type="text"
                    value={formData.validTill}
                    onChange={(e) => handleChange("validTill", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                    placeholder="e.g. 03 March 2027"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Section 3: Advanced Overrides (Collapsible) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              padding: "20px 24px",
              marginBottom: "24px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111827", margin: 0 }}>
                  3. Content & Heading Overrides (Optional)
                </h3>
                <p style={{ margin: "2px 0 0", color: "#6b7280", fontSize: "12px" }}>
                  Customize letter title, authorized note, and legal text paragraphs.
                </p>
              </div>
              <span style={{ fontSize: "18px", color: "#6b7280" }}>
                {showAdvanced ? "▲" : "▼"}
              </span>
            </div>

            {showAdvanced && (
              <div style={{ marginTop: "18px", display: "grid", gap: "16px", borderTop: "1px solid #f3f4f6", paddingTop: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Letter Title
                  </label>
                  <input
                    type="text"
                    value={formData.letterTitle || ""}
                    onChange={(e) => handleChange("letterTitle", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Salary Row Label (Optional Override)
                  </label>
                  <input
                    type="text"
                    value={formData.salaryLabel || ""}
                    onChange={(e) => handleChange("salaryLabel", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                    placeholder="Salary (monthly) in new zealand doller:"
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Page 2 Authorized Note
                  </label>
                  <textarea
                    rows={2}
                    value={formData.authorizedNote || ""}
                    onChange={(e) => handleChange("authorizedNote", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "13px",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Body Paragraph 1 (Authorization)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bodyParagraph1 || ""}
                    onChange={(e) => handleChange("bodyParagraph1", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "13px",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Body Paragraph 2 (Confidentiality & MBIE Disclaimer)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bodyParagraph2 || ""}
                    onChange={(e) => handleChange("bodyParagraph2", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "13px",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                    Sign-off
                  </label>
                  <input
                    type="text"
                    value={formData.signOff || ""}
                    onChange={(e) => handleChange("signOff", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "4px",
                      fontSize: "14px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live PDF Preview */}
        <div
          style={{
            display: activeTab === "preview" || typeof window !== "undefined" ? "block" : "none",
            position: "sticky",
            top: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              overflow: "hidden",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
            }}
          >
            {/* Preview Toolbar */}
            <div
              style={{
                backgroundColor: "#1a1f36",
                color: "#ffffff",
                padding: "12px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "14px", fontWeight: "700" }}>Live PDF Document</span>
                <span
                  style={{
                    backgroundColor: "#0062a4",
                    color: "#ffffff",
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    fontWeight: "600",
                  }}
                >
                  2 Pages
                </span>
                {isGenerating && (
                  <span style={{ fontSize: "12px", color: "#9ca3af", fontStyle: "italic" }}>
                    Updating...
                  </span>
                )}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  style={{
                    backgroundColor: "#c60c46",
                    color: "#ffffff",
                    border: "none",
                    padding: "6px 14px",
                    borderRadius: "3px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {isDownloading ? "Downloading..." : "Download"}
                </button>
                <button
                  type="button"
                  onClick={handleOpenPreview}
                  disabled={!previewUrl}
                  style={{
                    backgroundColor: "transparent",
                    color: "#ffffff",
                    border: "1px solid #4b5563",
                    padding: "6px 12px",
                    borderRadius: "3px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Full Tab
                </button>
              </div>
            </div>

            {/* Preview Frame */}
            <div
              style={{
                backgroundColor: "#525659",
                height: "760px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              {previewUrl ? (
                <iframe
                  src={`${previewUrl}#toolbar=0&navpanes=0`}
                  title="Grant Letter PDF Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                />
              ) : (
                <div style={{ color: "#ffffff", textAlign: "center", padding: "40px" }}>
                  <div style={{ fontSize: "16px", marginBottom: "8px" }}>Generating Letter Preview...</div>
                  <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                    Loading react-pdf renderer & official vector assets
                  </div>
                </div>
              )}
            </div>

            {/* Quick Reference Guidance footer */}
            <div
              style={{
                padding: "12px 18px",
                backgroundColor: "#f9fafb",
                borderTop: "1px solid #e5e7eb",
                fontSize: "12px",
                color: "#6b7280",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Authentic INZ format with official MBIE & NZ Govt lockups.</span>
              <span style={{ fontWeight: "600", color: "#0062a4" }}>Ready for export</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
