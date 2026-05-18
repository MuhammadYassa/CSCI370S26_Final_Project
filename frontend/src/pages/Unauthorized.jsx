function Unauthorized() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">

      <div className="bg-white p-10 rounded-2xl shadow-md text-center">

        <h1 className="text-4xl font-bold text-red-600 mb-4">
          Unauthorized
        </h1>

        <p className="text-gray-600 mb-6">
          You must log in to access this page.
        </p>

        <a
          href="/login"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
        >
          Go To Login
        </a>

      </div>

    </div>
  );
}

export default Unauthorized;