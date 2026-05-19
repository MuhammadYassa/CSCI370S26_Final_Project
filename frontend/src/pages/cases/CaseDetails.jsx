import { useParams } from "react-router-dom";

function CaseDetails() {
  const { caseId } = useParams();

  const caseData = {
    id: caseId,
    disputeType: "SECURITY_DEPOSIT",
    propertyAddress: "123 Main Street, Queens, NY",
    amountRequested: 1200,
    status: "FORM_READY",

    renterName: "Tasnim Shahrin",
    renterEmail: "tasnimhridi8901@gmail.com",
    renterPhone: "929-639-1408",

    landlordName: "John Smith",
    landlordEmail: "johnsmith@email.com",
    landlordPhone: "718-555-1234",

    description:
      "The landlord refused to return the security deposit after move-out even though the renter states there were no major damages beyond normal wear and tear.",

    evidence: [
      "Lease_Agreement.pdf",
      "Security_Deposit_Receipt.pdf",
      "Move_Out_Photos.jpg",
    ],

    aiResult:
      "Based on the available dispute details and evidence, the renter may have a strong claim if the uploaded documents support that the deposit was paid and the property was returned in good condition.",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-blue-600">
          Rental Dispute Resolver
        </h1>

        <a
          href="/dashboard"
          className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-blue-700"
        >
          Back to Dashboard
        </a>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-3xl p-8 shadow-md mb-6">
          <p className="uppercase tracking-widest font-bold text-sm">
            Case #{caseData.id}
          </p>

          <h1 className="text-4xl font-extrabold mt-3">
            {caseData.disputeType}
          </h1>

          <p className="text-blue-100 mt-3 text-lg">
            {caseData.propertyAddress}
          </p>

          <span className="inline-block bg-white text-blue-700 px-4 py-2 rounded-full font-bold mt-5">
            {caseData.status}
          </span>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-gray-500">Amount Requested</p>
            <h2 className="text-3xl font-extrabold mt-2">
              ${caseData.amountRequested}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-gray-500">Dispute Type</p>
            <h2 className="text-2xl font-extrabold mt-2">
              {caseData.disputeType}
            </h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-gray-500">Current Status</p>
            <h2 className="text-2xl font-extrabold mt-2">
              {caseData.status}
            </h2>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">Renter Information</h2>
            <p>{caseData.renterName}</p>
            <p className="text-gray-600 mt-2">{caseData.renterEmail}</p>
            <p className="text-gray-600 mt-2">{caseData.renterPhone}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold mb-4">Landlord Information</h2>
            <p>{caseData.landlordName}</p>
            <p className="text-gray-600 mt-2">{caseData.landlordEmail}</p>
            <p className="text-gray-600 mt-2">{caseData.landlordPhone}</p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">Dispute Description</h2>
          <p className="text-gray-700 leading-7">{caseData.description}</p>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6 mt-6">
          <h2 className="text-2xl font-bold mb-4">Evidence Uploaded</h2>

          <div className="space-y-3">
            {caseData.evidence.map((file, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-xl px-4 py-3 border"
              >
                📄 {file}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6 mt-6 border-l-8 border-blue-600">
          <p className="uppercase tracking-widest text-blue-600 font-bold text-sm">
            AI Arbitration Result
          </p>

          <h2 className="text-2xl font-extrabold mt-3">
            Recommended Outcome
          </h2>

          <p className="text-gray-700 leading-7 mt-4">{caseData.aiResult}</p>
        </section>
      </main>
    </div>
  );
}

export default CaseDetails;