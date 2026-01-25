"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Tractor, Factory, UserCheck, MapPin } from "lucide-react";

const roles = [
  {
    id: "farmer",
    label: "ගොවියා / Farmer",
    icon: Tractor,
    description: "වී වගා කරන ගොවීන් සඳහා",
  },
  {
    id: "mill",
    label: "මෝල් හිමියා / Mill Owner",
    icon: Factory,
    description: "වී මෝල් හිමිකරුවන් සඳහා",
  },
  {
    id: "officer",
    label: "කෘෂිකර්ම නිලධාරී / Agri Officer",
    icon: UserCheck,
    description: "කෘෂිකර්ම නිලධාරීන් සඳහා",
  },
];

const districts = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

const OnboardingForm = () => {
  const router = useRouter();
  const { isSignedIn, isLoaded, user } = useUser();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [formData, setFormData] = useState({
    district: "",
    nic: "",
    phone: "",
    millName: "",
    regNo: "",
    address: "",
    adminPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setFormData({
      district: "",
      nic: "",
      phone: "",
      millName: "",
      regNo: "",
      address: "",
      adminPassword: "",
    });
  };

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: selectedRole,
          district: formData.district,
          nic: formData.nic,
          phone: formData.phone,
          millName: formData.millName,
          regNo: formData.regNo,
          address: formData.address,
          adminPassword: formData.adminPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to save your details");
      }

      if (user) {
        await user.reload();
      }

      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFarmerValid =
    selectedRole === "farmer" &&
    formData.nic.trim() &&
    formData.district.trim() &&
    formData.phone.trim();

  const isMillValid =
    selectedRole === "mill" &&
    formData.millName.trim() &&
    formData.regNo.trim() &&
    formData.district.trim() &&
    formData.address.trim() &&
    formData.phone.trim();

  const isOfficerValid =
    selectedRole === "officer" && formData.adminPassword.trim();

  const isFormValid = Boolean(isFarmerValid || isMillValid || isOfficerValid);

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-primary/20">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-display text-foreground">
            ඔබේ තොරතුරු ඇතුළත් කරන්න
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            தொடங்குவதற்கு உங்கள் சுயவிவரத்தை நிரப்பவும்.
          </CardDescription>
          <CardDescription className="text-muted-foreground text-base">
            Complete your profile to get started
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Role Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-foreground">
              ඔබේ භූමිකාව තෝරන්න / Select Your Role
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left hover:shadow-lg ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50 bg-card"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">
                      {role.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {role.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedRole && (
            <div className="space-y-6">
              {(selectedRole === "farmer" || selectedRole === "mill") && (
                <div className="space-y-4">
                  <Label className="text-lg font-semibold text-foreground">
                    ඔබේ දිස්ත්‍රික්කය තෝරන්න / Select Your District
                  </Label>
                  <Select
                    value={formData.district}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, district: value }))
                    }
                  >
                    <SelectTrigger className="w-full h-12 text-base">
                      <SelectValue placeholder="දිස්ත්‍රික්කය තෝරන්න / Choose district..." />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem
                          key={district}
                          value={district}
                          className="text-base"
                        >
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedRole === "farmer" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ජාතික හැඳුනුම්පත් අංකය / NIC</Label>
                    <Input
                      value={formData.nic}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          nic: e.target.value,
                        }))
                      }
                      placeholder="NIC"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>දුරකථන අංකය / Phone Number</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="077XXXXXXX"
                    />
                  </div>
                </div>
              )}

              {selectedRole === "mill" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>මෝල් නම / Mill Name</Label>
                    <Input
                      value={formData.millName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          millName: e.target.value,
                        }))
                      }
                      placeholder="Enter mill name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ලියාපදිංචි අංකය / Registration No</Label>
                    <Input
                      value={formData.regNo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          regNo: e.target.value,
                        }))
                      }
                      placeholder="Enter registration number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ලිපිනය / Address</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      placeholder="Street, City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>දුරකථන අංකය / Phone Number</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder="077XXXXXXX"
                    />
                  </div>
                </div>
              )}

              {selectedRole === "officer" && (
                <div className="space-y-2">
                  <Label>පරිපාලක මුරපදය / Admin Password</Label>
                  <Input
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        adminPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter admin password"
                  />
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          {/* Continue Button */}
          <Button
            disabled={!isFormValid || isSubmitting}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving your details...
              </span>
            ) : (
              "ඉදිරියට යන්න / Continue"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingForm;
