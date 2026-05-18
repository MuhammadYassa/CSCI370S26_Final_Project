function FormPage() {
  const generatedForm = {
    caseId: 1,

    renterFullName: "John Smith",
    renterEmail: "johnsmith@gmail.com",

    landlordFullName: "Michael Johnson",

    propertyAddress: "123 Main Street, Queens, NY",

    disputeType: "SECURITY_DEPOSIT",

    amountRequested: 1200,

    disputeDescription:
      "The landlord refused to return the security deposit after move-out.",
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-md mb-8 flex justify-between items-center">

        <div>
          <h1 className="text-4xl font-bold text-blue-600">
            Generated Form Preview
          </h1>

          <p className="text-gray-500 mt-2">
            Case ID: #{generatedForm.caseId}
          </p>
        </div>

        <button className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700">
          Download PDF
        </button>

      </div>

      {/* Form Preview */}
      <div className="bg-white p-8 rounded-2xl shadow-md">

        <h2 className="text-3xl font-bold mb-6">
          Rental Dispute Complaint Form
        </h2>

        <div className="space-y-4 text-gray-700">

          <p>
            <strong>Renter Name:</strong>{" "}
            {generatedForm.renterFullName}
          </p>

          <p>
            <strong>Renter Email:</strong>{" "}
            {generatedForm.renterEmail}
          </p>

          <p>
            <strong>Landlord Name:</strong>{" "}
            {generatedForm.landlordFullName}
          </p>

          <p>
            <strong>Property Address:</strong>{" "}
            {generatedForm.propertyAddress}
          </p>

          <p>
            <strong>Dispute Type:</strong>{" "}
            {generatedForm.disputeType}
          </p>

          <p>
            <strong>Amount Requested:</strong> $
            {generatedForm.amountRequested}
          </p>

          <div>
            <strong>Dispute Description:</strong>

            <p className="mt-2 text-gray-600">
              {generatedForm.disputeDescription}
            </p>
          </div>

        </div>

      </div>

      {/* Missing Fields Warning */}
      <div className="bg-yellow-100 border border-yellow-300 p-5 rounded-2xl mt-6">

        <h3 className="text-xl font-bold text-yellow-800 mb-2">
          Missing Fields Warning
        </h3>

        <p className="text-yellow-700">
          Please verify all renter and dispute details before final submission.
        </p>

      </div>

    </div>
  );
}

export default FormPage;