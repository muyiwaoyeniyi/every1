import React from "react";

interface TdProps {
  children: React.ReactNode;
  className?: string;
}

const Td: React.FC<TdProps> = ({ children, className = "" }) => (
  <td
    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}
  >
    {children}
  </td>
);

export default Td;
