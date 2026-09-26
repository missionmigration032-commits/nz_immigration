/* eslint-disable jsx-a11y/alt-text */
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Link,
  Font,
} from "@react-pdf/renderer";
import { OfferLetterData } from "@/types/offerLetter";
import {
  INZ_LOGO_BASE64,
  MBIE_LOGO_BASE64,
  NZ_GOVT_LOGO_BASE64,
} from "@/lib/offerLetterAssets";

// Register font for full Unicode & macron (Māngere) support
try {
  if (typeof window !== "undefined") {
    Font.register({
      family: "LiberationSerif",
      fonts: [
        { src: `${window.location.origin}/fonts/LiberationSerif-Regular.ttf` },
        { src: `${window.location.origin}/fonts/LiberationSerif-Bold.ttf`, fontWeight: "bold" },
        { src: `${window.location.origin}/fonts/LiberationSerif-Italic.ttf`, fontStyle: "italic" },
      ],
    });
  } else {
    // Node.js environment
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    Font.register({
      family: "LiberationSerif",
      fonts: [
        { src: path.resolve("public/fonts/LiberationSerif-Regular.ttf") },
        { src: path.resolve("public/fonts/LiberationSerif-Bold.ttf"), fontWeight: "bold" },
        { src: path.resolve("public/fonts/LiberationSerif-Italic.ttf"), fontStyle: "italic" },
      ],
    });
  }
} catch {
  // Fallback to built-in Times-Roman if registration already happened or fails
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "LiberationSerif",
    fontSize: 9.6,
    paddingTop: 24,
    paddingBottom: 60,
    paddingLeft: 64,
    paddingRight: 64,
    color: "#000000",
    lineHeight: 1.25,
  },
  headerLogoContainer: {
    alignItems: "flex-end",
    marginBottom: 8,
  },
  topLogo: {
    width: 80,
    height: 85,
    objectFit: "contain",
  },
  quoteTitle: {
    fontWeight: "bold",
    fontSize: 9.8,
    marginBottom: 4,
  },
  quoteTable: {
    marginBottom: 9,
  },
  quoteRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  quoteLabel: {
    width: 180,
    fontSize: 9.6,
  },
  quoteValue: {
    fontSize: 9.6,
  },
  sponsorBlock: {
    marginBottom: 9,
  },
  sponsorName: {
    fontWeight: "bold",
    fontSize: 9.8,
    marginBottom: 2,
  },
  sponsorDetail: {
    fontSize: 9.4,
    marginBottom: 2,
  },
  sponsorBold: {
    fontWeight: "bold",
  },
  sponsorLink: {
    color: "#000000",
    textDecoration: "none",
  },
  sponsorEmailsContainer: {
    marginBottom: 1,
  },
  sponsorEmailsRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  sponsorEmailCol: {
    width: "50%",
    paddingRight: 8,
  },
  sponsorAddress: {
    fontWeight: "bold",
    fontSize: 9.8,
    marginTop: 1,
  },
  letterTitle: {
    fontWeight: "bold",
    fontSize: 10.2,
    textAlign: "center",
    marginTop: 2,
    marginBottom: 9,
  },
  salutationBlock: {
    marginBottom: 9,
  },
  salutationDear: {
    fontWeight: "bold",
    fontSize: 9.8,
    marginBottom: 2,
  },
  salutationCandidate: {
    fontSize: 9.8,
    marginBottom: 2,
  },
  salutationNationality: {
    fontSize: 9.8,
  },
  detailsBlock: {
    marginBottom: 9,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  detailLabel: {
    fontWeight: "bold",
    width: 125,
    fontSize: 9.8,
  },
  detailValue: {
    fontSize: 9.8,
  },
  bodyParagraph: {
    textAlign: "justify",
    marginBottom: 8,
    lineHeight: 1.26,
    fontSize: 9.4,
  },
  bodyLink: {
    color: "#0462c1",
    textDecoration: "underline",
  },
  signOff: {
    fontWeight: "bold",
    fontSize: 9.8,
    marginTop: 3,
  },
  footerContainer: {
    position: "absolute",
    bottom: 22,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mbieLogo: {
    width: 128,
    height: 46,
    objectFit: "contain",
  },
  nzGovtLogo: {
    width: 118,
    height: 48,
    objectFit: "contain",
  },

  // Page 2 Styles
  page2Note: {
    fontWeight: "bold",
    fontSize: 9.8,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 10,
    lineHeight: 1.25,
  },
  p2Section: {
    marginBottom: 8,
  },
  p2Title: {
    fontWeight: "bold",
    fontSize: 8.2,
    marginBottom: 2,
  },
  p2Body: {
    fontSize: 8,
    lineHeight: 1.22,
    marginBottom: 2,
  },
  p2Bold: {
    fontWeight: "bold",
  },
  p2Link: {
    color: "#0462c1",
    textDecoration: "underline",
  },
});

interface OfferLetterDocumentProps {
  data: OfferLetterData;
}

export const OfferLetterDocument: React.FC<OfferLetterDocumentProps> = ({ data }) => {
  return (
    <Document title={`Grant_Letter_${data.candidateName.replace(/\s+/g, "_")}`}>
      {/* PAGE 1 */}
      <Page size="LETTER" style={styles.page}>
        {/* Top Right Logo */}
        <View style={styles.headerLogoContainer}>
          <Image src={INZ_LOGO_BASE64} style={styles.topLogo} />
        </View>

        {/* Top Quote Block */}
        <View>
          <Text style={styles.quoteTitle}>In reply please quote:</Text>
          <View style={styles.quoteTable}>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Name of Sponsor:</Text>
              <Text style={styles.quoteValue}>{data.sponsorName}</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Client ID:</Text>
              <Text style={styles.quoteValue}>{data.clientId}</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Sponsorship Approval ID:</Text>
              <Text style={styles.quoteValue}>{data.sponsorshipApprovalId}</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>File Number:</Text>
              <Text style={styles.quoteValue}>{data.fileNumber}</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Sponsorship Fee Receipt Number:</Text>
              <Text style={styles.quoteValue}>{data.sponsorshipFeeReceiptNumber}</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>
                {data.salaryLabel || "Salary (monthly) in new zealand doller:"}
              </Text>
              <Text style={styles.quoteValue}>{data.monthlySalary || ""}</Text>
            </View>
            <View style={styles.quoteRow}>
              <Text style={styles.quoteLabel}>Date of Sponsorship Approval:</Text>
              <Text style={styles.quoteValue}>{data.dateOfSponsorshipApproval}</Text>
            </View>
          </View>
        </View>

        {/* Sponsor Block */}
        <View style={styles.sponsorBlock}>
          <Text style={styles.sponsorName}>{data.sponsorName}</Text>
          {data.sponsorWebsite ? (
            <Text style={styles.sponsorDetail}>
              <Text style={styles.sponsorBold}>Website: </Text>
              <Link
                src={
                  data.sponsorWebsite.startsWith("http")
                    ? data.sponsorWebsite
                    : `https://${data.sponsorWebsite}`
                }
                style={styles.sponsorLink}
              >
                {data.sponsorWebsite}
              </Link>
            </Text>
          ) : null}
          {data.sponsorEmails && data.sponsorEmails.filter((e) => e && e.trim() !== "").length > 0 ? (
            <View style={styles.sponsorEmailsContainer}>
              {(() => {
                const validEmails = data.sponsorEmails.filter((e) => e && e.trim() !== "");
                const pairs: [string, string?][] = [];
                for (let i = 0; i < validEmails.length; i += 2) {
                  pairs.push([validEmails[i], validEmails[i + 1]]);
                }
                return pairs.map((pair, idx) => (
                  <View key={idx} style={styles.sponsorEmailsRow}>
                    <View style={styles.sponsorEmailCol}>
                      <Text style={styles.sponsorDetail}>
                        <Text style={styles.sponsorBold}>Email: </Text>
                        <Link
                          src={`mailto:${pair[0].replace(/^email\s*:\s*/i, "").trim()}`}
                          style={styles.sponsorLink}
                        >
                          {pair[0].replace(/^email\s*:\s*/i, "").trim()}
                        </Link>
                      </Text>
                    </View>
                    <View style={styles.sponsorEmailCol}>
                      {pair[1] ? (
                        <Text style={styles.sponsorDetail}>
                          <Text style={styles.sponsorBold}>Email: </Text>
                          <Link
                            src={`mailto:${pair[1].replace(/^email\s*:\s*/i, "").trim()}`}
                            style={styles.sponsorLink}
                          >
                            {pair[1].replace(/^email\s*:\s*/i, "").trim()}
                          </Link>
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ));
              })()}
            </View>
          ) : null}
          {data.sponsorAddress ? (
            <Text style={styles.sponsorAddress}>{data.sponsorAddress}</Text>
          ) : null}
        </View>

        {/* Centered Heading */}
        <Text style={styles.letterTitle}>
          {data.letterTitle || "Grant Letter of Sponsorship for New Zealand"}
        </Text>

        {/* Salutation Block */}
        <View style={styles.salutationBlock}>
          <Text style={styles.salutationDear}>Dear</Text>
          <Text style={styles.salutationCandidate}>{data.candidateName}</Text>
          <Text style={styles.salutationNationality}>{data.candidateNationality}</Text>
        </View>

        {/* Candidate Details Block */}
        <View style={styles.detailsBlock}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status: </Text>
            <Text style={styles.detailValue}>{data.status}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name: </Text>
            <Text style={styles.detailValue}>{data.candidateName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Passport Number: </Text>
            <Text style={styles.detailValue}>{data.passportNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Sponsorship Number: </Text>
            <Text style={styles.detailValue}>{data.sponsorshipNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Issue Date: </Text>
            <Text style={styles.detailValue}>{data.issueDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Valid Till: </Text>
            <Text style={styles.detailValue}>{data.validTill}</Text>
          </View>
        </View>

        {/* Body Paragraph 1 */}
        <Text style={styles.bodyParagraph}>
          {data.bodyParagraph1 || (
            <>
              You are now authorized to work in New Zealand under an approved electronic Sponsorship and may enter through all international airports in New Zealand as a recognized international worker. When you travel to New Zealand, you must carry the passport you used to apply for the sponsorship, as the permit is electronically linked to it. New Zealand border officials and airline check-in staff will have electronic access to confirm your sponsorship status. To view or verify your work authorization online, please visit{" "}
              <Link src="https://www.immigration.govt.nz" style={styles.bodyLink}>
                www.immigration.govt.nz
              </Link>{" "}
              and refer to the Sponsorship section or log in through your RealMe account.
            </>
          )}
        </Text>

        {/* Body Paragraph 2 */}
        <Text style={styles.bodyParagraph}>
          {data.bodyParagraph2 ||
            "Any opinions expressed in this message do not necessarily reflect those of the Ministry of Business, Innovation and Employment. This message and any attachments are confidential and intended solely for the use of the individual or entity to whom they are addressed. If you are not the intended recipient, or the person responsible for delivering the message to the intended recipient, please be advised that you have received this communication in error. Any use, disclosure, distribution, or copying of this communication is strictly prohibited. Please notify the sender immediately and delete this message and any attachments from your system."}
        </Text>

        {/* Sign-off */}
        <Text style={styles.signOff}>{data.signOff || "Immigration New Zealand"}</Text>

        {/* Footer */}
        <View style={styles.footerContainer} fixed>
          <Image src={MBIE_LOGO_BASE64} style={styles.mbieLogo} />
          <Image src={NZ_GOVT_LOGO_BASE64} style={styles.nzGovtLogo} />
        </View>
      </Page>

      {/* PAGE 2 */}
      <Page size="LETTER" style={styles.page}>
        {/* Top Right Logo */}
        <View style={styles.headerLogoContainer}>
          <Image src={INZ_LOGO_BASE64} style={styles.topLogo} />
        </View>

        {/* Header Authorized Note */}
        <Text style={styles.page2Note}>
          {data.authorizedNote ||
            "*Note: This paper Authorized by Immigration New Zealand and valid till a limited duration as determined by Immigration New Zealand"}
        </Text>

        {/* Section 1 */}
        <View style={styles.p2Section}>
          <Text style={styles.p2Title}>You do not require a visa label in your passport</Text>
          <Text style={styles.p2Body}>
            The details provided reflect the <Text style={styles.p2Bold}>electronic record</Text> of your visa held by{" "}
            <Text style={styles.p2Bold}>Immigration New Zealand (INZ)</Text>.
          </Text>
          <Text style={styles.p2Body}>
            Do not alter this letter. For information about <Text style={styles.p2Bold}>visas</Text>, visit:{" "}
            <Link src="https://www.immigration.govt.nz" style={styles.p2Link}>
              https://www.immigration.govt.nz
            </Link>
          </Text>
          <Text style={[styles.p2Body, { marginTop: 2 }]}>
            Please ensure your <Text style={styles.p2Bold}>visa details match your passport</Text> before you travel. Contact INZ immediately if there are any discrepancies.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.p2Section}>
          <Text style={styles.p2Title}>If you get a new passport</Text>
          <Text style={styles.p2Body}>
            If you obtain a new passport while this visa is still valid, you{" "}
            <Text style={styles.p2Bold}>must request INZ to update your visa details</Text> so that they correspond with your new passport. INZ provides guidance on how to do this at:{" "}
            <Link src="https://www.immigration.govt.nz/new-zealand-visas" style={styles.p2Link}>
              https://www.immigration.govt.nz/new-zealand-visas
            </Link>
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.p2Section}>
          <Text style={styles.p2Title}>Your passport scans</Text>
          <Text style={styles.p2Body}>
            At the time of your visa application, you may have been asked to{" "}
            <Text style={styles.p2Bold}>submit your passport to the nearest Visa Application Centre (VAC)</Text> for scanning. This process is a standard part of verifying your identity and supporting your application.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.p2Section}>
          <Text style={styles.p2Title}>Passport Requirements Waived</Text>
          <Text style={styles.p2Body}>
            Following assessment of your application, we <Text style={styles.p2Bold}>waived the passport requirement</Text>. We apologies if you have already submitted your passport to the VAC. Your passport will be returned to you as soon as possible.{" "}
            <Text style={styles.p2Bold}>If you have not yet submitted your passport, please do not send it.</Text>
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.p2Section}>
          <Text style={styles.p2Title}>Automated Systems</Text>
          <Text style={styles.p2Body}>
            Some parts of your application may have been processed using <Text style={styles.p2Bold}>automated systems</Text> under section 28 of the Immigration Act 2009.
          </Text>
          <Text style={styles.p2Body}>
            For more information about INZ’s use of automation, visit:
            <Link src="https://www.immigration.govt.nz/about-us/site-information/terms-of-use" style={styles.p2Link}>
              https://www.immigration.govt.nz/about-us/site-information/terms-of-use
            </Link>
          </Text>
        </View>

        {/* Section 6 */}
        <View style={styles.p2Section}>
          <Text style={styles.p2Title}>You Must Not Remain in New Zealand after Your Visa Expires</Text>
          <Text style={styles.p2Body}>
            You must <Text style={styles.p2Bold}>hold a valid visa at all times</Text> while in New Zealand.
          </Text>
          <Text style={styles.p2Body}>
            If your visa expires and you do not leave, you will be in New Zealand unlawfully and may be{" "}
            <Text style={styles.p2Bold}>liable for deportation</Text>. Failure to leave voluntarily before receiving a deportation order may result in a{" "}
            <Text style={styles.p2Bold}>prohibition period</Text> that restricts you from returning to New Zealand in the future.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer} fixed>
          <Image src={MBIE_LOGO_BASE64} style={styles.mbieLogo} />
          <Image src={NZ_GOVT_LOGO_BASE64} style={styles.nzGovtLogo} />
        </View>
      </Page>
    </Document>
  );
};

export default OfferLetterDocument;
