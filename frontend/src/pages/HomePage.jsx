import { Link } from "react-router-dom";
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
import heroImage from "../assets/hero-rice-field.jpg";
import diseaseIcon from "../assets/disease-detection-icon.jpg";
import farmIcon from "../assets/farm-management-icon.jpg";
import marketIcon from "../assets/market-price-icon.jpg";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const HomePage = () => {
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
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                  <span className="flex text-sm font-medium text-primary-dark">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI-Powered Agricultural Technology
                  </span>
                </div>
              </div>

              <h1
                className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-foreground leading-[1.1] opacity-0 animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                Revolutionize Rice Farming with{" "}
                <span className="text-primary-dark">AI Detection</span>
              </h1>

              <p
                className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed opacity-0 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                Empowering Sri Lankan paddy farmers with AI-based disease
                detection, digital record management, and real-time market
                insights. Grow smarter, harvest better.
              </p>

              <div
                className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center bg-primary text-base text-white px-8 py-3 rounded-xl font-medium hover:bg-primary-dark hover:shadow-glow transition-all duration-300 group"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/demo"
                  className="inline-flex items-center justify-center gap-2 h-14 px-8 text-base border bg-white border-gray-300 rounded-xl hover:bg-muted/50 hover:shadow-glow transition-all duration-300 group"
                >
                  <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  Watch Demo
                </Link>
              </div>

              {/* Social proof */}
              <div
                className="flex items-center gap-6 pt-4 opacity-0 animate-fade-in"
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
              className="relative opacity-0 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="absolute -inset-4 bg-linear-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl animate-pulse-slow" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src={heroImage}
                  alt="AI-powered rice farming technology"
                  className="w-full h-auto object-cover"
                />
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
            <div className="inline-block px-4 py-2 text-xs font-medium text-primary-dark bg-primary/10 rounded-full border border-primary/20">
              Features
            </div>
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
              <div
                key={index}
                className="group rounded-2xl shadow-sm border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:border-primary/20 transition-all duration-500 overflow-hidden"
              >
                <div className="p-6 space-y-4">
                  {feature.badge && (
                    <div className="inline-block rounded-full text-xs bg-linear-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-white mb-6">
                      {feature.badge}
                    </div>
                  )}
                  {feature.image ? (
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover"
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
                </div>
              </div>
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
                <div className="inline-block px-4 py-2 text-xs font-medium text-primary-dark bg-primary/10 rounded-full border border-primary/20">
                  Why Choose Us
                </div>
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
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-foreground font-medium">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                to="/register"
                className="inline-flex items-center justify-center bg-primary text-sm text-white px-8 py-4.5 rounded-xl font-medium hover:bg-primary-dark hover:shadow-glow transition-all duration-300 group"
              >
                Start Your Free Trial
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="p-8 space-y-3 shadow-sm rounded-2xl border-border/50 bg-linear-to-br from-card to-muted/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-4xl text-primary-dark font-display font-bold text-gradient">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
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
            <div className="inline-block px-4 py-2 text-xs font-medium text-primary-dark bg-primary/10 rounded-full border border-primary/20">
              For Everyone
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground">
              Built for Every Stakeholder
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tailored solutions for farmers, mills, and agricultural officers
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {userTypes.map((type, index) => (
              <div
                key={index}
                className="group shadow-sm rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
              >
                <div className="p-8 space-y-6 text-center">
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
                  <Link
                    to={type.link}
                    className="inline-flex items-center py-2 justify-center w-full text-sm rounded-2xl border border-gray-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300"
                  >
                    Learn More
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block px-4 py-2 text-xs font-medium text-primary-dark bg-primary/10 rounded-full border border-primary/20">
              Testimonials
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground">
              What Our Users Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="shadow-sm rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="p-8 space-y-6">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="relative rounded-2xl overflow-hidden border-0 bg-linear-to-br from-primary via-emerald-600 to-teal-600 shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
            <div className="relative p-12 lg:p-20 text-center space-y-8">
              <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl text-white">
                Ready to Transform Your Rice Farming?
              </h2>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Join Rizora AI today and experience the future of agriculture.
                Start for free, upgrade when you're ready.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center h-14 rounded-xl gap-2 px-8 bg-white text-sm font-medium text-primary-dark hover:bg-white/90 shadow-xl"
                >
                  Get Started Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center h-14 px-8 rounded-xl text-sm font-medium border-2 border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
