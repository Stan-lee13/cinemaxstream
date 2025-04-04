
import React from "react";

interface LoadingStateProps {
  type?: "spinner" | "skeleton" | "pulse";
  text?: string;
  size?: "sm" | "md" | "lg";
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  type = "spinner", 
  text = "Loading...",
  size = "md" 
}) => {
  // Determine size classes
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  };
  
  const textClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };
  
  if (type === "spinner") {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-cinemax-500 ${sizeClasses[size]}`}></div>
        {text && <p className={`mt-2 text-gray-400 ${textClasses[size]}`}>{text}</p>}
      </div>
    );
  }
  
  if (type === "skeleton") {
    return (
      <div className="space-y-4 w-full">
        <div className="h-6 bg-gray-700 rounded-md animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded-md w-3/4 animate-pulse"></div>
        <div className="h-4 bg-gray-700 rounded-md w-1/2 animate-pulse"></div>
        <div className="h-10 bg-gray-700 rounded-md w-full animate-pulse"></div>
        <div className="h-40 bg-gray-700 rounded-md w-full animate-pulse"></div>
        {text && <p className={`text-gray-400 ${textClasses[size]}`}>{text}</p>}
      </div>
    );
  }
  
  // Pulse
  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`animate-pulse flex flex-col items-center`}>
        <div className={`rounded-full bg-gray-700 ${sizeClasses[size]} mb-4`}></div>
        <div className="h-4 w-32 bg-gray-700 rounded"></div>
      </div>
      {text && <p className={`mt-4 text-gray-400 ${textClasses[size]}`}>{text}</p>}
    </div>
  );
};

export default LoadingState;
