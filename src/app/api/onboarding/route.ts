import { NextResponse } from "next/server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    role,
    district,
    nic,
    phone,
    millName,
    regNo,
    address,
    adminPassword,
  } = body ?? {};

  if (!role || !["farmer", "mill", "officer"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {
    role,
    onboardingCompleted: true,
  };

  if (role === "farmer") {
    if (!district || !nic || !phone) {
      return NextResponse.json(
        { error: "District, NIC, and phone are required" },
        { status: 400 }
      );
    }
    updates.district = district;
    updates.nic = nic;
    updates.phone = phone;
  }

  if (role === "mill") {
    if (!district || !millName || !regNo || !address || !phone) {
      return NextResponse.json(
        { error: "All mill fields are required" },
        { status: 400 }
      );
    }
    updates.district = district;
    updates.millName = millName;
    updates.registrationNumber = regNo;
    updates.address = address;
    updates.phone = phone;
  }

  if (role === "officer") {
    const officerPassword = process.env.OFFICER_ADMIN_PASSWORD;

    if (!officerPassword) {
      return NextResponse.json(
        { error: "Officer admin password not configured" },
        { status: 500 }
      );
    }

    if (adminPassword !== officerPassword) {
      return NextResponse.json(
        { error: "Invalid admin password" },
        { status: 403 }
      );
    }
  }

  try {
    await connectDB();

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { role },
    });

    const clerkProfile = await currentUser();
    const email =
      clerkProfile?.primaryEmailAddress?.emailAddress ||
      clerkProfile?.emailAddresses?.[0]?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "Unable to read email from Clerk profile" },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        $set: updates,
        $setOnInsert: {
          clerkId: userId,
          email,
          firstName: clerkProfile?.firstName,
          lastName: clerkProfile?.lastName,
          imageUrl: clerkProfile?.imageUrl,
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error saving onboarding data", error);
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    );
  }
}
