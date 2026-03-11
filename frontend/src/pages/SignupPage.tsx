import { Link } from "react-router-dom";
import SignupForm from "../components/auth/SignupForm";

const SignupPage = () => {
  return (
    
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">

      <div className="bg-white shadow-md rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md">

        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
          Create an account
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mb-6">
          Join us today
        </p>

        <SignupForm />

        {/* Redirect to login if user already has an account */}
        <p className="text-xs sm:text-sm text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default SignupPage;