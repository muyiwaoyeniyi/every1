import axios from "axios";
import React, { useState, useEffect, useCallback } from "react";

import { Payment, DateMode, PaymentsResponse } from "../types";

import { fmtMoney } from "../utils";
import PaymentsTable from "../components/PaymentsTable";
import PaymentsFilters from "../components/PaymentsFilters";

export default function PaymentsPage() {
  // Filters
  const [recipient, setRecipient] = useState<string>("");
  const [dateMode, setDateMode] = useState<DateMode>("after");
  const [dateValue, setDateValue] = useState<string | undefined>(undefined);

  // Data
  const [items, setItems] = useState<Payment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);

  // Fetch payments function
  const fetchPayments = useCallback(
    (
      recipient: string,
      dateMode: DateMode,
      dateValue: string | undefined
    ): void => {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (recipient.trim()) searchParams.append("recipient", recipient.trim());
      if (dateValue) {
        searchParams.append(dateMode, dateValue);
      }

      axios
        .get<PaymentsResponse>(
          `http://localhost:3001/ach_payments?${searchParams.toString()}`
        )
        .then((response) => {
          setItems(response.data.payments);
          setTotal(response.data.total);
        })
        .catch(() => {
          setError("Failed to fetch payments");
        })
        .finally(() => {
          setLoading(false);
        });
    },
    []
  );

  // Initial load
  useEffect((): void => {
    fetchPayments("", "after", undefined);
  }, [fetchPayments]);

  // Handle search button click
  const handleSearch = useCallback((): void => {
    fetchPayments(recipient, dateMode, dateValue);
  }, [dateMode, dateValue, fetchPayments, recipient]);

  const onClearFilters = useCallback((): void => {
    setRecipient("");
    setDateMode("after");
    setDateValue(undefined);
    fetchPayments("", "after", undefined);
  }, [fetchPayments]);

  const handleRecipientChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setRecipient(e.target.value);
    },
    []
  );

  const handleDateModeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>): void => {
      setDateMode(e.target.value as DateMode);
    },
    []
  );

  const handleDateValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      setDateValue(e.target.value || undefined);
    },
    []
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
            Pending Payments
          </h1>
          <div className="text-sm md:text-base font-medium text-gray-700">
            Total:{" "}
            <span className="font-semibold">{fmtMoney(total, "USD")}</span>
          </div>
        </div>
      </header>

      {/* Filters */}
      <PaymentsFilters
        loading={loading}
        dateMode={dateMode}
        recipient={recipient}
        dateValue={dateValue}
        onSearch={handleSearch}
        onClearFilters={onClearFilters}
        onDateModeChange={handleDateModeChange}
        onRecipientChange={handleRecipientChange}
        onDateValueChange={handleDateValueChange}
      />

      {/* Data table */}
      <PaymentsTable items={items} loading={loading} error={error} />
    </div>
  );
}
