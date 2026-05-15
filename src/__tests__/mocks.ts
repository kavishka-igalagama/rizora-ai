/**
 * Test Mocks and Setup
 * Common mocks and setup for testing
 */

// Mock Next.js router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
  pathname: "/",
  query: {},
  asPath: "/",
};

jest.mock("next/router", () => ({
  useRouter: () => mockRouter,
}));

// Mock Next.js navigation
export const mockNavigate = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useNavigation: () => ({
    push: mockNavigate,
  }),
}));

// Mock Clerk auth
export const mockAuth = {
  userId: "test-user-id",
  sessionId: "test-session-id",
  isLoaded: true,
  isSignedIn: true,
};

jest.mock("@clerk/nextjs", () => ({
  useAuth: () => mockAuth,
  useUser: () => ({
    user: {
      id: "test-user-id",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  useSession: () => ({
    session: mockAuth,
    isLoaded: true,
  }),
}));

// Mock environment variables
export const setupEnv = () => {
  process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000/api";
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "test-key";
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  setupEnv();
});
