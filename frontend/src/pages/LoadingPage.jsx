function LoadingPage({
  message = "Loading data..."
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">

      <div className="bg-white p-10 rounded-2xl shadow-md text-center">

        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>

        <h1 className="text-2xl font-bold text-gray-800">
          {message}
        </h1>

      </div>

    </div>
  );
}

export default LoadingPage;