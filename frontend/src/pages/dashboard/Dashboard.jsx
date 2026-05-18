function Dashboard() {
  const mockCases = [
    {
      caseId: 1,
      disputeType: "SECURITY_DEPOSIT",
      status: "FORM_READY",
      propertyAddress: "123 Main Street, Queens, NY",
      amountRequested: 1200,
      createdAt: "2026-05-16",
    },
    {
      caseId: 2,
      disputeType: "MAINTENANCE",
      status: "INTAKE_SUBMITTED",
      propertyAddress: "45 Hillside Ave, Queens, NY",
      amountRequested: 800,
      createdAt: "2026-05-15",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Navbar */}
      <div className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-blue-600">
          Rental Dispute Resolver
        </h1>

        <button className="bg-red-500 text-white px-4 py-2 rounded-lg">
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="p-8">

        {/* Top Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold text-gray-800">
              Dashboard
            </h2>

            <p className="text-gray-500 mt-2">
              Manage your dispute cases
            </p>
          </div>

          <button className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700">
            + New Case
          </button>
        </div>

        {/* Case Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockCases.map((item) => (
            <div
              key={item.caseId}
              className="bg-white p-6 rounded-2xl shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  {item.disputeType}
                </h3>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  {item.status}
                </span>
              </div>

              <p className="text-gray-600 mb-3">
                {item.propertyAddress}
              </p>

              <p className="mb-2">
                <span className="font-semibold">
                  Amount Requested:
                </span>{" "}
                ${item.amountRequested}
              </p>

              <p className="text-sm text-gray-500">
                Created At: {item.createdAt}
              </p>

              <button className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                View Case
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;