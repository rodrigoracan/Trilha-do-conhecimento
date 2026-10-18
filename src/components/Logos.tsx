import React from 'react';

/**
 * Official Google Drive 3-color polygonal logo
 */
export const GoogleDriveLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 87.3 78"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z"
      fill="#0066DA"
    />
    <path
      d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3L1.2 47.7c-.8 1.4-1.2 2.95-1.2 4.5h27.5z"
      fill="#00AC47"
    />
    <path
      d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l6.1 10.55z"
      fill="#EA4335"
    />
    <path
      d="m43.65 25 13.75-23.8C56.05.4 54.5 0 52.95 0H34.35c-1.55 0-3.1.4-4.45 1.2z"
      fill="#00832D"
    />
    <path
      d="m59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.45 1.2h50.9c1.55 0 3.1-.4 4.45-1.2z"
      fill="#2684FC"
    />
    <path
      d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 28h27.5c0-1.55-.4-3.1-1.2-4.5z"
      fill="#FFBA00"
    />
  </svg>
);

/**
 * Official Google Gemini 4-point gradient sparkle star
 */
export const GoogleGeminiLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="gemini-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4E82EE" />
        <stop offset="35%" stopColor="#7BA1F7" />
        <stop offset="70%" stopColor="#9B72CF" />
        <stop offset="100%" stopColor="#D96570" />
      </linearGradient>
    </defs>
    <path
      d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
      fill="url(#gemini-star-grad)"
    />
  </svg>
);

/**
 * Stylized Google NotebookLM emblem
 */
export const NotebookLMLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="notebook-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818CF8" />
        <stop offset="100%" stopColor="#C084FC" />
      </linearGradient>
    </defs>
    <rect x="3.5" y="3" width="17" height="18" rx="3" fill="#0E1626" stroke="#818CF8" strokeWidth="1.2" />
    <path d="M7 3v18" stroke="#818CF8" strokeWidth="1.2" strokeDasharray="2 2" />
    <path d="M11 8h6M11 12h6M11 16h4" stroke="url(#notebook-grad)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
