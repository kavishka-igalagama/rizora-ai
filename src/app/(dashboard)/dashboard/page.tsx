import { redirect } from "next/navigation";
import FarmerDashboard from "@/components/dashboard/farmer/FarmerDashboard";
import MillDashboard from "@/components/dashboard/mill/MillDashboard";
import { getCurrentUserWithRole } from "@/lib/auth";
import OfficerDashboard from "@/components/dashboard/officer/OfficerDashboard";
import { getFarmerDashboardData } from "@/lib/actions/farmer/dashboard";

const DashboardPage = async () => {
  const user = await getCurrentUserWithRole();

  if (!user) {
    redirect("/");
  }

  if (user.role === "farmer") {
    const dashboardData = await getFarmerDashboardData();
    return (
      <FarmerDashboard
        userName={user.firstName || "User"}
        dashboardData={dashboardData}
      />
    );
  }

  if (user.role === "mill") {
    return (
      <MillDashboard
        userName={user.firstName || "User"}
        millName={user.millName}
      />
    );
  }

  if (user.role === "officer") {
    return <OfficerDashboard />;
  }

  redirect("/");
};

export default DashboardPage;
