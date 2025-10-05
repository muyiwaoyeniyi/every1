import React from "react";
import { DateMode } from "../types";

interface PaymentsFiltersProps {
  loading: boolean;
  recipient: string;
  dateMode: DateMode;
  onSearch: () => void;
  onClearFilters: () => void;
  dateValue: string | undefined;
  onRecipientChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateModeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onDateValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PaymentsFilters: React.FC<PaymentsFiltersProps> = ({
  loading,
  recipient,
  onSearch,
  dateMode,
  dateValue,
  onClearFilters,
  onDateModeChange,
  onRecipientChange,
  onDateValueChange,
}) => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Recipient
          </label>
          <input
            value={recipient}
            placeholder="e.g. John Doe"
            onChange={onRecipientChange}
            className="rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          />
        </div>

        {/* Date mode filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Date Mode
          </label>
          <select
            value={dateMode}
            onChange={onDateModeChange}
            aria-label="Select date filter mode"
            className="rounded-xl border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          >
            <option value="after">After</option>
            <option value="before">Before</option>
          </select>
        </div>

        {/* Date value filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Scheduled Date
          </label>
          <input
            type="date"
            aria-label="Date"
            value={dateValue || ""}
            onChange={onDateValueChange}
            className="rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
          />
        </div>

        {/* Search button */}
        <div className="flex items-end">
          <button
            onClick={onSearch}
            disabled={loading}
            aria-label="Apply filters"
            className="h-[42px] w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-3 py-2 active:scale-[.99]"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Clear button */}
        <div className="flex items-end">
          <button
            disabled={loading}
            onClick={onClearFilters}
            aria-label="Clear filters"
            className="h-[42px] w-full rounded-xl border border-gray-300 px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 active:scale-[.99]"
          >
            Clear
          </button>
        </div>
      </div>
    </section>
  );
};

export default PaymentsFilters;
