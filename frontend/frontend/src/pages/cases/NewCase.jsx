import { useState } from "react";

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.renterFullName ||
      !formData.renterEmail ||
      !formData.disputeType
    ) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      console.log(formData);

      alert("Case submitted successfully!");

      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-md">
        
        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          Create New Dispute Case
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Renter Information */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Renter Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                type="text"
                name="renterFullName"
                placeholder="Renter Full Name"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />

              <input
                type="email"
                name="renterEmail"
                placeholder="Renter Email"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />

              <input
                type="text"
                name="renterPhone"
                placeholder="Renter Phone"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />

            </div>
          </div>

          {/* Landlord Information */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Landlord Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                type="text"
                name="landlordFullName"
                placeholder="Landlord Full Name"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />

              <input
                type="email"
                name="landlordEmail"
                placeholder="Landlord Email"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />

              <input
                type="text"
                name="landlordPhone"
                placeholder="Landlord Phone"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />

            </div>
          </div>

          {/* Property Information */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Property Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                type="text"
                name="propertyAddress"
                placeholder="Property Address"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />

              <input
                type="text"
                name="city"
                placeholder="City"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />

              <input
                type="text"
                name="state"
                placeholder="State"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />

              <input
                type="text"
                name="zipCode"
                placeholder="Zip Code"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />

            </div>
          </div>

          {/* Dispute Information */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Dispute Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <select
                name="disputeType"
                value={formData.disputeType}
                className="border p-3 rounded-lg"
                onChange={handleChange}
              >
                <option value="">Select Dispute Type</option>

                <option value="SECURITY_DEPOSIT">
                  Security Deposit
                </option>

                <option value="MAINTENANCE">
                  Maintenance
                </option>

                <option value="LEASE_TERMINATION">
                  Lease Termination
                </option>
              </select>

              {/* SECURITY DEPOSIT */}
              {formData.disputeType === "SECURITY_DEPOSIT" && (
                <div className="space-y-4">

                  <input
                    type="number"
                    name="securityDepositAmount"
                    placeholder="Security Deposit Amount"
                    className="w-full border p-3 rounded-lg"
                    onChange={handleChange}
                  />

                  <textarea
                    name="depositReason"
                    placeholder="Why is the deposit being withheld?"
                    className="w-full border p-3 rounded-lg"
                    rows="4"
                    onChange={handleChange}
                  />

                </div>
              )}

              {/* MAINTENANCE */}
              {formData.disputeType === "MAINTENANCE" && (
                <div className="space-y-4">

                  <input
                    type="text"
                    name="maintenanceIssue"
                    placeholder="Maintenance Issue"
                    className="w-full border p-3 rounded-lg"
                    onChange={handleChange}
                  />

                  <textarea
                    name="maintenanceDetails"
                    placeholder="Describe the maintenance problem..."
                    className="w-full border p-3 rounded-lg"
                    rows="4"
                    onChange={handleChange}
                  />

                </div>
              )}

              {/* LEASE TERMINATION */}
              {formData.disputeType === "LEASE_TERMINATION" && (
                <div className="space-y-4">

                  <input
                    type="date"
                    name="terminationDate"
                    className="w-full border p-3 rounded-lg"
                    onChange={handleChange}
                  />

                  <textarea
                    name="terminationReason"
                    placeholder="Reason for lease termination..."
                    className="w-full border p-3 rounded-lg"
                    rows="4"
                    onChange={handleChange}
                  />

                </div>
              )}

              <input
                type="number"
                name="amountRequested"
                placeholder="Amount Requested"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />

              <input
                type="date"
                name="leaseStartDate"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />

              <input
                type="date"
                name="leaseEndDate"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />

              <input
                type="date"
                name="moveOutDate"
                className="border p-3 rounded-lg"
                onChange={handleChange}
              />

            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Dispute Description
            </h2>

            <textarea
              name="disputeDescription"
              placeholder="Describe your dispute..."
              rows="5"
              className="w-full border p-3 rounded-lg"
              onChange={handleChange}
            />

            <textarea
              name="evidenceDescription"
              placeholder="Describe your evidence..."
              rows="5"
              className="w-full border p-3 rounded-lg mt-4"
              onChange={handleChange}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
          >
            {loading ? "Submitting..." : "Submit Case"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default NewCase;