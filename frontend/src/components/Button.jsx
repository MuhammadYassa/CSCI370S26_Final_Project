import { Link } from "react-router-dom";

function Button({
  children,
  href,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
}) {

  const baseStyles =
    "inline-block px-5 py-3 rounded-xl transition font-medium";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700",

    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300",

    danger:
      "bg-red-500 text-white hover:bg-red-600",

    success:
      "bg-green-600 text-white hover:bg-green-700",
  };

  if (href) {
    return (
      <Link
        to={href}
        className={`${baseStyles} ${variants[variant]}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`${baseStyles} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

export default Button;