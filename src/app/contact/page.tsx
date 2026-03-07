"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import Navbar from "@/components/home/Navbar";
import Footer from "@/components/home/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Mail,
  Phone,
  MapPin,
  HelpCircle,
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Leaf,
  Building2,
} from "lucide-react";

type ContactFormData = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type FAQ = {
  question: string;
  answer: string;
};

type EmergencyContact = {
  title: string;
  phone: string;
  description: string;
  icon: typeof Building2;
};

const ContactPage = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs: FAQ[] = useMemo(
    () => [
      {
        question: "How does the AI disease detection work?",
        answer:
          "Our AI uses deep learning models trained on thousands of rice leaf images. Simply upload a photo of an affected leaf, and the system analyzes visual patterns to identify diseases with 95%+ accuracy. The model can detect common diseases like Brown Spot, Bacterial Leaf Blight, Leaf Smut, and Rice Blast.",
      },
      {
        question: "How accurate is the disease detection?",
        answer:
          "Our AI model achieves over 95% accuracy in detecting major rice diseases. However, we always recommend consulting with agricultural officers for confirmation and treatment guidance, especially for severe infections.",
      },
      {
        question: "Is the app available in Sinhala and Tamil?",
        answer:
          "We are actively working on multi-language support. Currently, the app is available in English, with Sinhala and Tamil translations coming soon to ensure accessibility for all Sri Lankan farmers.",
      },
      {
        question: "Do I need internet to use the disease detection?",
        answer:
          "Yes, an internet connection is required to use the AI disease detection feature as the analysis is performed on our cloud servers. However, you can save previous diagnoses for offline reference.",
      },
      {
        question: "How often are market prices updated?",
        answer:
          "Market prices are updated daily based on data from major paddy purchasing centers across Sri Lanka. We aggregate prices from multiple sources to provide accurate and reliable market insights.",
      },
      {
        question: "Can I connect with agricultural officers through the app?",
        answer:
          "Yes! Our platform connects you with registered agricultural officers in your region. You can send messages, share disease images, and receive expert guidance directly through the app.",
      },
    ],
    [],
  );

  const emergencyContacts: EmergencyContact[] = useMemo(
    () => [
      {
        title: "Department of Agriculture",
        phone: "011-2868950",
        description: "National agricultural emergency helpline",
        icon: Building2,
      },
      {
        title: "Rice Research & Development Institute",
        phone: "037-2259881",
        description: "Batalagoda, Ibbagamuwa - Rice disease expertise",
        icon: Leaf,
      },
      {
        title: "Agricultural Extension Service",
        phone: "011-2869553",
        description: "Regional farming support and guidance",
        icon: MessageSquare,
      },
    ],
    [],
  );

  const handleChange =
    (field: keyof ContactFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float-slow" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <Badge
              variant="secondary"
              className="px-4 py-2 bg-primary/10 text-primary border-primary/20"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Help & Support
            </Badge>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-foreground leading-tight">
              Contact <span className="text-gradient-hero">Us</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Have questions or need assistance? We&apos;re here to help you
              make the most of Rizora AI.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="font-display text-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-emerald-600 flex items-center justify-center">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        required
                        maxLength={100}
                        className="h-12"
                        value={formData.name}
                        onChange={handleChange("name")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        required
                        maxLength={255}
                        className="h-12"
                        value={formData.email}
                        onChange={handleChange("email")}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="07X XXX XXXX"
                        maxLength={15}
                        className="h-12"
                        value={formData.phone}
                        onChange={handleChange("phone")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="How can we help?"
                        maxLength={200}
                        className="h-12"
                        value={formData.subject}
                        onChange={handleChange("subject")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Describe your question or issue..."
                      required
                      maxLength={1000}
                      className="min-h-37.5 resize-none"
                      value={formData.message}
                      onChange={handleChange("message")}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      1000 characters
                    </p>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full h-14 bg-linear-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg hover:shadow-glow transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info & Emergency Contacts */}
            <div className="space-y-6">
              {/* Quick Contact */}
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="font-display text-xl">
                    Quick Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Email</p>
                      <p className="text-muted-foreground">support@rizora.lk</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Phone</p>
                      <p className="text-muted-foreground">+94 11 234 5678</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Location</p>
                      <p className="text-muted-foreground">
                        Colombo, Sri Lanka
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contacts */}
              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="font-display text-xl flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                    Emergency Agricultural Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {emergencyContacts.map((contact, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50"
                    >
                      <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                        <contact.icon className="w-6 h-6 text-destructive" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {contact.title}
                        </p>
                        <p className="text-primary font-medium">
                          {contact.phone}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {contact.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30 relative">
        <div className="absolute inset-0 dot-pattern opacity-50" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-12 space-y-4">
            <Badge
              variant="secondary"
              className="px-4 py-2 bg-primary/10 text-primary border-primary/20"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQ
            </Badge>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about Rizora AI
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Additional Help */}
          <div className="mt-12 text-center">
            <Card className="inline-block border-border/50 bg-card/80 backdrop-blur-sm p-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-display font-semibold text-xl text-foreground">
                    Still have questions?
                  </h3>
                  <p className="text-muted-foreground">
                    Contact our support team for personalized assistance.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
