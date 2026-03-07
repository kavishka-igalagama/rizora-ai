import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Leaf,
  Target,
  Lightbulb,
  GraduationCap,
  AlertTriangle,
  TrendingUp,
  Brain,
  Users,
  Shield,
  Award,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

type Stat = {
  value: string;
  label: string;
};

type Objective = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const AboutPage = async () => {
  const authUser = await currentUser();

  if (authUser) redirect("/dashboard");

  const problemStats: Stat[] = [
    {
      value: "30-40%",
      label: "Annual crop loss due to rice diseases in Sri Lanka",
    },
    {
      value: "7+",
      label: "Major rice diseases affecting local paddy cultivation",
    },
    {
      value: "70%",
      label: "Of farmers lack access to timely expert diagnosis",
    },
    {
      value: "Rs. 20B+",
      label: "Estimated annual economic loss to the agriculture sector",
    },
  ];

  const objectives: Objective[] = [
    {
      icon: Brain,
      title: "AI-Powered Disease Detection",
      description:
        "Develop an accurate deep learning model to identify rice diseases from leaf images with 95%+ accuracy.",
    },
    {
      icon: Users,
      title: "Farmer Empowerment",
      description:
        "Provide accessible technology to rural farmers, enabling early disease detection and prevention.",
    },
    {
      icon: TrendingUp,
      title: "Market Integration",
      description:
        "Connect farmers with real-time market prices and mill networks for better economic outcomes.",
    },
    {
      icon: Shield,
      title: "Sustainable Agriculture",
      description:
        "Promote sustainable farming practices through data-driven decision making and resource optimization.",
    },
  ];

  const whyAI: Objective[] = [
    {
      icon: Lightbulb,
      title: "Speed & Accuracy",
      description:
        "AI can analyze leaf images in seconds with consistent accuracy, unlike manual inspection which is slow and error-prone.",
    },
    {
      icon: Target,
      title: "Early Detection",
      description:
        "Machine learning models can detect disease patterns at early stages, before visible symptoms become severe.",
    },
    {
      icon: Users,
      title: "Scalability",
      description:
        "A single AI system can serve thousands of farmers simultaneously, overcoming the shortage of agricultural experts.",
    },
    {
      icon: Award,
      title: "Continuous Learning",
      description:
        "The model improves over time with more data, adapting to new disease variants and local conditions.",
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
              <GraduationCap className="w-4 h-4 mr-2" />
              Academic Research Project
            </Badge>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-foreground leading-tight">
              About <span className="text-gradient-hero">Rizora AI</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              An AI-powered solution designed to revolutionize rice farming in
              Sri Lanka through intelligent disease detection and farm
              management.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Background Section */}
      <section className="py-20 bg-muted/30 relative">
        <div className="absolute inset-0 dot-pattern opacity-50" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-12 space-y-4">
            <Badge
              variant="secondary"
              className="px-4 py-2 bg-destructive/10 text-destructive border-destructive/20"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              The Problem
            </Badge>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
              Rice Disease Crisis in Sri Lanka
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Sri Lanka&apos;s rice cultivation faces significant challenges
              from various diseases that threaten food security and farmer
              livelihoods. Traditional detection methods are often too slow,
              leading to widespread crop damage.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {problemStats.map((stat, index) => (
              <Card
                key={index}
                className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6 text-center">
                  <p className="text-3xl sm:text-4xl font-display font-bold text-destructive mb-2">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-8">
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="mb-4">
                Rice is the staple food of Sri Lanka, with over{" "}
                <strong className="text-foreground">2 million hectares</strong>{" "}
                under paddy cultivation. However, diseases like Bacterial Leaf
                Blight, Brown Spot, Leaf Smut, and Blast cause devastating crop
                losses annually.
              </p>
              <p className="mb-4">
                The current agricultural extension system cannot provide timely
                disease diagnosis to all farmers due to limited resources and
                geographical constraints. Farmers often rely on visual
                inspection, which is subjective and may miss early-stage
                infections.
              </p>
              <p>
                By the time diseases are identified, significant damage has
                already occurred, leading to reduced yields, lower quality
                produce, and substantial economic losses for farming
                communities.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Why AI Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-12 space-y-4">
            <Badge
              variant="secondary"
              className="px-4 py-2 bg-primary/10 text-primary border-primary/20"
            >
              <Brain className="w-4 h-4 mr-2" />
              The Solution
            </Badge>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
              Why AI for Disease Detection?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Artificial Intelligence offers a transformative approach to
              agricultural disease management.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {whyAI.map((item, index) => (
              <Card
                key={index}
                className="group border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
              >
                <CardContent className="p-6 flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary/10 to-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Project Objectives Section */}
      <section className="py-20 bg-muted/30 relative">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-12 space-y-4">
            <Badge
              variant="secondary"
              className="px-4 py-2 bg-primary/10 text-primary border-primary/20"
            >
              <Target className="w-4 h-4 mr-2" />
              Our Goals
            </Badge>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
              Project Objectives & Scope
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {objectives.map((objective, index) => (
              <Card
                key={index}
                className="group border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
              >
                <CardContent className="p-6 flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-emerald-600 flex items-center justify-center shrink-0 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                    <objective.icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                      {objective.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {objective.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Context Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-4">
            <Badge
              variant="secondary"
              className="px-4 py-2 bg-primary/10 text-primary border-primary/20"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Academic Context
            </Badge>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
              Research & Development
            </h2>
          </div>

          <Card className="border-border/50 bg-linear-to-br from-card to-muted/30 overflow-hidden">
            <CardContent className="p-8 sm:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-primary to-emerald-600 flex items-center justify-center shadow-xl">
                    <Leaf className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
                    University Research Initiative
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Rizora AI is developed as part of an academic research
                    project focused on applying artificial intelligence to solve
                    real-world agricultural challenges in Sri Lanka. The project
                    combines expertise in computer vision, deep learning, and
                    agricultural science.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-foreground">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>Deep Learning & Computer Vision Research</span>
                    </div>
                    <div className="flex items-center gap-3 text-foreground">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>Agricultural Technology Innovation</span>
                    </div>
                    <div className="flex items-center gap-3 text-foreground">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>Community-Centered Design Approach</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <Card className="p-6 bg-muted/50 border-primary/20">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Project Supervisor
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          Faculty of Computing & Technology
                        </p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6 bg-muted/50 border-primary/20">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Award className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Research Domain
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          AI, Machine Learning & Agricultural Technology
                        </p>
                      </div>
                    </div>
                  </Card>
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

export default AboutPage;
