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
            className={`flex flex-col items-center gap-1 border-2 rounded-xl py-4 px-3 transition-all cursor-pointer
              ${
                formData.role === "student"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
              }`}
          >
            <span className="text-2xl">🎓</span>
            <span className="font-semibold text-sm">Student</span>
            <span className="text-xs text-center leading-tight">
              Looking for a supervisor
            </span>
          </button>

          {/* Supervisor role card */}
          <button
            type="button"
            onClick={() => handleRoleSelect("supervisor")}
            className={`flex flex-col items-center gap-1 border-2 rounded-xl py-4 px-3 transition-all cursor-pointer
              ${
                formData.role === "supervisor"
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
              }`}
          >
            <span className="text-2xl">🏫</span>
            <span className="font-semibold text-sm">Supervisor</span>
            <span className="text-xs text-center leading-tight">
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
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      {/* Confirm password field */}
      <div className="flex flex-col gap-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Inline validation error */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Submit button */}
      <button
        type="submit"
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors cursor-pointer"
      >
        Create Account
      </button>

    </form>
  );
};

export default SignupForm;