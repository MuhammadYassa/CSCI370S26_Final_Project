import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCaseById } from "../../api/caseApi";

function CaseDetails() {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCase() {
      try {
        const data = await getCaseById(caseId);
        setCaseData(data);
      } catch (err) {
        console.error("Failed to load case:", err);
        setError("Failed to load case details.");
      }
    }

    loadCase();
  }, [caseId]);

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-red-700">{error}</h2>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-2xl shadow p-8">
          <h2 className="text-2xl font-bold">Loading Case...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow p-8">
        <p className="text-blue-600 font-semibold mb-2">Case Details</p>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
          {caseData.disputeType || "Rental Dispute"}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-2xl p-5">
            <h2 className="text-xl font-bold mb-3">Property</h2>
            <p>{caseData.propertyAddress}</p>
            <p>{caseData.city}, {caseData.state} {caseData.zipCode}</p>
          </div>

          <div className="border rounded-2xl p-5">
            <h2 className="text-xl font-bold mb-3">Claim</h2>
            <p><strong>Status:</strong> {caseData.status}</p>
            <p><strong>Amount Requested:</strong> ${caseData.amountRequested}</p>
          </div>

          <div className="border rounded-2xl p-5">
            <h2 className="text-xl font-bold mb-3">Renter</h2>
            <p>{caseData.renterFullName}</p>
            <p>{caseData.renterEmail}</p>
          </div>

          <div className="border rounded-2xl p-5">
            <h2 className="text-xl font-bold mb-3">Landlord</h2>
            <p>{caseData.landlordFullName}</p>
            <p>{caseData.landlordEmail}</p>
          </div>
        </div>

        <div className="mt-8 border rounded-2xl p-5">
          <h2 className="text-xl font-bold mb-3">Dispute Description</h2>
          <p className="text-gray-700">
            {caseData.disputeDescription || "No description available."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CaseDetails;