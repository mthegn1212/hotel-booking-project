// src/components/AuthFormWrapper.tsx
import React from "react";

export default function AuthFormWrapper({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
}