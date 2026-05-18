import { Link, useLocation } from "react-router-dom";

import Button from "./Button";

function Navbar() {

  const location = useLocation();

  const navLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
    },

    {
      name: "New Case",
      path: "/new-case",
    },
  ];

  return (
    <div className="bg-white shadow-md px-4 md:px-8 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">

      {/* Logo */}
      <Link
        to="/dashboard"
        className="text-2xl md:text-3xl font-bold text-blue-600"
      >
        Rental Dispute Resolver
      </Link>

      {/* Navigation */}
      <div className="flex flex-wrap items-center gap-4">

        {navLinks.map((link) => (

          <Link
            key={link.path}
            to={link.path}
            className={`font-medium transition ${
              location.pathname === link.path
                ? "text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            {link.name}
          </Link>

        ))}

        {/* Logout */}
        <Button
          variant="danger"
          onClick={() => {

            localStorage.removeItem("token");

            window.location.href = "/login";
          }}
        >
          Logout
        </Button>

      </div>

    </div>
  );
}

export default Navbar;