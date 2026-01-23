import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Leaf,
  Brain,
  Zap,
  TrendingUp,
  BarChart3,
  Bell,
  FileText,
  Calendar,
  MapPin,
  Users,
  Shield,
  Smartphone,
  Cloud,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
type MainFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  benefits: string[];
  link: string;
};

type AdditionalFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type TechSpec = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const FeaturesPage = async () => {
  const authUser = await currentUser();

  if (authUser) redirect("/dashboard");

  const mainFeatures: MainFeature[] = [
    {
      icon: Camera,
      title: "AI Disease Detection",
      description:
        "Upload images of rice leaves and get instant AI-powered diagnosis with 95%+ accuracy.",
      gradient: "from-primary to-emerald-600",
      benefits: [
        "Instant image analysis",
        "7+ disease types detected",
        "Treatment recommendations",
        "Disease severity assessment",
      ],
      link: "/disease-detection",
    },
    {
      icon: FileText,
      title: "Smart Farm Records",
      description:
        "Digitize and manage all your farm data including planting schedules, inputs, and harvests.",
      gradient: "from-sky to-blue-600",
      benefits: [
        "Digital record keeping",
        "Expense tracking",
        "Yield analytics",
        "Season comparisons",
      ],
      link: "/farm-records",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Market Prices",
      description:
        "Access live paddy prices from mills across Sri Lanka to make informed selling decisions.",
      gradient: "from-amber-500 to-orange-600",
      benefits: [
        "Live price updates",
        "Mill comparisons",
        "Price trend analysis",
        "Direct mill contact",
      ],
      link: "/market-prices",
    },
  ];

  const additionalFeatures: AdditionalFeature[] = [
    {
      icon: Bell,
      title: "Smart Notifications",
      description:
        "Receive timely alerts about disease outbreaks, weather conditions, and market changes in your area.",
    },
    {
      icon: Calendar,
      title: "Crop Calendar",
      description:
        "Plan your farming activities with a smart calendar that suggests optimal planting and harvesting times.",
    },
    {
      icon: MapPin,
      title: "Location Services",
      description:
        "Find nearby mills, agricultural offices, and input suppliers with integrated mapping.",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description:
        "Visualize your farm's performance with detailed charts and insights over multiple seasons.",
    },
    {
      icon: Users,
      title: "Farmer Network",
      description:
        "Connect with other farmers, share knowledge, and access community-driven insights.",
    },
    {
      icon: Cloud,
      title: "Cloud Backup",
      description:
        "All your farm data is securely backed up in the cloud, accessible from any device.",
    },
  ];

  const techSpecs: TechSpec[] = [
    {
      icon: Brain,
      title: "Deep Learning Model",
      description: "Trained on 50,000+ rice leaf images using CNN architecture",
    },
    {
      icon: Zap,
      title: "Fast Processing",
      description: "Get diagnosis results in under 3 seconds",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "End-to-end encryption for all your farm data",
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Works seamlessly on any smartphone or tablet",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute top-20 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float-slow" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <Badge
              variant="secondary"
              className="px-4 py-2 bg-primary/10 text-primary border-primary/20"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Powerful Features
            </Badge>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-foreground leading-tight">
              Everything You Need for{" "}
              <span className="text-gradient-hero">Smart Farming</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover how Rizora AI combines cutting-edge technology with
              practical farming tools to revolutionize your rice cultivation.
            </p>
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 space-y-4">
            <Badge
              variant="secondary"
              className="px-4 py-2 bg-primary/10 text-primary border-primary/20"
            >
              <Leaf className="w-4 h-4 mr-2" />
              Core Features
            </Badge>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
              Three Pillars of Smart Agriculture
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => (
              <Card
                key={index}
                className="group border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden"
              >
                <CardHeader className="pb-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-display group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    <Link href={feature.link}>
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Technology Section */}
      <section className="py-20 bg-muted/30 relative">
        <div className="absolute inset-0 dot-pattern opacity-50" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge
                variant="secondary"
                className="px-4 py-2 bg-primary/10 text-primary border-primary/20"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Technology
              </Badge>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
                Powered by Advanced Machine Learning
              </h2>
              <p className="text-lg text-muted-foreground">
                Our AI model is trained on thousands of rice leaf images from
                Sri Lankan farms, ensuring accurate detection of local disease
                variants and conditions specific to our agricultural
                environment.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {techSpecs.map((spec, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border/50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <spec.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm">
                        {spec.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {spec.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <Card className="relative border-border/50 bg-card/80 backdrop-blur-sm p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-emerald-600 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-xl text-foreground">
                        How It Works
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Simple 3-step process
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Capture Image
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Take a clear photo of the affected rice leaf
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          AI Analysis
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Our AI processes and identifies the disease
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Get Results
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Receive diagnosis with treatment recommendations
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    asChild
                    className="w-full bg-linear-to-r from-primary to-emerald-600 hover:shadow-lg hover:shadow-primary/25 transition-all"
                  >
                    <Link href="/disease-detection">
                      Try Disease Detection
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="py-20 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-12 space-y-4">
            <Badge
              variant="secondary"
              className="px-4 py-2 bg-primary/10 text-primary border-primary/20"
            >
              <Zap className="w-4 h-4 mr-2" />
              More Features
            </Badge>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
              Additional Tools & Capabilities
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Beyond our core features, Rizora AI offers a comprehensive suite
              of tools to support your farming journey.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <Card
                key={index}
                className="group border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
              >
                <CardContent className="p-6 flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/10 to-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <Card className="border-border/50 bg-linear-to-br from-card to-muted/30 overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-primary to-emerald-600 flex items-center justify-center shadow-xl mx-auto">
                  <Leaf className="w-10 h-10 text-white" />
                </div>
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
                  Ready to Transform Your Farm?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join thousands of Sri Lankan farmers who are already using
                  Rizora AI to improve their yields and protect their crops.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-linear-to-r from-primary to-emerald-600 hover:shadow-lg hover:shadow-primary/25 transition-all"
                  >
                    <Link href="/register">
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FeaturesPage;
