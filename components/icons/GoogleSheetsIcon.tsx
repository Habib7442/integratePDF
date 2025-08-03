import React from 'react';

interface GoogleSheetsIconProps {
  className?: string;
}

const GoogleSheetsIcon: React.FC<GoogleSheetsIconProps> = ({ className = "w-6 h-6" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Google Sheets green background */}
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        fill="#0F9D58"
      />
      
      {/* White grid lines */}
      <g stroke="white" strokeWidth="0.5" fill="none">
        {/* Horizontal lines */}
        <line x1="5" y1="8" x2="19" y2="8" />
        <line x1="5" y1="11" x2="19" y2="11" />
        <line x1="5" y1="14" x2="19" y2="14" />
        <line x1="5" y1="17" x2="19" y2="17" />
        
        {/* Vertical lines */}
        <line x1="8" y1="5" x2="8" y2="19" />
        <line x1="11" y1="5" x2="11" y2="19" />
        <line x1="14" y1="5" x2="14" y2="19" />
        <line x1="17" y1="5" x2="17" y2="19" />
      </g>
      
      {/* Header row highlight */}
      <rect
        x="5"
        y="5"
        width="14"
        height="3"
        fill="rgba(255, 255, 255, 0.2)"
      />
      
      {/* First column highlight */}
      <rect
        x="5"
        y="5"
        width="3"
        height="14"
        fill="rgba(255, 255, 255, 0.1)"
      />
    </svg>
  );
};

export default GoogleSheetsIcon;
