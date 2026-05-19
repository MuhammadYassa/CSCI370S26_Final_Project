import { useEffect, useState } from "react";

function Dashboard() {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    const sampleCases = [
      {
        id: 1,
        disputeType: "SECURITY_DEPOSIT",
        propertyAddress: "123 Main Street, Queens, NY",
        amountRequested: 1200,
        status: "FORM_READY",
        createdAt: "2026-05-16",
      },
      {
        id: 2,
        disputeType: "MAINTENANCE",
        propertyAddress: "45 Hillside Ave, Queens, NY",
        amountRequested: 800,
        status: "INTAKE_SUBMITTED",
        createdAt: "2026-05-15",
      },
    ];

    setCases(sampleCases);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-5 flex justify-between items-center">
        <h1 className="text-4xl font-bold text-blue-600">
          Rental Dispute Resolver
        </h1>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="bg-red-500 text-white px-6 py-3 rounded-2xl hover:bg-red-600"
        >
          Logout
        </button>
      </nav>

      {/* Header */}
      <div className="px-6 py-10 flex justify-between items-center">
        <div>
          <h2 className="text-6xl font-extrabold text-gray-800">
            Dashboard
          </h2>

          <p className="text-2xl text-gray-500 mt-3">
            Manage your dispute cases
          </p>
        </div>

        <a
          href="/new-case"
          className="bg-blue-600 text-white px-10 py-5 rounded-3xl text-2xl hover:bg-blue-700"
        >
          + New Case
        </a>
      </div>

      {/* Case Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6">

        {cases.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl shadow-md p-8 hover:shadow-xl transition"
          >

            <div className="flex justify-between items-start">
              <h3 className="text-5xl font-extrabold text-gray-900">
                {item.disputeType}
              </h3>

              <span className="bg-green-100 text-green-700 px-5 py-2 rounded-full text-xl">
                {item.status}
              </span>
            </div>

            <p className="text-3xl text-gray-600 mt-8">
              {item.propertyAddress}
            </p>

            <p className="text-2xl mt-8">
              <strong>Amount Requested:</strong> $
              {item.amountRequested}
            </p>

            <p className="text-xl text-gray-500 mt-5">
              Created At: {item.createdAt}
            </p>

            <a
              href={`/cases/${item.id}`}
              className="inline-block mt-8 bg-blue-600 text-white px-8 py-4 rounded-2xl text-2xl hover:bg-blue-700"
            >
              View Case
            </a>

          </div>
        ))}

      </div>

    </div>
  );
}

export default Dashboard;