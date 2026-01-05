import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import OnboardingForm from "./OnboardingForm";

const OnboardingPage = async () => {
  const authUser = await currentUser();

  if (!authUser) {
    redirect("/");
  }

  await connectDB();
  const dbUser = await User.findOne({ clerkId: authUser.id }).lean();

  if (dbUser && dbUser.role && dbUser.role !== "none") {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
};

export default OnboardingPage;
