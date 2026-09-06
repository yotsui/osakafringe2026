import React from 'react';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col items-center justify-center min-h-[360px] gap-4">
        <div className="w-10 h-10 border-4 border-[#E6007E] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-[#E6007E]/70 animate-pulse">
          Loading Venues...
        </p>
      </div>
    </div>
  );
}
