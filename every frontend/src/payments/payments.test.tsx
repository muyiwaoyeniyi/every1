import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import PaymentsPage from "./index";
import { Payment, PaymentsResponse } from "../types";
import * as utils from "../utils";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the utils module
jest.mock("../utils");
const mockedUtils = utils as jest.Mocked<typeof utils>;

// Mock data
const mockPayments: Payment[] = [
  {
    id: "txn_001",
    amount: 5000,
    currency: "USD",
    scheduled_date: "2025-10-04",
    recipient: "John Doe",
    within_24h: true,
  },
  {
    id: "txn_002",
    amount: 2500,
    currency: "USD",
    scheduled_date: "2025-10-05",
    recipient: "Jane Smith",
    within_24h: false,
  },
];

const mockResponse: PaymentsResponse = {
  payments: mockPayments,
  total: 7500,
};

describe("PaymentsPage Component", () => {
  beforeEach(() => {
    mockedUtils.fmtMoney.mockImplementation((amount, currency = "USD") =>
      new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
        amount
      )
    );
    mockedAxios.get.mockClear();
  });

  it("renders the main heading and total", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockResponse });
    render(<PaymentsPage />);

    expect(screen.getByText("Pending Payments")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Total:")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("$7,500.00")).toBeInTheDocument();
    });
  });

  it("renders filter inputs", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockResponse });
    render(<PaymentsPage />);

    expect(screen.getByPlaceholderText("e.g. John Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("After")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Search")).toBeInTheDocument();
    });
    expect(screen.getByText("Clear")).toBeInTheDocument();
  });

  it("fetches payments on component mount", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockResponse });
    render(<PaymentsPage />);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:3001/ach_payments?"
      );
    });
  });

  it("displays payments when data is loaded", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockResponse });
    render(<PaymentsPage />);

    await waitFor(() => {
      expect(screen.getByText("txn_001")).toBeInTheDocument();
    });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("txn_002")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("within 24h")).toBeInTheDocument();
  });

  it("updates recipient filter and triggers search", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockResponse });
    render(<PaymentsPage />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText("Search")).toBeInTheDocument();
    });

    const recipientInput = screen.getByPlaceholderText("e.g. John Doe");
    fireEvent.change(recipientInput, { target: { value: "John" } });

    const searchButton = screen.getByText("Search");
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:3001/ach_payments?recipient=John"
      );
    });
  });

  it("updates date filter with 'after' mode", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockResponse });
    render(<PaymentsPage />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText("Search")).toBeInTheDocument();
    });

    const dateInput = screen.getByLabelText("Date");
    fireEvent.change(dateInput, { target: { value: "2025-10-04" } });

    const searchButton = screen.getByText("Search");
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:3001/ach_payments?after=2025-10-04"
      );
    });
  });

  it("changes date mode to 'before' and applies filter", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockResponse });
    render(<PaymentsPage />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText("Search")).toBeInTheDocument();
    });

    const dateModeSelect = screen.getByDisplayValue("After");
    fireEvent.change(dateModeSelect, { target: { value: "before" } });

    const dateInput = screen.getByLabelText("Date");
    fireEvent.change(dateInput, { target: { value: "2025-10-04" } });

    const searchButton = screen.getByText("Search");
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:3001/ach_payments?before=2025-10-04"
      );
    });
  });

  it("applies multiple filters together", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockResponse });
    render(<PaymentsPage />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText("Search")).toBeInTheDocument();
    });

    const recipientInput = screen.getByPlaceholderText("e.g. John Doe");
    fireEvent.change(recipientInput, { target: { value: "John" } });

    const dateInput = screen.getByLabelText("Date");
    fireEvent.change(dateInput, { target: { value: "2025-10-04" } });

    const searchButton = screen.getByText("Search");
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:3001/ach_payments?recipient=John&after=2025-10-04"
      );
    });
  });

  it("clears filters when clear button is clicked", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockResponse });
    render(<PaymentsPage />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText("Search")).toBeInTheDocument();
    });

    // Set some filters first
    const recipientInput = screen.getByPlaceholderText("e.g. John Doe");
    fireEvent.change(recipientInput, { target: { value: "John" } });

    const clearButton = screen.getByText("Clear");
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("e.g. John Doe")).toHaveValue("");
    });

    expect(screen.getByDisplayValue("After")).toBeInTheDocument();
    expect(screen.getByLabelText("Date")).toHaveValue("");
  });

  it("displays loading state", () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<PaymentsPage />);

    expect(screen.getByText("Loading payments…")).toBeInTheDocument();
  });

  it("displays error state", async () => {
    mockedAxios.get.mockRejectedValue(new Error("API Error"));
    render(<PaymentsPage />);

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch payments")).toBeInTheDocument();
    });
  });

  it("displays empty state when no payments", async () => {
    mockedAxios.get.mockResolvedValue({ data: { payments: [], total: 0 } });
    render(<PaymentsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("No payments match your filters.")
      ).toBeInTheDocument();
    });
  });

  it("disables search button during loading", async () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<PaymentsPage />);

    const searchButton = screen.getByText("Searching...");
    expect(searchButton).toBeDisabled();
  });

  it("disables clear button during loading", async () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<PaymentsPage />);

    const clearButton = screen.getByText("Clear");
    expect(clearButton).toBeDisabled();
  });

  it("formats money correctly", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockResponse });
    render(<PaymentsPage />);

    await waitFor(() => {
      expect(mockedUtils.fmtMoney).toHaveBeenCalledWith(5000, "USD");
    });

    expect(mockedUtils.fmtMoney).toHaveBeenCalledWith(2500, "USD");
    expect(mockedUtils.fmtMoney).toHaveBeenCalledWith(7500, "USD");
  });

  it("handles empty recipient input correctly", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockResponse });
    render(<PaymentsPage />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText("Search")).toBeInTheDocument();
    });

    const recipientInput = screen.getByPlaceholderText("e.g. John Doe");
    fireEvent.change(recipientInput, { target: { value: "   " } }); // Whitespace only

    const searchButton = screen.getByText("Search");
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:3001/ach_payments?"
      );
    });
  });

  it("handles undefined date value correctly", async () => {
    mockedAxios.get.mockResolvedValue({ data: mockResponse });
    render(<PaymentsPage />);

    // Wait for initial load to complete
    await waitFor(() => {
      expect(screen.getByText("Search")).toBeInTheDocument();
    });

    const dateInput = screen.getByLabelText("Date");
    fireEvent.change(dateInput, { target: { value: "" } });

    const searchButton = screen.getByText("Search");
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "http://localhost:3001/ach_payments?"
      );
    });
  });
});
