interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-3",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-gray-300 border-t-blue-600 ${sizeStyles[size]} ${className}`}
      role="status"
      aria-label="Chargement"
    />
  );
}
