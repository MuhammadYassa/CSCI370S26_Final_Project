import { useState } from "react";
import ErrorCard from "../ErrorCard";
import Button from "../../components/Button";
import { createCase } from "../../api/caseApi";

function NewCase() {
  const [formData, setFormData] = useState({
    renterFullName: "",
    renterEmail: "",
    renterPhone: "",

    landlordFullName: "",
    landlordEmail: "",
    landlordPhone: "",

    propertyAddress: "",
    city: "",
    state: "",
    zipCode: "",

    disputeType: "",

    securityDepositAmount: "",
    amountRequested: "",

    leaseStartDate: "",
    leaseEndDate: "",
    moveOutDate: "",

    disputeDescription: "",
    evidenceDescription: "",

    depositReason: "",
    maintenanceIssue: "",
    maintenanceDetails: "",
    terminationDate: "",
    terminationReason: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.renterFullName ||
      !formData.renterEmail ||
      !formData.disputeType
    ) {
      setError("Please fill all required fields.");
      return;
    }

    setLoading(true);

    try {
      await createCase(formData);

      alert("Case submitted successfully!");
    } catch {
      setError("Failed to create case.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-500 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="uppercase tracking-widest text-sm font-semibold mb-3">
            RentShield AI
          </p>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Create a Rental Dispute Case
          </h1>

          <p className="mt-4 text-blue-100 text-lg max-w-2xl">
            Submit dispute details, upload evidence, and receive AI-assisted
            guidance for your renter protection workflow.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {error && (
          <div className="mb-6">
            <ErrorCard message={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Renter Info */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Renter Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                type="text"
                name="renterFullName"
                placeholder="Renter Full Name"
                className="border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
              />

              <input
                type="email"
                name="renterEmail"
                placeholder="Renter Email"
                className="border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
              />

              <input
                type="text"
                name="renterPhone"
                placeholder="Renter Phone"
                className="border border-gray-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Landlord Info */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Landlord Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                type="text"
                name="landlordFullName"
                placeholder="Landlord Full Name"
                className="border border-gray-200 rounded-xl p-4"
                onChange={handleChange}
              />

              <input
                type="email"
                name="landlordEmail"
                placeholder="Landlord Email"
                className="border border-gray-200 rounded-xl p-4"
                onChange={handleChange}
              />

              <input
                type="text"
                name="landlordPhone"
                placeholder="Landlord Phone"
                className="border border-gray-200 rounded-xl p-4"
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Property */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Property Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input
                type="text"
                name="propertyAddress"
                placeholder="Property Address"
                className="border border-gray-200 rounded-xl p-4"
                onChange={handleChange}
              />

              <input
                type="text"
                name="city"
                placeholder="City"
                className="border border-gray-200 rounded-xl p-4"
                onChange={handleChange}
              />

              <input
                type="text"
                name="state"
                placeholder="State"
                className="border border-gray-200 rounded-xl p-4"
                onChange={handleChange}
              />

              <input
                type="text"
                name="zipCode"
                placeholder="Zip Code"
                className="border border-gray-200 rounded-xl p-4"
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Dispute */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Dispute Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <select
                name="disputeType"
                value={formData.disputeType}
                className="border border-gray-200 rounded-xl p-4"
                onChange={handleChange}
              >
                <option value="">Select Dispute Type</option>
                <option value="SECURITY_DEPOSIT">Security Deposit</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="LEASE_TERMINATION">Lease Termination</option>
              </select>

              <input
                type="number"
                name="amountRequested"
                placeholder="Amount Requested"
                className="border border-gray-200 rounded-xl p-4"
                onChange={handleChange}
              />

            </div>

            <div className="mt-6">
              <textarea
                name="disputeDescription"
                placeholder="Describe your dispute..."
                rows="6"
                className="w-full border border-gray-200 rounded-xl p-4"
                onChange={handleChange}
              />
            </div>
          </section>

          {/* Upload */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Upload Evidence
            </h2>

            <div className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-3xl p-10 text-center">
              <p className="text-gray-700 mb-4 text-lg">
                Drag & drop files or select evidence documents
              </p>

              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="block mx-auto"
              />

              <p className="text-sm text-gray-500 mt-4">
                JPG, PNG, PDF supported
              </p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between"
                  >
                    <span>{file.name}</span>

                    <span className="text-gray-500 text-sm">
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Case"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NewCase;