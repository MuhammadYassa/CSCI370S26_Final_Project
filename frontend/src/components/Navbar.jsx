import Button from "./Button";

function Navbar() {
  return (
    <div className="bg-white shadow-md px-8 py-4 flex justify-between items-center">

      <h1 className="text-3xl font-bold text-blue-600">
        Rental Dispute Resolver
      </h1>

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
  );
}

export default Navbar;