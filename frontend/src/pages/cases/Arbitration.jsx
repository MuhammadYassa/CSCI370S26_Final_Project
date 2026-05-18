function Arbitration() {
  const arbitrationData = {
    caseId: 1,

    renterName: "John Smith",

    landlordName: "Michael Johnson",

    disputeType: "SECURITY_DEPOSIT",

    amountRequested: 1200,

    status: "UNDER_REVIEW",

    resolutionNotes:
      "The arbitration process is currently reviewing submitted evidence and lease documentation.",
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-md mb-8">

        <h1 className="text-4xl font-bold text-blue-600">
          Arbitration Center
        </h1>

        <p className="text-gray-500 mt-2">
          Case ID: #{arbitrationData.caseId}
        </p>

      </div>

      {/* Arbitration Card */}
      <div className="bg-white p-8 rounded-2xl shadow-md">

        <div className="space-y-5">

          <p>
            <strong>Renter:</strong>{" "}
            {arbitrationData.renterName}
          </p>

          <p>
            <strong>Landlord:</strong>{" "}
            {arbitrationData.landlordName}
          </p>

          <p>
            <strong>Dispute Type:</strong>{" "}
            {arbitrationData.disputeType}
          </p>

          <p>
            <strong>Amount Requested:</strong> $
            {arbitrationData.amountRequested}
          </p>

          <p>
            <strong>Arbitration Status:</strong>{" "}
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">
              {arbitrationData.status}
            </span>
          </p>

          <div>
            <strong>Resolution Notes:</strong>

            <p className="mt-2 text-gray-600">
              {arbitrationData.resolutionNotes}
            </p>
          </div>

        </div>

        {/* Decision Buttons */}
        <div className="mt-8 flex gap-4">

          <button className="bg-green-600 text-white px-5 py-3 rounded-xl hover:bg-green-700">
            Approve Claim
          </button>

          <button className="bg-red-600 text-white px-5 py-3 rounded-xl hover:bg-red-700">
            Reject Claim
          </button>

        </div>

      </div>

    </div>
  );
}

export default Arbitration;