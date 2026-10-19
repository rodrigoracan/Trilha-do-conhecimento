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
 * Official Google NotebookLM Logo
 * Multi-colored orbital vortex/swirl in Google AI identity palette
 */
export const NotebookLMLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#1F2328" />
    <path
      d="M12 4.5C7.858 4.5 4.5 7.858 4.5 12C4.5 16.142 7.858 19.5 12 19.5C16.142 19.5 19.5 16.142 19.5 12"
      stroke="#4285F4"
      strokeWidth="2.1"
      strokeLinecap="round"
    />
    <path
      d="M12 7.4C9.46 7.4 7.4 9.46 7.4 12C7.4 14.54 9.46 16.6 12 16.6C14.54 16.6 16.6 14.54 16.6 12"
      stroke="#EA4335"
      strokeWidth="1.9"
      strokeLinecap="round"
    />
    <path
      d="M12 9.8C10.785 9.8 9.8 10.785 9.8 12C9.8 13.215 10.785 14.2 12 14.2C13.215 14.2 14.2 13.215 14.2 12"
      stroke="#FBBC05"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <circle cx="12" cy="12" r="1.3" fill="#34A853" />
    <circle cx="17.8" cy="7.2" r="1.4" fill="#C084FC" />
  </svg>
);

/**
 * Official Google Classroom Logo (green blackboard with yellow frame & white figures)
 */
export const GoogleClassroomLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="20" height="18" rx="3" fill="#F4B400" />
    <rect x="3.5" y="4.5" width="17" height="15" rx="1.8" fill="#0F9D58" />
    {/* Teacher figure */}
    <circle cx="12" cy="9.2" r="2.1" fill="#FFFFFF" />
    <path d="M8 15.5c0-2.2 1.8-3.6 4-3.6s4 1.4 4 3.6H8z" fill="#FFFFFF" />
    {/* Student figure left */}
    <circle cx="7" cy="10.2" r="1.4" fill="#E8F5E9" fillOpacity="0.9" />
    <path d="M4.2 15.5c0-1.6 1.2-2.6 2.8-2.6.5 0 1 .1 1.4.3-.6.6-1 1.4-1.1 2.3H4.2z" fill="#E8F5E9" fillOpacity="0.9" />
    {/* Student figure right */}
    <circle cx="17" cy="10.2" r="1.4" fill="#E8F5E9" fillOpacity="0.9" />
    <path d="M19.8 15.5c0-1.6-1.2-2.6-2.8-2.6-.5 0-1 .1-1.4.3.6.6 1 1.4 1.1 2.3h3.1z" fill="#E8F5E9" fillOpacity="0.9" />
  </svg>
);
