import React from "react";
import { Payment } from "../types";
import { fmtMoney } from "../utils";
import Th from "./Th";
import Td from "./Td";
import TableLoadingState from "./TableLoadingState";

interface PaymentsTableProps {
  items: Payment[] | null;
  loading: boolean;
  error: string | null;
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({
  items,
  loading,
  error,
}) => {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-10">
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <Th>ID</Th>
              <Th>Recipient</Th>
              <Th>Scheduled Date</Th>
              <Th className="text-right">Amount</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <TableLoadingState columns={4} />}

            {error && !loading && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-red-600">
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && (!items || items.length === 0) && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-600">
                  No payments match your filters.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              items?.map((p) => (
                <tr key={p.id} className="hover:bg-indigo-50/30">
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs md:text-sm text-gray-800">
                        {p.id}
                      </span>
                      {p.within_24h && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          <span>within 24h</span>
                        </span>
                      )}
                    </div>
                  </Td>
                  <Td className="font-medium">{p.recipient}</Td>
                  <Td>{new Date(p.scheduled_date).toLocaleDateString()}</Td>
                  <Td className="text-right tabular-nums">
                    {fmtMoney(p.amount, "USD")}
                  </Td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default PaymentsTable;
