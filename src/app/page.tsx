import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  Microscope,
  TrendingUp,
  MessageSquare,
  BookOpen,
  Award,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  BarChart3,
  Users,
  Play,
  Star,
} from "lucide-react";
import heroImage from "@public/hero-rice-field.jpg";
import diseaseIcon from "@public/disease-detection-icon.jpg";
import farmIcon from "@public/farm-management-icon.jpg";
import marketIcon from "@public/market-price-icon.jpg";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { SignUpButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getCurrentUserWithRole } from "@/lib/auth";

const HomePage = async () => {
  const user = await getCurrentUserWithRole();

  if (user) redirect("/dashboard");

  const features = [
    {
      icon: Microscope,
      title: "AI Disease Detection",
      description:
        "Upload rice leaf images and get instant disease diagnosis with 95%+ accuracy using advanced deep learning.",
      image: diseaseIcon,
      color: "from-emerald-500 to-teal-600",
      badge: "Most Popular",
    },
    {
      icon: BookOpen,
      title: "Digital Record Book",
      description:
        "Track planting, fertilizer usage, harvest details, and auto-generate comprehensive farming statistics.",
      image: farmIcon,
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: TrendingUp,
      title: "Market Insights",
      description:
        "Real-time paddy price updates by region, trends analysis, and best market opportunities.",
      image: marketIcon,
      color: "from-sky-500 to-blue-600",
    },
    {
      icon: MessageSquare,
      title: "Expert Connect",
      description:
        "Direct connection with paddy mills and agricultural officers for expert guidance and support.",
      color: "from-violet-500 to-purple-600",
    },
  ];

  const stats = [
    { value: "95%", label: "Detection Accuracy", icon: Zap },
    { value: "5,000+", label: "Active Farmers", icon: Users },
    { value: "30%", label: "Crop Loss Reduction", icon: Shield },
    { value: "24/7", label: "Expert Support", icon: BarChart3 },
  ];

  const benefits = [
    "Early disease detection saves 30-40% crop loss",
    "AI-powered treatment recommendations",
    "Real-time market price tracking",
    "Digital farm record management",
    "Expert agricultural officer support",
    "Quality control transparency",
  ];

  const userTypes = [
    {
      title: "For Farmers",
      description:
        "AI-powered tools to detect diseases early, manage records digitally, and connect with buyers.",
      icon: Leaf,
      link: "/register?type=farmer",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: "For Paddy Mills",
      description:
        "Manage procurement, track quality, and communicate efficiently with farmer networks.",
      icon: Award,
      link: "/register?type=mill",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      title: "For Officers",
      description:
        "Monitor regional disease trends, manage knowledge base, and provide expert guidance.",
      icon: Shield,
      link: "/register?type=officer",
      gradient: "from-sky-500 to-blue-600",
    },
  ];

  const testimonials = [
    {
      quote:
        "Rizora AI helped me detect brown spot disease early and saved 40% of my crop. Game changer!",
      author: "Kamal Perera",
      role: "Rice Farmer, Kurunegala",
      rating: 5,
    },
    {
      quote:
        "The market price tracking feature helped me get the best price for my harvest. Highly recommended.",
      author: "Nimal Silva",
      role: "Rice Farmer, Anuradhapura",
      rating: 5,
    },
    {
      quote:
        "Managing procurement has never been easier. We can now track quality and connect with farmers seamlessly.",
      author: "Lanka Mills Ltd",
      role: "Paddy Mill, Polonnaruwa",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute top-20 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float-slow" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-12 lg:py-20">
            {/* Left content */}
            <div className="space-y-8">
              <div
                className="animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                <Badge
                  variant="secondary"
                  className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI-Powered Agricultural Technology
                </Badge>
              </div>

              <h1
                className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-foreground leading-[1.1] animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                Revolutionize Rice Farming with{" "}
                <span className="text-gradient-hero">AI Detection</span>
              </h1>

              <p
                className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                Empowering Sri Lankan paddy farmers with AI-based disease
                detection, digital record management, and real-time market
                insights. Grow smarter, harvest better.
              </p>

              <div
                className="flex flex-col sm:flex-row gap-4 animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                <SignUpButton mode="modal">
                  <Button
                    size="lg"
                    asChild
                    className="h-14 px-8 text-base bg-linear-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-xl hover:shadow-glow transition-all duration-300 group cursor-pointer"
                  >
                    <div>
                      Get Started Free
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Button>
                </SignUpButton>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-14 px-8 text-base border-2 hover:bg-muted/50"
                >
                  <Link href="/demo" className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </Link>
                </Button>
              </div>

              {/* Social proof */}
              <div
                className="flex items-center gap-6 pt-4 animate-fade-in"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-11 h-11 rounded-full bg-linear-to-br from-primary/20 to-primary/40 border-2 border-background flex items-center justify-center shadow-md"
                    >
                      <Leaf className="w-5 h-5 text-primary" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      5,000+
                    </span>{" "}
                    farmers trust Rizora AI
                  </p>
                </div>
              </div>
            </div>

            {/* Right content - Hero image */}
            <div
              className="relative animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="absolute -inset-4 bg-linear-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl animate-pulse-slow" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <Image
                  src={heroImage}
                  alt="AI-powered rice farming technology"
                  className="w-full h-auto object-cover"
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                {/* Floating card */}
                <div className="absolute bottom-6 left-6 right-6 glass rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                      <Microscope className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-sm">
                        Disease Detected
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Brown Spot · 94% confidence
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                      Treatable
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative bg-muted/30">
        <div className="absolute inset-0 dot-pattern opacity-50" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-16 space-y-4">
            <Badge
              variant="secondary"
              className="px-4 py-2 bg-primary/10 text-primary border-primary/20"
            >
              Features
            </Badge>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground">
              Powerful Features for Modern Farming
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your paddy cultivation efficiently
              and profitably
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 overflow-hidden"
              >
                <CardContent className="p-6 space-y-4">
                  {feature.badge && (
                    <Badge className="bg-linear-to-r from-amber-500 to-orange-500 text-white border-0 mb-2">
                      {feature.badge}
                    </Badge>
                  )}
                  {feature.image ? (
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-16 h-16 rounded-2xl bg-linear-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                  )}
                  <h3 className="font-display font-semibold text-xl text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge
                  variant="secondary"
                  className="px-4 py-2 bg-primary/10 text-primary border-primary/20"
                >
                  Why Choose Us
                </Badge>
                <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground">
                  Why Choose Rizora AI?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join thousands of farmers who have increased their yield and
                  profitability with our AI-powered platform.
                </p>
              </div>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-foreground font-medium">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  asChild
                  className="h-14 px-8 bg-linear-to-r from-primary to-emerald-600 shadow-lg hover:shadow-glow transition-all duration-300 cursor-pointer"
                >
                  <div>Start Your Free Trial</div>
                </Button>
              </SignUpButton>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="p-8 space-y-3 border-border/50 bg-linear-to-br from-card to-muted/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-4xl font-display font-bold text-gradient">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-24 bg-muted/30 relative">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-16 space-y-4">
            <Badge
              variant="secondary"
              className="px-4 py-2 bg-primary/10 text-primary border-primary/20"
            >
              For Everyone
            </Badge>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground">
              Built for Every Stakeholder
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tailored solutions for farmers, mills, and agricultural officers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {userTypes.map((type, index) => (
              <Card
                key={index}
                className="group border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
              >
                <CardContent className="p-8 space-y-6 text-center">
                  <div
                    className={`w-20 h-20 mx-auto rounded-2xl bg-linear-to-br ${type.gradient} flex items-center justify-center shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300`}
                  >
                    <type.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-foreground">
                    {type.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {type.description}
                  </p>
                  <Button
                    variant="outline"
                    asChild
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                  >
                    <Link href={type.link}>
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-16 space-y-4">
            <Badge
              variant="secondary"
              className="px-4 py-2 bg-primary/10 text-primary border-primary/20"
            >
              Testimonials
            </Badge>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground">
              What Our Users Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-8 space-y-6">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <Card className="relative overflow-hidden border-0 bg-linear-to-br from-primary via-emerald-600 to-teal-600 shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
            <CardContent className="relative p-12 lg:p-20 text-center space-y-8">
              <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white">
                Ready to Transform Your Rice Farming?
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Join Rizora AI today and experience the future of agriculture.
                Start for free, upgrade when you&apos;re ready.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <SignUpButton mode="modal">
                  <Button
                    size="lg"
                    asChild
                    className="h-14 px-8 bg-white text-primary hover:bg-white/90 shadow-xl cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      Get Started Now
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </Button>
                </SignUpButton>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-14 px-8 border-2 border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
