import "@testing-library/jest-dom";

// Mock environment variables if needed
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "test-key";
process.env.CLERK_SECRET_KEY = "test-secret";

// Suppress console errors in tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
