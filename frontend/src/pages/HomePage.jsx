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
        "Upload rice leaf images and get instant disease diagnosis with 95%+ accuracy using advanced CNN models.",
      image: diseaseIcon,
    },
    {
      icon: BookOpen,
      title: "Digital Record Book",
      description:
        "Track planting, fertilizer usage, harvest details, and auto-generate comprehensive farming statistics.",
      image: farmIcon,
    },
    {
      icon: TrendingUp,
      title: "Market Insights",
      description:
        "Real-time paddy price updates by region, trends analysis, and best market opportunities.",
      image: marketIcon,
    },
    {
      icon: MessageSquare,
      title: "Communication Hub",
      description:
        "Direct connection with paddy mills and agricultural officers for expert guidance and support.",
      image: null,
    },
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
    },
    {
      title: "For Paddy Mills",
      description:
        "Manage procurement, track quality, and communicate efficiently with farmer networks.",
      icon: Award,
      link: "/register?type=mill",
    },
    {
      title: "For Officers",
      description:
        "Monitor regional disease trends, manage knowledge base, and provide expert guidance.",
      icon: Sparkles,
      link: "/register?type=officer",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <span className="text-sm font-medium text-primary">
                  AI-Powered Agricultural Technology
                </span>
              </div>

              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
                Revolutionize Rice Farming with{" "}
                <span className="text-primary">AI Detection</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl">
                Empowering Sri Lankan paddy farmers with AI-based disease
                detection, digital record management, and real-time market
                insights. Grow smarter, harvest better.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center bg-primary text-white text-sm px-8 py-3 rounded-xl font-medium hover:bg-primary/80 hover:text-white transition-colors"
                >
                  Get Started Free <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center bg-white justify-center text-sm px-8 py-3 rounded-xl font-medium border border-primary hover:bg-primary/10 transition-colors"
                >
                  Explore Features
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center"
                    >
                      <Leaf className="w-5 h-5 text-primary" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-foreground">5000+ Farmers</p>
                  <p className="text-sm text-muted-foreground">
                    Trust Rizora AI
                  </p>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl"></div>
              <img
                src={heroImage}
                alt="Rice paddy fields"
                className="relative rounded-2xl shadow-strong w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
              Powerful Features for Modern Farming
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your paddy cultivation efficiently
              and profitably
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group hover:shadow-medium transition-all duration-300 border-border"
              >
                <div className="p-6 space-y-4 bg-white hover:shadow-lg shadow-primary/10 border border-gray-200 rounded-xl">
                  {feature.image ? (
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <feature.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                  )}
                  <h3 className="font-semibold text-xl text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                Why Choose Rizora AI?
              </h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of farmers who have increased their yield and
                profitability with our AI-powered platform.
              </p>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-success shrink-0 mt-0.5" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/register"
                className="inline-flex items-center justify-center text-sm bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-primary/80 hover:text-white transition-colors"
              >
                Start Your Free Trial
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 space-y-2 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                <p className="text-4xl font-bold text-primary">95%</p>
                <p className="text-sm text-muted-foreground">
                  Detection Accuracy
                </p>
              </div>
              <div className="p-6 space-y-2 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                <p className="text-4xl font-bold text-primary">5000+</p>
                <p className="text-sm text-muted-foreground">Active Farmers</p>
              </div>
              <div className="p-6 space-y-2 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                <p className="text-4xl font-bold text-primary">30%</p>
                <p className="text-sm text-muted-foreground">
                  Crop Loss Reduction
                </p>
              </div>
              <div className="p-6 space-y-2 bg-primary/10 rounded-xl border border-primary/20 shadow-sm">
                <p className="text-4xl font-bold text-primary">24/7</p>
                <p className="text-sm text-muted-foreground">Expert Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
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
                className="group hover:shadow-medium transition-all duration-300 border-border"
              >
                <div className="p-8 space-y-4 text-center bg-white hover:shadow-lg shadow-primary/10 border border-gray-200 rounded-xl">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <type.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-2xl text-foreground">
                    {type.title}
                  </h3>
                  <p className="text-muted-foreground">{type.description}</p>
                  <Link
                    to="/contact"
                    className="w-full inline-flex items-center bg-white text-sm justify-center px-8 py-3 rounded-xl font-medium border border-primary hover:bg-primary/10 transition-colors"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden bg-background border border-gray-200 rounded-xl">
            <div className="absolute inset-0 opacity-10"></div>
            <div className="relative p-12 text-center space-y-6">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground">
                Ready to Transform Your Rice Farming?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join Rizora AI today and experience the future of agriculture
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center bg-primary text-white text-sm px-8 py-3 rounded-xl font-medium hover:bg-primary/80 hover:text-white transition-colors"
                >
                  Get Started Now <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center bg-white justify-center text-sm px-8 py-3 rounded-xl font-medium border border-primary hover:bg-primary/10 transition-colors"
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
