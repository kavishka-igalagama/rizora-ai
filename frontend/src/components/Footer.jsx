import { Link } from "react-router-dom";
import {
  Leaf,
  Mail,
  MapPin,
  Phone,
  Github,
  Twitter,
  Linkedin,
  Youtube,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-16">
        {/* Newsletter CTA */}
        <div className="rounded-2xl bg-muted/80 backdrop-blur-xl border border-border shadow-medium p-6 md:p-8 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <div className="flex-1">
              <h2 className="font-display font-bold text-lg md:text-xl text-foreground">
                Stay in the loop
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Get updates on new features and farming insights.
              </p>
            </div>
            <form
              className="w-full md:w-auto flex items-center gap-2"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Subscribe to newsletter"
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="flex-1 md:w-80 px-4 py-2.5 rounded-lg bg-background text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold hover:bg-gradient-primary-dark hover:shadow-strong hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary to-primary-dark flex items-center justify-center shadow-medium">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Rizora AI
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered rice disease detection and treatment system for smart
              paddy cultivation in Sri Lanka.
            </p>
            {/* Socials */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="p-2 rounded-lg bg-background border border-border text-muted-foreground hover:text-foreground hover:shadow-medium transition-all"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="p-2 rounded-lg bg-background border border-border text-muted-foreground hover:text-foreground hover:shadow-medium transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="p-2 rounded-lg bg-background border border-border text-muted-foreground hover:text-foreground hover:shadow-medium transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="p-2 rounded-lg bg-background border border-border text-muted-foreground hover:text-foreground hover:shadow-medium transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/features"
                  className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h3 className="font-bold text-foreground mb-4">For Users</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/farmer-dashboard"
                  className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
                >
                  Farmers
                </Link>
              </li>
              <li>
                <Link
                  to="/mill-dashboard"
                  className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
                >
                  Paddy Mills
                </Link>
              </li>
              <li>
                <Link
                  to="/officer-dashboard"
                  className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
                >
                  Agricultural Officers
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                <span>Department of Agriculture, Colombo, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                <span>+94 11 234 5678</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0 text-primary" />
                <span>info@rizoraai.lk</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground font-medium">
              © {new Date().getFullYear()} Rizora AI. All rights reserved.
            </p>
            <div className="flex gap-6 items-center">
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-primary font-medium transition-colors"
              >
                Terms of Service
              </Link>
              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Follow us</span>
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="p-2 rounded-lg hover:bg-muted/60 transition-colors"
                >
                  <Github className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </a>
                <a
                  href="https://twitter.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter"
                  className="p-2 rounded-lg hover:bg-muted/60 transition-colors"
                >
                  <Twitter className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </a>
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="p-2 rounded-lg hover:bg-muted/60 transition-colors"
                >
                  <Linkedin className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
