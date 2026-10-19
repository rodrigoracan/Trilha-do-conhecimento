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
 * Official Google Gemini Notebook / NotebookLM Logo
 * Concentric nested arches with purple-to-blue-to-cyan gradient
 */
export const NotebookLMLogo: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="notebooklm-outer-grad" x1="0%" y1="100%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="25%" stopColor="#6366f1" />
        <stop offset="60%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
      <linearGradient id="notebooklm-mid-grad" x1="0%" y1="100%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="35%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#60a5fa" />
      </linearGradient>
      <linearGradient id="notebooklm-inner-grad" x1="0%" y1="100%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c4b5fd" />
        <stop offset="45%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#93c5fd" />
      </linearGradient>
    </defs>
    {/* Outer Arch */}
    <path
      d="M5 26.5 V15 C5 8.925 9.925 4 16 4 C22.075 4 27 8.925 27 15 V26.5"
      stroke="url(#notebooklm-outer-grad)"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    {/* Middle Arch */}
    <path
      d="M9.5 26.5 V15.5 C9.5 11.91 12.41 9 16 9 C19.59 9 22.5 11.91 22.5 15.5 V26.5"
      stroke="url(#notebooklm-mid-grad)"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    {/* Inner Arch */}
    <path
      d="M13.8 26.5 V16 C13.8 14.785 14.785 13.8 16 13.8 C17.215 13.8 18.2 14.785 18.2 16 V26.5"
      stroke="url(#notebooklm-inner-grad)"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
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
