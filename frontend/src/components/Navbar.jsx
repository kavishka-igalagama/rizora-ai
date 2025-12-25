import { Link, useLocation } from "react-router-dom";
import { Leaf, Menu, X, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "/features" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-3 bg-muted/95 backdrop-blur-xl shadow-medium border-border"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full group-hover:bg-primary/40 transition-all duration-300" />
              <div className="relative w-11 h-11 rounded-2xl bg-linear-to-br from-primary to-primary-dark flex items-center justify-center shadow-medium group-hover:shadow-strong transition-all duration-300 group-hover:scale-110">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl text-foreground tracking-tight">
                Rizora AI
              </span>
              <span className="text-2xs text-muted-foreground font-medium hidden sm:block">
                Smart Rice Farming
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`relative group px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  location.pathname === link.href
                    ? "text-primary bg-background shadow-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:shadow-medium"
                }`}
              >
                {link.label}
                {location.pathname === link.href ? (
                  <span className="pointer-events-none absolute bottom-1 left-3 right-3 h-0.5 bg-primary rounded-full" />
                ) : (
                  <span className="pointer-events-none absolute bottom-1 left-3 right-3 h-0.5 bg-primary/70 rounded-full transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-backgroud border-2 border-primary text-foreground hover:bg-primary-foreground hover:shadow-strong hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-primary text-primary-foreground hover:bg-gradient-primary-dark hover:shadow-strong hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center gap-2"
            >
              Get Started
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-out ${
            mobileMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 px-2 rounded-2xl bg-muted/95 backdrop-blur-xl border border-border shadow-medium">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    location.pathname === link.href
                      ? "text-primary bg-background"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-border my-3" />
              <div className="flex flex-col gap-2 px-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-lg text-sm font-semibold text-foreground hover:text-primary transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 rounded-lg text-sm font-semibold bg-gradient-primary text-primary-foreground hover:shadow-strong transition-all"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
