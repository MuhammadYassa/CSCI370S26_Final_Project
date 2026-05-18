import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getCaseById } from "../../api/caseApi";

import Layout from "../../components/Layout";
import Button from "../../components/Button";
import Card from "../../components/Card";

function CaseDetails() {

  const [caseData, setCaseData] = useState(null);

  const { caseId } = useParams();

  // Load Case
  useEffect(() => {

    async function loadCase() {

      const data = await getCaseById(caseId);

      // TEMP MOCK FALLBACK
      setCaseData(
        data || {
          caseId: 1,

          renterFullName: "John Smith",
          renterEmail: "johnsmith@gmail.com",
          renterPhone: "(917) 555-1234",

          landlordFullName: "Michael Johnson",
          landlordEmail: "landlord@gmail.com",
          landlordPhone: "(718) 555-7788",

          propertyAddress: "123 Main Street, Queens, NY",

          disputeType: "SECURITY_DEPOSIT",

          status: "FORM_READY",

          amountRequested: 1200,

          disputeDescription:
            "The landlord refused to return the security deposit after move-out.",

          evidenceDescription:
            "Move-out photos and payment receipts available.",
        }
      );
    }

    loadCase();

  }, [caseId]);

  // Activity Timeline
  const activityTimeline = [
    {
      id: 1,
      title: "Case Submitted",
      description: "Renter submitted dispute intake form.",
      date: "2026-05-15",
    },

    {
      id: 2,
      title: "Evidence Uploaded",
      description: "Evidence documents were uploaded.",
      date: "2026-05-16",
    },

    {
      id: 3,
      title: "Form Generated",
      description: "AI generated arbitration form successfully.",
      date: "2026-05-17",
    },

    {
      id: 4,
      title: "Arbitration Started",
      description: "Case entered arbitration review stage.",
      date: "2026-05-18",
    },
  ];

  // Loading State
  if (!caseData) {
    return (
      <Layout>

        <Card>

          <h1 className="text-2xl font-bold">
            Loading Case...
          </h1>

        </Card>

      </Layout>
    );
  }

  return (
    <Layout>

      {/* Top Header */}
      <Card className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">

        <div>

          <h1 className="text-3xl md:text-4xl font-bold text-blue-600">
            Case Details
          </h1>

          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Case ID: #{caseData.caseId}
          </p>

        </div>

        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full w-fit">
          {caseData.status}
        </span>

      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Renter Information */}
        <Card>

          <h2 className="text-2xl font-bold mb-4">
            Renter Information
          </h2>

          <div className="space-y-2 text-sm md:text-base">

            <p>
              <strong>Name:</strong> {caseData.renterFullName}
            </p>

            <p>
              <strong>Email:</strong> {caseData.renterEmail}
            </p>

            <p>
              <strong>Phone:</strong> {caseData.renterPhone}
            </p>

          </div>

        </Card>

        {/* Landlord Information */}
        <Card>

          <h2 className="text-2xl font-bold mb-4">
            Landlord Information
          </h2>

          <div className="space-y-2 text-sm md:text-base">

            <p>
              <strong>Name:</strong> {caseData.landlordFullName}
            </p>

            <p>
              <strong>Email:</strong> {caseData.landlordEmail}
            </p>

            <p>
              <strong>Phone:</strong> {caseData.landlordPhone}
            </p>

          </div>

        </Card>

        {/* Property Information */}
        <Card>

          <h2 className="text-2xl font-bold mb-4">
            Property Information
          </h2>

          <p className="text-sm md:text-base">
            {caseData.propertyAddress}
          </p>

        </Card>

        {/* Dispute Information */}
        <Card>

          <h2 className="text-2xl font-bold mb-4">
            Dispute Information
          </h2>

          <div className="space-y-2 text-sm md:text-base">

            <p>
              <strong>Dispute Type:</strong>{" "}
              {caseData.disputeType}
            </p>

            <p>
              <strong>Amount Requested:</strong>{" "}
              ${caseData.amountRequested}
            </p>

          </div>

        </Card>

      </div>

      {/* Description Section */}
      <Card className="mt-6">

        <h2 className="text-2xl font-bold mb-4">
          Dispute Description
        </h2>

        <p className="text-gray-700 mb-6 text-sm md:text-base">
          {caseData.disputeDescription}
        </p>

        <h2 className="text-2xl font-bold mb-4">
          Evidence Description
        </h2>

        <p className="text-gray-700 text-sm md:text-base">
          {caseData.evidenceDescription}
        </p>

      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mt-8">

        <Button href={`/cases/${caseData.caseId}/form`}>
          Generate Form
        </Button>

        <Button
          href={`/cases/${caseData.caseId}/arbitration`}
          variant="secondary"
        >
          View Arbitration
        </Button>

        <Button
          href={`/cases/${caseData.caseId}/landlord-response`}
          variant="success"
        >
          View Landlord Response
        </Button>

      </div>

      {/* Activity Timeline */}
      <Card className="mt-8">

        <h2 className="text-2xl md:text-3xl font-bold mb-6">
          Activity Timeline
        </h2>

        <div className="space-y-6">

          {activityTimeline.map((activity) => (

            <div
              key={activity.id}
              className="border-l-4 border-blue-600 pl-5"
            >

              <h3 className="text-lg font-semibold text-gray-800">
                {activity.title}
              </h3>

              <p className="text-gray-600 text-sm mt-1">
                {activity.description}
              </p>

              <p className="text-sm text-gray-500 mt-2">
                {activity.date}
              </p>

            </div>

          ))}

        </div>

      </Card>

    </Layout>
  );
}

export default CaseDetails;