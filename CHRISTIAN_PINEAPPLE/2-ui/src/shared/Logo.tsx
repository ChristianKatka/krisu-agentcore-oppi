import { type FC } from "react";

type LogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

interface LogoProps {
  size?: LogoSize;
  className?: string;
  alt?: string;
}

const sizeClasses: Record<LogoSize, string> = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
  "2xl": "h-32 w-32",
};

export const Logo: FC<LogoProps> = ({
  size = "md",
  className = "",
  alt = "Logo",
}) => {
  return (
    <img
      src="/images/logo.png"
      alt={alt}
      className={`object-contain ${sizeClasses[size]} ${className}`}
    />
  );
};
