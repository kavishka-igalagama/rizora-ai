/**
 * Component Tests - Form Component
 * Tests for form components with validation
 */

import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Example form component for testing
const SimpleForm = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes("@")) {
      setError("Invalid email address");
      return;
    }

    setError("");
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </div>
      {error && <p role="alert">{error}</p>}
      <button type="submit">Submit</button>
    </form>
  );
};

describe("Component Tests - Form", () => {
  it("should render form fields", () => {
    render(<SimpleForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("should validate email input", async () => {
    const user = userEvent.setup();
    render(<SimpleForm />);

    const input = screen.getByPlaceholderText("Enter your email");
    const submitButton = screen.getByRole("button", { name: /submit/i });

    // Enter invalid email
    await user.type(input, "invalid-email");
    await user.click(submitButton);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Invalid email address",
    );
  });

  it("should clear error on valid input", async () => {
    const user = userEvent.setup();
    render(<SimpleForm />);

    const input = screen.getByPlaceholderText("Enter your email");
    const submitButton = screen.getByRole("button", { name: /submit/i });

    // First, trigger error
    await user.type(input, "invalid");
    await user.click(submitButton);
    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Clear and enter valid email
    await user.clear(input);
    await user.type(input, "valid@email.com");
    await user.click(submitButton);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
