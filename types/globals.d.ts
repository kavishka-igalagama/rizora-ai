export {};

// Create a type for the Roles
export type Roles = "farmer" | "mill" | "officer";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
      onboardingComplete?: boolean;
    };
  }
}
