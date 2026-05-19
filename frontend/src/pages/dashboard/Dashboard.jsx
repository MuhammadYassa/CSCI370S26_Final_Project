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
        console.log("Case ID:", caseId);

        const data = await getCaseById(caseId);

        setCaseData(data.case || data.data || data);
      } catch (err) {
        console.error("Failed to load case:", err);
        setError("Unable to load case details.");
      }
    }

    if (caseId) {
      loadCase();
    }
  }, [caseId]);

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-300 rounded-xl p-6">
          <h1 className="text-3xl font-bold text-red-700">
            Unable to load case details.
          </h1>

          <p className="text-red-600 mt-2">
            Please check the backend case details API.
          </p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold">
          Loading Case...
        </h1>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold mb-6">
          Case #{caseId}
        </h1>

        <div className="space-y-4">
          <p>
            <strong>Dispute Type:</strong>{" "}
            {caseData.disputeType || "N/A"}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {caseData.status || "Open"}
          </p>

          <p>
            <strong>Property Address:</strong>{" "}
            {caseData.propertyAddress || "N/A"}
          </p>

          <p>
            <strong>Description:</strong>{" "}
            {caseData.disputeDescription || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CaseDetails;