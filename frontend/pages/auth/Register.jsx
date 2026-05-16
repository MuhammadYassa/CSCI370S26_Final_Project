import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/apiFetch";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "RENTER",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      alert("Account created successfully!");
      navigate("/login");
    } catch (error) {
      alert(error?.error?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Register
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            className="w-full border p-3 rounded-lg"
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border p-3 rounded-lg"
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border p-3 rounded-lg"
            onChange={handleChange}
          />

          <select
            name="role"
            className="w-full border p-3 rounded-lg"
            onChange={handleChange}
          >
            <option value="RENTER">Renter</option>
            <option value="LANDLORD">Landlord</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;