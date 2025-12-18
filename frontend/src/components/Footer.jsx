import { Link } from "react-router-dom";
import { Leaf, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Rizora AI
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered rice disease detection and treatment system for smart
              paddy cultivation in Sri Lanka.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/features"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">For Users</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/farmer-dashboard"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Farmers
                </Link>
              </li>
              <li>
                <Link
                  to="/mill-dashboard"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Paddy Mills
                </Link>
              </li>
              <li>
                <Link
                  to="/officer-dashboard"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Agricultural Officers
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
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
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Rizora AI. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                to="/privacy"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
