"use client";

import React, { useId } from "react";

interface BuyNowBagIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  fillColor?: string;
  variant?: "monochrome" | "two-tone";
}

export default function BuyNowBagIcon({
  size = 20,
  className = "",
  fillColor = "currentColor",
  variant = "monochrome",
  ...props
}: BuyNowBagIconProps) {
  const rawId = useId();
  const safeId = `bag-smile-mask-${rawId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  if (variant === "two-tone") {
    const navyColor = "#1E3A8A";
    const cyanColor = "#1A9FD4";
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 120"
        width={size}
        height={size}
        fill="none"
        className={`shrink-0 ${className}`}
        {...props}
      >
        {/* Handle */}
        <path
          d="M 47 34 V 22 C 47 12, 73 12, 73 22 V 34"
          fill="none"
          stroke={navyColor}
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bag Body */}
        <path
          d="M 32 34 C 28 34, 26.5 36.5, 27.5 40 L 22.5 86 C 22 88, 24 89, 26 89 H 94 C 96 89, 98 88, 97.5 86 L 92.5 40 C 93.5 36.5, 92 34, 88 34 Z"
          fill={navyColor}
        />
        {/* Smile Cutout / Accent */}
        <path
          d="M 48 48 C 48 67, 72 67, 72 48"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="7.5"
          strokeLinecap="round"
        />
        {/* Bottom Base */}
        <path
          d="M 21.5 96 H 98.5 C 100 96, 100.5 97, 100 98 L 98 104 C 95.5 110.5, 90.5 114, 84 114 H 36 C 29.5 114, 24.5 110.5, 22 104 L 20 98 C 19.5 97, 20 96, 21.5 96 Z"
          fill={cyanColor}
        />
      </svg>
    );
  }

  // Monochrome / adaptive to button color (with cutout smile and bottom gap)
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      fill="none"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <defs>
        <mask id={safeId}>
          <rect width="120" height="120" fill="#FFFFFF" />
          <path
            d="M 48 48 C 48 67, 72 67, 72 48"
            stroke="#000000"
            strokeWidth="7.5"
            strokeLinecap="round"
            fill="none"
          />
        </mask>
      </defs>

      <g mask={`url(#${safeId})`} fill={fillColor}>
        {/* Handle */}
        <path
          d="M 47 34 V 22 C 47 12, 73 12, 73 22 V 34"
          fill="none"
          stroke={fillColor}
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bag Body */}
        <path d="M 32 34 C 28 34, 26.5 36.5, 27.5 40 L 22.5 86 C 22 88, 24 89, 26 89 H 94 C 96 89, 98 88, 97.5 86 L 92.5 40 C 93.5 36.5, 92 34, 88 34 Z" />
        {/* Bottom Base */}
        <path d="M 21.5 96 H 98.5 C 100 96, 100.5 97, 100 98 L 98 104 C 95.5 110.5, 90.5 114, 84 114 H 36 C 29.5 114, 24.5 110.5, 22 104 L 20 98 C 19.5 97, 20 96, 21.5 96 Z" />
      </g>
    </svg>
  );
}
