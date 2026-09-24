export interface OfferLetterData {
  // Sponsor Details
  sponsorName: string;
  sponsorAddress: string;
  clientId: string;
  sponsorshipApprovalId: string;
  fileNumber: string;
  sponsorshipFeeReceiptNumber: string;
  dateOfSponsorshipApproval: string;

  // Candidate Details
  candidateName: string;
  candidateNationality: string;
  passportNumber: string;
  sponsorshipNumber: string;
  status: string;
  issueDate: string;
  validTill: string;

  // Customization (Optional overrides with reference defaults)
  letterTitle?: string;
  authorizedNote?: string;
  bodyParagraph1?: string;
  bodyParagraph2?: string;
  signOff?: string;
}

export const DEFAULT_OFFER_LETTER_DATA: OfferLetterData = {
  // Sponsor Details (from reference)
  sponsorName: "HD Contractor Limited",
  sponsorAddress: "54B Tidal Road, Māngere, Auckland 2022, New Zealand",
  clientId: "15622175210",
  sponsorshipApprovalId: "1740568430",
  fileNumber: "ABD2026/420367",
  sponsorshipFeeReceiptNumber: "100001750031",
  dateOfSponsorshipApproval: "03 September 2026",

  // Candidate Details (from reference)
  candidateName: "MD Shaminuzzaman",
  candidateNationality: "Bangladeshi",
  passportNumber: "A09820252",
  sponsorshipNumber: "W8420862",
  status: "Issued",
  issueDate: "03 September 2026",
  validTill: "03 March 2027",

  // Letter Defaults
  letterTitle: "Grant Letter of Sponsorship for New Zealand",
  authorizedNote: "*Note: This paper Authorized by Immigration New Zealand and valid till a limited duration as determined by Immigration New Zealand",
  bodyParagraph1: "You are now authorized to work in New Zealand under an approved electronic Sponsorship and may enter through all international airports in New Zealand as a recognized international worker. When you travel to New Zealand, you must carry the passport you used to apply for the sponsorship, as the permit is electronically linked to it. New Zealand border officials and airline check-in staff will have electronic access to confirm your sponsorship status. To view or verify your work authorization online, please visit www.immigration.govt.nz and refer to the Sponsorship section or log in through your RealMe account.",
  bodyParagraph2: "Any opinions expressed in this message do not necessarily reflect those of the Ministry of Business, Innovation and Employment. This message and any attachments are confidential and intended solely for the use of the individual or entity to whom they are addressed. If you are not the intended recipient, or the person responsible for delivering the message to the intended recipient, please be advised that you have received this communication in error. Any use, disclosure, distribution, or copying of this communication is strictly prohibited. Please notify the sender immediately and delete this message and any attachments from your system.",
  signOff: "Immigration New Zealand",
};
