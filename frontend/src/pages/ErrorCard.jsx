function ErrorCard({
  message = "Something went wrong."
}) {
  return (
    <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-xl">

      {message}

    </div>
  );
}

export default ErrorCard;