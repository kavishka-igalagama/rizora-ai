/**
 * Integration Tests - Dashboard Feature
 * Tests for dashboard component with data loading and state management
 */

import React, { useState, useEffect } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock API service
const api = {
  fetchDashboardData: async () => ({
    title: "Dashboard",
    stats: [
      { label: "Total Users", value: 150 },
      { label: "Total Posts", value: 42 },
      { label: "Active Sessions", value: 28 },
    ],
  }),
  refreshData: async () => ({
    ...api.fetchDashboardData(),
    updatedAt: new Date().toISOString(),
  }),
};

// Dashboard component
interface DashboardProps {
  onError?: (error: Error) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onError }) => {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await api.fetchDashboardData();
        setData(result);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [onError]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await api.refreshData();
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div role="alert">Error: {error}</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div>
      <h1>{(data as Record<string, unknown>).title}</h1>
      <button onClick={handleRefresh} disabled={refreshing}>
        {refreshing ? "Refreshing..." : "Refresh"}
      </button>
      <div>
        {Array.isArray((data as Record<string, unknown>).stats) &&
          (data as Record<string, unknown>).stats.map(
            (stat: Record<string, unknown>) => (
              <div key={String(stat.label)}>
                <span>{stat.label}:</span>
                <span>{stat.value}</span>
              </div>
            ),
          )}
      </div>
    </div>
  );
};

describe("Integration Tests - Dashboard Feature", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should load and display dashboard data", async () => {
    jest.spyOn(api, "fetchDashboardData");

    render(<Dashboard />);

    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    expect(screen.getByText(/Total Users/)).toBeInTheDocument();
    expect(screen.getByText(/150/)).toBeInTheDocument();
  });

  it("should display all statistics", async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Total Users/)).toBeInTheDocument();
      expect(screen.getByText(/Total Posts/)).toBeInTheDocument();
      expect(screen.getByText(/Active Sessions/)).toBeInTheDocument();
    });

    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("28")).toBeInTheDocument();
  });

  it("should handle errors during loading", async () => {
    const error = new Error("Failed to load dashboard");
    jest.spyOn(api, "fetchDashboardData").mockRejectedValueOnce(error);

    const onError = jest.fn();
    render(<Dashboard onError={onError} />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Error: Failed to load dashboard",
      );
    });

    expect(onError).toHaveBeenCalledWith(error);
  });

  it("should refresh data when refresh button is clicked", async () => {
    const user = userEvent.setup();
    jest.spyOn(api, "refreshData");

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole("button", { name: /refresh/i });
    expect(refreshButton).not.toBeDisabled();

    await user.click(refreshButton);

    expect(refreshButton).toBeDisabled();
    expect(refreshButton).toHaveTextContent("Refreshing...");

    await waitFor(() => {
      expect(refreshButton).not.toBeDisabled();
      expect(refreshButton).toHaveTextContent("Refresh");
    });

    expect(api.refreshData).toHaveBeenCalled();
  });

  it("should handle refresh errors gracefully", async () => {
    const user = userEvent.setup();
    jest.spyOn(api, "fetchDashboardData").mockResolvedValueOnce({
      title: "Dashboard",
      stats: [],
    });
    jest
      .spyOn(api, "refreshData")
      .mockRejectedValueOnce(new Error("Refresh failed"));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole("button", { name: /refresh/i });
    await user.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Error: Refresh failed",
      );
    });
  });

  it("should maintain user interaction during async operations", async () => {
    const user = userEvent.setup();

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole("button", { name: /refresh/i });

    // First refresh
    await user.click(refreshButton);
    expect(refreshButton).toBeDisabled();

    // Wait for refresh to complete
    await waitFor(() => {
      expect(refreshButton).not.toBeDisabled();
    });

    // Second refresh
    await user.click(refreshButton);
    expect(refreshButton).toBeDisabled();

    await waitFor(() => {
      expect(refreshButton).not.toBeDisabled();
    });

    expect(api.refreshData).toHaveBeenCalledTimes(2);
  });
});
