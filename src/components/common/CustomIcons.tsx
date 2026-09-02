import React from 'react';

export function SparkleIcon({ className = "w-5 h-5", fill = "currentColor" }: { className?: string; fill?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
        fill={fill}
        stroke="black"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TicketIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 6V10C4.1 10 5 10.9 5 12C5 13.1 4.1 14 3 14V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V14C19.9 14 19 13.1 19 12C19 10.9 19.9 10 21 10V6C21 4.9 20.1 4 19 4H5C3.9 4 3 4.9 3 6Z"
        fill="#FFF100"
        stroke="black"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path d="M12 7V17" stroke="black" strokeWidth="2" strokeDasharray="2 2" />
    </svg>
  );
}

export function MapPinIcon({ className = "w-5 h-5", color = "#E6007E" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
        fill={color}
        stroke="black"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="3" fill="white" stroke="black" strokeWidth="2" />
    </svg>
  );
}

export function CalendarIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="16" rx="3" fill="white" stroke="black" strokeWidth="2.2" />
      <path d="M3 10H21" stroke="black" strokeWidth="2.2" />
      <path d="M8 3V7" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 3V7" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="8" cy="14" r="1.2" fill="#E6007E" />
      <circle cx="12" cy="14" r="1.2" fill="#E6007E" />
      <circle cx="16" cy="14" r="1.2" fill="#E6007E" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ZapIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#FFF100" stroke="black" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function CompassIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" fill="white" stroke="black" strokeWidth="2" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="#E6007E" stroke="black" strokeWidth="1.5" />
    </svg>
  );
}
