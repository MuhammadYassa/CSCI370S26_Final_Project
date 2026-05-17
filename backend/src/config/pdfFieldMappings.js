const PDF_FIELD_MAPPINGS = {
  NY_OAG_RENT_SECURITY_COMPLAINT: {
    acroTextFields: {
      'YOUR NAME': ['renterFullName'],
      'ADDRESS CURRENT': ['currentStreetAddress', 'currentAddress', 'claimantAddress', 'propertyAddress'],
      City: ['claimantCity', 'city'],
      State: ['claimantState', 'state'],
      'Zip Code': ['claimantZipCode', 'zipCode'],
      HOME: ['renterPhone'],
      Text3: ['currentApartmentNumber'],
      'Street No': ['propertyAddress'],
      City_2: ['city'],
      State_2: ['state'],
      'Zip Code_2': ['zipCode'],
      'INVOLVED IN THIS COMPLAINT': ['landlordFullName'],
      Text9: ['landlordStreetAddress'],
      Text10: ['landlordCity'],
      Text11: ['landlordState'],
      Text12: ['landlordZipCode'],
      Text13: ['landlordPhone'],
      'S NAME': ['managingAgentName'],
      Text15: ['managingAgentStreetAddress'],
      Text16: ['managingAgentCity'],
      Text17: ['managingAgentState'],
      Text20: ['managingAgentZipCode'],
      Text21: ['managingAgentPhone'],
      'APPROXIMATE NUMBER OF APARTMENTS IN BUILDING': ['numberOfApartmentsInBuilding'],
      'a  AMOUNT OF SECURITY DEPOSIT AND DATE PAID': ['securityDepositAmountDisplay'],
      Date: ['securityDepositDatePaid'],
      'b  MOST RECENT MONTHLY RENT': ['mostRecentMonthlyRent'],
      'a  DATE YOU MOVED INTO APARTMENT': ['moveInDate', 'leaseStartDate'],
      'b  DATE YOU MOVED OUT OF APARTMENT if applicable': ['moveOutDate'],
      'c  TERM OF FIRST LEASE': ['leaseStartDate'],
      to: ['leaseEndDate'],
      'Date you complained to the landlord': ['dateComplainedToLandlord'],
      'Person contacted': ['personContacted'],
      Text36: ['contactMethodOtherText'],
      'Has there been any other litigation concerning your apartment?  If so, briefly summarize the issues 1': [
        'otherLitigationDescription'
      ],
      'Indicate the amount of interest, if any, you have received on your security deposit and the period involved 1': [
        'securityDepositInterestReceived'
      ],
      'SPACE FOR ADDITIONAL INFORMATION, ANSWERS OR COMMENTS 1': ['additionalInformation'],
      'SPACE FOR ADDITIONAL INFORMATION, ANSWERS OR COMMENTS 2': ['disputeDescription'],
      'SPACE FOR ADDITIONAL INFORMATION, ANSWERS OR COMMENTS 3': ['evidenceSummary'],
      DATE: ['generatedDate']
    },
    acroCheckBoxes: {
      'Check Box22': ['oagConcernDepositNotReturned'],
      'Check Box23': ['oagConcernTrustAccount'],
      'Check Box24': ['oagConcernInterest'],
      'Check Box33': ['contactMethodByPhone'],
      'Check Box32': ['contactMethodLetter'],
      'Check Box34': ['contactMethodInPerson'],
      'Check Box37': ['priorCourtProceedingsYes'],
      'Check Box38': ['priorCourtProceedingsNo']
    },
    overlayFields: []
  },
  NYC_SMALL_CLAIMS_SECURITY_DEPOSIT_CIV_SC_50: {
    sanitizeAcroForm: true,
    acroTextFields: {
      FillText2: ['claimantLastNameOrFullName'],
      FillText3: ['claimantFirstName'],
      FillText4: ['claimantMiddleInitial'],
      FillText5: ['claimantAddress', 'currentAddress', 'propertyAddress'],
      FillText6: ['claimantCity', 'city'],
      FillText7: ['claimantState', 'state'],
      FillText8: ['claimantZipCode', 'zipCode'],
      FillText9: ['claimantOtherInfo'],
      Claimant_Phone_No: ['renterPhone'],
      Claimant_EMAIL: ['renterEmail'],
      DEFENDANTS_LAST_NAME: ['defendantDisplayName'],
      DEFENDANTS_FIRST_NAME: ['defendantFirstName'],
      DEFENDANTS_MIDDLE_INITIAL: ['defendantMiddleInitial'],
      DEFENDANTS_ADDRESS: ['defendantAddress', 'landlordAddress'],
      DEFENDANTS_BOROUGH_CITY: ['defendantCity'],
      DEFENDANTS_ZIP: ['defendantZipCode'],
      DEFENDANTS_OTHER_INFO: ['defendantOtherInfo'],
      Defendants_Phone_No: ['landlordPhone'],
      Defendants_Email: ['landlordEmail'],
      Amount_Claimed: ['amountRequestedPlain'],
      Date_of_Occurrence_or_Transaction: ['dateOfOccurrenceUs', 'moveOutDateUs'],
      Place_of_occurrence_if_Auto_Accident: ['propertyAddress'],
      FillText10: ['smallClaimsBriefReason'],
      IDENTIFYING_NUMBERS: ['identifyingNumbers'],
      TODAYS_DATE: ['generatedDateUs']
    },
    acroCheckBoxes: {
      deposit: ['isSecurityDepositClaim']
    },
    overlayFields: []
  },
  NYC_HP_ACTION_REPAIRS_PACKET: {
    acroTextFields: {},
    acroCheckBoxes: {},
    overlayFields: [
      { type: 'text', pageIndex: 0, x: 54, y: 693, fontSize: 11, maxWidth: 90, keys: ['courtNameShort'] },
      { type: 'text', pageIndex: 0, x: 100, y: 673, fontSize: 11, maxWidth: 110, keys: ['countyName'] },
      { type: 'text', pageIndex: 0, x: 118, y: 648, fontSize: 8.5, maxWidth: 150, keys: ['renterFullName'] },
      { type: 'text', pageIndex: 0, x: 118, y: 584, fontSize: 8.5, maxWidth: 150, keys: ['respondentName', 'landlordFullName'] },
      { type: 'text', pageIndex: 0, x: 145, y: 364, fontSize: 10, maxWidth: 420, keys: ['propertyAddress'] },
      { type: 'checkbox', pageIndex: 0, x: 129, y: 346, size: 12, inset: 4, thickness: 1.2, keys: ['isPropertyTypeSingleFamily'] },
      { type: 'checkbox', pageIndex: 0, x: 270, y: 346, size: 12, inset: 4, thickness: 1.2, keys: ['isPropertyTypeMultiFamily'] },
      { type: 'checkbox', pageIndex: 0, x: 428, y: 346, size: 12, inset: 4, thickness: 1.2, keys: ['isPropertyTypeApartmentBuilding'] },
      { type: 'text', pageIndex: 0, x: 44, y: 253, fontSize: 9, maxWidth: 120, keys: ['renterFullName'] },
      { type: 'text', pageIndex: 0, x: 172, y: 252, fontSize: 9, maxWidth: 205, keys: ['currentAddress', 'propertyAddress'] },
      { type: 'text', pageIndex: 0, x: 390, y: 254, fontSize: 9, maxWidth: 88, keys: ['renterPhone'] },
      { type: 'text', pageIndex: 0, x: 499, y: 252, fontSize: 9, maxWidth: 74, keys: ['moveInDateUs', 'leaseStartDateUs'] },
      { type: 'checkbox', pageIndex: 0, x: 392, y: 227, size: 11, inset: 4, thickness: 1.2, keys: ['hasRelatedCase'] },
      { type: 'checkbox', pageIndex: 0, x: 436, y: 227, size: 11, inset: 4, thickness: 1.2, keys: ['hasNoRelatedCase'] },
      { type: 'text', pageIndex: 0, x: 140, y: 207, fontSize: 9, maxWidth: 160, keys: ['relatedCaseIndexNumber'] },
      { type: 'text', pageIndex: 0, x: 394, y: 207, fontSize: 9, maxWidth: 115, keys: ['relatedCaseNextCourtDateUs'] },
      { type: 'text', pageIndex: 1, x: 96, y: 341, fontSize: 9.5, maxWidth: 466, keys: ['respondentName', 'landlordFullName'] },
      { type: 'text', pageIndex: 1, x: 84, y: 319, fontSize: 9.25, maxWidth: 438, keys: ['respondentAddress', 'landlordAddress', 'defendantAddress'] },
      { type: 'checkbox', pageIndex: 1, x: 61, y: 268, size: 12, inset: 4, thickness: 1.2, keys: ['respondentBusinessAddress'] },
      { type: 'checkbox', pageIndex: 1, x: 61, y: 231, size: 12, inset: 4, thickness: 1.2, keys: ['respondentRoleOwner'] },
      { type: 'checkbox', pageIndex: 1, x: 67, y: 29, size: 12, inset: 4, thickness: 1.2, keys: ['respondentRoleAgent'] },
      { type: 'checkbox', pageIndex: 1, x: 67, y: 7, size: 12, inset: 4, thickness: 1.2, keys: ['respondentRoleOther'] },
      { type: 'text', pageIndex: 2, x: 222, y: 719, fontSize: 11, maxWidth: 90, keys: ['monthlyRentPlain'] },
      {
        type: 'text',
        pageIndex: 2,
        x: 36,
        y: 628,
        fontSize: 11,
        maxWidth: 515,
        lineHeight: 14,
        maxLines: 22,
        keys: ['shortRepairConditions', 'repairConditionsSummary']
      },
      { type: 'checkbox', pageIndex: 3, x: 52, y: 718, size: 12, inset: 4, thickness: 1.2, keys: ['shouldOrderRepairs'] },
      { type: 'text', pageIndex: 3, x: 108, y: 312, fontSize: 11, maxWidth: 110, keys: ['countyName'] },
      { type: 'text', pageIndex: 3, x: 22, y: 281, fontSize: 11, maxWidth: 210, keys: ['renterFullName'] }
    ]
  }
};

module.exports = {
  PDF_FIELD_MAPPINGS
};
