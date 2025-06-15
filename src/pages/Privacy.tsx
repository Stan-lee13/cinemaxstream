import React from 'react';
import BackButton from "@/components/BackButton";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4">
        <BackButton className="mb-6" />
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="prose prose-invert max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                <p className="text-gray-300">
                  At CinemaxStream, we respect your privacy and are committed to protecting your personal data. 
                  This privacy policy explains how we collect, use, and protect your information when you use our service.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                    <p className="text-gray-300">
                      We collect information you provide directly to us, such as when you create an account, 
                      subscribe to our service, or contact us for support.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Usage Information</h3>
                    <p className="text-gray-300">
                      We collect information about how you use our service, including your viewing history, 
                      preferences, and interactions with our platform.
                    </p>
                  </div>
                </div>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>To provide and maintain our service</li>
                  <li>To personalize your experience and recommend content</li>
                  <li>To process payments and manage subscriptions</li>
                  <li>To communicate with you about our service</li>
                  <li>To improve our platform and develop new features</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Data Protection</h2>
                <p className="text-gray-300">
                  We implement appropriate security measures to protect your personal information against 
                  unauthorized access, alteration, disclosure, or destruction. Your data is encrypted and 
                  stored securely using industry-standard practices.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
                <p className="text-gray-300">
                  You have the right to access, update, or delete your personal information. You can also 
                  opt out of certain communications and control your privacy settings through your account.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="text-gray-300">
                  If you have any questions about this Privacy Policy, please contact us at{' '}
                  <a href="mailto:stanleyvic13@gmail.com" className="text-cinemax-500 hover:text-cinemax-400">
                    stanleyvic13@gmail.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
