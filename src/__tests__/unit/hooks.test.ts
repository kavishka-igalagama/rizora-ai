/**
 * Unit Tests - Custom Hooks
 * Tests for custom React hooks
 */

import { renderHook, act } from "@testing-library/react";

// Example custom hook
const useCounter = (initialValue = 0) => {
  const [count, setCount] = React.useState(initialValue);

  const increment = () => setCount((c) => c + 1);
  const decrement = () => setCount((c) => c - 1);
  const reset = () => setCount(initialValue);

  return { count, increment, decrement, reset };
};

const useFetch = (url: string) => {
  const [data, setData] = React.useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

// Need to import React for the hooks
import React from "react";

describe("Unit Tests - Custom Hooks", () => {
  describe("useCounter", () => {
    it("should initialize with default value", () => {
      const { result } = renderHook(() => useCounter());
      expect(result.current.count).toBe(0);
    });

    it("should initialize with custom value", () => {
      const { result } = renderHook(() => useCounter(10));
      expect(result.current.count).toBe(10);
    });

    it("should increment count", () => {
      const { result } = renderHook(() => useCounter());

      act(() => {
        result.current.increment();
      });

      expect(result.current.count).toBe(1);
    });

    it("should decrement count", () => {
      const { result } = renderHook(() => useCounter(5));

      act(() => {
        result.current.decrement();
      });

      expect(result.current.count).toBe(4);
    });

    it("should reset count to initial value", () => {
      const { result } = renderHook(() => useCounter(10));

      act(() => {
        result.current.increment();
        result.current.increment();
      });

      expect(result.current.count).toBe(12);

      act(() => {
        result.current.reset();
      });

      expect(result.current.count).toBe(10);
    });

    it("should handle multiple operations", () => {
      const { result } = renderHook(() => useCounter(0));

      act(() => {
        result.current.increment();
        result.current.increment();
        result.current.decrement();
      });

      expect(result.current.count).toBe(1);
    });
  });

  describe("useFetch", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fetch data successfully", async () => {
      const mockData = { id: 1, name: "Test" };

      (global.fetch as jest.Mock) = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => mockData,
        }),
      );

      const { result, waitForNextUpdate } = renderHook(() =>
        useFetch("/api/test"),
      );

      expect(result.current.loading).toBe(true);

      await waitForNextUpdate();

      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
    });

    it("should handle fetch errors", async () => {
      (global.fetch as jest.Mock) = jest.fn(() =>
        Promise.resolve({
          ok: false,
        }),
      );

      const { result, waitForNextUpdate } = renderHook(() =>
        useFetch("/api/test"),
      );

      await waitForNextUpdate();

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("Failed to fetch");
    });

    it("should call fetch with correct URL", async () => {
      (global.fetch as jest.Mock) = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({}),
        }),
      );

      renderHook(() => useFetch("/api/users"));

      expect(global.fetch).toHaveBeenCalledWith("/api/users");
    });

    it("should refetch when URL changes", async () => {
      (global.fetch as jest.Mock) = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: async () => ({}),
        }),
      );

      const { rerender, waitForNextUpdate } = renderHook(
        ({ url }) => useFetch(url),
        { initialProps: { url: "/api/users" } },
      );

      await waitForNextUpdate();

      expect(global.fetch).toHaveBeenCalledTimes(1);

      rerender({ url: "/api/posts" });

      await waitForNextUpdate();

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenLastCalledWith("/api/posts");
    });
  });
});
