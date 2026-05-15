/**
 * Component Tests - Navbar Component
 * Tests for navigation component
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Link from "next/link";

// Example navbar component for testing
const Navbar = ({
  onLogout,
  isLoggedIn,
}: {
  onLogout: () => void;
  isLoggedIn: boolean;
}) => {
  return (
    <nav>
      <div>Logo</div>
      <ul>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/features">Features</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
      </ul>
      {isLoggedIn && (
        <button onClick={onLogout} data-testid="logout-btn">
          Logout
        </button>
      )}
      {!isLoggedIn && <button data-testid="login-btn">Login</button>}
    </nav>
  );
};

describe("Component Tests - Navbar", () => {
  it("should render all navigation links", () => {
    render(<Navbar onLogout={() => {}} isLoggedIn={false} />);

    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /features/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument();
  });

  it("should display logo", () => {
    render(<Navbar onLogout={() => {}} isLoggedIn={false} />);
    expect(screen.getByText("Logo")).toBeInTheDocument();
  });

  it("should show login button when not logged in", () => {
    render(<Navbar onLogout={() => {}} isLoggedIn={false} />);
    expect(screen.getByTestId("login-btn")).toBeInTheDocument();
    expect(screen.queryByTestId("logout-btn")).not.toBeInTheDocument();
  });

  it("should show logout button when logged in", () => {
    render(<Navbar onLogout={() => {}} isLoggedIn={true} />);
    expect(screen.getByTestId("logout-btn")).toBeInTheDocument();
    expect(screen.queryByTestId("login-btn")).not.toBeInTheDocument();
  });

  it("should call onLogout when logout button is clicked", async () => {
    const handleLogout = jest.fn();
    const user = userEvent.setup();
    render(<Navbar onLogout={handleLogout} isLoggedIn={true} />);

    await user.click(screen.getByTestId("logout-btn"));

    expect(handleLogout).toHaveBeenCalledTimes(1);
  });

  it("should have correct href attributes", () => {
    render(<Navbar onLogout={() => {}} isLoggedIn={false} />);

    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: /features/i })).toHaveAttribute(
      "href",
      "/features",
    );
    expect(screen.getByRole("link", { name: /about/i })).toHaveAttribute(
      "href",
      "/about",
    );
  });
});
