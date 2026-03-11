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
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Password field */}
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors cursor-pointer"
      >
        Sign In
      </button>

    </form>
  );
};

export default LoginForm;