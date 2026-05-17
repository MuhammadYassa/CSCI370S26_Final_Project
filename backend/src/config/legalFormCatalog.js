const path = require('path');

const LEGAL_FORM_CATALOG = {
  NY_OAG_RENT_SECURITY_COMPLAINT: {
    filingPath: 'NY_OAG_RENT_SECURITY_COMPLAINT',
    formType: 'NY_OAG_RENT_SECURITY_COMPLAINT',
    formName: 'New York State Attorney General Rent Security Complaint Form',
    filingDestination: 'New York State Attorney General',
    templatePath: path.resolve(
      __dirname,
      '..',
      '..',
      'templates',
      'legal-forms',
      'ny',
      'oag-rent-security-complaint.pdf'
    ),
    generatedFileSlug: 'ny-oag-rent-security-complaint',
    officialSourceName: 'New York State Attorney General Rent Security Complaint Form',
    officialSourceUrl:
      'https://ag.ny.gov/sites/default/files/nyc-rent-security-complaint-english.pdf',
    filingInstructions: [
      'Review the generated PDF carefully.',
      'Print the completed form.',
      'Follow the New York State Attorney General filing instructions for submission.',
      'Keep copies of your lease, receipts, messages, and supporting evidence.'
    ]
  },
  NYC_SMALL_CLAIMS_SECURITY_DEPOSIT_CIV_SC_50: {
    filingPath: 'NYC_SMALL_CLAIMS_SECURITY_DEPOSIT_CIV_SC_50',
    formType: 'NYC_SMALL_CLAIMS_SECURITY_DEPOSIT_CIV_SC_50',
    formName: 'Statement of Claim (Small Claims), CIV-SC-50',
    filingDestination: 'NYC Civil Court Small Claims',
    templatePath: path.resolve(
      __dirname,
      '..',
      '..',
      'templates',
      'legal-forms',
      'ny',
      'nyc-small-claims-civ-sc-50.pdf'
    ),
    generatedFileSlug: 'nyc-small-claims-civ-sc-50',
    officialSourceName: 'New York Courts Statement of Claim (Small Claims), CIV-SC-50',
    officialSourceUrl:
      'https://www.nycourts.gov/legacyPDFs/courts/nyc/civil/forms/CIV-SC-50.pdf',
    filingInstructions: [
      'Review the generated PDF carefully.',
      'Print the completed form.',
      'Bring or submit the completed form according to the court clerk instructions.',
      'Bring copies of your lease, deposit receipt, photos, messages, and repair or damage records.'
    ]
  },
  NYC_HP_ACTION_REPAIRS_PACKET: {
    filingPath: 'NYC_HP_ACTION_REPAIRS_PACKET',
    formType: 'NYC_HP_ACTION_REPAIRS_PACKET',
    formName: 'Petition for Judgment Directing Repairs, UCS-LT12B',
    filingDestination: 'NYC Housing Court HP Clerk',
    templatePath: path.resolve(
      __dirname,
      '..',
      '..',
      'templates',
      'legal-forms',
      'ny',
      'ucs-lt12b-repairs-petition.pdf'
    ),
    generatedFileSlug: 'nyc-hp-action-repairs-packet',
    officialSourceName: 'New York Courts Petition for Judgment Directing Repairs, UCS-LT12B',
    officialSourceUrl:
      'https://www.nycourts.gov/LegacyPDFS/FORMS/landlordtenant/%5BUCS-LT12B%5DPetitionArt7DRepairs.pdf',
    filingInstructions: [
      'Review the generated PDF carefully.',
      'Print the completed packet.',
      'Bring the completed packet to the appropriate Housing Court clerk for filing instructions.',
      'Bring photos, inspection reports, repair notices, and any essential service records.'
    ]
  },
  UNSUPPORTED_FORM_TYPE: {
    filingPath: 'UNSUPPORTED_FORM_TYPE',
    formType: 'UNSUPPORTED_FORM_TYPE',
    formName: null,
    filingDestination: null,
    templatePath: null,
    generatedFileSlug: null,
    officialSourceName: null,
    officialSourceUrl: null,
    filingInstructions: []
  }
};

const SECURITY_DEPOSIT_ISSUE_TYPES = [
  'INTEREST_NOT_PAID',
  'TRUST_ACCOUNT_NOT_DISCLOSED',
  'DEPOSIT_NOT_RETURNED_GENERAL',
  'DEPOSIT_NOT_RETURNED_NO_DAMAGE_DISPUTE',
  'WITHHELD_FOR_DAMAGE',
  'WITHHELD_FOR_UNPAID_RENT',
  'SEEKING_MONEY_JUDGMENT'
];

const NYC_BOROUGHS = [
  'MANHATTAN',
  'BROOKLYN',
  'QUEENS',
  'BRONX',
  'STATEN_ISLAND'
];

module.exports = {
  LEGAL_FORM_CATALOG,
  SECURITY_DEPOSIT_ISSUE_TYPES,
  NYC_BOROUGHS
};
