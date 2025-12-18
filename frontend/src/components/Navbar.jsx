import { Link } from "react-router-dom";
import { Leaf, Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              Rizora AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/features"
              className="text-foreground/80 hover:text-primary font-medium transition-colors"
            >
              Features
            </Link>
            <Link
              to="/about"
              className="text-foreground/80 hover:text-primary font-medium transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-foreground/80 hover:text-primary font-medium transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center bg-white justify-center text-sm px-5 py-2.5 rounded-xl font-medium border border-primary hover:bg-primary/10 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center bg-primary text-white text-sm px-5 py-2.5 rounded-xl font-medium hover:bg-primary/80 hover:text-white transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link
                to="/features"
                className="text-foreground/80 hover:text-primary font-medium transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/about"
                className="text-foreground/80 hover:text-primary font-medium transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-foreground/80 hover:text-primary font-medium transition-colors px-2 py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <Link
                  to="/contact"
                  className="inline-flex items-center bg-white justify-center text-sm px-5 py-2.5 rounded-xl font-medium border border-primary hover:bg-primary/10 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center bg-primary text-white text-sm px-5 py-2.5 rounded-xl font-medium hover:bg-primary/80 hover:text-white transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
