import { auth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export type UserRole = "farmer" | "mill" | "officer";

// Get current user's district from User schema (for pricing region etc.)
export async function getCurrentUserDistrict(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  try {
    await connectDB();
    const user = await User.findOne({ clerkId: userId }).select("district").lean();
    return user?.district ?? null;
  } catch {
    return null;
  }
}

// Get the current user's role from Clerk public metadata
export async function getUserRole(): Promise<UserRole | null> {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  // Check public metadata for role
  const role = user.publicMetadata?.role as string;

  return role === "farmer" || role === "mill" || role === "officer"
    ? role
    : null;
}

// Check if the current user is an admin-equivalent role
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "officer";
}

// Get user data with role
export async function getCurrentUserWithRole() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const role = await getUserRole();

  return {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    role,
  };
}

// Require authentication, redirect to sign-in if not authenticated
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

// Require admin role, throw error if not admin
export async function requireAdmin() {
  await requireAuth();
  const admin = await isAdmin();

  if (!admin) {
    throw new Error("Forbidden: Officer access required");
  }
}
