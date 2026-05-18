function LandlordResponse() {
  const landlordData = {
    caseId: 1,

    landlordName: "Michael Johnson",

    responseStatus: "PENDING_RESPONSE",

    landlordStatement:
      "The security deposit was partially withheld due to property damages.",

    evidenceSummary:
      "Photos of wall damage and unpaid utility bills were submitted.",
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-md mb-8">

        <h1 className="text-4xl font-bold text-blue-600">
          Landlord Response
        </h1>

        <p className="text-gray-500 mt-2">
          Case ID: #{landlordData.caseId}
        </p>

      </div>

      {/* Main Response Card */}
      <div className="bg-white p-8 rounded-2xl shadow-md">

        <div className="space-y-6">

          <p>
            <strong>Landlord Name:</strong>{" "}
            {landlordData.landlordName}
          </p>

          <p>
            <strong>Response Status:</strong>{" "}
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
              {landlordData.responseStatus}
            </span>
          </p>

          <div>
            <strong>Landlord Statement:</strong>

            <p className="mt-2 text-gray-600">
              {landlordData.landlordStatement}
            </p>
          </div>

          <div>
            <strong>Evidence Summary:</strong>

            <p className="mt-2 text-gray-600">
              {landlordData.evidenceSummary}
            </p>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">

          <button className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700">
            Accept Response
          </button>

          <button className="bg-red-600 text-white px-5 py-3 rounded-xl hover:bg-red-700">
            Dispute Response
          </button>

        </div>

      </div>

    </div>
  );
}

export default LandlordResponse;