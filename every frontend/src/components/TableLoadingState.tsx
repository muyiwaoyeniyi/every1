import React from "react";
import Td from "./Td";

interface TableLoadingStateProps {
  columns: number;
  rows?: number;
}

const TableLoadingState: React.FC<TableLoadingStateProps> = ({
  columns,
  rows = 5,
}) => {
  return (
    <>
      {/* Loading skeleton rows */}
      {[...Array(rows)].map((_, index) => (
        <tr key={`loading-${index}`} className="animate-pulse">
          {[...Array(columns)].map((_, colIndex) => (
            <Td key={`loading-${index}-${colIndex}`}>
              <div
                className={`h-4 bg-gray-200 rounded ${
                  colIndex === columns - 1
                    ? "w-16 ml-auto" // Amount column (last column)
                    : colIndex === 0
                    ? "w-20" // ID column
                    : colIndex === 1
                    ? "w-24" // Recipient column
                    : colIndex === 2
                    ? "w-20" // Date column
                    : "w-12" // Default
                }`}
              ></div>
            </Td>
          ))}
        </tr>
      ))}
      <tr>
        <td colSpan={columns} className="p-6 text-center text-gray-600">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
            Loading payments…
          </div>
        </td>
      </tr>
    </>
  );
};

export default TableLoadingState;
