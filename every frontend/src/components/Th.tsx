import React from "react";

interface ThProps {
  children: React.ReactNode;
  className?: string;
}

const Th: React.FC<ThProps> = ({ children, className = "" }) => (
  <th
    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

export default Th;
