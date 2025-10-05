// Payment type
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  scheduled_date: string;
  recipient: string;
  within_24h: boolean;
}

// Date filter mode type
export type DateMode = "after" | "before";

// API response types
export interface PaymentsResponse {
  payments: Payment[];
  total: number;
}
