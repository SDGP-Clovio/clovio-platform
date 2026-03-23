import React from 'react';

type ClovioMarkProps = {
  className?: string;
};

const ClovioMark: React.FC<ClovioMarkProps> = ({ className = 'h-6 w-6' }) => {
  return (
    <svg
      viewBox="0 0 128 128"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M64 12L74 46L110 56L74 66L64 116L54 66L18 56L54 46L64 12Z"
        stroke="currentColor"
        strokeWidth="4.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="64"
        cy="64"
        rx="46"
        ry="18"
        transform="rotate(34 64 64)"
        stroke="currentColor"
        strokeWidth="4.75"
        strokeLinecap="round"
      />
      <ellipse
        cx="64"
        cy="64"
        rx="46"
        ry="18"
        transform="rotate(-34 64 64)"
        stroke="currentColor"
        strokeWidth="4.75"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default ClovioMark;