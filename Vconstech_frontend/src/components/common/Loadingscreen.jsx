import React from 'react';
import { Loader } from 'lucide-react';

/**
 * LoadingScreen — full-page loading state
 *
 * Props:
 *   message  {string}  — optional label shown below the spinner
 *                        defaults to "Loading..."
 */
const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        {/* Spinner */}
        <div className="relative">
          {/* Outer decorative ring */}
          <div className="w-16 h-16 rounded-full border-4 border-yellow-100" />
          {/* Spinning arc */}
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-yellow-500 animate-spin" />
          {/* Inner icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader size={20} className="text-yellow-500 animate-pulse" />
          </div>
        </div>

        {/* Message */}
        <p className="text-gray-400 text-sm font-medium tracking-wide">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;