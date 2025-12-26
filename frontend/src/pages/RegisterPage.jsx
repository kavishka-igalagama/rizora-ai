import { Link } from "react-router-dom";
import { Leaf, Mail, Lock, User, MapPin, ArrowRight } from "lucide-react";

const RegisterPage = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* ===== Background mesh ===== */}
      <div className="absolute inset-0 bg-linear-to-br from-green-100 via-emerald-50 to-sky-100" />
      <div className="absolute top-24 left-24 w-72 h-72 bg-green-400/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-24 right-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-float-slow" />

      <div className="relative z-10 w-full max-w-2xl">
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
              Create Your Account
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Join thousands of farmers using AI to improve their yield
            </p>
          </div>

          <form className="space-y-4">
            {/* First and Last Name */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder="Enter your first name"
                    className="w-full h-12 pl-12 rounded-xl border text-sm border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder="Enter your last name"
                    className="w-full h-12 pl-12 rounded-xl border text-sm border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
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
            <div className="grid md:grid-cols-2 gap-4">
              {/* User Role */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  I am a
                </label>
                <select
                  className="relative mt-2 w-full h-12 pl-2 rounded-xl border text-sm border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select user type
                  </option>
                  <option value="farmer">Farmer</option>
                  <option value="mill">Paddy Mill</option>
                  <option value="officer">Agricultural Officer</option>
                </select>
              </div>

              {/* District */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  District
                </label>

                <select
                  className="relative mt-2 w-full h-12 pl-3 pr-2 rounded-xl
               border text-sm border-gray-200 bg-gray-50
               focus:outline-none focus:ring-2 focus:ring-green-500"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select district
                  </option>

                  {/* Western */}
                  <option value="colombo">Colombo</option>
                  <option value="gampaha">Gampaha</option>
                  <option value="kalutara">Kalutara</option>

                  {/* Central */}
                  <option value="kandy">Kandy</option>
                  <option value="matale">Matale</option>
                  <option value="nuwara-eliya">Nuwara Eliya</option>

                  {/* Southern */}
                  <option value="galle">Galle</option>
                  <option value="matara">Matara</option>
                  <option value="hambantota">Hambantota</option>

                  {/* Northern */}
                  <option value="jaffna">Jaffna</option>
                  <option value="kilinochchi">Kilinochchi</option>
                  <option value="mannar">Mannar</option>
                  <option value="mullaitivu">Mullaitivu</option>
                  <option value="vavuniya">Vavuniya</option>

                  {/* Eastern */}
                  <option value="trincomalee">Trincomalee</option>
                  <option value="batticaloa">Batticaloa</option>
                  <option value="ampara">Ampara</option>

                  {/* North Western */}
                  <option value="kurunegala">Kurunegala</option>
                  <option value="puttalam">Puttalam</option>

                  {/* North Central */}
                  <option value="anuradhapura">Anuradhapura</option>
                  <option value="polonnaruwa">Polonnaruwa</option>

                  {/* Uva */}
                  <option value="badulla">Badulla</option>
                  <option value="monaragala">Monaragala</option>

                  {/* Sabaragamuwa */}
                  <option value="ratnapura">Ratnapura</option>
                  <option value="kegalle">Kegalle</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium text-gray-700">Password</label>
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
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <label className="font-medium text-gray-700">
                    Confirm Password
                  </label>
                </div>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full h-12 pl-12 rounded-xl border text-sm border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="w-full h-12 mt-2 text-sm font-medium rounded-xl bg-gradient-primary hover:bg-gradient-primary-dark text-white flex items-center justify-center gap-2 hover:opacity-90 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 group"
            >
              Register
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary-dark font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
