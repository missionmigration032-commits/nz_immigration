import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { OfferLetterDocument } from "@/components/OfferLetterDocument";
import { OfferLetterData, DEFAULT_OFFER_LETTER_DATA } from "@/types/offerLetter";

export async function POST(req: NextRequest) {
  try {
    const body: OfferLetterData = await req.json();
    const data: OfferLetterData = {
      ...DEFAULT_OFFER_LETTER_DATA,
      ...body,
    };

    const pdfBuffer = await renderToBuffer(
      React.createElement(OfferLetterDocument, { data }) as any
    );

    const safeName = (data.candidateName || "Grant_Letter")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .replace(/_+/g, "_");

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Grant_Letter_${safeName}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF generation route error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate offer letter PDF" },
      { status: 500 }
    );
  }
}
