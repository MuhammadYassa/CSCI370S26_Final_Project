function ErrorPage({
  title = "Something Went Wrong",
  message = "An unexpected error occurred.",
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">

      <div className="bg-white p-10 rounded-2xl shadow-md text-center max-w-lg">

        <h1 className="text-4xl font-bold text-red-600 mb-4">
          {title}
        </h1>

        <p className="text-gray-600 mb-8">
          {message}
        </p>

        <a
          href="/dashboard"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
        >
          Return Dashboard
        </a>

      </div>

    </div>
  );
}

export default ErrorPage;