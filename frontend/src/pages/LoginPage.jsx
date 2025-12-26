import { Link } from "react-router-dom";
import { Leaf, Mail, Lock, ArrowRight } from "lucide-react";

const LoginPage = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* ===== Background mesh ===== */}
      <div className="absolute inset-0 bg-linear-to-br from-green-100 via-emerald-50 to-sky-100" />
      <div className="absolute top-24 left-24 w-72 h-72 bg-green-400/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-24 right-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-float-slow" />

      <div className="relative z-10 w-full max-w-md">
        {/* ===== Logo ===== */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-foreground">
            Rizora AI
          </span>
        </Link>

        {/* ===== Card ===== */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 p-6">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-gray-900">
              Welcome Back
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Sign in to continue to your dashboard
            </p>
          </div>

          <form className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-12 pl-12 rounded-xl border text-sm border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between text-sm">
                <label className="font-medium text-gray-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-primary-dark hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full h-12 pl-12 rounded-xl border text-sm border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full h-12 mt-2 text-sm font-medium rounded-xl bg-gradient-primary hover:bg-gradient-primary-dark text-white flex items-center justify-center gap-2 hover:opacity-90 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 group"
            >
              Login
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative text-center">
              <span className="bg-white px-3 text-xs text-gray-400 uppercase">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="h-11 rounded-xl border text-sm border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-4 h-4"
              />
              Google
            </button>

            <button className="h-11 rounded-xl border text-sm border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50">
              <img
                src="https://www.svgrepo.com/show/475654/github-color.svg"
                alt="GitHub"
                className="w-4 h-4"
              />
              GitHub
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-primary-dark font-semibold hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
