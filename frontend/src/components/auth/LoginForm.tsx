import { useState } from "react";

// Shape of the login form data
interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm = () => {
  // Initialize form fields as empty strings
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  // Controls whether the password is visible or masked
  const [showPassword, setShowPassword] = useState(false);

  // Dynamically update the matching field using the input's name attribute
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth logic will be wired here in the next phase
    console.log("Login submitted:", formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">

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
            type={showPassword ? "text" : "password"} // Toggle input type
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 pr-12 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Show/hide toggle button */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              // Eye-off icon — password is visible
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              // Eye icon — password is hidden
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 text-sm sm:text-base rounded-lg transition-colors cursor-pointer"
      >
        Sign In
      </button>

    </form>
  );
};

export default LoginForm;