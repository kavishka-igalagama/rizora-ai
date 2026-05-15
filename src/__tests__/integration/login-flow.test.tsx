/**
 * Integration Tests Example
 * Tests for multiple components working together
 */

import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Example components for integration testing
const LoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!email.includes("@") || password.length < 6) {
        throw new Error("Invalid credentials");
      }
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 100));
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
    </div>
  );
};

const Dashboard = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard</p>
    </div>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return isLoggedIn ? (
    <Dashboard />
  ) : (
    <LoginForm onSuccess={() => setIsLoggedIn(true)} />
  );
};

describe("Integration Tests - Login Flow", () => {
  it("should display login form initially", () => {
    render(<App />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it("should show error for invalid credentials", async () => {
    const user = userEvent.setup();
    render(<App />);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(emailInput, "invalid-email");
    await user.type(passwordInput, "123");
    await user.click(submitButton);

    // Wait for error to appear
    const error = await screen.findByRole("alert");
    expect(error).toHaveTextContent("Invalid credentials");
  });

  it("should navigate to dashboard on successful login", async () => {
    const user = userEvent.setup();
    render(<App />);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    // Wait for dashboard to appear
    const dashboard = await screen.findByText(/welcome to your dashboard/i);
    expect(dashboard).toBeInTheDocument();
    expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
  });

  it("should show loading state during submission", async () => {
    const user = userEvent.setup();
    render(<App />);

    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /login/i });

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "password123");

    // Start submission but check for loading state
    const submitPromise = user.click(submitButton);

    // The button should be disabled
    expect(screen.getByRole("button")).toBeDisabled();

    await submitPromise;
  });
});
