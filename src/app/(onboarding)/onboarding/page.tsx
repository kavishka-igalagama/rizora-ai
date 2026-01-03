"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { Tractor, Factory, UserCheck, MapPin } from "lucide-react";

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

const OnboardingPage = () => {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  const isFormValid = selectedRole && selectedDistrict;

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
                    onClick={() => setSelectedRole(role.id)}
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

          {/* District Selection */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-foreground">
              ඔබේ දිස්ත්‍රික්කය තෝරන්න / Select Your District
            </Label>
            <Select
              value={selectedDistrict}
              onValueChange={setSelectedDistrict}
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

          {/* Continue Button */}
          <Button
            disabled={!isFormValid}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            ඉදිරියට යන්න / Continue
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;
