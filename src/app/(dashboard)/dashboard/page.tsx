"use client";

import { redirect } from "next/navigation";
import FarmerDashboard from "@/components/dashboard/FarmerDashboard";
import MillDashboard from "@/components/dashboard/MillDashboard";
import { useUser } from "@clerk/nextjs";

const DashboardPage = () => {
  const { user } = useUser();

  if (!user) {
    redirect("/sign-in");
  }

  const role = user.publicMetadata.role as "farmer" | "mill" | "officer";

  if (role === "mill") {
    return <MillDashboard userName={user.firstName || "User"} />;
  }

  return <FarmerDashboard userName={user.firstName || "User"} />;
};

export default DashboardPage;
