import logoImage from "../assets/logo.jpg";

export default function Logo({ className = "h-16", variant = "default" }) {
  if (variant === "white-bg") {
    return (
      <div className="bg-white p-2 rounded-xl shadow-md inline-block">
        <img
          src={logoImage}
          alt="Logo Nagari"
          className={`block object-contain ${className}`}
        />
      </div>
    );
  }

  return (
    <img
      src={logoImage}
      alt="Logo Nagari"
      className={`block object-contain ${className}`}
    />
  );
}
