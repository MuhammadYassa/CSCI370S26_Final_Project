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
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-blue-600">
          Rental Dispute Resolver
        </h1>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="bg-red-500 text-white px-5 py-2 rounded-xl hover:bg-red-600 font-semibold"
        >
          Logout
        </button>
      </nav>

      <section className="px-6 py-8 flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-900">
            Dashboard
          </h2>

          <p className="text-lg text-gray-500 mt-2">
            Manage your dispute cases
          </p>
        </div>

        <a
          href="/new-case"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-blue-700"
        >
          + New Case
        </a>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-10">
        {cases.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
          >
            <div className="h-36 bg-gradient-to-br from-blue-100 to-sky-200 rounded-xl flex items-center justify-center mb-5">
              <span className="text-5xl">🏘️</span>
            </div>

            <div className="flex justify-between items-start gap-4">
              <h3 className="text-2xl font-extrabold text-gray-900">
                {item.disputeType}
              </h3>

              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                {item.status}
              </span>
            </div>

            <p className="text-xl text-gray-600 mt-4">
              {item.propertyAddress}
            </p>

            <p className="text-lg mt-4">
              <strong>Amount Requested:</strong> ${item.amountRequested}
            </p>

            <p className="text-sm text-gray-500 mt-3">
              Created At: {item.createdAt}
            </p>

            <a
              href={`/cases/${item.id}`}
              className="inline-block mt-6 bg-blue-600 text-white px-5 py-2 rounded-xl text-lg font-semibold hover:bg-blue-700"
            >
              View Case
            </a>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Dashboard;