import React from 'react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TierDemo from '@/components/TierDemo';
import { useAuth } from '@/contexts/AuthContext';

const TierTest = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <ResponsiveLayout>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">User Tier Test</h1>
          <p className="text-gray-400">Testing user tier gating functionality</p>
        </div>

        {!isAuthenticated ? (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-gray-400 mb-6">Please sign in to view your tier information.</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign In
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <TierDemo />
            
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold mb-4">Tier Benefits Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Free Tier</h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• 5 streams per day</li>
                    <li>• Standard quality</li>
                    <li>• Basic support</li>
                    <li>• Limited content</li>
                    <li>• No downloads</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Pro Tier</h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• 12 streams per day</li>
                    <li>• 5 downloads per day</li>
                    <li>• HD quality</li>
                    <li>• Priority download queue</li>
                    <li>• Priority support</li>
                    <li>• All content access</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-2">Premium Tier</h3>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Unlimited streams</li>
                    <li>• Unlimited downloads</li>
                    <li>• 4K streaming</li>
                    <li>• Premium-only catalog</li>
                    <li>• VIP support</li>
                    <li>• Ad-free experience</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </ResponsiveLayout>
  );
};

export default TierTest;