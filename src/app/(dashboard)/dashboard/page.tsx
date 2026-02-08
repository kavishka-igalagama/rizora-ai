import { redirect } from "next/navigation";
import FarmerDashboard from "@/components/dashboard/farmer/FarmerDashboard";
import MillDashboard from "@/components/dashboard/MillDashboard";
import { getCurrentUserWithRole } from "@/lib/auth";
import OfficerDashboard from "@/components/dashboard/OfficerDashboard";

const DashboardPage = async () => {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect("/");
  }

  if (user.role === "farmer") {
    return <FarmerDashboard userName={user.firstName || "User"} />;
  }

  if (user.role === "mill") {
    return <MillDashboard userName={user.firstName || "User"} />;
  }

  if (user.role === "officer") {
    return <OfficerDashboard />;
  }

  redirect("/");
};

export default DashboardPage;
