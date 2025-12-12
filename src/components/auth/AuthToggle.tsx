
import React from "react";

interface AuthToggleProps {
  isSignUp: boolean;
  setIsSignUp: (isSignUp: boolean) => void;
}

const AuthToggle: React.FC<AuthToggleProps> = ({ isSignUp, setIsSignUp }) => {
  return (
    <div className="mt-6 text-center text-sm">
      {isSignUp ? (
        <p>
          Already have an account?{" "}
          <button
            type="button"
            className="text-cinemax-500 hover:underline"
            onClick={() => setIsSignUp(false)}
          >
            Sign In
          </button>
        </p>
      ) : (
        <p>
          Don't have an account?{" "}
          <button
            type="button"
            className="text-cinemax-500 hover:underline"
            onClick={() => setIsSignUp(true)}
          >
            Sign Up
          </button>
        </p>
      )}
    </div>
  );
};

export default AuthToggle;
