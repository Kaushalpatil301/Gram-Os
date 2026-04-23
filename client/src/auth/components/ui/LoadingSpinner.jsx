const LoadingSpinner = ({ 
  size = "md", 
  color = "green", 
  className = "",
  label = "Loading..."
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const colorClasses = {
    green: "border-green-600",
    white: "border-white",
    gray: "border-gray-600",
    blue: "border-blue-600"
  };

  return (
    <div 
      className={`inline-flex items-center gap-2 ${className}`}
      role="status" 
      aria-label={label}
    >
      <div 
        className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
