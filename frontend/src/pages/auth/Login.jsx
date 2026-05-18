import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../api/apiFetch";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      localStorage.setItem("token", data.token);

      navigate("/dashboard");
    } catch (error) {
      alert(error?.error?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg"
          >
            Login
          </button>
          <p className="text-center mt-4">
            Don't have an account?{" "}
            <a href="/register" className="text-blue-600 font-semibold">
              Register
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;