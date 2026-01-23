export {};

// Create a type for the Roles
export type Roles = "farmer" | "mill";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
