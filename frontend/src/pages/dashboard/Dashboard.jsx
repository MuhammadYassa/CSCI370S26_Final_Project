import { useEffect, useState } from "react";

import { getCases } from "../../api/caseApi";

import Layout from "../../components/Layout";
import Button from "../../components/Button";
import Card from "../../components/Card";

function Dashboard() {

  const [cases, setCases] = useState([]);

  // Load Cases
  useEffect(() => {

    async function loadCases() {

      const data = await getCases();

      setCases(data);
    }

    loadCases();

  }, []);

  return (
    <Layout>

      {/* Top Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8">

        <div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Dashboard
          </h2>

          <p className="text-gray-500 mt-2 text-sm md:text-base">
            Manage your dispute cases
          </p>

        </div>

        <Button href="/new-case">
          Create New Case
        </Button>

      </div>

      {/* Case Section */}
      {cases.length === 0 ? (

        <Card className="p-6 md:p-10 text-center">

          <h2 className="text-2xl font-bold text-gray-700 mb-3">
            No Cases Found
          </h2>

          <p className="text-gray-500 mb-6">
            Create your first dispute case to begin.
          </p>

          <Button href="/new-case">
            Create New Case
          </Button>

        </Card>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {cases.map((item) => (

            <Card
              key={item.caseId}
              className="hover:shadow-lg transition"
            >

              <div className="flex justify-between items-start mb-5 gap-4">

                <h3 className="text-xl md:text-2xl font-bold text-gray-800 break-words">
                  {item.disputeType}
                </h3>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs md:text-sm whitespace-nowrap">
                  {item.status}
                </span>

              </div>

              <p className="text-gray-600 mb-4 text-sm md:text-base">
                {item.propertyAddress}
              </p>

              <p className="mb-3 text-sm md:text-base">

                <span className="font-semibold">
                  Amount Requested:
                </span>{" "}

                ${item.amountRequested}

              </p>

              <p className="text-sm text-gray-500">
                Created At: {item.createdAt}
              </p>

              <div className="mt-6">

                <Button href={`/cases/${item.caseId}`}>
                  View Case
                </Button>

              </div>

            </Card>

          ))}

        </div>

      )}

    </Layout>
  );
}

export default Dashboard;