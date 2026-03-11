import { useState } from "react";

// Allowed roles for a new user account
type Role = "student" | "supervisor";

// Shape of the signup form data
interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

const SignupForm = () => {
  // Initialize form fields — role defaults to "student"
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  // Controls visibility for each password field independently
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Holds any validation error message to display to the user
  const [error, setError] = useState<string | null>(null);

  // Dynamically update the matching field using the input's name attribute
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Clear error on any input change
  };

  // Update role when a role card is clicked
  const handleRoleSelect = (role: Role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that both password fields match before submitting
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Auth logic will be wired here in the next phase
    console.log("Signup submitted:", formData);
  };

  // Reusable inline SVG eye icon — shown when password is visible
  const EyeOffIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  // Reusable inline SVG eye-off icon — shown when password is hidden
  const EyeIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">

      {/* Role selector — user picks either Student or Supervisor */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">I am a...</label>
        <div className="grid grid-cols-2 gap-3">

          {/* Student role card */}
          <button
            type="button"
            onClick={() => handleRoleSelect("student")}
            className={`flex flex-col items-center gap-1 border-2 rounded-xl py-3 sm:py-4 px-2 sm:px-3 transition-all cursor-pointer
              ${
                formData.role === "student"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
              }`}
          >
            <span className="text-xl sm:text-2xl">🎓</span>
            <span className="font-semibold text-xs sm:text-sm">Student</span>
            <span className="text-xs text-center leading-tight hidden sm:block">
              Looking for a supervisor
            </span>
          </button>

          {/* Supervisor role card */}
          <button
            type="button"
            onClick={() => handleRoleSelect("supervisor")}
            className={`flex flex-col items-center gap-1 border-2 rounded-xl py-3 sm:py-4 px-2 sm:px-3 transition-all cursor-pointer
              ${
                formData.role === "supervisor"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
              }`}
          >
            <span className="text-xl sm:text-2xl">🏫</span>
            <span className="font-semibold text-xs sm:text-sm">Supervisor</span>
            <span className="text-xs text-center leading-tight hidden sm:block">
              Looking to supervise students
            </span>
          </button>

        </div>
      </div>

      {/* Full name field */}
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={formData.name}
          onChange={handleChange}
          placeholder="John Doe"
          className="px-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Email field */}
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          className="px-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Password field with show/hide toggle */}
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </label>

        {/* Wrapper to position the toggle button inside the input */}
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 pr-12 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Eye / EyeOff inline SVG toggle for password */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? EyeOffIcon : EyeIcon}
          </button>
        </div>
      </div>

      {/* Confirm password field with show/hide toggle */}
      <div className="flex flex-col gap-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Confirm Password
        </label>

        {/* Wrapper to position the toggle button inside the input */}
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 pr-12 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Eye / EyeOff inline SVG toggle for confirm password */}
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? EyeOffIcon : EyeIcon}
          </button>
        </div>
      </div>

      {/* Inline validation error */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Submit button */}
      <button
        type="submit"
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 text-sm sm:text-base rounded-lg transition-colors cursor-pointer"
      >
        Create Account
      </button>

    </form>
  );
};

export default SignupForm;